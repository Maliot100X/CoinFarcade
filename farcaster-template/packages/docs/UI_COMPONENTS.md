# Building UI Components for Your Farcaster Miniapp

This guide explains how to build and customize UI components for your Farcaster Miniapp. We'll cover the component architecture, styling patterns, and best practices for creating mobile-optimized user interfaces.

## Overview

The Farcaster Miniapp template includes a comprehensive component system designed for modern web applications:

- **Layout Components**: Header, Footer, and Layout wrappers
- **UI Library**: ShadCN components for consistent design
- **Custom Components**: Miniapp-specific components
- **Mobile Optimization**: Touch-friendly and responsive design

## Core Component Architecture

### 1. Layout Components

The layout system provides consistent structure across your miniapp:

```tsx
import { Layout } from "@/components/Layout";

export default function MyPage({ children }) {
  return <Layout>{children}</Layout>;
}
```

**Props:**

- `children` (ReactNode): Page content
- `showHeader` (boolean, optional): Show/hide header
- `showFooter` (boolean, optional): Show/hide footer

### 2. Header Component

Responsive navigation header with mobile optimization:

```tsx
import { Header } from "@/components/Header";

<Header
  title="My Miniapp"
  showBackButton={true}
  onBackClick={() => router.back()}
/>;
```

**Props:**

- `title` (string): Page title
- `showBackButton` (boolean): Show back navigation
- `onBackClick` (function): Back button handler
- `rightContent` (ReactNode): Right side content

### 3. Footer Component

Bottom navigation for mobile apps:

```tsx
import { Footer } from "@/components/Footer";

const tabs = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "nfts", label: "NFTs", icon: ImageIcon },
  { id: "profile", label: "Profile", icon: UserIcon },
];

<Footer tabs={tabs} activeTab="home" onTabChange={setActiveTab} />;
```

## UI Component Library

### 1. Button Components

Accessible and touch-friendly buttons:

```tsx
import { Button } from "@/components/ui/button";

<Button
  onClick={handleClick}
  loading={isLoading}
  disabled={isDisabled}
  variant="default"
  size="lg"
  className="w-full"
>
  Click Me
</Button>;
```

**Variants:**

- `default`: Primary brand color
- `destructive`: Warning/danger actions
- `outline`: Secondary actions
- `ghost`: Minimal styling
- `link`: Link appearance

**Sizes:**

- `default`: Standard size
- `sm`: Small size
- `lg`: Large size (touch-friendly)
- `icon`: Square icon button

### 2. Input Components

Mobile-optimized form inputs:

```tsx
import { Input } from "@/components/ui/input";

<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="text-lg"
/>;
```

### 3. Card Components

Content containers with elevation:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card className="mb-4">
  <CardHeader>
    <CardTitle>NFT Collection</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your NFT gallery content</p>
  </CardContent>
</Card>;
```

## Custom Miniapp Components

### 1. Tab Navigation

Create app-like tab navigation:

```tsx
interface TabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-sm">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2. NFT Gallery Component

Display NFT collections with responsive grid:

```tsx
import Image from "next/image";

interface NFTGalleryProps {
  nfts: Array<{
    id: string;
    tokenURI: string;
    name?: string;
  }>;
  onNFTClick?: (nft: any) => void;
}

export function NFTGallery({ nfts, onNFTClick }: NFTGalleryProps) {
  if (nfts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🖼️</span>
        </div>
        <p className="text-gray-600 mb-4">No NFTs found</p>
        <Button
          onClick={() => {
            /* mint action */
          }}
        >
          Mint Your First NFT
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {nfts.map((nft, index) => (
        <div
          key={nft.id}
          onClick={() => onNFTClick?.(nft)}
          className="bg-white p-3 rounded-xl shadow-sm border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-colors"
        >
          <Image
            alt={nft.name || `NFT #${index + 1}`}
            src={nft.tokenURI}
            className="w-full h-32 object-cover rounded-lg mb-2"
            width={150}
            height={120}
          />
          <p className="text-sm font-medium text-gray-800 truncate">
            {nft.name || `NFT #${index + 1}`}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Wallet Status Component

Display wallet connection status:

```tsx
import { useWeb3 } from "@/contexts/useWeb3";

export function WalletStatus() {
  const { address, getUserAddress } = useWeb3();

  if (!address) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-amber-800 font-medium mb-3">
          Connect your wallet to get started
        </p>
        <Button onClick={getUserAddress} className="w-full">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
      <p className="text-green-800 font-medium mb-1">Wallet Connected</p>
      <p className="font-mono text-sm text-green-700">
        {address.substring(0, 6)}...{address.substring(address.length - 4)}
      </p>
    </div>
  );
}
```

### 4. Transaction Status Component

Handle transaction feedback:

```tsx
interface TransactionStatusProps {
  tx?: {
    transactionHash: string;
    status?: "pending" | "success" | "failed";
  };
  onDismiss?: () => void;
}

export function TransactionStatus({ tx, onDismiss }: TransactionStatusProps) {
  if (!tx) return null;

  const getStatusColor = () => {
    switch (tx.status) {
      case "pending":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "failed":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold mb-1">
            {tx.status === "pending" && "Transaction Pending..."}
            {tx.status === "success" && "Transaction Successful!"}
            {tx.status === "failed" && "Transaction Failed"}
          </p>
          <a
            href={`https://alfajores.celoscan.io/tx/${tx.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 text-sm"
          >
            View on Explorer
          </a>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
```

## Mobile-Optimized Design Patterns

### 1. Touch-Friendly Components

Design components for mobile interaction:

```tsx
export function TouchFriendlyButton({ children, ...props }) {
  return (
    <button
      className="min-h-[44px] px-4 py-3 text-lg font-medium rounded-lg bg-purple-600 text-white active:bg-purple-700 transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}
```

### 2. Responsive Grid System

Create responsive layouts:

```tsx
export function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
```

### 3. Safe Area Components

Handle mobile safe areas:

```tsx
export function SafeAreaView({ children, className = "" }) {
  return (
    <div
      className={`
      pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right
      ${className}
    `}
    >
      {children}
    </div>
  );
}
```

## Styling Guidelines

### 1. Color System

Use consistent colors throughout your app:

```css
:root {
  --color-primary: #6366f1;
  --color-secondary: #10b981;
  --color-accent: #f59e0b;
  --color-danger: #ef4444;

  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;
}
```

### 2. Typography Scale

Consistent text sizing:

```css
.text-xs {
  font-size: 0.75rem;
}
.text-sm {
  font-size: 0.875rem;
}
.text-base {
  font-size: 1rem;
}
.text-lg {
  font-size: 1.125rem;
}
.text-xl {
  font-size: 1.25rem;
}
.text-2xl {
  font-size: 1.5rem;
}
```

### 3. Spacing System

Consistent spacing patterns:

```css
.space-1 {
  margin: 0.25rem;
}
.space-2 {
  margin: 0.5rem;
}
.space-3 {
  margin: 0.75rem;
}
.space-4 {
  margin: 1rem;
}
.space-6 {
  margin: 1.5rem;
}
.space-8 {
  margin: 2rem;
}
```

## Component Testing

### 1. Unit Testing

Test individual components:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { WalletStatus } from "./WalletStatus";

test("shows connect button when wallet not connected", () => {
  render(<WalletStatus />);
  expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
});

test("handles wallet connection", () => {
  const mockConnect = jest.fn();
  render(<WalletStatus onConnect={mockConnect} />);

  fireEvent.click(screen.getByText("Connect Wallet"));
  expect(mockConnect).toHaveBeenCalled();
});
```

### 2. Visual Testing

Use Storybook for component development:

```tsx
// NFTGallery.stories.tsx
export default {
  title: "Components/NFTGallery",
  component: NFTGallery,
};

export const Empty = () => <NFTGallery nfts={[]} />;

export const WithNFTs = () => (
  <NFTGallery
    nfts={[
      { id: "1", tokenURI: "/nft1.jpg", name: "Cool NFT" },
      { id: "2", tokenURI: "/nft2.jpg", name: "Another NFT" },
    ]}
  />
);
```

## Performance Optimization

### 1. Lazy Loading

Load components on demand:

```tsx
import dynamic from "next/dynamic";

const NFTGallery = dynamic(() => import("./NFTGallery"), {
  loading: () => <div>Loading gallery...</div>,
});
```

### 2. Virtualization

Handle large lists efficiently:

```tsx
import { FixedSizeList as List } from "react-window";

function VirtualizedNFTList({ nfts }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <NFTCard nft={nfts[index]} />
    </div>
  );

  return (
    <List height={400} itemCount={nfts.length} itemSize={200}>
      {Row}
    </List>
  );
}
```

### 3. Memoization

Optimize re-renders:

```tsx
import { memo, useMemo } from "react";

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map((item) => /* expensive calculation */ item);
  }, [data]);

  return <div>{/* render with processedData */}</div>;
});
```

## Accessibility

### 1. Screen Reader Support

```tsx
<button
  aria-label="Mint new NFT"
  aria-describedby="mint-description"
  onClick={handleMint}
>
  Mint NFT
</button>
<div id="mint-description" className="sr-only">
  Creates a new NFT in your collection
</div>
```

### 2. Keyboard Navigation

```tsx
const handleKeyDown = (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleClick();
  }
};

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
  className="cursor-pointer focus:outline-none focus:ring-2"
>
  Interactive element
</div>;
```

### 3. Color Contrast

Ensure sufficient contrast ratios:

```css
/* Good contrast examples */
.text-primary {
  color: #1f2937;
} /* Dark text on light background */
.text-on-primary {
  color: #ffffff;
} /* White text on dark background */

/* Use tools like WebAIM contrast checker */
```

This guide provides a solid foundation for building accessible, mobile-optimized UI components for your Farcaster Miniapp. Focus on creating intuitive user experiences that work well across all devices and accessibility needs.
