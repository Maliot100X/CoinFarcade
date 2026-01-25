import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, Coins, Wallet, Rocket, Map, ChevronRight } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string | React.ReactNode;
  timestamp: number;
}

export function More() {
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
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: command,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI processing
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

          case 'Tour App':
            botResponse = (
                <div className="space-y-2">
                    <p>Welcome to CoinFarcade! Here is your guided tour:</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center justify-between bg-gray-800 p-2 rounded">
                            <span>🏠 <b>Home</b>: Discover trending coins.</span>
                            <button onClick={() => navigate('/')} className="text-purple-400 text-xs font-bold">GO</button>
                        </li>
                        <li className="flex items-center justify-between bg-gray-800 p-2 rounded">
                            <span>🚀 <b>Launch</b>: Create Zora coins.</span>
                            <button onClick={() => navigate('/launch')} className="text-purple-400 text-xs font-bold">GO</button>
                        </li>
                        <li className="flex items-center justify-between bg-gray-800 p-2 rounded">
                            <span>🛍️ <b>Shop</b>: Buy Boosts & Subs.</span>
                            <button onClick={() => navigate('/shop')} className="text-purple-400 text-xs font-bold">GO</button>
                        </li>
                         <li className="flex items-center justify-between bg-gray-800 p-2 rounded">
                            <span>👤 <b>Profile</b>: Sync Wallets & Portfolio.</span>
                            <button onClick={() => navigate('/profile')} className="text-purple-400 text-xs font-bold">GO</button>
                        </li>
                    </ul>
                </div>
            );
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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-black text-white pb-20">
       <header className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900/50 backdrop-blur">
          <Bot className="text-purple-500" />
          <h1 className="text-xl font-bold">Forgecast AI</h1>
       </header>

       {/* Chat Area */}
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

       {/* Quick Commands */}
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
                <button onClick={() => handleCommand('Tour App')} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-gray-700">
                   <Map size={14} className="text-blue-500" /> Tour App
               </button>
           </div>

           {/* Input Area */}
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

       {/* Navigation Trail / Shortcuts */}
       <div className="px-4 pb-4">
           <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Shortcuts</h3>
           <div className="space-y-2">
               <div onClick={() => navigate('/launch')} className="flex items-center justify-between p-3 bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-800 border border-gray-800">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Rocket size={16} /></div>
                       <span className="text-sm font-medium">Launch New Coin</span>
                   </div>
                   <ChevronRight size={14} className="text-gray-600" />
               </div>
               <div onClick={() => navigate('/profile')} className="flex items-center justify-between p-3 bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-800 border border-gray-800">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Wallet size={16} /></div>
                       <span className="text-sm font-medium">Check Portfolio</span>
                   </div>
                   <ChevronRight size={14} className="text-gray-600" />
               </div>
           </div>
       </div>
    </div>
  );
}
