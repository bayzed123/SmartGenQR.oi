---
slug: "github-secrets-explained"
title: "GitHub Secrets Explained"
description: Learn about secrets as they are used in GitHub Actions workflows.
order: 1
category: "Guides"
---
# 🔐 GitHub Secrets Explained for Beginners

## What is a "Secret"? 🤔

A **secret** is like a **password** or **hidden information** that you don't want to share publicly.

### Real-Life Example

Think of it like this:

```
Your House 🏠
├── Living Room (public - anyone can see)
├── Bedroom (private - only you see)
└── Safe Box (secret - locked, only you have key)
    ├── Passwords
    ├── Credit cards
    └── Personal documents
```

### In Programming:

```
Your Website
├── Code (public - on GitHub, everyone sees)
├── Configuration (private - only on your server)
└── Secrets (locked - passwords, API keys, SSH keys)
    ├── Server passwords
    ├── Database passwords
    ├── API keys from services
    └── SSH keys for deployment
```

## Why Use the Word "Secret"? 🤐

It's called a "secret" because:
- 🔒 It's **locked and encrypted**
- 👤 Only **you** can access it
- 🙈 It's **hidden from public view**
- 🔑 It's like a **password** or **API key**

## What Kind of Information is "Secret"?

### ✅ Things That Should Be Secret:
```
1. Server passwords
2. SSH private keys
3. API tokens
4. Database passwords
5. Credit card numbers
6. Personal information
```

### ❌ Things That Are NOT Secret:
```
1. Your code
2. Your README file
3. Your project name
4. Public configuration
```

## GitHub Secrets in Simple Terms

GitHub has a special feature where you can:
1. Store secrets **safely** (encrypted)
2. Use them in **workflows** (CI/CD)
3. **Nobody** can see them (except you)

### Analogy: Treasure Box 🎁

```
Regular Files (GitHub repo)
├── README.md
├── package.json
└── All visible to everyone
    ↓
    Public to anyone on internet!

GitHub Secrets (Special encrypted storage)
├── PRODUCTION_SERVER_HOST
├── PRODUCTION_SERVER_SSH_KEY
└── PRODUCTION_SERVER_USER
    ↓
    Only YOU can see it!
```

## Your Specific Secrets for Deployment

For deploying your portfolio, you need these secrets:

### For Staging Server (Testing):
```
STAGING_SERVER_HOST          = IP address of staging server
STAGING_SERVER_USER          = Username to login
STAGING_SERVER_SSH_KEY       = Private key to connect
STAGING_DEPLOYMENT_PATH      = Folder path on server
STAGING_URL                  = Website URL
```

### For Production Server (Live):
```
PRODUCTION_SERVER_HOST       = IP address of production server
PRODUCTION_SERVER_USER       = Username to login
PRODUCTION_SERVER_SSH_KEY    = Private key to connect
PRODUCTION_DEPLOYMENT_PATH   = Folder path on server
PRODUCTION_URL               = Website URL
```

## Example: What is SSH Key? 🔑

### SSH Key = Digital Lock & Key

```
Like a physical lock:
┌─────────────────┐
│ Your House 🏠   │
│ Locked with:    │
│ Public lock     │
│ (everyone sees) │
└─────────────────┘

Your key:
┌─────────────────┐
│ Private key 🔑  │
│ (only you have) │
│ Opens the lock  │
└─────────────────┘
```

### In Code:
```
Server has: Public lock (installed on server)
You have: Private key (keep secret in GitHub)

When deploying:
GitHub workflows say: "I'm deploying!"
Server checks: "Do you have the private key?"
GitHub shows: SSH key from secrets
Server checks: "Yes, I recognize this key!"
Server allows: Deployment to happen!
```

## Why Can't You Just Use Passwords? 🤔

Because:
1. **Passwords are unsafe** - Can be guessed
2. **SSH keys are safer** - Like a fingerprint
3. **Passwords can expire** - Keys don't
4. **Keys are unique** - Hard to duplicate

## Where to Store Secrets in GitHub

### Step-by-Step:

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Click **Secrets and variables** (left sidebar)
4. Click **Actions**
5. Click **New repository secret**
6. Enter name and value
7. Click **Add secret**

```
📦 GitHub Repository
└── ⚙️ Settings
    └── 🔐 Secrets and variables
        └── Actions
            └── New repository secret
                ├── Name: STAGING_SERVER_HOST
                └── Value: 1.2.3.4
```

## Example: Adding a Secret

### What You Do:

```
Name: STAGING_SERVER_HOST
Value: 192.168.1.100

Click: Add secret
```

### What GitHub Does:

```
Encrypts: 192.168.1.100
Locks it: 🔒
Shows you: ••••••••••••• (hidden)
Only decrypts: When workflows need it
```

## How Workflows Use Secrets

### In Your Workflow File:

```yaml
- name: Deploy to Server
  run: ssh user@${{ secrets.STAGING_SERVER_HOST }}
```

### What Happens:

```
GitHub reads: ${{ secrets.STAGING_SERVER_HOST }}
Looks up: STAGING_SERVER_HOST from secrets
Gets value: 192.168.1.100
Replaces: ssh user@192.168.1.100
Runs command: Connects to server!
```

## Real Example for Your Portfolio

### Your Workflow Needs This:

```yaml
- name: Deploy Portfolio
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.PRODUCTION_SERVER_HOST }}
    username: ${{ secrets.PRODUCTION_SERVER_USER }}
    key: ${{ secrets.PRODUCTION_SERVER_SSH_KEY }}
```

### You Configured:

```
Secret 1: PRODUCTION_SERVER_HOST = 123.45.67.89
Secret 2: PRODUCTION_SERVER_USER = deploy
Secret 3: PRODUCTION_SERVER_SSH_KEY = -----BEGIN OPENSSH...
```

### Result:

```
GitHub replaces:
host: 123.45.67.89
username: deploy
key: -----BEGIN OPENSSH...

Then connects to your server and deploys!
```

## Why This is Safe? 🛡️

```
Without Secrets (DANGEROUS ❌):
- SSH key in workflow file
- Visible to everyone
- Anyone can deploy
- Your server is compromised!

With Secrets (SAFE ✅):
- SSH key encrypted
- Only on GitHub servers
- Only visible to you
- Workflows use it safely
- Your server is protected!
```

## Quick Checklist: Do You Need Secrets?

| Need | Type | Where |
|------|------|-------|
| Server IP | Secret | GitHub Secrets |
| Username | Secret | GitHub Secrets |
| SSH Key | Secret | GitHub Secrets |
| Deployment Path | Secret | GitHub Secrets |
| Website URL | Could be public | Or GitHub Secrets |
| Your code | Not a secret | In repository |
| README | Not a secret | In repository |

## Common Mistakes Beginners Make ❌

### Mistake 1: Putting secrets in code
```yaml
# ❌ WRONG - DON'T DO THIS!
host: 123.45.67.89
key: -----BEGIN OPENSSH PRIVATE KEY-----
```

### Mistake 2: Committing secrets to Git
```bash
# ❌ WRONG - DON'T DO THIS!
git add secrets.json
git push  # Now everyone sees your passwords!
```

### Mistake 3: Sharing SSH key publicly
```bash
# ❌ WRONG - DON'T DO THIS!
# Posting key in forum or chat
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### Correct Way ✅
```yaml
# ✅ RIGHT - USE SECRETS!
host: ${{ secrets.PRODUCTION_SERVER_HOST }}
key: ${{ secrets.PRODUCTION_SERVER_SSH_KEY }}
```

## Your Secret Names (For Your Portfolio)

These are the exact secret names we use:

### Staging Secrets:
```
1. STAGING_SERVER_HOST
2. STAGING_SERVER_USER
3. STAGING_SERVER_SSH_KEY
4. STAGING_DEPLOYMENT_PATH
5. STAGING_URL
```

### Production Secrets:
```
1. PRODUCTION_SERVER_HOST
2. PRODUCTION_SERVER_USER
3. PRODUCTION_SERVER_SSH_KEY
4. PRODUCTION_DEPLOYMENT_PATH
5. PRODUCTION_URL
```

### Optional:
```
1. SNYK_TOKEN (for security scanning)
```

## Where Do Values Come From?

### STAGING_SERVER_HOST
```
Get from: Your server provider (Linode, DigitalOcean, etc.)
Example: 185.234.218.45
How: ssh user@185.234.218.45
```

### STAGING_SERVER_USER
```
Get from: Server setup
Example: deploy
How: whoami (on server)
```

### STAGING_SERVER_SSH_KEY
```
Get from: Generate locally
Example: ssh-keygen -t ed25519
How: cat ~/.ssh/id_ed25519
What: Entire file content (starts with -----BEGIN...)
```

## Step-by-Step: Add Your First Secret

### 1. Go to GitHub
```
https://github.com/your-account/your_repostory
```

### 2. Click Settings
```
Repository → Settings (top right)
```

### 3. Go to Secrets
```
Left menu → Secrets and variables → Actions
```

### 4. Add Secret
```
Click: New repository secret
Name: STAGING_SERVER_HOST
Value: YOUR_SERVER_IP_HERE
Click: Add secret
```

### 5. Repeat for All Secrets
```
Do this 5 more times for:
- STAGING_SERVER_USER
- STAGING_SERVER_SSH_KEY
- STAGING_DEPLOYMENT_PATH
- STAGING_URL
- (And same for PRODUCTION_)
```

## How to Get Your Secret Values

### For STAGING_SERVER_HOST (Server IP):
```
If you have a server:
$ ip addr
or
$ curl https://checkip.amazonaws.com

If using cloud provider:
- DigitalOcean: Droplet → Settings → IP Address
- AWS: EC2 → Instances → Public IPv4 address
- Linode: Linodes → Server → IP Addresses
```

### For STAGING_SERVER_USER:
```
Default usually: root or deploy
Check with:
$ whoami
```

### For STAGING_SERVER_SSH_KEY:
```
Generate:
$ ssh-keygen -t ed25519 -f deploy_key -N ""

View private key:
$ cat deploy_key

Copy ENTIRE content (from -----BEGIN to -----END)
Paste into GitHub Secret
```

### For STAGING_DEPLOYMENT_PATH:
```
Folder on your server:
Example: /home/deploy/app

Where is your app?
$ pwd
(shows current path)
```

### For STAGING_URL:
```
Your website URL:
Example: https://staging.yourdomain.com

Or for IP:
Example: http://123.45.67.89
```

## Verification: Did You Add Secrets Correctly?

### Check GitHub:
```
1. Go to Settings > Secrets and variables > Actions
2. You should see all 5 secrets listed:
   ✅ STAGING_SERVER_HOST
   ✅ STAGING_SERVER_USER
   ✅ STAGING_SERVER_SSH_KEY
   ✅ STAGING_DEPLOYMENT_PATH
   ✅ STAGING_URL
3. Click each to verify (shows: •••••••••••)
```

### Check Workflows:
```
1. Make a push to GitHub
2. Go to Actions tab
3. Wait for workflow to run
4. If secrets work: ✅ Deployment succeeds
5. If secrets wrong: ❌ Connection fails
```

## Troubleshooting: Secrets Not Working

### Error: "Authentication failed"
```
Means: SSH key is wrong
Fix:
1. Copy private key again
2. Make sure no extra spaces
3. Use full key (-----BEGIN to -----END)
```

### Error: "Connection refused"
```
Means: Server IP is wrong
Fix:
1. Check IP is correct
2. Try ping: ping STAGING_SERVER_HOST
3. Make sure server is running
```

### Error: "Permission denied"
```
Means: User or SSH key wrong
Fix:
1. SSH manually first: ssh user@ip
2. Check user exists
3. Check SSH key works
```

## Summary 🎯

| Concept | Explanation |
|---------|-------------|
| **Secret** | Password/key you keep hidden |
| **GitHub Secret** | Encrypted storage on GitHub |
| **Why use it** | Keep sensitive info safe |
| **What to store** | Server IPs, keys, passwords |
| **How workflows use it** | ${{ secrets.NAME }} |
| **Your secrets** | 5 for staging, 5 for production |
| **Who can see** | Only you and workflows |

## Next Steps

1. **Read**: `FOLDER_STRUCTURE.md` (understand files)
2. **Get**: Server IP, SSH key, etc.
3. **Add**: All secrets to GitHub
4. **Push**: Code to GitHub
5. **Watch**: Workflows run
6. **See**: Your portfolio deploy! ✅

---

**Congratulations!** You now understand GitHub Secrets! 🎉