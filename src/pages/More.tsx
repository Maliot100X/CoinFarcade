import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, Wallet, Rocket, Map, ChevronRight, X, MessageSquare } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string | React.ReactNode;
  timestamp: number;
}

function ForgecastBot({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Hello! I am your Forgecast AI Agent. How can I help you today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleCommand = async (command: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: command,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(async () => {
      let botResponse: React.ReactNode = '';

      try {
        switch (command) {
          case 'Create Creator Coin':
          case 'Create Content Coin':
            botResponse = (
              <div>
                <p className="mb-2">I can help you launch a coin on Zora/Base! Ready to deploy?</p>
                <button 
                  onClick={() => navigate('/launch')}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500 transition-colors"
                >
                  Go to Launchpad 🚀
                </button>
              </div>
            );
            break;

          case 'Recent Coins':
            const recentRes = await fetch('/zora_explore_new');
            const recentData = await recentRes.json();
            const coins = recentData.coins?.slice(0, 3) || [];
            botResponse = (
              <div className="space-y-2">
                <p>Here are the latest coins launched on Base:</p>
                {coins.map((c: any) => (
                  <div key={c.id} className="p-2 bg-gray-800 rounded flex items-center gap-2">
                     <img src={c.image} className="w-8 h-8 rounded-full" />
                     <div>
                       <div className="font-bold text-sm">{c.name}</div>
                       <div className="text-xs text-gray-400">{c.symbol}</div>
                     </div>
                  </div>
                ))}
              </div>
            );
            break;

          case 'My Holdings':
            if (!address) {
                botResponse = "Please connect your wallet in the Profile tab first.";
            } else {
                const holdingsRes = await fetch(`/zora_get_holdings?address=${address}`);
                const holdingsData = await holdingsRes.json();
                const myCoins = holdingsData.coins?.slice(0, 3) || [];
                if (myCoins.length === 0) {
                    botResponse = "You don't have any coins yet.";
                } else {
                    botResponse = (
                        <div className="space-y-2">
                            <p>Your top holdings:</p>
                            {myCoins.map((c: any) => (
                                <div key={c.address} className="p-2 bg-gray-800 rounded flex items-center gap-2">
                                    <img src={c.image} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <div className="font-bold text-sm">{c.name}</div>
                                        <div className="text-xs text-gray-400">{c.balance || '0'} tokens</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }
            }
            break;

          default:
            botResponse = "I'm still learning! Try one of the commands below.";
        }
      } catch (err) {
        botResponse = "Sorry, I encountered an error fetching data.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse,
        timestamp: Date.now()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
       <header className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <Bot className="text-purple-500" />
            <h1 className="text-xl font-bold">Forgecast AI</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
       </header>

       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-gray-800 text-gray-200 rounded-tl-none'
                  }`}>
                      {msg.content}
                  </div>
              </div>
          ))}
          {isTyping && (
              <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none text-gray-400 text-sm animate-pulse">
                      Thinking...
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       <div className="p-4 bg-gray-900/80 border-t border-gray-800">
           <div className="grid grid-cols-2 gap-2 mb-4">
               <button onClick={() => handleCommand('Create Creator Coin')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-gray-700">
                   <Rocket size={14} className="text-pink-500" /> Create Coin
               </button>
               <button onClick={() => handleCommand('Recent Coins')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-gray-700">
                   <Sparkles size={14} className="text-yellow-500" /> Recent Coins
               </button>
               <button onClick={() => handleCommand('My Holdings')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-gray-700">
                   <Wallet size={14} className="text-green-500" /> My Holdings
               </button>
           </div>

           <div className="relative">
               <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && input && (handleCommand(input), setInput(''))}
                 placeholder="Ask Forgecast..."
                 className="w-full bg-gray-950 border border-gray-800 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:border-purple-500 transition-colors"
               />
               <button 
                 onClick={() => input && (handleCommand(input), setInput(''))}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors"
               >
                   <Send size={14} />
               </button>
           </div>
       </div>
    </div>
  );
}

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
          <p className="text-xs text-gray-600">CoinFarcade v1.0.0 (Phase 3)</p>
      </div>
    </div>
  );
}
