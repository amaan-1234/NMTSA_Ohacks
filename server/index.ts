import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

// Initialize Firebase Admin
// Try to get service account from environment variable (Vercel) or file (local dev)
let firebaseAdminApp: admin.app.App | null = null;
let firestoreDb: admin.firestore.Firestore | null = null;

try {
  // First, try environment variable (for Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    firestoreDb = admin.firestore();
    log("[admin] initialized from FIREBASE_SERVICE_ACCOUNT env var");
  }
  // Second, try file (for local development)
  else {
    const svcPath = path.join(__dirname, "firebase-service-account.json");
    if (fs.existsSync(svcPath)) {
      const svc = JSON.parse(fs.readFileSync(svcPath, "utf-8"));
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(svc),
        projectId: svc.project_id,
      });
      firestoreDb = admin.firestore();
      log("[admin] initialized from firebase-service-account.json file");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      firestoreDb = admin.firestore();
      log("[admin] using GOOGLE_APPLICATION_CREDENTIALS");
    } else {
      log("[admin] WARNING: no service account found. /api/admin/* will fail (500).");
      firebaseAdminApp = admin.initializeApp(); // Fallback - will fail on protected routes
      firestoreDb = admin.firestore();
    }
  }
} catch (e: any) {
  log(`[admin] Firebase Admin initialization error: ${e.message}`);
  firebaseAdminApp = admin.initializeApp(); // Fallback
  firestoreDb = admin.firestore();
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

if (!process.env.STRIPE_SECRET_KEY) {
  log("[stripe] WARNING: STRIPE_SECRET_KEY not set. Payment features will fail.");
}

// Import CommonJS modules dynamically
const require = createRequire(import.meta.url);

let EmailService: any;
let EmailValidationService: any;
let OTPVerificationService: any;
let AnalyticsService: any;

// Load CommonJS modules
try {
  EmailService = require("./email-service.cjs");
  EmailValidationService = require("./email-validation-simple.cjs");
  OTPVerificationService = require("./otp-verification.cjs");
  AnalyticsService = require("./analytics-service-mock.cjs");
} catch (e) {
  log(`[warning] Failed to load some CommonJS modules: ${e}`);
  // Fallback - these will cause errors if used, but app will still start
  EmailService = { default: class {} };
  EmailValidationService = { default: class {} };
  OTPVerificationService = { default: class {} };
  AnalyticsService = { default: class {} };
}

// Initialize services
const emailService = new (EmailService.default || EmailService)();
const emailValidationService = new (EmailValidationService.default || EmailValidationService)();
const otpService = new (OTPVerificationService.default || OTPVerificationService)();
const analyticsService = new (AnalyticsService.default || AnalyticsService)();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Admin guard middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!firebaseAdminApp) {
    return res.status(500).json({ error: "Firebase Admin not initialized" });
  }

  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing_token" });

    const decoded = await admin.auth().verifyIdToken(token, true);
    const email = (decoded.email || "").toLowerCase();
    if (!email) return res.status(403).json({ error: "no_email" });

    if (!firestoreDb) {
      return res.status(500).json({ error: "Firestore not initialized" });
    }

    const s = await firestoreDb.collection("approved_emails").doc(email).get();
    const ok = s.exists && s.data()?.approved === true && s.data()?.role === "admin";
    if (!ok) return res.status(403).json({ error: "not_admin", email });

    (req as any).user = decoded;
    next();
  } catch (e: any) {
    console.error("[requireAdmin]", e.message);
    return res.status(401).json({ error: "invalid_token", detail: e.message });
  }
}

(async () => {
  // Register routes from routes.ts (newsletter endpoints)
  registerRoutes(app);

  // Health endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "stripe-backend" });
  });

  // Admin health endpoint
  app.get("/api/admin/health", (_req, res) => {
    const projectId =
      firebaseAdminApp?.options.projectId || (firebaseAdminApp?.options.credential as any)?.projectId || null;
    res.json({
      ok: true,
      projectId,
    });
  });

  // Returns ALL Firebase Auth users (paged), admin-only
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    if (!firebaseAdminApp) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }

    try {
      let nextPageToken: string | undefined = undefined;
      const users: any[] = [];

      do {
        const page = await admin.auth().listUsers(1000, nextPageToken);
        users.push(
          ...page.users.map((u) => ({
            uid: u.uid,
            email: u.email || null,
            name: u.displayName || (u.email ? u.email.split("@")[0] : "—"),
          }))
        );
        nextPageToken = page.pageToken;
      } while (nextPageToken);

      // Attach roles in one batched read from approved_emails
      if (!firestoreDb) {
        return res.status(500).json({ error: "Firestore not initialized" });
      }

      const emails = [...new Set(users.map((u) => (u.email || "").toLowerCase()).filter(Boolean))];
      const refs = emails.map((e) => firestoreDb!.collection("approved_emails").doc(e));
      const snaps = emails.length ? await firestoreDb.getAll(...refs) : [];
      const roleByEmail = new Map<string, string>();

      snaps.forEach((s, i) => {
        if (!s.exists) return;
        const d = s.data();
        if (d?.approved === true && (d.role === "admin" || d.role === "caregiver")) {
          roleByEmail.set(emails[i], d.role);
        }
      });

      const result = users
        .map((u) => ({
          ...u,
          role: u.email ? roleByEmail.get(u.email.toLowerCase()) || "pending" : "pending",
        }))
        .sort((a, b) => (a.email || "").localeCompare(b.email || ""));

      res.json({ users: result });
    } catch (e: any) {
      console.error("[/api/admin/users] failed:", e);
      res.status(500).json({ error: "list_users_failed", detail: e.message || String(e) });
    }
  });

  // Sync Firebase Auth users into Firestore 'profiles'
  app.post("/api/admin/sync-auth-users", requireAdmin, async (_req, res) => {
    if (!firebaseAdminApp || !firestoreDb) {
      return res.status(500).json({ error: "Firebase Admin/Firestore not initialized" });
    }

    try {
      let nextPageToken: string | undefined = undefined;
      let total = 0;

      do {
        const page = await admin.auth().listUsers(1000, nextPageToken);
        total += page.users.length;

        const emails = page.users.map((u) => (u.email || "").toLowerCase()).filter(Boolean);
        const uniqueEmails = [...new Set(emails)];
        const roleByEmail = new Map<string, string>();

        if (uniqueEmails.length) {
          const refs = uniqueEmails.map((e) => firestoreDb!.collection("approved_emails").doc(e));
          const snaps = await firestoreDb.getAll(...refs);
          snaps.forEach((s, i) => {
            if (!s.exists) return;
            const d = s.data();
            if (d?.approved === true && (d.role === "admin" || d.role === "caregiver")) {
              roleByEmail.set(uniqueEmails[i], d.role);
            }
          });
        }

        const writes = page.users.map((u) => {
          const email = u.email || null;
          const data: any = {
            email,
            full_name: u.displayName || null,
            username: email ? email.split("@")[0] : null,
            synced_from_auth: true,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          };
          const r = email ? roleByEmail.get(email.toLowerCase()) : null;
          if (r) data.role = r;
          return { ref: firestoreDb!.collection("profiles").doc(u.uid), data };
        });

        const CHUNK = 450;
        for (let i = 0; i < writes.length; i += CHUNK) {
          const batch = firestoreDb.batch();
          writes.slice(i, i + CHUNK).forEach((w) => batch.set(w.ref, w.data, { merge: true }));
          await batch.commit();
        }

        nextPageToken = page.pageToken;
      } while (nextPageToken);

      return res.json({ ok: true, count: total });
    } catch (e: any) {
      console.error("[sync-auth-users] failed:", e);
      return res.status(500).json({ error: "sync_failed", detail: String(e?.message || e) });
    }
  });

  // Create a Checkout Session from cart items
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const {
        items = [],
        customerEmail = null,
        successPath = "/payments/success",
        cancelPath = "/payments",
      } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cart is empty." });
      }

      const line_items = items.map((it: any) => {
        const unit_amount = Math.max(50, Math.round(((it.price ?? 10) * 100)));
        const quantity = Math.max(1, it.qty ?? 1);
        const name = (it.title || `Course ${it.id}`).toString().slice(0, 100);
        return {
          price_data: {
            currency: "usd",
            product_data: { name },
            unit_amount,
          },
          quantity,
        };
      });

      // Get origin from headers or environment (for Vercel)
      const origin =
        req.headers.origin ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        customer_email: customerEmail || undefined,
        success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${cancelPath}`,
      });

      return res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      console.error("[stripe] create session error:", err.message);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Email validation endpoint
  app.post("/api/validate-email", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      console.log(`📧 Validating email: ${email}`);
      const validation = await emailValidationService.validateEmail(email);

      res.status(200).json({
        success: true,
        validation: {
          isValid: validation.valid,
          reason: validation.reason,
          isDisposable: validation.disposable,
          isDeliverable: validation.deliverable,
          hasMxRecord: validation.mx,
          hasTypo: validation.typo,
        },
      });
    } catch (error: any) {
      console.error("Email validation error:", error);
      res.status(500).json({
        success: false,
        message: "Email validation failed",
      });
    }
  });

  // Quick email validation endpoint
  app.post("/api/validate-email-quick", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const validation = await emailValidationService.quickValidate(email);

      res.status(200).json({
        success: true,
        validation: {
          isValid: validation.valid,
          reason: validation.reason,
        },
      });
    } catch (error: any) {
      console.error("Quick email validation error:", error);
      res.status(500).json({
        success: false,
        message: "Email validation failed",
      });
    }
  });

  // Send OTP for email verification
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.includes("@")) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      console.log(`📧 Validating email before sending OTP: ${email}`);
      const validation = await emailValidationService.validateEmail(email);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `Invalid email: ${validation.reason}`,
        });
      }

      if (otpService.hasPendingVerification(email)) {
        const status = otpService.getVerificationStatus(email);
        return res.status(400).json({
          success: false,
          message: `OTP already sent. Please wait ${status.timeLeft} seconds before requesting a new one.`,
          timeLeft: status.timeLeft,
        });
      }

      const otp = otpService.generateOTP();
      const verificationToken = otpService.generateVerificationToken();

      otpService.storeOTP(email, otp, verificationToken);

      const emailResult = await emailService.sendOTPEmail(email, otp);

      res.status(200).json({
        success: true,
        message: "OTP sent successfully! Check your email for the verification code.",
        testingKeyword: otpService.getTestingKeyword?.(),
        emailSent: emailResult.success,
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
  });

  // Verify OTP
  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const verification = otpService.verifyOTP(email, otp);

      if (verification.success) {
        res.status(200).json({
          success: true,
          message: verification.message,
          verificationToken: verification.verificationToken,
        });
      } else {
        res.status(400).json({
          success: false,
          message: verification.message,
          reason: verification.reason,
          attemptsLeft: verification.attemptsLeft,
        });
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
      });
    }
  });

  // Get verification status
  app.get("/api/verification-status/:email", async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const status = otpService.getVerificationStatus(email);

      res.status(200).json({
        success: true,
        hasPending: status.hasPending,
        timeLeft: status.timeLeft,
        attemptsLeft: status.attemptsLeft,
      });
    } catch (error: any) {
      console.error("Get verification status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get verification status",
      });
    }
  });

  // Analytics endpoints
  app.post("/api/analytics/revenue/track", async (req, res) => {
    try {
      const transactionData = req.body;

      if (!transactionData.userId || !transactionData.courseId || !transactionData.amount) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, courseId, amount",
        });
      }

      const result = await analyticsService.trackRevenueTransaction(transactionData);

      res.status(200).json({
        success: true,
        message: "Revenue transaction tracked successfully",
        transaction: result,
      });
    } catch (error: any) {
      console.error("Track revenue transaction error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track revenue transaction",
      });
    }
  });

  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const analytics = await analyticsService.getRevenueAnalytics(new Date(startDate as string), new Date(endDate as string));

      res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error("Get revenue analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get revenue analytics",
      });
    }
  });

  app.post("/api/analytics/session/track", async (req, res) => {
    try {
      const sessionData = req.body;

      if (!sessionData.userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const result = await analyticsService.trackUserSession(sessionData);

      res.status(200).json({
        success: true,
        message: "User session tracked successfully",
        session: result,
      });
    } catch (error: any) {
      console.error("Track user session error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track user session",
      });
    }
  });

  app.post("/api/analytics/progress/track", async (req, res) => {
    try {
      const progressData = req.body;

      if (!progressData.userId || !progressData.courseId) {
        return res.status(400).json({
          success: false,
          message: "userId and courseId are required",
        });
      }

      const result = await analyticsService.trackCourseProgress(progressData);

      res.status(200).json({
        success: true,
        message: "Course progress tracked successfully",
        progress: result,
      });
    } catch (error: any) {
      console.error("Track course progress error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track course progress",
      });
    }
  });

  app.get("/api/analytics/engagement", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const metrics = await analyticsService.getUserEngagementMetrics(new Date(startDate as string), new Date(endDate as string));

      res.status(200).json({
        success: true,
        metrics,
      });
    } catch (error: any) {
      console.error("Get user engagement metrics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user engagement metrics",
      });
    }
  });

  app.post("/api/analytics/interaction/track", async (req, res) => {
    try {
      const interactionData = req.body;

      if (!interactionData.userId || !interactionData.courseId || !interactionData.interactionType) {
        return res.status(400).json({
          success: false,
          message: "userId, courseId, and interactionType are required",
        });
      }

      const result = await analyticsService.trackCourseInteraction(interactionData);

      res.status(200).json({
        success: true,
        message: "Course interaction tracked successfully",
        interaction: result,
      });
    } catch (error: any) {
      console.error("Track course interaction error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track course interaction",
      });
    }
  });

  app.get("/api/analytics/content", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const metrics = await analyticsService.getContentPerformanceMetrics(new Date(startDate as string), new Date(endDate as string));

      res.status(200).json({
        success: true,
        metrics,
      });
    } catch (error: any) {
      console.error("Get content performance metrics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get content performance metrics",
      });
    }
  });

  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const dashboard = await analyticsService.getAnalyticsDashboard(new Date(startDate as string), new Date(endDate as string));

      res.status(200).json({
        success: true,
        dashboard,
      });
    } catch (error: any) {
      console.error("Get analytics dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get analytics dashboard",
      });
    }
  });

  app.post("/api/analytics/generate-daily", async (req, res) => {
    try {
      const { date } = req.body;
      const targetDate = date ? new Date(date) : new Date();

      const analytics = await analyticsService.generateDailyAnalytics(targetDate);

      res.status(200).json({
        success: true,
        message: "Daily analytics generated successfully",
        analytics,
      });
    } catch (error: any) {
      console.error("Generate daily analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate daily analytics",
      });
    }
  });

  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Skip vite and static serving in Vercel serverless mode
  // Vercel handles static file serving automatically from dist/public
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    log("[server] Running in Vercel serverless mode - skipping vite/static setup and server.listen()");
  } else if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Only start server if not in Vercel serverless environment
  // Vercel handles the serverless functions, so we don't need to start a server
  if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
  }
})();

export default app;
