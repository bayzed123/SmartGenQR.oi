# ⚡ Vite Config Quick Reference

## Your Setup

```typescript
// vite.config.ts
build: {
  outDir: "dist/public",
  emptyOutDir: true,
}

server: {
  port: 3000,
  host: true,
  allowedHosts: [
    ".manuspre.computer",
    ".manus.computer",
    // ... others
  ],
}
```

## Key Facts About Your Vite Build

| Setting | Value | Impact |
|---------|-------|--------|
| **Output Directory** | `dist/public` | Files go here after build |
| **Build Tool** | Vite 7.1.7 | Very fast incremental builds |
| **React** | v19.2.1 | Modern, performance-focused |
| **TailwindCSS** | v4.1.14 | Latest with Vite plugin |
| **Port** | 3000 | Default dev server port |

## Build Command Breakdown

```bash
pnpm build
  ↓
vite build
  ├─ Runs TypeScript compiler (esbuild)
  ├─ Bundles React with SWC
  ├─ Processes Tailwind CSS
  ├─ Minifies output
  └─ Outputs to: dist/public/
```

**Time**: ~15-20 seconds (with caching)

## What Happens in CI/CD

### 1️⃣ Installation (~30 seconds)
```bash
pnpm install --frozen-lockfile
```
- Checks pnpm-lock.yaml integrity
- Installs 100+ dependencies
- Uses GitHub Actions cache

### 2️⃣ Type Check (~3 seconds)
```bash
pnpm check
```
- Runs TypeScript without emitting
- Catches type errors early
- No build output

### 3️⃣ Build (~20 seconds)
```bash
NODE_ENV=production pnpm build
```
- Compiles TypeScript
- Bundles JavaScript/CSS
- Minifies everything
- Outputs to `dist/public/`

### 4️⃣ Verification (~2 seconds)
```bash
# Check dist exists
if [ ! -d "dist" ]; then exit 1; fi

# Count files
find dist -type f | wc -l

# Show size
du -sh dist
```

### 5️⃣ Deployment (~10 seconds)
- Copy `dist/` to server
- Restart Express server
- Health check

## Commands Cheat Sheet

```bash
# Development
pnpm dev                    # Start Vite dev server (port 3000)

# Building
pnpm build                  # Production build
NODE_ENV=production pnpm build   # Explicit production mode

# Preview
pnpm preview --host         # Preview production build

# Type checking
pnpm check                  # TypeScript check only (no build)

# Formatting
pnpm format                 # Format code with Prettier
```

## Workflow Environment Variables

Add to your workflows for better builds:

```yaml
env:
  NODE_ENV: production
  VITE_BUILD_TARGET: es2020     # Modern JavaScript
  VITE_SOURCEMAP: false          # Disable source maps
```

## File Structure After Build

```
dist/
├── public/                  # Your build output
│   ├── index.html          # Main entry point
│   ├── assets/
│   │   ├── index-xxx.js    # Main bundle
│   │   ├── vendor-xxx.js   # Vendor code
│   │   └── style-xxx.css   # CSS bundle
│   └── ...other files
└── index.js                # Express server entry
```

## GitHub Actions Integration

### Build Step
```yaml
- name: Build with Vite
  run: pnpm build
  env:
    NODE_ENV: production
    VITE_BUILD_TARGET: es2020
```

### Verify Step
```yaml
- name: Verify build
  run: |
    test -d dist && echo "✅ Build OK" || exit 1
    find dist -name '*.js' | wc -l
```

### Upload Step
```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: frontend-build
    path: dist/
    retention-days: 5
```

## Docker Best Practices for Vite

### Multi-stage Build
```dockerfile
FROM node:20-alpine AS builder
# ... install and build ...
RUN pnpm build

FROM node:20-alpine
# ... copy dist/ to runtime ...
COPY --from=builder /app/dist ./dist
```

### In docker-compose.yml
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
```

## Debugging Build Issues

### Build not starting?
```bash
# Check Vite is installed
pnpm list vite

# Test build locally
pnpm build --verbose

# Clear cache
rm -rf node_modules .vite
pnpm install
```

### Build failing in CI but works locally?
```bash
# Ensure same Node version
node -v  # Should be v20+

# Clear pnpm cache
pnpm store prune

# Reinstall
pnpm install --frozen-lockfile
```

### Build too slow?
```bash
# Check if dependencies installed
pnpm list --depth=0

# Use cache in CI/CD
# Already configured in workflows
```

## Performance Tips

### 1. Keep Dependencies Minimal
- Your project has ~100 dependencies
- Vite handles them efficiently
- Remove unused packages

### 2. Code Splitting
Your Radix UI components (21 packages) are bundled together. Consider splitting:

```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      radix: Object.keys(pkg.dependencies)
        .filter(k => k.startsWith('@radix-ui'))
    }
  }
}
```

### 3. Lazy Load Components
```typescript
import { lazy } from 'react';

const HeavyComponent = lazy(() => 
  import('./HeavyComponent')
);
```

### 4. Monitor Bundle Size
```bash
# Add to package.json
"build:analyze": "vite build --analyze"

# Then npm install -g rollup-plugin-visualizer
```

## Common Errors & Fixes

### ❌ "dist is not a directory"
**Fix**: `pnpm build` didn't complete
```bash
# Check for errors
pnpm build --verbose

# Clear and retry
rm -rf dist node_modules
pnpm install
pnpm build
```

### ❌ "ENOENT: no such file or directory 'dist/public'"
**Fix**: Check vite.config.ts `outDir`
```typescript
// Should be:
outDir: "dist/public"
// Or:
outDir: path.resolve(__dirname, "dist/public")
```

### ❌ "Cannot find module '@'"
**Fix**: Alias not configured. Already done in your vite.config.ts:
```typescript
resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "client", "src"),
  },
}
```

### ❌ "CSS not loading in production"
**Fix**: Enable CSS code splitting:
```typescript
build: {
  cssCodeSplit: true,
}
```

## Monitoring Build Health

### In Workflows
```yaml
- name: Build Report
  run: |
    echo "## Build Report" >> $GITHUB_STEP_SUMMARY
    echo "- Build: ✅" >> $GITHUB_STEP_SUMMARY
    echo "- Output: dist/" >> $GITHUB_STEP_SUMMARY
    du -sh dist >> $GITHUB_STEP_SUMMARY
```

### Local Testing
```bash
# Build and preview
pnpm build
pnpm preview --host

# Open browser
# http://localhost:4173
```

## Next: Advanced Topics

See `VITE_OPTIMIZATION.md` for:
- Bundle analysis
- Code splitting strategies
- Performance optimizations
- Monitoring build metrics

---

**TL;DR**: Your Vite setup builds to `dist/public/` in ~20 seconds. The workflows handle everything automatically. No manual intervention needed! 🚀
