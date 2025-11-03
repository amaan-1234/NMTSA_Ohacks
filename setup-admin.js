// Quick script to create an admin user in Firestore
// Run with: node setup-admin.js

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "ohacks-ce5c0.firebaseapp.com",
  projectId: "ohacks-ce5c0",
  storageBucket: "ohacks-ce5c0.appspot.com",
  messagingSenderId: "1049545776701",
  appId: "1:1049545776701:web:fad31bbe231f2b0ff8d454",
  measurementId: "G-HTD3DJY3JJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    // Replace with your admin email
    const adminEmail = "admin@example.com";
    const emailKey = adminEmail.trim().toLowerCase();
    
    await setDoc(doc(db, "approved_emails", emailKey), {
      approved: true,
      role: "admin",
      created_at: new Date(),
    });
    
    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`📧 Email key: ${emailKey}`);
    console.log(`🔑 Role: admin`);
    console.log(`\nYou can now login with this email and will be redirected to /admin`);
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

createAdminUser();
