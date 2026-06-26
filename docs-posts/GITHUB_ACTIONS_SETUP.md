# GitHub Actions Configuration Guide

## 🔐 Required Secrets

Add these secrets to your GitHub repository under **Settings > Secrets and variables > Actions**:

### Deployment Secrets

#### Staging Environment
```
STAGING_SERVER_HOST         - Staging server IP/domain (e.g., 1.2.3.4)
STAGING_SERVER_USER         - SSH username (e.g., deploy)
STAGING_SERVER_SSH_KEY      - Private SSH key (multiline)
STAGING_SERVER_PORT         - SSH port (default: 22, optional)
STAGING_DEPLOYMENT_PATH     - Path on server (e.g., /home/deploy/app)
STAGING_URL                 - Staging URL (e.g., https://staging.example.com)
```

#### Production Environment
```
PRODUCTION_SERVER_HOST      - Production server IP/domain
PRODUCTION_SERVER_USER      - SSH username
PRODUCTION_SERVER_SSH_KEY   - Private SSH key (multiline)
PRODUCTION_SERVER_PORT      - SSH port (default: 22, optional)
PRODUCTION_DEPLOYMENT_PATH  - Path on server
PRODUCTION_URL              - Production URL
```

### Security Scanning
```
SNYK_TOKEN                  - Snyk API token (optional, for security scanning)
GITHUB_TOKEN                - Auto-generated, used for PR comments
```

## 🛠️ Setup Instructions

### 1. Generate SSH Key for Deployment

```bash
# Generate SSH key pair (no passphrase for CI/CD)
ssh-keygen -t ed25519 -f deploy_key -N ""

# Copy public key to your server
ssh-copy-id -i deploy_key.pub user@server-ip

# Copy private key content
cat deploy_key | base64
# Paste as STAGING_SERVER_SSH_KEY and PRODUCTION_SERVER_SSH_KEY
```

### 2. Configure Server Access

```bash
# SSH into your server
ssh user@server-ip

# Create application directory
mkdir -p /home/deploy/app
cd /home/deploy/app

# Clone repository
git clone https://github.com/your-username/bayezid_portfolio.git .
git remote set-url origin https://github.com/your-username/bayezid_portfolio.git

# Install Node.js and pnpm
curl -fsSL https://nodejs.org/dist/v20.0.0/node-v20.0.0-linux-x64.tar.xz | tar xJ
export PATH=$PWD/node-v20.0.0-linux-x64/bin:$PATH

# Install pnpm
npm install -g pnpm@10.4.1

# Install pm2 for process management
npm install -g pm2

# Create .env file
echo "NODE_ENV=production" > .env
echo "PORT=3000" >> .env

# Initial setup
pnpm install --frozen-lockfile
pnpm build
pm2 start --name bayezid_portfolio npm -- start
pm2 save
pm2 startup
```

### 3. Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Copy nginx.conf to your server
scp nginx.conf user@server-ip:/tmp/nginx.conf

# Update Nginx config
sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot certonly --nginx -d your-domain.com
```

### 4. Add Repository Secrets

Go to: `https://github.com/your-username/bayezid_portfolio/settings/secrets/actions`

Click "New repository secret" and add:

```
STAGING_SERVER_HOST = 1.2.3.4
STAGING_SERVER_USER = deploy
STAGING_SERVER_SSH_KEY = -----BEGIN OPENSSH PRIVATE KEY-----
[paste base64 encoded key]
-----END OPENSSH PRIVATE KEY-----

STAGING_DEPLOYMENT_PATH = /home/deploy/app
STAGING_URL = https://staging.your-domain.com

PRODUCTION_SERVER_HOST = 5.6.7.8
PRODUCTION_SERVER_USER = deploy
PRODUCTION_SERVER_SSH_KEY = -----BEGIN OPENSSH PRIVATE KEY-----
[paste base64 encoded key]
-----END OPENSSH PRIVATE KEY-----

PRODUCTION_DEPLOYMENT_PATH = /home/deploy/app
PRODUCTION_URL = https://your-domain.com
```

### 5. Create Environment Secrets (Optional)

Go to: `https://github.com/your-username/bayezid_portfolio/settings/environments`

Create "staging" and "production" environments and assign the appropriate secrets to each.

## 📋 Workflow File Setup

Place workflow files in `.github/workflows/` directory:

```
.github/workflows/
├── ci-cd.yml              # Main CI/CD pipeline
├── code-quality.yml       # Code quality checks
└── deploy.yml             # Deployment workflow
```

## 🚀 Deployment Workflow

### Automatic Deployments

- **Develop branch** → Staging environment (on push)
- **Main branch** → Production environment (on push)

### Manual Deployments

Go to: `https://github.com/your-username/bayezid_portfolio/actions`

1. Click "Deploy" workflow
2. Click "Run workflow"
3. Select environment (staging/production)
4. Click "Run workflow"

## 🔍 Monitoring & Logging

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Click on workflow name to see logs
3. Click on job to see detailed output

### Server Logs

```bash
# SSH into server
ssh user@server-ip

# View PM2 logs
pm2 logs bayezid_portfolio

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🐛 Troubleshooting

### SSH Connection Failed

```bash
# Test SSH connection
ssh -i deploy_key user@server-ip

# Check authorized_keys
cat ~/.ssh/authorized_keys

# If needed, add key again
echo "$(cat deploy_key.pub)" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Build Fails

```bash
# Run locally to debug
pnpm install --frozen-lockfile
pnpm check          # TypeScript check
pnpm build          # Build project
```

### Deployment Hangs

```bash
# Check server disk space
df -h

# Check memory
free -m

# Restart service
pm2 restart bayezid_portfolio
```

## 🔐 Security Best Practices

✅ Use SSH keys instead of passwords
✅ Rotate secrets regularly
✅ Use separate secrets for staging/production
✅ Never commit secrets to repository
✅ Use GitHub Environments for approval gates
✅ Enable branch protection rules
✅ Require status checks before merging

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Key Generation Guide](https://github.com/settings/keys)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
