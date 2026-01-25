"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/useWeb3";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { useConnect, useDisconnect } from "wagmi";

// Farcaster SDK integration
let sdk: any = null;

export default function Home() {
  const [mounted, setMounted] = useState(false);

  const {
    address,
    isConnected,
    chain,
    needsChainSwitch,
    sendCUSD,
    ensureCorrectChain,
    isCUSDLoading,
    cUSDTxHash,
    celoBalance,
    cUSDBalance,
  } = useWeb3();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [isFarcasterMiniapp, setIsFarcasterMiniapp] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [amountToSend, setAmountToSend] = useState<string>("0.1");
  const [recipientAddress, setRecipientAddress] = useState<string>("");

  // Handle SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Farcaster SDK
  useEffect(() => {
    const initFarcasterSDK = async () => {
      try {
        console.log("Initializing Farcaster SDK...");

        // Check if we're in a Farcaster miniapp environment
        const url = new URL(window.location.href);
        const isMiniApp =
          url.pathname.includes("/miniapp") ||
          url.searchParams.get("miniApp") === "true" ||
          window.navigator.userAgent.includes("Farcaster") ||
          window.navigator.userAgent.includes("Warpcast") ||
          window.parent !== window ||
          !!(window as any).farcaster;

        setIsFarcasterMiniapp(isMiniApp);

        // Initialize SDK
        const { sdk: farcasterSDK } = await import("@farcaster/miniapp-sdk");
        sdk = farcasterSDK;
        sdk.actions.ready();

        console.log("Farcaster SDK initialized");
        setIsInitializing(false);
      } catch (error) {
        console.log("Farcaster SDK not available:", error);
        setTimeout(() => setIsInitializing(false), 2000);
      }
    };

    initFarcasterSDK();
  }, []);

  // Handle wallet connection - prioritize Farcaster wallet
  const handleGetStarted = async () => {
    try {
      // If we're in a Farcaster miniapp, use the Farcaster connector
      if (isFarcasterMiniapp) {
        console.log("Connecting to Farcaster wallet...");
        connect({ connector: farcasterMiniApp() });
      } else {
        // Otherwise, use the first available connector (should be Farcaster, then fallback to injected)
        if (connectors.length > 0) {
          console.log("Connecting to available wallet...");
          connect({ connector: connectors[0] });
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Handle send cUSD
  const handleSendCUSD = async () => {
    if (!address) return;

    // Use recipient address if provided, otherwise send to self for testing
    const toAddress = recipientAddress.trim() || address;

    try {
      await ensureCorrectChain();
      await sendCUSD(toAddress, amountToSend);
    } catch (error) {
      console.error("Error sending cUSD:", error);
    }
  };

  // Format balance for display
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return "0.00";
    if (num < 0.001) return "< 0.001";
    return num.toFixed(3);
  };

  // Validate recipient address
  const isValidRecipient =
    recipientAddress.trim() === "" || isAddress(recipientAddress.trim());
  const recipientToShow = recipientAddress.trim() || address;

  // Prevent SSR issues with wagmi hooks
  if (!mounted) {
    return <div className="p-4">Loading...</div>;
  }

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show connection screen if not connected
  if (!isConnected) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h1 className="text-xl font-semibold text-black mb-4">
            Farcaster × Celo
          </h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to get started
          </p>
          <Button
            title="Get Started"
            onClick={handleGetStarted}
            className="w-full bg-black text-white hover:bg-gray-800"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black">Farcaster × Celo</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Connected</p>
            <p className="font-mono text-xs text-black">
              {address?.substring(0, 6)}...
              {address?.substring(address.length - 4)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">CELO Balance</p>
            <p className="font-semibold text-black">
              {formatBalance(celoBalance)}
            </p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-500 mb-1">cUSD Balance</p>
            <p className="font-semibold text-black">
              {formatBalance(cUSDBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Chain Switch Banner */}
      {needsChainSwitch && (
        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black">
              Switch to Celo Alfajores to continue
            </p>
            <button
              onClick={ensureCorrectChain}
              className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
            >
              Switch
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Transaction Success Banner */}
        {cUSDTxHash && (
          <div className="mb-4 p-3 border border-gray-200 rounded">
            <p className="font-medium text-black mb-1">
              Transaction Completed!
            </p>
            <a
              href={`https://alfajores.celoscan.io/tx/${cUSDTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-gray-600 hover:text-black"
            >
              View on Explorer
            </a>
          </div>
        )}

        {/* Send Section */}
        <div className="space-y-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-semibold text-black mb-2">Send cUSD</h2>
            <p className="text-gray-600">Transfer Celo stablecoins</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Recipient Address
              </label>
              <Input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x... (leave empty to send to yourself)"
                className={`w-full ${
                  !isValidRecipient ? "border-red-300" : "border-gray-300"
                }`}
              />
              {!isValidRecipient && (
                <p className="text-xs text-red-600 mt-1">
                  Please enter a valid Ethereum address
                </p>
              )}
              {recipientToShow && (
                <p className="text-xs text-gray-500 mt-1">
                  Sending to: {recipientToShow.substring(0, 6)}...
                  {recipientToShow.substring(recipientToShow.length - 4)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Amount to Send
              </label>
              <Input
                type="number"
                value={amountToSend}
                onChange={(e) => setAmountToSend(e.target.value)}
                placeholder="0.0"
                className="w-full border-gray-300"
              />
            </div>

            <Button
              title={isCUSDLoading ? "Sending..." : `Send ${amountToSend} cUSD`}
              onClick={handleSendCUSD}
              disabled={
                isCUSDLoading ||
                needsChainSwitch ||
                !isValidRecipient ||
                !amountToSend
              }
              className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            />
          </div>

          <div className="text-center">
            <a
              href="https://faucet.celo.org/alfajores"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-gray-600 hover:text-black"
            >
              Need test tokens? Get them from the faucet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
