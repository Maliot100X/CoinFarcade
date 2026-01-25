import { useEffect, useState } from 'react';
import { TrendingUp, Flame, Star, Zap } from 'lucide-react';

export function Home() {
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('New');

  useEffect(() => {
    // Fetch from our MCP server
    const apiUrl = import.meta.env.VITE_API_URL || ''; // Empty string means relative path in dev if proxy set up, or absolute if needed.
    // Actually, with vite proxy, we can just use /zora_explore_new if running on same host, 
    // but the proxy is set to localhost:3000. 
    // If we use relative path in fetch like '/zora_explore_new', vite proxy handles it.
    
    setLoading(true);
    fetch(`/zora_explore_new`)
      .then(res => res.json())
      .then(data => {
        setCoins(data.coins || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeTab]);

  const tabs = [
    { name: 'New', icon: <Star size={14} /> },
    { name: 'Boosted', icon: <Zap size={14} /> },
    { name: 'Graduated', icon: <TrendingUp size={14} /> },
    { name: 'Trending', icon: <Flame size={14} /> }
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-md p-4 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            CoinFarcade
        </h1>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
      </header>
      
      <div className="px-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => (
                <button 
                    key={tab.name} 
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.name 
                        ? 'bg-white text-black font-bold shadow-lg shadow-purple-500/20' 
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                    }`}
                >
                    {tab.icon}
                    <span>{tab.name}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="px-4 grid gap-4">
        {loading ? (
            <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 animate-pulse">Scanning the blockchain...</p>
            </div>
        ) : coins.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                No coins found. Be the first to launch one!
            </div>
        ) : (
            coins.map((coin: any, index: number) => (
            <div key={coin.id || index} className="group relative p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center space-x-4 relative z-10">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                            <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                        </div>
                        {index < 3 && activeTab === 'Trending' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold border-2 border-gray-900">
                                {index + 1}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h2 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">{coin.name}</h2>
                            <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">+{(Math.random() * 100).toFixed(2)}%</span>
                        </div>
                        <p className="text-sm text-gray-400 flex items-center">
                            <span className="font-bold text-gray-500 mr-2">${coin.symbol}</span>
                            <span className="text-xs text-gray-600">Market Cap: ${(Math.random() * 50000).toFixed(0)}</span>
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex space-x-2 relative z-10">
                    <button className="flex-1 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-600 hover:text-white transition-all">
                        Buy
                    </button>
                    <button className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors">
                        <Star size={16} />
                    </button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
}
