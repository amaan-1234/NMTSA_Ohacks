# Fix Firebase Storage CORS Error

## The Problem
Firebase Storage is blocking requests from `http://localhost:5173` due to CORS policy.

## Quick Fix: Configure CORS via Google Cloud Console

### Method 1: Install Google Cloud SDK and Use gsutil (Recommended)

1. **Download and Install Google Cloud SDK**
   - Windows: https://cloud.google.com/sdk/docs/install#windows
   - Or use: `choco install gcloudsdk` (if you have Chocolatey)

2. **After installation, restart your terminal and run:**
   ```bash
   gcloud init
   # Login with your Google account
   
   # Deploy CORS configuration
   gsutil cors set cors.json gs://ohacks-ce5c0.appspot.com
   ```

### Method 2: Use Firebase Console (Alternative)

1. Go to: https://console.cloud.google.com/storage/browser?project=ohacks-ce5c0
2. Click on your bucket: `ohacks-ce5c0.appspot.com`
3. Click on the "Configuration" tab
4. Look for "CORS configuration" 
5. Click "Edit CORS configuration"
6. Add the configuration from `cors.json` file

### Method 3: Quick PowerShell Script (Easiest for Windows)

I'll create a script that uses Firebase Admin to help with this...

## Alternative Quick Fix: Use Firebase Emulator for Development

Instead of configuring CORS, you can use Firebase emulators for local development:

```bash
npm install -g firebase-tools
firebase init emulators  # Select Storage and Firestore
firebase emulators:start
```

Then update your `firebase.ts` to use emulators in development.

---

**Current Status**: CORS configuration file created (`cors.json`). 
You need to deploy it to Firebase Storage using one of the methods above.

