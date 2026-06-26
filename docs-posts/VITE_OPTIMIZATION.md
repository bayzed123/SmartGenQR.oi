# 🔧 Vite Optimization Guide for CI/CD

Based on your `vite.config.ts`, here's how to optimize builds and deployments.

## 📋 Your Vite Configuration Overview

Your `vite.config.ts` includes:
- ✅ React 19 with Vite
- ✅ TailwindCSS 4 (Vite plugin)
- ✅ JSX location tracking plugin
- ✅ Custom Manus debug collector (dev only)
- ✅ Storage proxy for development
- ✅ Build output to `dist/` directory

## 🏗️ Build Process

### What Happens When You Run `pnpm build`

```
vite build
  ├─ Compiles TypeScript
  ├─ Bundles React components
  ├─ Processes TailwindCSS
  ├─ Outputs to: dist/
  │  ├─ dist/public/     (static assets)
  │  ├─ dist/index.js    (entry point)
  │  └─ dist/...
  └─ Generates source maps (dev by default)
```

### Build Configuration

```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
}
```

**Output Path**: `dist/public/`

## ⚡ Production Build Optimization

### 1. Enable Production Mode

```bash
NODE_ENV=production pnpm build
```

The workflows already do this automatically.

### 2. Disable Source Maps in Production

Add to `vite.config.ts`:

```typescript
build: {
  sourcemap: false,  // Disable source maps in production
  minify: 'terser',  // Use Terser for minification (smaller bundles)
  rollupOptions: {
    output: {
      manualChunks: {
        // Split large dependencies
        radix: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog'],
        framer: ['framer-motion'],
        recharts: ['recharts'],
      },
    },
  },
}
```

### 3. CSS Optimization

```typescript
build: {
  cssCodeSplit: true,  // Split CSS into separate files
  cssTarget: 'chrome88',  // Target modern browsers
  cssMinify: 'lightningcss',  // Faster CSS minification
}
```

### 4. Asset Optimization

```typescript
build: {
  assetsInlineLimit: 4096,  // Inline assets smaller than 4KB
  rollupOptions: {
    output: {
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
}
```

## 📊 Build Optimization Tips

### Current Bundle Analysis

To analyze your bundle, add to your workflow:

```yaml
- name: Bundle Analysis
  run: |
    npm install -g vite-plugin-visualizer
    pnpm add -D vite-plugin-visualizer
```

Then add to `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  // ... other plugins
  visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
  }),
]
```

### Code Splitting Strategy

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Separate vendor chunks
        vendor: ['react', 'react-dom'],
        radix: [
          '@radix-ui/react-accordion',
          '@radix-ui/react-alert-dialog',
          '@radix-ui/react-avatar',
          // ... other radix components
        ],
        motion: ['framer-motion'],
        charts: ['recharts'],
        forms: ['react-hook-form', 'zod'],
      },
    },
  },
}
```

### Lazy Loading Strategy

```typescript
// In your React components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 🔍 Vite-Specific Workflow Enhancements

### 1. Add Vite Build Analysis

```yaml
- name: Vite Build Analysis
  run: |
    echo "## 🔨 Vite Build Report" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    
    # Show dist size
    if [ -d "dist" ]; then
      echo "### Build Size" >> $GITHUB_STEP_SUMMARY
      du -h -d 1 dist/ >> $GITHUB_STEP_SUMMARY
      echo "" >> $GITHUB_STEP_SUMMARY
    fi
    
    # Count assets
    echo "### Asset Count" >> $GITHUB_STEP_SUMMARY
    echo "- JS files: $(find dist -name '*.js' | wc -l)" >> $GITHUB_STEP_SUMMARY
    echo "- CSS files: $(find dist -name '*.css' | wc -l)" >> $GITHUB_STEP_SUMMARY
    echo "- Images: $(find dist -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.svg' \) | wc -l)" >> $GITHUB_STEP_SUMMARY
```

### 2. Pre-build Checks

```yaml
- name: Validate Vite Config
  run: |
    node -e "
    const config = require('./vite.config.ts');
    console.log('✅ Vite config is valid');
    console.log('Build output:', config.build?.outDir || 'dist/');
    "
```

### 3. Cache Optimization

```yaml
- name: Cache Node Modules
  uses: actions/cache@v3
  with:
    path: |
      ~/.pnpm-store
      **/node_modules
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Cache Vite Build
  uses: actions/cache@v3
  with:
    path: .vite
    key: ${{ runner.os }}-vite-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-vite-
```

## 🌍 Environment Variables for Build

Add these to your `.env` for different build scenarios:

```env
# Production Build
VITE_API_URL=https://api.your-domain.com
VITE_BUILD_TARGET=es2020
VITE_SOURCEMAP=false

# Development Build
VITE_API_URL=http://localhost:3000
VITE_BUILD_TARGET=es2020
VITE_SOURCEMAP=true
```

Use in workflow:

```yaml
- name: Build with Environment
  run: pnpm build
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
    VITE_BUILD_TARGET: es2020
```

## 📦 Docker Build Optimization for Vite

### Multi-stage Dockerfile for Vite

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@10.4.1

COPY pnpm-lock.yaml package.json ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

COPY . .

# Build with optimizations
RUN VITE_BUILD_TARGET=es2020 pnpm build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app
RUN npm install -g pnpm@10.4.1

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile --prod

# Copy built assets
COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/index.js"]
```

## 🚀 Performance Benchmarks

### Expected Build Times

- **Type Check**: ~2-3 seconds
- **Vite Build**: ~15-20 seconds
- **Total**: ~30-40 seconds (with dependencies cached)

### Expected Bundle Sizes

Your project with all Radix components and Framer Motion:
- **JavaScript**: ~300-500 KB (uncompressed)
- **CSS**: ~50-100 KB (uncompressed)
- **Gzipped Total**: ~80-150 KB

**Goal**: Keep main bundle under 200KB gzipped.

## 🔄 CI/CD Integration with Vite

### Optimal Workflow Structure

```yaml
jobs:
  type-check:
    # TypeScript checking (no build)
    - pnpm check  # 2-3 seconds

  build:
    needs: type-check
    # Full Vite build
    - pnpm build  # 15-20 seconds
    # Analyze output
    - Bundle analysis
    
  test:
    needs: build
    # Can use dist/ output
    - pnpm test

  deploy:
    needs: [build, test]
    # Deploy dist/ folder
```

## 🐛 Common Vite Issues & Solutions

### Issue: Build takes too long

**Solution:**
```yaml
- name: Faster Build
  run: NODE_ENV=production pnpm build --clearScreen
  env:
    VITE_BUILD_TARGET: es2020
```

### Issue: Source maps too large

**Solution:**
```typescript
// vite.config.ts
build: {
  sourcemap: process.env.NODE_ENV === 'production' ? false : 'inline',
}
```

### Issue: Asset paths wrong in production

**Solution:**
```typescript
// vite.config.ts
build: {
  base: '/',  // Ensure correct base path
  assetsDir: 'assets',
}
```

### Issue: CSS not loading

**Solution:**
```typescript
// vite.config.ts
build: {
  cssCodeSplit: true,  // Generate separate CSS files
  rollupOptions: {
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].[hash].js',
      assetFileNames: 'assets/[name].[hash][extname]',
    },
  },
}
```

## 📈 Monitoring Build Performance

### Add Performance Metrics to Workflow

```yaml
- name: Build Time Report
  if: always()
  run: |
    echo "## ⏱️ Build Performance" >> $GITHUB_STEP_SUMMARY
    echo "- Build time: ~20s" >> $GITHUB_STEP_SUMMARY
    echo "- Bundle size: ~300KB" >> $GITHUB_STEP_SUMMARY
    echo "- Gzipped: ~80KB" >> $GITHUB_STEP_SUMMARY
```

## ✅ Vite Workflow Checklist

- [ ] `NODE_ENV=production` set during build
- [ ] Source maps disabled in production
- [ ] Asset optimization enabled
- [ ] CSS code splitting enabled
- [ ] Lazy loading for large components
- [ ] Build output verified (dist/)
- [ ] Bundle size monitored
- [ ] Cache strategies implemented
- [ ] Environment variables properly set
- [ ] Docker build optimized

---

**Next Steps:**
1. Implement bundle analysis
2. Set up code splitting
3. Monitor build times
4. Optimize for your specific use case
