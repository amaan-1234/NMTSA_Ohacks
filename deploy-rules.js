/**
 * Deploy Firestore and Storage Rules to Firebase
 * 
 * This script automatically deploys the security rules to fix the "Missing permissions" error.
 * 
 * Usage:
 *   node deploy-rules.js
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

console.log("\n🔥 Firebase Rules Deployment Script\n");

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "server", "firebase-service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Error: firebase-service-account.json not found");
  console.log("\nPlease download it from:");
  console.log("  Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
  console.log("\nSave it as: server/firebase-service-account.json");
  process.exit(1);
}

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });

  console.log(`✅ Connected to project: ${serviceAccount.project_id}\n`);
} catch (error) {
  console.error("❌ Error initializing Firebase:", error.message);
  process.exit(1);
}

// Read the rules files
const firestoreRules = fs.readFileSync(path.join(__dirname, "firestore.rules"), "utf8");
const storageRules = fs.readFileSync(path.join(__dirname, "storage.rules"), "utf8");

console.log("📋 Rules to deploy:\n");
console.log("Firestore Rules:");
console.log("─".repeat(50));
console.log(firestoreRules.substring(0, 200) + "...\n");

console.log("Storage Rules:");
console.log("─".repeat(50));
console.log(storageRules.substring(0, 200) + "...\n");

console.log("⚠️  NOTE: Rules deployment via Admin SDK is not supported.");
console.log("You need to deploy rules manually through Firebase Console or CLI.\n");

console.log("📖 MANUAL DEPLOYMENT STEPS:\n");
console.log("Method 1: Firebase Console (Easiest)");
console.log("  1. Go to https://console.firebase.google.com/");
console.log("  2. Select your project");
console.log("  3. Go to Firestore Database → Rules");
console.log("  4. Copy content from firestore.rules file");
console.log("  5. Paste and click Publish");
console.log("  6. Go to Storage → Rules");
console.log("  7. Copy content from storage.rules file");
console.log("  8. Paste and click Publish\n");

console.log("Method 2: Firebase CLI");
console.log("  npm install -g firebase-tools");
console.log("  firebase login");
console.log("  firebase deploy --only firestore:rules,storage\n");

console.log("✅ After deployment, your app will work without permission errors!");

process.exit(0);

