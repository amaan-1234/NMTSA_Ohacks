# Firebase Storage CORS Fix - Complete ✅

## Problem
CORS (Cross-Origin Resource Sharing) errors when uploading files to Firebase Storage from `http://localhost:5173`:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

## Root Causes Found

### 1. **Wrong Storage Bucket Name**
   - **Issue**: Configuration was using `ohacks-ce5c0.appspot.com`
   - **Actual Bucket**: `ohacks-ce5c0.firebasestorage.app`
   - **Impact**: Files were trying to upload to non-existent bucket

### 2. **CORS Not Configured**
   - **Issue**: Firebase Storage didn't allow requests from localhost
   - **Solution**: Deployed CORS configuration

## Fixes Applied

### ✅ 1. Installed Google Cloud SDK
- Installed via `winget install Google.CloudSDK`
- Authenticated with `gcloud auth login`
- Set project to `ohacks-ce5c0`

### ✅ 2. Created CORS Configuration (`cors.json`)
```json
[
  {
    "origin": [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://ohacks-ce5c0.web.app",
      "https://ohacks-ce5c0.firebaseapp.com"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

### ✅ 3. Deployed CORS to Firebase Storage
```bash
gsutil cors set cors.json gs://ohacks-ce5c0.firebasestorage.app
```

### ✅ 4. Updated Storage Bucket Configuration

**File: `.env.local`**
```diff
- VITE_FIREBASE_STORAGE_BUCKET=ohacks-ce5c0.appspot.com
+ VITE_FIREBASE_STORAGE_BUCKET=ohacks-ce5c0.firebasestorage.app
```

**File: `firebase.json`**
```diff
  "storage": [
    {
-     "bucket": "ohacks-ce5c0.appspot.com",
+     "bucket": "ohacks-ce5c0.firebasestorage.app",
      "rules": "storage.rules"
    }
  ]
```

## Next Steps: Restart Dev Server

**IMPORTANT**: You must restart the dev server to pick up the new environment variables!

### 1. Stop Current Dev Server
Press `Ctrl+C` in the terminal running `npm run dev`

### 2. Restart Dev Server
```bash
npm run dev
```

### 3. Test Upload
1. Navigate to http://localhost:5173
2. Login as admin
3. Go to Add Course page
4. Upload a course with thumbnail and materials
5. Should now work without CORS errors! ✅

## Verification

After restarting, check:
- ✅ No CORS errors in browser console
- ✅ Files upload successfully to Firebase Storage
- ✅ Course documents saved to Firestore
- ✅ Files visible in Firebase Console Storage

### Check Firebase Console
**Storage**: https://console.firebase.google.com/project/ohacks-ce5c0/storage/ohacks-ce5c0.firebasestorage.app/files

You should see folders:
- `courses/` - thumbnail images
- `course-materials/` - PDFs and videos

## Common Issues After Fix

### Issue: Still Getting CORS Errors
**Solution**: 
1. Make sure you restarted the dev server
2. Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
3. Clear browser cache

### Issue: "Storage Bucket Not Found"
**Solution**:
- Verify `.env.local` has `ohacks-ce5c0.firebasestorage.app`
- Restart dev server to load new env vars

### Issue: Files Upload But Get 404
**Solution**:
- Check Storage Rules are deployed: `firebase deploy --only storage`
- Verify you're authenticated

## Files Modified
- ✅ `.env.local` - Updated storage bucket name
- ✅ `firebase.json` - Updated storage bucket configuration
- ✅ `cors.json` - Created CORS configuration (deployed to Cloud Storage)

## Tools Installed
- ✅ Google Cloud SDK - Required for `gsutil` commands
  - Includes: `gcloud`, `gsutil`, `bq`
  - Used for: Deploying CORS, managing Cloud Storage

## Security Notes

### CORS Configuration
- Allows requests from `localhost:5173` for development
- Allows requests from production domains
- Allows all common HTTP methods (GET, POST, PUT, DELETE, HEAD)
- Cache time: 1 hour (3600 seconds)

### Production Considerations
- Current CORS config includes production URLs
- No changes needed for production deployment
- CORS is configured at bucket level (applies to all files)

## Rollback Instructions

If you need to rollback:

### 1. Revert Storage Bucket Name
```bash
# In .env.local
VITE_FIREBASE_STORAGE_BUCKET=ohacks-ce5c0.appspot.com
```

### 2. Remove CORS Configuration
```bash
gsutil cors set empty-cors.json gs://ohacks-ce5c0.firebasestorage.app
```

Where `empty-cors.json` contains: `[]`

## Additional Resources

- **Firebase Storage CORS Docs**: https://firebase.google.com/docs/storage/web/download-files#cors_configuration
- **gsutil CORS Command**: https://cloud.google.com/storage/docs/gsutil/commands/cors
- **Google Cloud SDK Docs**: https://cloud.google.com/sdk/docs

---

**Status**: ✅ CORS configuration deployed successfully
**Next Action**: ⚠️ **RESTART DEV SERVER** to apply changes
**Date**: October 14, 2025
**Fixed By**: Automated fix with gcloud SDK

## Testing Checklist

After restarting server, verify:
- [ ] No CORS errors in console
- [ ] Thumbnail uploads successfully
- [ ] PDF files upload successfully
- [ ] Video files upload successfully
- [ ] Files visible in Firebase Storage
- [ ] Course saved to Firestore
- [ ] Success toast appears after upload

