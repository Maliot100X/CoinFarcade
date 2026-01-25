# Farcaster Miniapp Development Guide

This comprehensive guide covers building Farcaster Miniapps using the Celo Composer template. Miniapps are full-featured web applications that integrate seamlessly with the Farcaster ecosystem.

## Table of Contents

1. [Understanding Farcaster Miniapps](#understanding-farcaster-miniapps)
2. [Miniapp Architecture](#miniapp-architecture)
3. [Getting Started](#getting-started)
4. [Authentication](#authentication)
5. [Core Features](#core-features)
6. [Mobile Optimization](#mobile-optimization)
7. [Celo Integration](#celo-integration)
8. [State Management](#state-management)
9. [Best Practices](#best-practices)
10. [Testing & Debugging](#testing--debugging)
11. [Performance Optimization](#performance-optimization)
12. [Deployment](#deployment)

## Understanding Farcaster Miniapps

Farcaster Miniapps are full web applications that run within Farcaster clients, providing rich, interactive experiences beyond simple social posts. Unlike Frames (which are limited interaction cards), miniapps offer:

- **Complete UI Control**: Full HTML, CSS, and JavaScript capabilities
- **Multi-Screen Navigation**: Complex user flows and app-like experiences
- **Rich Interactions**: Forms, animations, complex state management
- **Native Integration**: Deep integration with Farcaster social graph
- **Blockchain Features**: Direct interaction with Celo and other blockchains

### Miniapp vs Frame Comparison

| Feature       | Frames                       | Miniapps                       |
| ------------- | ---------------------------- | ------------------------------ |
| UI Complexity | Limited (4 buttons, 1 image) | Unlimited web app UI           |
| Navigation    | Single screen                | Multi-screen navigation        |
| User Input    | Text input only              | Forms, uploads, complex inputs |
| State         | Stateless interactions       | Full state management          |
| Performance   | Server-side rendering        | Client-side app performance    |
| Development   | Simple POST handlers         | Full web app architecture      |

## Miniapp Architecture

```
┌─────────────────────────────────────────┐
│                Next.js App              │
├─────────────────────────────────────────┤
│ app/                                    │
│ ├── page.tsx             (Main app)     │
│ ├── layout.tsx           (Root layout)  │
│ ├── profile/             (User profile) │
│ ├── nfts/                (NFT gallery)  │
│ └── wallet/              (Wallet mgmt)  │
├─────────────────────────────────────────┤
│ components/                             │
│ ├── ui/                  (UI library)   │
│ ├── Header.tsx           (Navigation)   │
│ ├── Footer.tsx           (Footer)       │
│ └── Layout.tsx           (Page wrapper) │
├─────────────────────────────────────────┤
│ lib/                                    │
│ ├── farcaster-auth.ts    (FC auth)      │
│ └── utils.ts             (Utilities)    │
├─────────────────────────────────────────┤
│ contexts/                               │
│ ├── useWeb3.ts           (Blockchain)   │
│ └── AuthContext.tsx      (Auth state)   │
└─────────────────────────────────────────┘
```

## Getting Started

### 1. Local Development Setup

```bash
cd packages/react-app
yarn dev
```

Your miniapp will be available at:

- **Development URL**: `http://localhost:3000`
- **Production URL**: Your deployed domain

### 2. Environment Variables

Create a `.env.local` file in `packages/react-app/`:

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FARCASTER_CONNECT_CONFIG={"relay":"...","domain":"..."}
NEXT_PUBLIC_CELO_NETWORK=alfajores
```

### 3. Farcaster Integration

Miniapps can be shared in Farcaster through:

- Direct links in casts
- QR codes for mobile access
- Integration with Farcaster frames that link to miniapps
- Custom Farcaster client integrations

## Authentication

### Sign In with Farcaster

Implement Farcaster authentication to access user social data:

```typescript
import {
  createSignInWithFarcasterUrl,
  generateAuthState,
} from "@/lib/farcaster-auth";

// Generate auth URL
const authUrl = createSignInWithFarcasterUrl(
  "yourdomain.com",
  "https://yourdomain.com/auth/callback",
  generateAuthState()
);

// Redirect user to Farcaster for authentication
window.location.href = authUrl;
```

### Authentication Flow

1. **Initiate Auth**: Generate auth URL and redirect to Farcaster
2. **User Authorization**: User approves in Farcaster client
3. **Callback Handling**: Receive auth data at callback URL
4. **Session Creation**: Create persistent user session
5. **Profile Access**: Access user's Farcaster profile and social graph

### User Context

```typescript
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifiedAddresses?: string[];
}

// Use in components
const { user, isAuthenticated, logout } = useAuth();
```

## Core Features

### 1. Responsive Design

Create mobile-first designs that work across all devices:

```tsx
// Mobile-optimized layout
export default function MiniappLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Navigation items */}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>

      {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        {/* Tab navigation */}
      </nav>
    </div>
  );
}
```

### 2. Navigation System

Implement app-like navigation patterns:

```tsx
const [activeTab, setActiveTab] = useState<"home" | "profile" | "nfts">("home");

// Tab navigation
<div className="flex border-b">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 py-3 text-center font-medium border-b-2 ${
        activeTab === tab.id
          ? "border-purple-500 text-purple-600"
          : "border-transparent text-gray-500"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>;
```

### 3. Social Features

Leverage Farcaster's social graph:

```typescript
// Get user's followers/following
async function getUserSocialGraph(fid: number) {
  // Implement using Farcaster Hub API or Neynar
  const followers = await getFollowers(fid);
  const following = await getFollowing(fid);
  return { followers, following };
}

// Social interactions
async function shareToFarcaster(content: string, imageUrl?: string) {
  // Create shareable content for Farcaster
  const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    content
  )}`;
  window.open(intent, "_blank");
}
```

## Mobile Optimization

### 1. Touch-Friendly Interface

```css
/* Touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Prevent zoom on input focus */
input,
select,
textarea {
  font-size: 16px;
}

/* Safe area handling */
.safe-area {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(
      safe-area-inset-bottom
    ) env(safe-area-inset-left);
}
```

### 2. Performance Considerations

```typescript
// Lazy loading for better performance
const NFTGallery = dynamic(() => import("@/components/NFTGallery"), {
  loading: () => <div>Loading gallery...</div>,
});

// Image optimization
<Image
  src={imageUrl}
  alt="NFT"
  width={300}
  height={300}
  priority={isAboveFold}
  className="rounded-lg"
/>;
```

### 3. Offline Support

```typescript
// Service worker for caching
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// Cache strategy
const cache = await caches.open("miniapp-v1");
await cache.addAll(["/", "/styles.css", "/app.js"]);
```

## Celo Integration

### 1. Wallet Connection

```typescript
import { useWeb3 } from "@/contexts/useWeb3";

function WalletConnection() {
  const { address, getUserAddress, sendCUSD, mintFarcasterNFT } = useWeb3();

  return (
    <div>
      {!address ? (
        <button onClick={getUserAddress}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => mintFarcasterNFT()}>Mint NFT</button>
        </div>
      )}
    </div>
  );
}
```

### 2. Blockchain Features

```typescript
// Token operations
async function handleTokenTransfer() {
  const tx = await sendCUSD(recipientAddress, amount);
  console.log("Transaction:", tx.transactionHash);
}

// NFT operations
async function mintNFT() {
  const tx = await mintFarcasterNFT();
  const newNFTs = await getNFTs();
  setUserNFTs(newNFTs);
}

// Contract interactions
async function customContractCall() {
  // Use viem for custom contract interactions
  const result = await contract.read.customFunction();
  return result;
}
```

## State Management

### 1. React Context

```typescript
// Auth context
interface AuthContextType {
  user: FarcasterUser | null;
  isAuthenticated: boolean;
  login: (authData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Usage
const { user, isAuthenticated } = useContext(AuthContext);
```

### 2. Local Storage

```typescript
// Persist user preferences
const saveUserPreferences = (preferences: UserPreferences) => {
  localStorage.setItem("userPrefs", JSON.stringify(preferences));
};

const getUserPreferences = (): UserPreferences | null => {
  const saved = localStorage.getItem("userPrefs");
  return saved ? JSON.parse(saved) : null;
};
```

### 3. URL State

```typescript
// Use URL for app state
const router = useRouter();
const { tab } = router.query;

// Update URL when state changes
const setActiveTab = (newTab: string) => {
  router.push(`/?tab=${newTab}`, undefined, { shallow: true });
};
```

## Best Practices

### 1. User Experience

- **Progressive Loading**: Show content as it loads
- **Optimistic Updates**: Update UI before confirming transactions
- **Error Handling**: Graceful error states and recovery
- **Accessibility**: Screen reader support and keyboard navigation

### 2. Security

```typescript
// Input validation
const validateInput = (input: string) => {
  return input.length <= 280 && !containsMaliciousContent(input);
};

// Rate limiting
const rateLimiter = new Map<string, number>();
const checkRateLimit = (userId: string) => {
  const lastRequest = rateLimiter.get(userId) || 0;
  return Date.now() - lastRequest > 1000; // 1 second cooldown
};
```

### 3. Performance

```typescript
// Memoization
const memoizedComponent = useMemo(() => {
  return <ExpensiveComponent data={data} />;
}, [data]);

// Virtualization for large lists
import { FixedSizeList } from "react-window";

const VirtualizedNFTList = ({ nfts }) => (
  <FixedSizeList height={400} itemCount={nfts.length} itemSize={100}>
    {({ index, style }) => (
      <div style={style}>
        <NFTCard nft={nfts[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

## Testing & Debugging

### 1. Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthContext";

test("renders wallet connection button", () => {
  render(
    <AuthProvider>
      <WalletConnection />
    </AuthProvider>
  );

  expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
});
```

### 2. E2E Testing

```typescript
// Playwright or Cypress tests
test("complete NFT minting flow", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="connect-wallet"]');
  await page.click('[data-testid="mint-nft"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### 3. Debugging Tools

```typescript
// Debug context
const useDebug = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Debug info:", { user, address, nfts });
    }
  }, [user, address, nfts]);
};
```

## Performance Optimization

### 1. Bundle Optimization

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
    domains: ["example.com"],
    formats: ["image/webp", "image/avif"],
  },
};
```

### 2. Caching Strategies

```typescript
// React Query for API caching
import { useQuery } from "@tanstack/react-query";

const useUserNFTs = (address: string) => {
  return useQuery({
    queryKey: ["nfts", address],
    queryFn: () => getNFTs(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Deployment

### 1. Production Build

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### 2. Environment Configuration

```env
# Production environment variables
NEXT_PUBLIC_BASE_URL=https://yourminiapp.com
NEXT_PUBLIC_CELO_NETWORK=mainnet
FARCASTER_WEBHOOK_SECRET=your_production_secret
```

### 3. Deployment Platforms

**Vercel (Recommended)**:

```bash
npm install -g vercel
vercel --prod
```

**Other platforms**: Netlify, Railway, Render, or custom hosting

### 4. Domain Configuration

- Set up custom domain
- Configure HTTPS/SSL
- Set up analytics and monitoring
- Configure error tracking (Sentry, LogRocket)

## Advanced Features

### 1. Real-time Updates

```typescript
// WebSocket or SSE for real-time data
useEffect(() => {
  const eventSource = new EventSource("/api/stream");
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateUI(data);
  };
  return () => eventSource.close();
}, []);
```

### 2. Push Notifications

```typescript
// Service worker notifications
if ("Notification" in window && "serviceWorker" in navigator) {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    // Set up push notifications
  }
}
```

### 3. Multi-chain Support

```typescript
// Support multiple blockchain networks
const networks = {
  celo: { chainId: 42220, rpc: "https://forno.celo.org" },
  polygon: { chainId: 137, rpc: "https://polygon-rpc.com" },
};

const switchNetwork = async (networkKey: string) => {
  const network = networks[networkKey];
  await switchChain({ chainId: network.chainId });
};
```

This guide provides the foundation for building sophisticated Farcaster Miniapps that leverage both the social features of Farcaster and the blockchain capabilities of Celo. Focus on creating engaging user experiences that feel native to mobile users while providing powerful decentralized functionality.
