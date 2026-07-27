# Deployment Guide

## ✅ Code Successfully Pushed to GitHub!

**Repository:** https://github.com/ngaboserge/shorainstitute.git  
**Branch:** main  
**Commit:** QR code seminar registration with compact cards

---

## 🌐 Production Setup (www.shorainstitute.com)

### Step 1: Update Environment Variables on Server

SSH into your production server and update the `.env` file:

```bash
# Change this from localhost to your production URL:
VITE_SITE_URL=https://www.shorainstitute.com

# Keep other variables as is
SITE_URL=https://www.shorainstitute.com
```

### Step 2: Pull Latest Code

```bash
cd /path/to/shorainstitute
git pull origin main
```

### Step 3: Install Dependencies (if new packages added)

```bash
npm install
```

### Step 4: Build for Production

```bash
npm run build
```

### Step 5: Restart Server/Service

Depending on your setup:
```bash
# If using PM2:
pm2 restart shorainstitute

# If using systemd:
sudo systemctl restart shorainstitute

# If using nginx with static files:
# Just copy dist folder to nginx root
```

---

## 🔧 Vercel Setup (Testing)

Vercel should automatically deploy from GitHub when you push to main.

### Update Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add/Update:

```
VITE_SITE_URL = https://your-vercel-app.vercel.app
SITE_URL = https://your-vercel-app.vercel.app
```

4. Redeploy after updating environment variables

---

## 🎯 QR Code URLs

### Development (localhost):
```
VITE_SITE_URL=http://localhost:3000
QR Code generates: http://localhost:3000/seminar/{id}/register
```

### Production (www.shorainstitute.com):
```
VITE_SITE_URL=https://www.shorainstitute.com
QR Code generates: https://www.shorainstitute.com/seminar/{id}/register
```

### Vercel (Testing):
```
VITE_SITE_URL=https://your-app.vercel.app
QR Code generates: https://your-app.vercel.app/seminar/{id}/register
```

---

## 📋 Changes Deployed

### Features Added:
✅ **QR Code Generation** for direct seminar registration  
✅ **Compact Seminar Cards** on homepage (grid layout)  
✅ **Direct Registration Flow** with auto-redirect  
✅ **Thumbnail Display** on registration form  
✅ **Production URL Support** in QR codes  
✅ **B2B Institutional System** (database ready, UI complete)  
✅ **Institutional Auth** and portal pages  
✅ **Seminar Signup/Login** pages  

### Files Added:
- `src/components/QRCodeModal.jsx` - QR code generator
- `src/pages/public/SeminarRegistrationForm.jsx` - Registration form
- `src/pages/auth/SeminarSignup.jsx` - Simplified signup
- `src/pages/auth/SeminarLogin.jsx` - Simplified login
- `src/pages/auth/InstitutionalLogin.jsx` - Institutional auth
- `src/components/InstitutionalAuthGuard.jsx` - Auth guard
- Multiple institutional portal pages
- B2B system migration files

### Files Modified:
- `src/pages/HomePage.jsx` - Compact card layout
- `src/pages/HomePage.css` - New card styles
- `src/App.jsx` - New routes added
- `.env.example` - Added VITE_SITE_URL
- `.gitignore` - Added /dist folder

### Files Removed:
- 68 temporary documentation files
- 5 temporary SQL files in root
- SSH key (id_ed25519.pub)

---

## 🧪 Testing After Deployment

### 1. Test Homepage:
- Visit homepage
- Check if seminars display in compact card grid
- Verify responsive design on mobile

### 2. Test QR Code Generation:
- Login as trainer
- Go to Manage Seminars
- Click "QR Code" button
- Verify URL shows production domain (not localhost)
- Download QR code and test scanning

### 3. Test Registration Flow:
- Scan QR code or visit registration URL
- Should go directly to registration form
- If not logged in, should redirect to signup
- After signup, should return to registration form
- Submit registration
- Should redirect to seminars portal

### 4. Test Thumbnail Display:
- Visit registration form for seminar with thumbnail
- Verify thumbnail displays at top
- Test on mobile

---

## ⚠️ Important Notes

### QR Code URL Fix:
The QR code modal now uses `VITE_SITE_URL` environment variable instead of `window.location.origin`. This means:
- **Development**: Set `VITE_SITE_URL=http://localhost:3000`
- **Production**: Set `VITE_SITE_URL=https://www.shorainstitute.com`
- **Vercel**: Set `VITE_SITE_URL=https://your-app.vercel.app`

### Build Notes:
- Build completed successfully
- Some CSS warnings (fontWeight/fontSize) - these are safe to ignore
- Main bundle is 1.96 MB (consider code splitting for future optimization)
- All assets generated in `/dist` folder

### Database:
- B2B institutional system migration is ready but NOT run yet
- Run migration manually when ready to activate B2B features
- File: `migrations/20260127000000_b2b_institutional_system.sql`

---

## 🚀 Quick Deployment Checklist

Production Server:
- [ ] Pull latest code from GitHub
- [ ] Update VITE_SITE_URL in .env
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build`
- [ ] Restart server/service
- [ ] Test QR code generation
- [ ] Test registration flow
- [ ] Verify thumbnails display

Vercel:
- [ ] Update VITE_SITE_URL in environment variables
- [ ] Trigger redeploy (or wait for auto-deploy)
- [ ] Test QR code generation
- [ ] Test registration flow

---

## 📞 Support

If you encounter issues:

1. **QR codes still showing localhost?**
   - Check VITE_SITE_URL in environment variables
   - Rebuild the project: `npm run build`
   - Clear browser cache

2. **Registration form not showing thumbnail?**
   - Check if seminar has thumbnail_url in database
   - Check browser console for image loading errors

3. **Compact cards not displaying properly?**
   - Clear browser cache
   - Check HomePage.css loaded correctly
   - Verify responsive design on different screen sizes

---

## 🎉 Summary

**Status:** ✅ Successfully deployed to GitHub!

**Next Steps:**
1. Update VITE_SITE_URL on production server
2. Pull and build on production
3. Test QR code generation
4. Start using QR codes for seminar marketing!

**QR codes now work with production URLs!** 🚀

---

*Last Updated: January 27, 2026*
*Deployment: Production Ready*
