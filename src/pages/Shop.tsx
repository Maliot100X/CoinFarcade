import { useState } from 'react';
import { ShoppingBag, Zap, Crown, Check, Clock } from 'lucide-react';

export function Shop() {
  const [buyingBoost, setBuyingBoost] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleBuyBoost = (type: string) => {
    setBuyingBoost(type);
    // Simulate purchase
    setTimeout(() => {
      setBuyingBoost(null);
      alert(`${type} purchased successfully!`);
    }, 1500);
  };

  const handleSubscribe = () => {
    setSubscribing(true);
    // Simulate subscription
    setTimeout(() => {
      setSubscribing(false);
      setIsSubscribed(true);
      alert("Welcome to CoinFarcade Premium!");
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-purple-500" />
            <span>Shop</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Boost your coins and unlock premium features.</p>
      </header>
      
      <div className="px-4 space-y-6">
          {/* Subscription Card */}
          <div className="relative p-6 bg-gradient-to-br from-yellow-900/40 to-black rounded-2xl border border-yellow-500/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Crown className="text-yellow-500" size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-yellow-500">Premium Member</h3>
                      <p className="text-xs text-yellow-500/70">Unlock exclusive tools</p>
                  </div>
              </div>

              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                      <Check size={16} className="text-yellow-500" />
                      <span>Zero trading fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                      <Check size={16} className="text-yellow-500" />
                      <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                      <Check size={16} className="text-yellow-500" />
                      <span>Priority support</span>
                  </li>
              </ul>

              {isSubscribed ? (
                  <button className="w-full py-3 bg-yellow-500/20 text-yellow-500 rounded-xl font-bold border border-yellow-500/50 cursor-default">
                      Active Member
                  </button>
              ) : (
                  <button 
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50"
                  >
                      {subscribing ? "Processing..." : "Subscribe ($15/mo)"}
                  </button>
              )}
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>24h Free Trial</span>
                  <span>Cancel anytime</span>
              </div>
          </div>

          {/* Boosts Section */}
          <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="text-purple-500" size={20} />
                  <span>Boost Your Coin</span>
              </h3>
              
              <div className="grid gap-4">
                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
                              <Clock size={20} />
                          </div>
                          <div>
                              <h4 className="font-bold">10 Minutes</h4>
                              <p className="text-xs text-gray-500">Get featured on home</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleBuyBoost('10min')}
                        disabled={!!buyingBoost}
                        className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50"
                      >
                          {buyingBoost === '10min' ? '...' : '$1.99'}
                      </button>
                  </div>

                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-600 text-[10px] font-bold text-white rounded-bl-lg">
                          POPULAR
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
                              <Clock size={20} />
                          </div>
                          <div>
                              <h4 className="font-bold">30 Minutes</h4>
                              <p className="text-xs text-gray-500">3x visibility boost</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleBuyBoost('30min')}
                        disabled={!!buyingBoost}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                      >
                          {buyingBoost === '30min' ? '...' : '$4.99'}
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
