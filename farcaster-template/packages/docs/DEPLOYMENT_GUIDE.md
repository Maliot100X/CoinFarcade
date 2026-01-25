# Deployment Guide for Farcaster Miniapps

This document provides comprehensive instructions for deploying your Farcaster Miniapp to production, ensuring optimal performance and user experience.

## Prerequisites

1. **Node.js installed**: Ensure Node.js (v18+) is installed on your system
2. **Miniapp tested locally**: Verify your app works correctly in development
3. **Smart contracts deployed**: Deploy contracts to your target network (Alfajores/Mainnet)

## Deployment Platforms

### Vercel (Recommended)

Vercel provides excellent Next.js support with zero-config deployments.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
# OR
pnpm add -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy from React App Directory

```bash
cd packages/react-app
vercel
```

#### Step 4: Configure Environment Variables

Set these variables in your Vercel dashboard:

| Variable                       | Value                            | Notes                    |
| ------------------------------ | -------------------------------- | ------------------------ |
| `NEXT_PUBLIC_WC_PROJECT_ID`    | Your WalletConnect Project ID    | From WalletConnect Cloud |
| `NEXT_PUBLIC_BASE_URL`         | `https://your-domain.vercel.app` | Your deployed URL        |
| `NEXT_PUBLIC_CELO_NETWORK`     | `alfajores` or `mainnet`         | Target Celo network      |
| `NEXT_PUBLIC_FARCASTER_CONFIG` | Your Farcaster client config     | For auth integration     |

#### Step 5: Production Deployment

```bash
vercel --prod
```

### Netlify

Alternative deployment platform with great developer experience.

#### Deploy Steps

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `cd packages/react-app && npm run build`
   - Publish directory: `packages/react-app/.next`
3. **Environment Variables**: Set the same variables as Vercel
4. **Deploy**: Trigger deployment from dashboard

### Railway

Container-based deployment platform.

#### Deploy Steps

1. **Install Railway CLI**: `npm install -g @railway/cli`
2. **Login**: `railway login`
3. **Initialize**: `railway init`
4. **Deploy**: `railway up`

### Custom Hosting

For self-hosted solutions:

1. **Build the app**: `npm run build`
2. **Install dependencies**: `npm ci --production`
3. **Start server**: `npm start`
4. **Reverse proxy**: Configure nginx/Apache for HTTPS
5. **Process management**: Use PM2 or similar for production

## Environment Configuration

### Development Environment

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_CELO_NETWORK=alfajores
NEXT_PUBLIC_FARCASTER_CONFIG={"relay":"https://relay.farcaster.xyz","domain":"localhost"}
```

### Production Environment

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_CELO_NETWORK=mainnet
NEXT_PUBLIC_FARCASTER_CONFIG={"relay":"https://relay.farcaster.xyz","domain":"yourdomain.com"}
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Domain Configuration

### Custom Domain Setup

1. **Add Domain**: Configure custom domain in your hosting platform
2. **DNS Configuration**: Point your domain to the deployment
3. **SSL Certificate**: Enable HTTPS (automatic on most platforms)
4. **Update Environment**: Change `NEXT_PUBLIC_BASE_URL` to your domain

### Subdomain Strategy

Consider using subdomains for different environments:

- `app.yourdomain.com` (production)
- `staging.yourdomain.com` (staging)
- `dev.yourdomain.com` (development)

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    domains: ["your-image-domains.com"],
    formats: ["image/webp", "image/avif"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};
```

### Caching Strategy

```javascript
// Cache configuration
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
};

// Static assets
app.use(
  "/static",
  express.static("public", {
    setHeaders: (res) => {
      res.set(cacheHeaders);
    },
  })
);
```

### Image Optimization

1. **Use Next.js Image component**: Automatic optimization and lazy loading
2. **Configure image domains**: Add external image sources to `next.config.js`
3. **Optimize NFT images**: Use proper image sizes and formats

## Mobile Optimization

### Responsive Design

Ensure your miniapp works well on all devices:

```css
/* Mobile-first approach */
.container {
  max-width: 100%;
  padding: 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    margin: 0 auto;
  }
}
```

### PWA Configuration

Add Progressive Web App features:

```javascript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... other config
});
```

## Security Configuration

### HTTPS Enforcement

Ensure all traffic uses HTTPS:

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});
```

### Content Security Policy

```javascript
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
];
```

### Rate Limiting

Implement rate limiting for API endpoints:

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

## Monitoring and Analytics

### Error Tracking

Set up error monitoring with Sentry:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Track Core Web Vitals and user interactions:

```javascript
// pages/_app.js
export function reportWebVitals(metric) {
  // Send to analytics service
  analytics.track(metric.name, {
    value: metric.value,
    id: metric.id,
  });
}
```

### User Analytics

Track user behavior and miniapp usage:

```javascript
import { Analytics } from "@segment/analytics-node";

const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY,
});

// Track events
analytics.track({
  userId: user.id,
  event: "NFT Minted",
  properties: {
    tokenId: nft.id,
    value: nft.price,
  },
});
```

## Testing in Production

### Smoke Tests

Create automated tests for production deployment:

```javascript
// tests/production.test.js
describe("Production Deployment", () => {
  test("homepage loads correctly", async () => {
    const response = await fetch("https://yourdomain.com");
    expect(response.status).toBe(200);
  });

  test("wallet connection works", async () => {
    // Test wallet connection flow
  });

  test("NFT minting works", async () => {
    // Test NFT minting functionality
  });
});
```

### Load Testing

Test your miniapp under load:

```bash
# Using artillery
npm install -g artillery
artillery quick --count 100 --num 5 https://yourdomain.com
```

## Maintenance and Updates

### Continuous Deployment

Set up automated deployments:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

### Backup Strategy

1. **Database backups**: Regular database snapshots
2. **Code repository**: Maintain git history and tags
3. **Environment variables**: Secure backup of configuration

### Health Checks

Implement health check endpoints:

```javascript
// pages/api/health.js
export default function handler(req, res) {
  // Check database connection
  // Check external API availability
  // Check smart contract connectivity

  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "up",
      blockchain: "up",
      external_apis: "up",
    },
  });
}
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version and dependencies
2. **Environment variables**: Verify all required variables are set
3. **Network connectivity**: Ensure proper RPC endpoint configuration
4. **Mobile compatibility**: Test on various devices and browsers

### Debug Tools

1. **Browser DevTools**: Monitor network requests and console errors
2. **Vercel Logs**: Check deployment and runtime logs
3. **Lighthouse**: Performance and accessibility auditing
4. **React DevTools**: Component debugging

### Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Celo Developer Resources](https://docs.celo.org)
- [Community Support](https://discord.com/invite/celo)

This guide ensures your Farcaster Miniapp is deployed securely, performs well, and provides an excellent user experience across all devices.
