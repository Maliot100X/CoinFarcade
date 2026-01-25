import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig({
  chains: [base],
  connectors: [farcasterMiniApp()],
  transports: {
    [base.id]: http("/base-rpc"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
