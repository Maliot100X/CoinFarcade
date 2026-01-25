import { AppProvider } from "@/providers/AppProvider";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Farcaster × Celo Miniapp",
  description:
    "A decentralized social miniapp on Celo blockchain integrated with Farcaster",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Farcaster × Celo Miniapp",
    description:
      "A decentralized social miniapp on Celo blockchain integrated with Farcaster",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Farcaster × Celo Miniapp",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
