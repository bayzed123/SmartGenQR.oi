---
slug: "github-actions-configuration-guide"
title: "Advanced Workflow Configuration"
description: "Configure GitHub Actions workflows beyond the defaults: custom environment variables, health checks, notifications and database migrations."
order: 4
---
# 🔧 Advanced Workflow Configuration

## Custom Environment Variables

### Add to Workflow

```yaml
env:
  NODE_VERSION: 20
  PNPM_VERSION: 10.4.1
  CUSTOM_VAR: value

jobs:
  build:
    env:
      VITE_BUILD_TARGET: es2020
```

### Add to Docker

```yaml
services:
  app:
    environment:
      NODE_ENV: production
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Custom Health Checks

### Simple HTTP Check
```yaml
- name: Health Check
  run: |
    for i in {1..10}; do
      curl -f http://localhost:3000 && break
      sleep 1
    done
```

### Advanced Health Check
```yaml
- name: Advanced Health Check
  run: |
    node -e "
    const http = require('http');
    const checkHealth = () => {
      http.get('http://localhost:3000/health', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Healthy');
          process.exit(0);
        } else {
          console.log('❌ Not healthy');
          process.exit(1);
        }
      }).on('error', () => {
        console.log('❌ Error');
        process.exit(1);
      });
    };
    checkHealth();
    "
```

## Notifications

### Slack Notification
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment ${{ job.status }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Deployment to ${{ env.ENVIRONMENT }}\nStatus: ${{ job.status }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Discord Notification
```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  if: always()
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
    title: "Deployment to Production"
    description: "Commit: ${{ github.sha }}"
```

### Email Notification
```yaml
- name: Send Email
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: ${{ secrets.SMTP_HOST }}
    server_port: ${{ secrets.SMTP_PORT }}
    username: ${{ secrets.SMTP_USER }}
    password: ${{ secrets.SMTP_PASS }}
    subject: "Deployment ${{ job.status }}"
    to: ${{ secrets.DEPLOY_EMAIL }}
    from: noreply@your-domain.com
    body: "Deployment completed with status: ${{ job.status }}"
```

## Database Migrations

### Pre-Deployment
```yaml
- name: Run Migrations
  run: |
    npm run migrate:up
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Rollback on Failure
```yaml
- name: Rollback Migrations
  if: failure()
  run: |
    npm run migrate:down
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Testing Integration

### Unit Tests
```yaml
- name: Run Tests
  run: pnpm test --coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
```

### E2E Tests
```yaml
- name: Run E2E Tests
  run: |
    npm install -g playwright
    pnpm test:e2e
  
- name: Upload Test Reports
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

### Performance Tests
```yaml
- name: Performance Testing
  run: |
    npm run test:performance
    
- name: Compare Performance
  run: |
    node scripts/compare-performance.js
```

## Database Services

### PostgreSQL
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432

jobs:
  test:
    services:
      postgres: ${{ services.postgres }}
    steps:
      - uses: actions/setup-node@v4
      - run: npm test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
```

### Redis
```yaml
services:
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 6379:6379
```

## Caching Strategies

### npm Cache
```yaml
- name: Cache npm
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

### Docker Layer Cache
```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Build Artifacts Cache
```yaml
- name: Cache Build
  uses: actions/cache@v3
  with:
    path: dist/
    key: ${{ runner.os }}-build-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-build-
```

## Conditional Jobs

### Only on Main Branch
```yaml
if: github.ref == 'refs/heads/main'
```

### Only on PR
```yaml
if: github.event_name == 'pull_request'
```

### Only on Tags
```yaml
if: startsWith(github.ref, 'refs/tags/')
```

### On Manual Trigger
```yaml
if: github.event_name == 'workflow_dispatch'
```

### Conditional Steps
```yaml
- name: Deploy
  if: success() && github.ref == 'refs/heads/main'
  run: npm run deploy
```

## Scheduled Tasks

### Daily Backup
```yaml
name: Daily Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: npm run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Weekly Security Scan
```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # Monday at midnight

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit
```

## Matrix Strategy

### Multiple Node Versions
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Multiple OS
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]

runs-on: ${{ matrix.os }}
```

### Multiple Environments
```yaml
strategy:
  matrix:
    environment: [staging, production]

environment:
  name: ${{ matrix.environment }}
```

## Artifact Management

### Upload Artifacts
```yaml
- name: Upload Artifacts
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: build-${{ matrix.node-version }}
    path: dist/
    retention-days: 30
```

### Download Artifacts
```yaml
- name: Download Artifacts
  uses: actions/download-artifact@v4
  with:
    name: build-${{ matrix.node-version }}
    path: dist/
```

### Cleanup Old Artifacts
```yaml
- name: Delete Old Artifacts
  uses: geekyeggo/delete-artifact@v2
  with:
    name: build-*
```

## Container Registry

### GitHub Container Registry
```yaml
- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and Push
  uses: docker/build-push-action@v5
  with:
    registry: ghcr.io
    image: ${{ github.repository }}
    tags: latest,${{ github.sha }}
```

### Docker Hub
```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build and Push
  uses: docker/build-push-action@v5
  with:
    image: ${{ secrets.DOCKER_USERNAME }}/bayezid-portfolio
    tags: latest,${{ github.sha }}
```

## Security Scanning

### SAST (Static Analysis)
```yaml
- name: SonarQube Scan
  uses: sonarsource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Dependency Check
```yaml
- name: Run Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'bayezid-portfolio'
    path: '.'
    format: 'XML'
```

### CodeQL
```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript

- name: Autobuild
  uses: github/codeql-action/autobuild@v2

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

## Release Management

### Create Release
```yaml
- name: Create Release
  uses: actions/create-release@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: v${{ env.VERSION }}
    release_name: Release v${{ env.VERSION }}
    body_path: CHANGELOG.md
    draft: false
    prerelease: false
```

### Semantic Versioning
```yaml
- name: Bump Version
  uses: anothrNick/github-tag-action@1.70.0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    WITH_V: true
```

## Performance Optimization

### Parallel Jobs
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
```

### Job Dependencies
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
  deploy:
    needs: test
    runs-on: ubuntu-latest
```

### Continue on Error
```yaml
- name: Optional Step
  continue-on-error: true
  run: npm run optional-script
```

## Debugging

### Enable Debug Logging
```bash
# Set in repository or organization secrets
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

### Print Debug Info
```yaml
- name: Debug
  run: |
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
    echo "Event: ${{ github.event_name }}"
```

### Use Act for Local Testing
```bash
# Install act
brew install act

# Run locally
act -l                    # List workflows
act -j build              # Run specific job
act -s GITHUB_TOKEN=xxx   # With secrets
```

---

For more info, see the main guide: `COMPLETE_WORKFLOWS_GUIDE.md`
