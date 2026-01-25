import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useEffect, useState } from "react";

export function Profile() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (!isConnected) {
        // Try to find the Farcaster connector, or fall back to the first available one
        const connector = connectors.find((c) => c.id === "farcaster" || c.id === "farcaster-miniapp" || c.name.toLowerCase().includes("farcaster")) || connectors[0];
        if (connector) {
          connect({ connector });
        }
      }
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      
      <div className="p-6 bg-gray-900 rounded-xl flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-700 rounded-full mb-4 flex items-center justify-center overflow-hidden">
             {/* Placeholder Avatar */}
             <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-xl font-bold">{isConnected ? "Connected User" : "Guest"}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {isConnected && address 
              ? `${address.slice(0, 6)}...${address.slice(-4)}` 
              : "Not connected"}
          </p>
          {isConnected && balance && (
             <p className="text-green-400 text-sm mt-2">
               {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
             </p>
          )}
      </div>

      <div className="space-y-3">
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full py-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50"
        >
            {isSyncing ? "Syncing..." : (isConnected ? "Sync Profile & Wallets" : "Connect Wallet")}
        </button>

        {isConnected && (
          <button 
            onClick={() => disconnect()}
            className="w-full py-3 bg-red-900/30 text-red-400 rounded-lg border border-red-900/50 hover:bg-red-900/50"
          >
              Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
