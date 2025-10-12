# How to Add Your Custom Images

## Current Setup
The login page is now using your existing musical image: `music_notes_instrume_07962769.jpg`

## To Add Your Custom Images

### Option 1: Replace the existing image
1. Save your background image as: `attached_assets/stock_images/music_notes_instrume_07962769.jpg`
2. This will automatically be used as both background and hero image

### Option 2: Add separate images
1. Save your background image as: `attached_assets/stock_images/auth-login-bg.jpg`
2. Save your hero image as: `attached_assets/stock_images/auth-login-hero.png`
3. Update the LoginPage.tsx file to use these filenames:

```typescript
// Change these lines in client/src/pages/auth/LoginPage.tsx:
try {
  BG = new URL("@assets/stock_images/auth-login-bg.jpg", import.meta.url).toString();
} catch {}
try {
  HERO = new URL("@assets/stock_images/auth-login-hero.png", import.meta.url).toString();
} catch {}
```

## Current Status
✅ Login page is working with musical background
✅ Fallback images are in place
✅ You can view it at: http://localhost:3001/auth/login

## Test the Current Setup
1. Go to http://localhost:3001/auth/login
2. You should see the musical background and hero image
3. The form should be readable with the overlay effect
