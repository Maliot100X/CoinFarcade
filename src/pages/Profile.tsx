import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useEffect, useState } from "react";

export function Profile() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'holdings' | 'created' | 'activity'>('holdings');
  const [holdings, setHoldings] = useState<any[]>([]);
  const [created, setCreated] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
        fetchHoldings(address);
        fetchCreated(address);
        fetchActivity(address);
    }
  }, [isConnected, address]);

  const fetchHoldings = async (addr: string) => {
      try {
          const res = await fetch(`/zora_get_holdings?address=${addr}`);
          const data = await res.json();
          setHoldings(data.coins || []);
      } catch (e) { console.error(e); }
  };

  const fetchCreated = async (addr: string) => {
      try {
          const res = await fetch(`/zora_get_created?address=${addr}`);
          const data = await res.json();
          setCreated(data.coins || []);
      } catch (e) { console.error(e); }
  };

  const fetchActivity = async (addr: string) => {
      try {
          const res = await fetch(`/get_user_activity?address=${addr}`);
          const data = await res.json();
          setActivity(data.activities || []);
      } catch (e) { console.error(e); }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (!isConnected) {
        // Try to find the Farcaster connector
        const connector = connectors.find((c) => c.id === "farcaster" || c.id === "farcaster-miniapp" || c.name.toLowerCase().includes("farcaster")) || connectors[0];
        if (connector) {
          connect({ connector });
        }
      }
      // Refresh data
      if (address) {
          await Promise.all([fetchHoldings(address), fetchCreated(address), fetchActivity(address)]);
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold p-4">Profile</h1>
      
      <div className="mx-4 p-6 bg-gray-900 rounded-xl flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-700 rounded-full mb-4 flex items-center justify-center overflow-hidden">
             <span className="text-3xl">👤</span>
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

      <div className="mx-4 space-y-3">
        {!isConnected && (
            <div className="grid grid-cols-1 gap-3">
                {connectors.map((connector) => {
                    let label = connector.name;
                    let bgClass = "bg-indigo-600 hover:bg-indigo-500";
                    
                    if (connector.name.toLowerCase().includes("farcaster")) {
                        label = "Connect Farcaster Wallet";
                        bgClass = "bg-purple-600 hover:bg-purple-500";
                    } else if (connector.name.toLowerCase().includes("coinbase")) {
                        label = "Connect Base Wallet";
                        bgClass = "bg-blue-600 hover:bg-blue-500";
                    } else if (connector.name.toLowerCase().includes("metamask") || connector.id === "injected") {
                        label = "Connect MetaMask";
                        bgClass = "bg-orange-600 hover:bg-orange-500";
                    }

                    return (
                        <button
                            key={connector.uid}
                            onClick={() => connect({ connector })}
                            className={`w-full py-3 rounded-lg font-bold transition-colors ${bgClass}`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        )}

        {isConnected && (
            <div className="flex gap-2">
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex-1 py-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                >
                    {isSyncing ? "Syncing..." : "Sync Profile"}
                </button>
                <button 
                    onClick={() => disconnect()}
                    className="flex-1 py-3 bg-red-900/30 text-red-400 rounded-lg border border-red-900/50 hover:bg-red-900/50"
                >
                    Disconnect
                </button>
            </div>
        )}
      </div>

      {isConnected && (
          <div className="mt-6">
              <div className="flex border-b border-gray-800">
                  <button 
                    onClick={() => setActiveTab('holdings')}
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'holdings' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                  >
                      Holdings
                  </button>
                  <button 
                    onClick={() => setActiveTab('created')}
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'created' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                  >
                      Created
                  </button>
                  <button 
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'activity' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                  >
                      Activity
                  </button>
              </div>

              <div className="p-4">
                  {activeTab === 'holdings' && (
                      <div className="space-y-4">
                          {holdings.length === 0 ? (
                              <p className="text-center text-gray-500 py-4">No coins found.</p>
                          ) : (
                              holdings.map((coin, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                                      <img src={coin.image || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full" />
                                      <div>
                                          <div className="font-bold">{coin.name}</div>
                                          <div className="text-xs text-gray-500">{coin.symbol}</div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}

                  {activeTab === 'created' && (
                       <div className="space-y-4">
                          {created.length === 0 ? (
                              <p className="text-center text-gray-500 py-4">No created coins found.</p>
                          ) : (
                              created.map((coin, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                                      <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center">🚀</div>
                                      <div>
                                          <div className="font-bold">{coin.name || 'Unknown'}</div>
                                          <div className="text-xs text-gray-500">{coin.address ? `${coin.address.slice(0,6)}...` : ''}</div>
                                      </div>
                                  </div>
                              ))
                          )}
                       </div>
                  )}

                  {activeTab === 'activity' && (
                      <div className="space-y-4">
                          {activity.length === 0 ? (
                              <p className="text-center text-gray-500 py-4">No recent activity.</p>
                          ) : (
                              activity.map((act, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                                      <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">💸</div>
                                      <div>
                                          <div className="font-bold">{act.type}</div>
                                          <div className="text-xs text-gray-500">
                                              {act.value} {act.asset} &rarr; {act.to?.slice(0,6)}...
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}
