# Musfiq R. Farhan Portfolio - Complete Setup Guide

## 🎯 Project Overview

This is a professional portfolio and blog website for Musfiq R. Farhan, showcasing his multi-talented career as a Radio Jockey, actor, and content creator. The site is built with:

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **CMS**: Decap CMS for blog management
- **Hosting**: GitHub Pages
- **Domain**: MusfiqrFarhan.blog (custom domain)

## 📋 What's Been Built

### ✅ Completed Components

1. **Professional Homepage** (`docs/index.html`)
   - Hero section with call-to-action buttons
   - About section with biography
   - Career highlights (4 key areas)
   - Portfolio/works section (3 featured projects)
   - Blog section with latest posts
   - Contact section with social links
   - Responsive footer

2. **Styling** (`assets/css/style.css`)
   - Modern, professional design
   - Responsive grid layouts
   - Smooth transitions and hover effects
   - Mobile-first approach
   - Color scheme: Blue (#1e40af), Amber (#f59e0b), Purple (#8b5cf6)

3. **JavaScript** (`assets/js/main.js`)
   - Smooth scrolling navigation
   - Active link highlighting
   - Lazy image loading
   - Scroll animations
   - Mobile menu support

4. **Decap CMS Admin** (`docs/admin/`)
   - `config.yml`: CMS configuration
   - `index.html`: Admin interface
   - Collections for blog posts and projects
   - Media upload support

5. **Content Structure**
   - `_posts/`: Blog posts in Jekyll format
   - `_pages/`: Additional pages
   - `assets/`: Images, CSS, JavaScript
   - `_config.yml`: Jekyll configuration

6. **Documentation**
   - `README.md`: Project overview and features
   - `SETUP_GUIDE.md`: This file
   - `.gitignore`: Git ignore rules

## 🚀 Deployment Steps

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/Sayadbayezid/MusfiqrFarhan
2. Click **Settings** (top right)
3. Scroll to **Pages** section (left sidebar)
4. Under "Build and deployment":
   - Select **Deploy from a branch**
   - Choose branch: **main**
   - Choose folder: **/docs**
   - Click **Save**

Your site will be available at: `https://sayadbayezid.github.io/MusfiqrFarhan/`

### Step 2: Configure Custom Domain

1. In repository **Settings → Pages**
2. Under "Custom domain":
   - Enter: `musfiqrfarhan.blog`
   - Click **Save**
3. GitHub will create a `CNAME` file automatically

4. **Update DNS Records** (with your domain registrar):
   - Add an `A` record pointing to GitHub Pages IP addresses:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   
   OR use a `CNAME` record:
   - Name: `www`
   - Value: `sayadbayezid.github.io`

5. Wait 24-48 hours for DNS propagation
6. Enable HTTPS: Check "Enforce HTTPS" in Settings → Pages

### Step 3: Set Up Decap CMS Authentication

1. **Create GitHub OAuth App:**
   - Go to: https://github.com/settings/developers
   - Click **New OAuth App**
   - Fill in details:
     - Application name: `Musfiq Portfolio CMS`
     - Homepage URL: `https://musfiqrfarhan.blog`
     - Authorization callback URL: `https://api.netlify.com/auth/done`
     - Description: `Admin dashboard for blog management`
   - Click **Register application**

2. **Save Credentials:**
   - Copy **Client ID**
   - Generate and copy **Client Secret** (save immediately!)

3. **Configure in Netlify:**
   - Go to: https://app.netlify.com
   - Create new site or use existing
   - Go to **Site settings → Access & security → OAuth**
   - Click **Install Provider**
   - Select **GitHub**
   - Paste Client ID and Client Secret
   - Click **Save**

4. **Access Admin Panel:**
   - Navigate to: `https://musfiqrfarhan.blog/admin`
   - Click "Login with GitHub"
   - Authorize the application
   - Start managing content!

## 📝 Content Management

### Adding Blog Posts

**Via Decap CMS (Recommended):**
1. Go to `https://musfiqrfarhan.blog/admin`
2. Click **Blog Posts**
3. Click **New Blog Post**
4. Fill in:
   - Title
   - Publish Date
   - Featured Image
   - Description
   - Body (Markdown)
   - Tags
   - Category
5. Click **Publish**

**Manually (via Git):**
1. Create file: `_posts/YYYY-MM-DD-post-title.md`
2. Add frontmatter:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: 2026-05-07
   image: "/assets/images/uploads/image.jpg"
   category: "Radio"
   tags: ["tag1", "tag2"]
   ---
   ```
3. Write content in Markdown
4. Commit and push to GitHub

### Adding Projects

**Via Decap CMS:**
1. Go to `https://musfiqrfarhan.blog/admin`
2. Click **Projects & Works**
3. Fill in project details
4. Publish

**Manually:**
1. Create file: `_pages/projects/project-name.md`
2. Add similar frontmatter with project details

## 🎨 Customization

### Change Colors

Edit `assets/css/style.css` - modify CSS variables:

```css
:root {
  --primary: #1e40af;        /* Main blue */
  --secondary: #f59e0b;      /* Amber accent */
  --accent: #8b5cf6;         /* Purple highlight */
  --text-dark: #1f2937;      /* Dark text */
  --text-light: #6b7280;     /* Light gray text */
  --bg-light: #f9fafb;       /* Light background */
}
```

### Update Social Links

Edit `docs/index.html` - find the contact section:

```html
<a href="https://facebook.com/your-profile" class="social-link">f</a>
<a href="https://instagram.com/your-profile" class="social-link">📷</a>
```

### Add New Sections

1. Add HTML section in `docs/index.html`
2. Add CSS styling in `assets/css/style.css`
3. Add navigation link in header
4. Commit and push

## 🔍 SEO & Analytics

### Add Google Analytics

1. Get your Google Analytics ID from Google Analytics
2. Update `_config.yml`:
   ```yaml
   google_analytics: "G-XXXXXXXXXX"
   ```
3. Commit and push

### Update Meta Tags

Edit `docs/index.html` - update Open Graph tags:

```html
<meta property="og:title" content="Your Title">
<meta property="og:description" content="Your description">
<meta property="og:image" content="https://musfiqrfarhan.blog/assets/images/hero.jpg">
```

## 🐛 Troubleshooting

### Site Not Loading

**Problem:** Getting 404 or blank page
**Solution:**
- Verify `/docs` folder is set as source in Settings → Pages
- Check that `index.html` exists in `docs/` folder
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)

### Images Not Showing

**Problem:** Broken image links
**Solution:**
- Check image paths are relative to `docs/` folder
- Verify images exist in `assets/images/`
- Check file extensions (.jpg, .png, etc.)
- Use correct path format: `../assets/images/filename.jpg`

### Admin Panel Not Loading

**Problem:** Decap CMS admin page blank
**Solution:**
- Check browser console for errors (F12)
- Verify `docs/admin/config.yml` exists
- Check YAML syntax is valid
- Verify GitHub OAuth App is configured correctly
- Ensure Authorization callback URL is exactly: `https://api.netlify.com/auth/done`

### Authentication Failed

**Problem:** Can't log in to admin panel
**Solution:**
- Verify you have push access to the repository
- Check GitHub OAuth App credentials are correct
- Ensure Client Secret is valid (regenerate if needed)
- Verify Netlify OAuth provider is configured
- Try logging out and logging back in

## 📚 File Structure Reference

```
MusfiqrFarhan/
├── docs/                          # GitHub Pages root
│   ├── index.html                 # Main portfolio page
│   ├── admin/
│   │   ├── config.yml             # Decap CMS config
│   │   └── index.html             # Admin interface
│   └── [other pages]
├── assets/
│   ├── css/
│   │   └── style.css              # Main stylesheet
│   ├── js/
│   │   └── main.js                # JavaScript
│   └── images/
│       ├── uploads/               # Media uploads
│       ├── hero.jpg
│       ├── about.jpg
│       ├── work1.jpg, work2.jpg, work3.jpg
│       └── blog1.jpg, blog2.jpg, blog3.jpg
├── _posts/                        # Blog posts
│   └── 2026-05-07-welcome-to-my-portfolio.md
├── _pages/                        # Additional pages
│   └── projects/
├── _config.yml                    # Jekyll config
├── README.md                      # Project readme
├── SETUP_GUIDE.md                 # This file
├── .gitignore                     # Git ignore rules
└── LICENSE                        # MIT License
```

## 🔗 Important Links

- **Repository**: https://github.com/Sayadbayezid/MusfiqrFarhan
- **Live Site**: https://musfiqrfarhan.blog
- **Admin Panel**: https://musfiqrfarhan.blog/admin
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Decap CMS Docs**: https://decapcms.org/docs/
- **Jekyll Docs**: https://jekyllrb.com/docs/

## 📧 Support & Contact

For issues or questions:
- Create an issue on GitHub
- Contact: contact@musfiqrfarhan.blog
- Check the README.md for additional resources

## ✨ Next Steps

1. **Replace placeholder images** with real photos
2. **Update social media links** with actual profiles
3. **Customize colors** to match brand identity
4. **Add more blog posts** via Decap CMS
5. **Set up Google Analytics** for traffic tracking
6. **Configure email contact form** (optional)
7. **Add more portfolio projects** as needed

## 📝 Notes

- The site is fully responsive and works on all devices
- All content is version controlled via Git
- Changes are automatically deployed to GitHub Pages
- Decap CMS provides an easy interface for non-technical users
- The site uses Jekyll for static site generation
- No database or backend server required

---

**Created**: May 7, 2026
**Version**: 1.0.0
**Status**: Ready for deployment
