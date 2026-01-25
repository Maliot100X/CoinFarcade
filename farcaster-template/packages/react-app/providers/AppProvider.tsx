"use client";

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { celoAlfajores } from "wagmi/chains";
import { injected } from "wagmi/connectors";

import Layout from "../components/Layout";

// Create connectors - prioritize Farcaster wallet in miniapp environment
const connectors = [
  farcasterMiniApp(), // Farcaster wallet (first priority when in miniapp)
  injected(), // Fallback to injected wallet (MetaMask, etc.)
];

const config = createConfig({
  connectors,
  chains: [celoAlfajores],
  transports: {
    [celoAlfajores.id]: http(),
  },
});

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Layout>{children}</Layout>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
