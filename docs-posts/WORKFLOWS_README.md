---
slug: "directory-structure-for-portfolio"
title: "Directory Structure for Portfolio"
description: "The portfolio project's directory layout, plus how to copy the workflow files into your own repository and get the first build running."
order: 1
---
# 🚀 Quick Start Guide - Bayezid Portfolio Workflows

## Directory Structure

Add these files to your repository:

```
bayezid_portfolio/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              ✅ Main CI/CD pipeline
│       ├── code-quality.yml        ✅ Code quality checks
│       └── deploy.yml              ✅ Deployment workflows
├── Dockerfile                      ✅ Docker build config
├── docker-compose.yml              ✅ Local dev environment
├── nginx.conf                      ✅ Reverse proxy config
├── .dockerignore                   ✅ Docker ignore file
├── GITHUB_ACTIONS_SETUP.md         ✅ Setup instructions
└── WORKFLOWS_README.md             ✅ This file
```

## Step 1: Copy Workflow Files

```bash
mkdir -p .github/workflows
```

Copy these files:
- `ci-cd.yml` → `.github/workflows/ci-cd.yml`
- `code-quality.yml` → `.github/workflows/code-quality.yml`
- `deploy.yml` → `.github/workflows/deploy.yml`

Copy these files to repository root:
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `.dockerignore`

## Step 2: Configure Secrets

Follow the detailed guide in `GITHUB_ACTIONS_SETUP.md`:

1. Generate SSH keys
2. Configure server access
3. Add GitHub secrets
4. Set up environments

## Step 3: Verify Installation

```bash
# Test locally
docker-compose up --build

# Visit: http://localhost:3000
curl http://localhost:3000
```

## Step 4: Push to GitHub

```bash
git add .github/ Dockerfile docker-compose.yml nginx.conf .dockerignore
git commit -m "ci: add GitHub Actions workflows"
git push origin main
```

## 📊 Workflow Status

Check status at: `https://github.com/your-username/bayezid_portfolio/actions`

## 🔄 What Each Workflow Does

### CI/CD Pipeline (`ci-cd.yml`)
✅ Runs on every push and PR
✅ Type checking (TypeScript)
✅ Code formatting validation
✅ Security scanning
✅ Build verification
✅ Auto-deploy to staging/production
✅ Health checks
✅ Performance reporting

### Code Quality (`code-quality.yml`)
✅ Prettier formatting
✅ TypeScript strict checks
✅ Dependency audits
✅ Build verification
✅ Lighthouse performance

### Deploy (`deploy.yml`)
✅ Docker image building
✅ SSH deployment
✅ Health checks
✅ Smoke tests
✅ Automatic rollback on failure
✅ Deployment notifications

## 🎯 Key Features

### Automated Testing
- Type checking
- Code formatting
- Dependency scanning
- Build verification

### Automated Deployment
- Staging (on develop branch)
- Production (on main branch)
- Manual deployment option
- Automatic rollback

### Quality Gates
- All checks must pass before merge
- PR comments with feedback
- Performance reports
- Security scanning

### Notifications
- PR comments on failures
- Deployment status
- Build artifacts
- Performance metrics

## 🔐 Environment Variables

Add to `.env` file (never commit):

```env
NODE_ENV=production
PORT=3000
# Add your API keys and configs here
```

## 📝 Branch Protection Rules

Go to: `Settings > Branches > Branch protection rules`

For `main` branch:
✅ Require status checks to pass
✅ Require code reviews before merge
✅ Include administrators
✅ Dismiss stale PR approvals

## 🚨 Troubleshooting

### Workflows not running?
- Check `.github/workflows/` directory exists
- Verify file names match exactly
- Check YAML syntax (use https://www.yamllint.com/)

### Deployment failing?
- Check SSH keys in secrets
- Verify server is accessible
- Check deployment path exists
- Review server logs

### Build failing?
- Run locally: `pnpm install && pnpm build`
- Check Node version: `node -v` (should be 20+)
- Check pnpm version: `pnpm -v` (should be 10.4.1+)

## 📚 Next Steps

1. ✅ Copy workflow files
2. ✅ Configure secrets
3. ✅ Test locally with Docker
4. ✅ Push to GitHub
5. ✅ Monitor first deployment
6. ✅ Set up branch protection
7. ✅ Document deployment process

## 🔗 Useful Links

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## ✨ Pro Tips

1. **Local Testing**: Use `act` to test workflows locally
   ```bash
   npm install -g act
   act -l  # List workflows
   act    # Run workflows
   ```

2. **Debug Mode**: Add to workflow:
   ```yaml
   - name: Debug
     run: |
       echo "Branch: ${{ github.ref }}"
       echo "Commit: ${{ github.sha }}"
       env | grep -i github
   ```

3. **Caching**: Workflows cache dependencies for faster builds

4. **Parallel Jobs**: Most jobs run in parallel for speed

5. **Status Badges**: Add to README:
   ```markdown
   ![CI/CD](https://github.com/your-username/bayezid_portfolio/actions/workflows/ci-cd.yml/badge.svg)
   ![Code Quality](https://github.com/your-username/bayezid_portfolio/actions/workflows/code-quality.yml/badge.svg)
   ```

---

**Need help?** Check `GITHUB_ACTIONS_SETUP.md` for detailed instructions.
