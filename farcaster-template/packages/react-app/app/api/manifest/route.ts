import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get the host from headers (this works better with ngrok)
  const host = request.headers.get("host") || "localhost:3000";

  // Determine protocol - ngrok always uses https
  const protocol = host.includes("ngrok")
    ? "https"
    : request.headers.get("x-forwarded-proto") ||
      (host === "localhost:3000" ? "http" : "https");

  const baseUrl = `${protocol}://${host}`;

  console.log("Manifest requested from:", baseUrl);

  const manifest = {
    miniapp: {
      version: "1",
      name: "Farcaster × Celo",
      iconUrl: `${baseUrl}/logo.svg`,
      homeUrl: baseUrl,
      splashImageUrl: `${baseUrl}/logo.svg`,
      splashBackgroundColor: "#6366f1",
      subtitle: "Social miniapp on Celo",
      description:
        "A decentralized social miniapp on Celo blockchain integrated with Farcaster for NFT minting and token operations",
      primaryCategory: "social",
      tags: ["social", "nft", "celo", "blockchain", "web3"],
      ogTitle: "Farcaster × Celo Miniapp",
      ogDescription:
        "A decentralized social miniapp on Celo blockchain integrated with Farcaster",
      ogImageUrl: `${baseUrl}/logo.svg`,
      requiredChains: [
        "eip155:44787", // Celo Alfajores Testnet
        "eip155:42220", // Celo Mainnet
      ],
      requiredCapabilities: ["wallet.getEthereumProvider"],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
