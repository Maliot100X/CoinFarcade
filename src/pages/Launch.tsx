import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Rocket, Upload, Sparkles } from 'lucide-react';
import { parseEther } from 'viem';

export function Launch() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  // Placeholder for Zora/Base Launch Contract
  // In a real app, you'd use the actual Factory ABI and Address
  const { writeContract, data: hash, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);

    try {
        // Simulate AI generation delay if needed
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // In Phase 1, we might just log or call a mock endpoint if we don't have the contract yet
        // But here is how we would call the contract:
        /*
        writeContract({
            address: '0x...', // Zora Factory Address
            abi: [...],
            functionName: 'createToken',
            args: [name, symbol, image, description],
        });
        */
       
       // For now, let's simulate a success after a delay
       setTimeout(() => {
           setIsLaunching(false);
           alert("Coin Launched! (Simulation)");
       }, 2000);

    } catch (err) {
        console.error("Launch failed", err);
        setIsLaunching(false);
    }
  };

  const generateWithAI = () => {
      // Placeholder for AI generation
      setName("Galactic Kitty");
      setSymbol("GKIT");
      setDescription("A kitty that travels through the galaxy.");
      setImage("https://via.placeholder.com/150");
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="text-purple-500" />
            <span>Launch Coin</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Create your own coin on Zora/Base instantly.</p>
      </header>
      
      <div className="px-4">
          <button 
            type="button"
            onClick={generateWithAI}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
              <Sparkles size={18} />
              <span>Generate with AI</span>
          </button>
      </div>

      <form onSubmit={handleLaunch} className="px-4 space-y-4">
          <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 outline-none transition-colors" 
                placeholder="e.g. My Cool Coin" 
                required
              />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Symbol</label>
                <input 
                    type="text" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 outline-none transition-colors" 
                    placeholder="e.g. COOL" 
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Initial Supply</label>
                <input 
                    type="number" 
                    className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 outline-none transition-colors" 
                    placeholder="1,000,000" 
                    disabled
                    value="1,000,000"
                />
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 outline-none transition-colors min-h-[100px]" 
                placeholder="Tell us about your coin..." 
              />
          </div>

          <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Image URL</label>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 outline-none transition-colors" 
                    placeholder="https://..." 
                    required
                />
                <button type="button" className="p-3 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700">
                    <Upload size={20} />
                </button>
              </div>
          </div>
          
          <div className="pt-4">
            <button 
                type="submit" 
                disabled={isLaunching || isConfirming}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLaunching || isConfirming ? (
                    <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Launching...</span>
                    </>
                ) : (
                    <>
                        <Rocket size={20} />
                        <span>Launch Coin (0.00 ETH)</span>
                    </>
                )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
                Cost: Gas fees only (Base Network)
            </p>
          </div>
      </form>
    </div>
  );
}
