# CRITICAL: Clear Browser Cache Instructions

## The Problem
Your browser has cached the OLD JavaScript code with the WRONG storage bucket name (`ohacks-ce5c0.appspot.com`).

## What I've Done
✅ Cleared Vite cache (`node_modules/.vite/`)
✅ Cleared build files
✅ Restarted dev server fresh
✅ Server is now running with CORRECT config (`ohacks-ce5c0.firebasestorage.app`)

## What YOU Must Do: Clear Browser Cache

### Method 1: Hard Refresh (Try This First)

**Windows**:
1. Go to http://localhost:5173
2. Press `Ctrl + Shift + R` (or `Ctrl + F5`)
3. Try uploading again

**If that doesn't work, use Method 2...**

### Method 2: Clear Cache via DevTools (RECOMMENDED)

1. **Open your browser** to http://localhost:5173
2. **Press F12** to open DevTools
3. **Right-click the refresh button** (next to the address bar)
4. **Select "Empty Cache and Hard Reload"**
5. **Close DevTools**
6. **Try uploading again**

### Method 3: Manual Cache Clear (If above methods fail)

**Chrome**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: **"All time"** (important!)
4. Click "Clear data"
5. Close and reopen browser
6. Go to http://localhost:5173

**Edge**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: **"All time"**
4. Click "Clear now"
5. Close and reopen browser
6. Go to http://localhost:5173

**Firefox**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Time range: **"Everything"**
4. Click "Clear Now"
5. Close and reopen browser
6. Go to http://localhost:5173

### Method 4: Incognito/Private Window (Quick Test)

Open an **Incognito/Private window**:
- Chrome: `Ctrl + Shift + N`
- Edge: `Ctrl + Shift + P`
- Firefox: `Ctrl + Shift + P`

Then go to: http://localhost:5173

If it works in Incognito, the problem is definitely your browser cache!

## How to Verify It's Fixed

After clearing cache, check the browser console:

### ✅ CORRECT (What you should see):
```
POST https://firebasestorage.googleapis.com/v0/b/ohacks-ce5c0.firebasestorage.app/o?name=courses/...
```
Notice: `.firebasestorage.app` ✅

### ❌ WRONG (What you're seeing now):
```
POST https://firebasestorage.googleapis.com/v0/b/ohacks-ce5c0.appspot.com/o?name=courses/...
```
Notice: `.appspot.com` ❌

## Verification Steps

1. **Clear browser cache** (use one of the methods above)
2. **Go to** http://localhost:5173
3. **Open DevTools** (F12) → Console tab
4. **Login as admin**
5. **Go to** Add Course page
6. **Fill form** and upload a file
7. **Watch the Network tab** (F12 → Network)
8. **Look for the upload request** - it should go to `.firebasestorage.app`

## If It STILL Doesn't Work

### Check 1: Is the dev server using correct env?
In terminal, check the server output for any errors.

### Check 2: Verify in DevTools Console
Open DevTools Console and type:
```javascript
import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
```
Press Enter. It should show: `"ohacks-ce5c0.firebasestorage.app"`

If it shows `.appspot.com`, your browser is STILL using cached code!

### Check 3: Try Different Browser
If you have another browser installed, try it there to confirm it works.

### Check 4: Nuclear Option - Clear EVERYTHING
1. Close ALL browser windows
2. Delete browser cache folder manually:
   - Chrome: `C:\Users\[YourName]\AppData\Local\Google\Chrome\User Data\Default\Cache`
   - Edge: `C:\Users\[YourName]\AppData\Local\Microsoft\Edge\User Data\Default\Cache`
3. Restart browser
4. Go to http://localhost:5173

## Servers Running

✅ **Frontend**: http://localhost:5173 (PID: 37844)
✅ **Backend**: http://localhost:8787 (PID: 32104)
✅ **Environment**: Correct storage bucket configured
✅ **Vite Cache**: Cleared and rebuilt

## Expected Result After Cache Clear

When you upload a course:
- ✅ No CORS errors
- ✅ Upload goes to `ohacks-ce5c0.firebasestorage.app`
- ✅ Files upload successfully
- ✅ "Course Added Successfully!" message
- ✅ Files visible in Firebase Console

---

**Status**: Server is ready with correct config
**Action Required**: Clear your browser cache using one of the methods above
**Priority**: HIGH - This is the ONLY remaining issue

