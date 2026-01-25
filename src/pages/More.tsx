import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Rocket, Wallet, ChevronRight } from 'lucide-react';
import ForgecastBot from '../components/ForgecastBot';

export function More() {
  const navigate = useNavigate();
  const [showBot, setShowBot] = useState(false);

  if (showBot) {
    return <div className="h-[calc(100vh-80px)]"><ForgecastBot onClose={() => setShowBot(false)} /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="p-4">
        <h1 className="text-2xl font-bold">More</h1>
      </header>
      
      {/* AI Agent Button */}
      <div className="px-4">
        <button 
          onClick={() => setShowBot(true)}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
        >
            <Bot className="text-white" size={24} />
            <span className="text-white text-lg">Open Forgecast Bot</span>
        </button>
      </div>

      {/* Shortcuts */}
      <div className="px-4">
        <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Shortcuts</h3>
        <div className="space-y-2">
            <div onClick={() => navigate('/launch')} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-800 border border-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Rocket size={20} /></div>
                    <span className="font-medium">Launch New Coin</span>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
            </div>
            <div onClick={() => navigate('/profile')} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-800 border border-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Wallet size={20} /></div>
                    <span className="font-medium">Check Portfolio</span>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
            </div>
        </div>
      </div>

      {/* Guided App Navigation */}
      <div className="px-4">
        <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Guided App Navigation</h3>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-4 relative overflow-hidden">
            <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gray-800"></div>
            
            <div className="flex items-center gap-4 relative z-10" onClick={() => navigate('/')}>
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">1</div>
                <div>
                    <div className="font-bold text-sm text-gray-200">Home</div>
                    <div className="text-xs text-gray-500">Discover trending coins</div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10" onClick={() => navigate('/launch')}>
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">2</div>
                <div>
                    <div className="font-bold text-sm text-gray-200">Launch</div>
                    <div className="text-xs text-gray-500">Create your own Zora coin</div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10" onClick={() => navigate('/profile')}>
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">3</div>
                <div>
                    <div className="font-bold text-sm text-gray-200">Profile</div>
                    <div className="text-xs text-gray-500">Sync wallets & view holdings</div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10" onClick={() => navigate('/shop')}>
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">4</div>
                <div>
                    <div className="font-bold text-sm text-gray-200">Shop</div>
                    <div className="text-xs text-gray-500">Buy boosts & subscriptions</div>
                </div>
            </div>
        </div>
      </div>

      <div className="px-4 text-center">
          <p className="text-xs text-gray-600">CoinFarcade v1.0.0 (Phase 4)</p>
      </div>
    </div>
  );
}
