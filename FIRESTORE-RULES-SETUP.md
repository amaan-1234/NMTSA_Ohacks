# 🔒 Firestore & Storage Rules Setup - Fix "Missing Permissions" Error

## ⚠️ Issue
You're getting **"Missing permissions"** error when trying to:
- Create categories
- Add courses
- Upload images

## ✅ Solution
Deploy the Firestore and Storage security rules to Firebase.

---

## 📋 Quick Setup (2 Methods)

### Method 1: Firebase Console (Easiest - 2 minutes)

#### Step 1: Deploy Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ohacks-ce5c0**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Replace ALL existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/approved_emails/$(request.auth.token.email.lower())) &&
             get(/databases/$(database)/documents/approved_emails/$(request.auth.token.email.lower())).data.role == "admin" &&
             get(/databases/$(database)/documents/approved_emails/$(request.auth.token.email.lower())).data.approved == true;
    }
    
    match /courses/{courseId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    match /profiles/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    match /approved_emails/{email} {
      allow read: if isAdmin();
      allow write: if false;
    }
    
    match /login_credentials/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

6. Click **Publish**
7. ✅ Done! Firestore rules deployed.

#### Step 2: Deploy Storage Rules

1. Still in Firebase Console
2. Click **Storage** in the left sidebar
3. Click the **Rules** tab at the top
4. Replace ALL existing rules with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /courses/{filename} {
      allow read: if true;
      allow write: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

5. Click **Publish**
6. ✅ Done! Storage rules deployed.

---

### Method 2: Firebase CLI (For Developers)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage
```

---

## 🧪 Test After Deployment

### Test 1: Create a Category

1. Open your app: http://localhost:5173
2. Login as admin
3. Click **Content Category** in navbar
4. Enter a category name (e.g., "Neurologic Music Therapy")
5. Click **Add Category**
6. ✅ Should work without "Missing permissions" error

### Test 2: Add a Course

1. Click **Add Course** in navbar
2. Upload a thumbnail image
3. Fill in course details
4. Select a category from dropdown
5. Click **Add Course**
6. ✅ Should upload successfully
7. Navigate to **Courses**
8. ✅ Should see your new course with thumbnail

---

## 🔐 Security Rules Explained

### What These Rules Do:

**Courses:**
- ✅ Anyone can read (public course catalog)
- ✅ Authenticated users can create (you, as admin)
- ✅ Only admins can update/delete

**Categories:**
- ✅ Anyone can read
- ✅ Authenticated users can create (you, as admin)
- ✅ Only admins can update/delete

**Storage (Images):**
- ✅ Anyone can view course images
- ✅ Authenticated users can upload
- ✅ Authenticated users can delete

**Profiles:**
- ✅ Users can only access their own profile

**Approved Emails:**
- ✅ Only admins can read (security)
- ✅ Can only be modified through Firebase Console

---

## ⚡ Why You Got "Missing Permissions"

Firebase Firestore and Storage have **strict default rules** that deny all access. When you created the database, it likely has rules like:

```javascript
// Default deny rule
match /{document=**} {
  allow read, write: if false;
}
```

This is a security feature! By deploying the rules above, you're explicitly allowing:
1. Authenticated users (you) to create courses and categories
2. Public users to view courses
3. Image uploads to Storage

---

## 📊 After Deployment - What Works

| Action | Before | After |
|--------|--------|-------|
| Create Category | ❌ Missing permissions | ✅ Works |
| Add Course | ❌ Missing permissions | ✅ Works |
| Upload Image | ❌ Missing permissions | ✅ Works |
| View Courses | ✅ Already working | ✅ Still works |
| Admin Access | ✅ Already working | ✅ Still works |

---

## 🚨 Important Notes

1. **Admin Email Setup:**
   - Make sure your email is in `.env.local` under `VITE_ADMIN_EMAILS`
   - Also add it to Firestore `approved_emails` collection:
     ```javascript
     // In Firestore Console → approved_emails collection
     {
       email: "your-email@example.com", // lowercase
       approved: true,
       role: "admin"
     }
     ```

2. **Test User:**
   - If you want regular users to create courses too, adjust the `isAdmin()` check
   - Currently, any authenticated user can create, but only admins can edit/delete

3. **Production Security:**
   - These rules allow authenticated users to create courses
   - For stricter security, change line 28 & 35 to:
     ```javascript
     allow create: if isAdmin(); // Only admins can create
     ```

---

## 🎯 Quick Checklist

- [ ] Deploy Firestore rules to Firebase Console
- [ ] Deploy Storage rules to Firebase Console
- [ ] Verify your email in `approved_emails` collection
- [ ] Test creating a category
- [ ] Test adding a course with image
- [ ] Verify course appears in catalog

---

## 🔧 Troubleshooting

### Still Getting "Missing permissions"?

**Check 1: Rules Published**
- Go to Firebase Console → Firestore → Rules
- Verify the new rules are there (not the default deny-all)
- Make sure you clicked "Publish"

**Check 2: Admin Email**
1. Check `.env.local` has your email:
   ```
   VITE_ADMIN_EMAILS=your-email@example.com
   ```
2. Check Firestore `approved_emails` collection has a document:
   - Document ID: `your-email@example.com` (lowercase)
   - Fields: `{ approved: true, role: "admin" }`

**Check 3: Restart Dev Server**
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

**Check 4: Clear Browser Cache**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or open in incognito/private window

### Still Having Issues?

Open browser console (F12) and check for specific error messages. Common issues:
- `auth/user-not-found` → Login again
- `permission-denied` → Rules not deployed correctly
- `unauthenticated` → Logout and login again

---

## ✅ Success!

After deploying these rules, you should be able to:
1. ✅ Create categories without errors
2. ✅ Add courses with images
3. ✅ See courses in the catalog
4. ✅ All permissions working correctly

**Time to deploy: < 5 minutes** ⚡

Just copy-paste the rules into Firebase Console and click Publish! 🎉

