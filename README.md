# CoinFarcade

A full-featured Farcaster + Base Mini App integrating real Zora coin launch, marketplace, wallet sync, and AI-assisted coin creation.

## Features

- **Home Tab**: Discover live coins (New, Boosted, Graduated, Trending).
- **Launch Tab**: Launch your own coin on Zora/Base with AI assistance.
- **Shop Tab**: Buy boosts and subscribe for premium features.
- **Profile Tab**: Sync Farcaster and Base wallets.
- **MCP Server**: Backend handling Zora and Base interactions.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure environment variables in `.env.local`.
4. Run development server: `npm run dev`.
5. Run MCP server (local): `npm run server`.

## Deployment

### Vercel

The project is configured for Vercel deployment.
- Frontend: Vite (Static)
- Backend: Serverless Functions via `api/index.ts`

Ensure you set the environment variables in your Vercel project settings.

## GitHub & Vercel

- **GitHub Repository**: [https://github.com/Maliot100X/CoinFarcade](https://github.com/Maliot100X/CoinFarcade)
- **Vercel Project**: [https://vercel.com/fbbussines58-6095s-projects](https://vercel.com/fbbussines58-6095s-projects)
- **Suggested Domain**: `coinfarcade.fun`

## Environment Variables

- `DATABASE_URL`
- `ZORA_API_KEY`
- `NEYNAR_API_KEY`
- `FORCE_REF_WALLET`
- `NEXT_PUBLIC_API_URL`
- `BASE_RPC_URL`
- `COINBASE_CLIENT_ID`
- `COINBASE_CLIENT_SECRET`
- `ALCHEMY_API_KEY`
- `RLC_POLICY_ID`
- `FARCASTER_CLIENT_ID`
- `FARCASTER_BOT_AGENT`
- `FARCASTER_API_KEY`

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Lucide React
- Backend: Express, Node.js (Serverless)
- Blockchain: Wagmi, Viem, Farcaster Frame SDK
