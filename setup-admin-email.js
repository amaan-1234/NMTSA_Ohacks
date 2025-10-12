/**
 * Setup Admin Email in Firestore
 * 
 * This script adds your admin email to the approved_emails collection in Firestore.
 * This is required for admin-only features like adding courses and managing categories.
 * 
 * Usage:
 *   node setup-admin-email.js your-email@example.com
 */

const admin = require("firebase-admin");
const path = require("path");

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("❌ Error: Please provide an email address");
  console.log("\nUsage:");
  console.log("  node setup-admin-email.js your-email@example.com");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error("❌ Error: Invalid email format");
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "server", "firebase-service-account.json");

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });

  console.log(`\n🔥 Connected to Firebase project: ${serviceAccount.project_id}\n`);
} catch (error) {
  console.error("❌ Error: Could not find firebase-service-account.json");
  console.log("\nMake sure the file exists at:");
  console.log("  server/firebase-service-account.json");
  console.log("\nDownload it from:");
  console.log("  Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
  process.exit(1);
}

// Add admin email to Firestore
async function setupAdminEmail() {
  try {
    const db = admin.firestore();
    const emailLower = email.toLowerCase();
    
    console.log(`📝 Setting up admin email: ${emailLower}\n`);
    
    // Check if email already exists
    const docRef = db.collection("approved_emails").doc(emailLower);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log("ℹ️  Email already exists in approved_emails:");
      console.log("   - Email:", emailLower);
      console.log("   - Role:", data.role);
      console.log("   - Approved:", data.approved);
      
      // Update to ensure it's admin
      if (data.role !== "admin" || data.approved !== true) {
        await docRef.update({
          role: "admin",
          approved: true,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("\n✅ Updated to admin role");
      }
    } else {
      // Create new admin email document
      await docRef.set({
        email: emailLower,
        role: "admin",
        approved: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("✅ Admin email created successfully!");
    }
    
    console.log("\n📋 Next steps:");
    console.log("   1. Make sure this email is in your .env.local:");
    console.log(`      VITE_ADMIN_EMAILS=${emailLower}`);
    console.log("   2. Deploy Firestore rules (see FIRESTORE-RULES-SETUP.md)");
    console.log("   3. Restart your dev server");
    console.log("   4. Login with this email");
    console.log("   5. You should now see Admin menu!\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error setting up admin email:", error.message);
    process.exit(1);
  }
}

setupAdminEmail();

