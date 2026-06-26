# 🚂 Railway Deployment Guide (Alternative to SSH)

Your repo has `railway.json`, so you can deploy to Railway instead of manual SSH!

## What is Railway?

Railway is a modern hosting platform that automatically deploys your app:
- Auto builds from GitHub
- Auto deploys on push
- Manages SSL/TLS
- Scales automatically
- Free for small projects (with limits)

## 🆚 Comparison: SSH vs Railway

| Feature | Manual SSH | Railway |
|---------|-----------|---------|
| **Setup Time** | 20 min | 5 min |
| **Deployment** | Manual via CI/CD | Automatic |
| **SSL/TLS** | Manual config | Automatic |
| **Scaling** | Manual | Automatic |
| **Cost** | Server cost | Free+ pricing |
| **Control** | Full | Limited |
| **Learning Curve** | Steep | Easy |

## 🚀 Option 1: Use Railway (Recommended for Beginners)

### Step 1: Create Railway Account
```
1. Go to: https://railway.app
2. Sign up with GitHub
3. Give permissions to your repo
```

### Step 2: Create New Project
```
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Choose your repository
4. Select "Confirm Deploy"
```

### Step 3: Configure railway.json
Your `railway.json` should look like:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyCondition": "on-failure",
    "restartPolicyMaxRetries": 5
  }
}
```

### Step 4: Add Environment Variables
In Railway dashboard:
1. Click your project
2. Go to "Variables"
3. Add any environment variables needed:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### Step 5: Deploy
```
1. Go to "Deployments" tab
2. Click "Deploy" button
3. Watch it build and deploy
4. Get your URL (e.g., https://app-name-production.up.railway.app)
```

### Step 6: Auto-Deploy from GitHub
```
1. Go to "Settings" tab
2. Enable "Deploy on Push"
3. Select branch (main)
4. Save
```

Now every push to `main` auto-deploys!

## 📦 Using Railway with Our Workflows

### Option A: Railway Only (Simplest)
```
Don't use our deploy.yml
Use Railway's built-in GitHub integration
```

### Option B: Railway + GitHub Actions
```
Use our workflows to:
1. Run tests
2. Build Docker image
3. Push to Railway
```

Here's how to modify `deploy.yml` for Railway:

```yaml
- name: Deploy to Railway
  uses: railway-app/deploy-action@v1
  with:
    token: ${{ secrets.RAILWAY_TOKEN }}
    service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

## 🚂 Step-by-Step Railway Setup

### 1. Get Railway Token

```
1. Go to: https://railway.app/account/tokens
2. Create new token
3. Copy token
4. Add to GitHub secrets as: RAILWAY_TOKEN
```

### 2. Get Service ID

```
1. In Railway dashboard
2. Go to your project
3. Click "Settings"
4. Copy "Service ID"
5. Add to GitHub secrets as: RAILWAY_SERVICE_ID
```

### 3. Configure GitHub Secrets

Go to: `Settings > Secrets and variables > Actions`

Add:
```
RAILWAY_TOKEN = your-token-here
RAILWAY_SERVICE_ID = your-service-id
```

### 4. Update Workflow

```yaml
# .github/workflows/deploy.yml

deploy-railway:
  name: Deploy to Railway
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Deploy to Railway
      uses: railway-app/deploy-action@v1
      with:
        token: ${{ secrets.RAILWAY_TOKEN }}
        service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

## 📊 Railway Pricing

### Free Tier
- ✅ $5 monthly credit
- ✅ 500 build minutes
- ✅ Enough for small projects
- ✅ Automatic SSL

### Pay as You Go
- 💰 $0.50/GB-month (memory)
- 💰 $0.10/CPU-month
- 💰 Typical app: $5-10/month

## ✅ Railway Deployment Steps

```
Push to main
    ↓
GitHub notifies Railway
    ↓
Railway pulls code
    ↓
Railway builds Dockerfile
    ↓
Railway runs: node dist/index.js
    ↓
App is live on railway.app subdomain
    ↓
Access via your custom domain
```

## 🔧 Railway vs Our Manual Deploy

### Our Manual Deploy (SSH)
```yaml
# Pros
✅ Full server control
✅ Custom configurations
✅ Cost-effective for long-term

# Cons
❌ Need to manage server
❌ Setup SSL/TLS manually
❌ Handle upgrades/security
```

### Railway Deploy
```yaml
# Pros
✅ Zero server management
✅ Auto SSL/TLS
✅ Auto scaling
✅ Easy monitoring

# Cons
❌ Less control
❌ Vendor lock-in
❌ Limited customization
```

## 🎯 Recommended Setup for You

### For Quick Start (Recommended)
```
Use Railway
- Zero infrastructure setup
- Auto SSL
- Auto deployments
- Free tier enough for portfolio
```

### For Full Control
```
Use our SSH workflows
- Own server
- Full customization
- Long-term cost savings
```

### For Both (Hybrid)
```
Use Railway for staging
Use SSH for production
Best of both worlds
```

## 📝 railway.json Example for Your App

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "dockerfile",
    "watchPatterns": [
      "client/**",
      "server/**",
      "shared/**",
      "package.json",
      "pnpm-lock.yaml"
    ]
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "restartPolicyCondition": "on-failure",
    "restartPolicyMaxRetries": 5,
    "runtime": "node"
  }
}
```

## 🚀 Deploy on Railway in 5 Minutes

```bash
# 1. Update railway.json (see above)
git add railway.json
git commit -m "feat: configure railway deployment"
git push origin main

# 2. Create Railway account
# https://railway.app

# 3. Connect GitHub repo
# Select: bayezid_portfolio
# Click: Deploy

# 4. Wait for deployment (2-3 min)
# View at: your-app.up.railway.app

# 5. Done!
```

## 🔗 Connect Custom Domain to Railway

### Add Custom Domain

```
1. Railway dashboard
2. Click your project
3. Go to "Settings"
4. Click "Domain"
5. Enter your domain (e.g., bayezid.dev)
6. Add CNAME record to your DNS
7. Done!
```

### DNS Configuration Example

If using Namecheap or similar:

```
Record: CNAME
Name: www (or @)
Value: your-app.up.railway.app
```

## 🎁 Railway Features for Your App

| Feature | Status |
|---------|--------|
| Auto SSL | ✅ Included |
| Auto deployments | ✅ On push to main |
| Environment variables | ✅ Dashboard |
| Logs | ✅ Real-time |
| Monitoring | ✅ Included |
| Scaling | ✅ Automatic |
| Health checks | ✅ Supported |
| Custom domain | ✅ Supported |

## 📊 Expected Performance

Railway provides:
- **Response time**: < 100ms
- **Uptime**: 99.5%+
- **Auto scaling**: Yes
- **CDN**: Optional
- **Backups**: Manual only

## ⚠️ Railway Limitations

- Limited to 100GB storage (free tier)
- Limited build minutes (500/month free)
- Can't install system packages
- No SSH access
- Limited customization

## 🆘 Railway Troubleshooting

### Build fails
```
1. Check logs: Railway dashboard > Deployments
2. Common issues:
   - Node version mismatch
   - Missing environment variables
   - Dockerfile path incorrect
```

### App doesn't start
```
1. Check start command in railway.json
2. Should be: node dist/index.js
3. Check port: Should use process.env.PORT || 3000
```

### Slow deployments
```
1. Clear Railway cache: Settings > Clear Cache
2. Check dependencies: pnpm-lock.yaml
3. Use .dockerignore: Already included
```

## 🎯 Decision Tree: SSH vs Railway

```
Do you want zero setup?
├─ YES → Use Railway
└─ NO → Use SSH

Do you need full control?
├─ YES → Use SSH
└─ NO → Use Railway

Will this be long-term?
├─ YES → Use SSH (cost savings)
└─ NO → Use Railway (quick)

Budget for infrastructure?
├─ YES → Use SSH
└─ NO → Use Railway (free tier)
```

## 📚 Recommended Path

For your portfolio app:
```
1. Start with Railway (quick setup)
2. Get comfortable with deployments
3. Later move to SSH if needed
```

## 🔄 Railway Deployment Flow

```
1. Push to GitHub
   git push origin main
    ↓
2. GitHub notifies Railway
    ↓
3. Railway builds image
   docker build .
    ↓
4. Railway starts container
   node dist/index.js
    ↓
5. Railway gives you a URL
   https://bayezid-portfolio.up.railway.app
    ↓
6. Add custom domain (optional)
    ↓
7. Done! App is live 🎉
```

## 🎓 Next Steps

### Choose Your Path:

**Path A: Use Railway (Recommended)**
1. Create Railway account
2. Connect GitHub
3. Update railway.json
4. Deploy

**Path B: Use Our SSH Workflows**
1. Follow GITHUB_ACTIONS_SETUP.md
2. Configure server
3. Add secrets
4. Deploy

**Path C: Use Both**
1. Railway for staging
2. SSH for production
3. Best flexibility

---

**TL;DR**: Railway is easier, SSH gives more control. Choose based on your needs! 🚀
