# Deployment Checklist - Musfiq R. Farhan Portfolio

## ✅ Pre-Deployment Verification

- [x] Repository cloned and files organized
- [x] Homepage created with all sections
- [x] CSS styling complete and responsive
- [x] JavaScript functionality implemented
- [x] Placeholder images created
- [x] Decap CMS configuration ready
- [x] Jekyll configuration set up
- [x] README and documentation complete
- [x] Files committed to Git
- [x] Code pushed to GitHub

## 🚀 Deployment Steps (In Order)

### Step 1: Enable GitHub Pages
- [ ] Go to https://github.com/Sayadbayezid/MusfiqrFarhan/settings
- [ ] Scroll to "Pages" section
- [ ] Select "Deploy from a branch"
- [ ] Choose branch: **main**
- [ ] Choose folder: **/docs**
- [ ] Click "Save"
- [ ] Wait for deployment (usually 1-2 minutes)
- [ ] Verify site is live at: https://sayadbayezid.github.io/MusfiqrFarhan/

### Step 2: Set Up Custom Domain
- [ ] In Settings → Pages
- [ ] Enter custom domain: `musfiqrfarhan.blog`
- [ ] Click "Save"
- [ ] GitHub creates CNAME file automatically

### Step 3: Configure DNS Records
- [ ] Log in to your domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Go to DNS settings
- [ ] Add A records pointing to GitHub Pages:
  - [ ] `185.199.108.153`
  - [ ] `185.199.109.153`
  - [ ] `185.199.110.153`
  - [ ] `185.199.111.153`
- [ ] OR add CNAME record:
  - [ ] Name: `www`
  - [ ] Value: `sayadbayezid.github.io`
- [ ] Save DNS changes
- [ ] Wait 24-48 hours for DNS propagation

### Step 4: Enable HTTPS
- [ ] Go back to Settings → Pages
- [ ] Check "Enforce HTTPS" checkbox
- [ ] Wait for SSL certificate to be issued (usually 5-10 minutes)

### Step 5: Set Up Decap CMS Authentication
- [ ] Go to https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in:
  - [ ] Application name: `Musfiq Portfolio CMS`
  - [ ] Homepage URL: `https://musfiqrfarhan.blog`
  - [ ] Authorization callback URL: `https://api.netlify.com/auth/done`
  - [ ] Description: `Admin dashboard for blog management`
- [ ] Click "Register application"
- [ ] Copy Client ID
- [ ] Generate Client Secret (save immediately!)

### Step 6: Configure Netlify OAuth Provider
- [ ] Go to https://app.netlify.com
- [ ] Create new site or select existing
- [ ] Go to Site settings → Access & security → OAuth
- [ ] Click "Install Provider"
- [ ] Select GitHub
- [ ] Paste Client ID
- [ ] Paste Client Secret
- [ ] Click "Save"

### Step 7: Test Admin Panel
- [ ] Navigate to `https://musfiqrfarhan.blog/admin`
- [ ] Click "Login with GitHub"
- [ ] Authorize the application
- [ ] Verify you can see the CMS interface
- [ ] Try creating a test blog post
- [ ] Verify post appears on main site

### Step 8: Verify All Features
- [ ] Homepage loads correctly
- [ ] All sections visible and styled properly
- [ ] Navigation links work smoothly
- [ ] Images load without errors
- [ ] Responsive design works on mobile
- [ ] Blog section displays posts
- [ ] Contact section visible
- [ ] Social links functional
- [ ] Admin panel accessible at `/admin`

## 📱 Testing Checklist

### Desktop (Chrome, Firefox, Safari)
- [ ] Homepage displays correctly
- [ ] All images load
- [ ] Navigation works
- [ ] Hover effects work
- [ ] Links functional

### Mobile (iOS, Android)
- [ ] Homepage responsive
- [ ] Text readable
- [ ] Images scaled properly
- [ ] Navigation accessible
- [ ] Buttons clickable

### Admin Panel
- [ ] Login works
- [ ] Can create new blog post
- [ ] Can upload images
- [ ] Can edit existing posts
- [ ] Changes appear on main site

## 🔍 Post-Deployment Verification

- [ ] Site accessible at https://musfiqrfarhan.blog
- [ ] HTTPS enabled (lock icon visible)
- [ ] Admin panel working at /admin
- [ ] Blog posts displaying correctly
- [ ] Images loading from correct paths
- [ ] Social links pointing to correct profiles
- [ ] Contact information visible
- [ ] Mobile responsive
- [ ] Page loads quickly

## 📊 Analytics & Monitoring

- [ ] Set up Google Analytics (optional)
- [ ] Configure search console
- [ ] Monitor site traffic
- [ ] Check for 404 errors
- [ ] Monitor performance metrics

## 🎯 Content Updates

- [ ] Replace placeholder images with real photos
- [ ] Update social media links
- [ ] Add real blog posts
- [ ] Update portfolio projects
- [ ] Customize colors if needed
- [ ] Update contact information
- [ ] Add more career highlights

## 🔐 Security & Maintenance

- [ ] Enable branch protection rules
- [ ] Set up automatic backups
- [ ] Monitor repository for security alerts
- [ ] Keep dependencies updated
- [ ] Review access permissions

## 📝 Documentation

- [ ] README.md complete
- [ ] SETUP_GUIDE.md created
- [ ] DEPLOYMENT_CHECKLIST.md (this file)
- [ ] Comments added to code where needed
- [ ] Documented any custom configurations

## 🎉 Launch Readiness

- [ ] All checklist items completed
- [ ] Site tested thoroughly
- [ ] Team reviewed and approved
- [ ] Ready to announce launch
- [ ] Social media posts prepared

## 📞 Support & Troubleshooting

If you encounter issues:

1. **Site not loading**
   - Check GitHub Pages settings
   - Verify `/docs` folder is selected
   - Clear browser cache

2. **Custom domain not working**
   - Wait for DNS propagation (24-48 hours)
   - Verify DNS records are correct
   - Check CNAME file exists in repository

3. **Admin panel not accessible**
   - Verify GitHub OAuth App settings
   - Check Authorization callback URL
   - Ensure Netlify provider is configured

4. **Images not showing**
   - Check image paths are correct
   - Verify images exist in repository
   - Check file extensions

For more help, see SETUP_GUIDE.md or check the README.md

---

**Deployment Status**: Ready to Deploy
**Last Updated**: May 7, 2026
**Version**: 1.0.0
