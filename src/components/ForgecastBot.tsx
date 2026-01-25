import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sdk, { type Context } from '@farcaster/miniapp-sdk';
import { Rocket, Clock, Wallet, Map, Upload, ArrowLeft } from 'lucide-react';

export default function ForgecastBot({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate();
    const [view, setView] = useState<'menu' | 'launch'>('menu');
    const [profile, setProfile] = useState<{ displayName: string; username: string } | null>(null);
    
    // Launch Form State
    const [launchName, setLaunchName] = useState('');
    const [launchSymbol, setLaunchSymbol] = useState('');
    const [launchFile, setLaunchFile] = useState<File | null>(null);
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await sdk.actions.ready();
                const context = await sdk.context;
                if (context && context.user) {
                    setProfile({
                        displayName: context.user.displayName || 'Anon',
                        username: context.user.username || 'anon'
                    });
                    // Auto-fill suggestion
                    if (!launchName) setLaunchName(`${context.user.displayName}'s Coin`);
                    if (!launchSymbol) setLaunchSymbol(context.user.username?.slice(0, 4).toUpperCase() || 'COIN');
                }
            } catch (err) {
                console.error("Farcaster SDK Error:", err);
            }
        };
        init();
    }, []);

    const handleLaunch = async () => {
        if (!launchFile || !launchName || !launchSymbol) {
            alert("Please fill all fields and upload an image.");
            return;
        }

        setIsLaunching(true);
        try {
            const formData = new FormData();
            formData.append('file', launchFile);
            formData.append('name', launchName);
            formData.append('symbol', launchSymbol);
            formData.append('decimals', '18');
            formData.append('supply', '1000000');
            if (profile) {
                formData.append('farcasterProfile', JSON.stringify(profile));
            }

            const res = await fetch('/api/launch_coin', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                alert(`Coin Launched!\nAddress: ${data.coinAddress}\nTx: ${data.txHash}`);
                setView('menu');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`Launch failed: ${(error as Error).message}`);
        } finally {
            setIsLaunching(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLaunchFile(e.target.files[0]);
        }
    };

    // Render Menu
    if (view === 'menu') {
        return (
            <div className="flex flex-col h-full bg-gray-900 text-white p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🤖</span> Forgecast Bot
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl mb-6">
                    <p className="text-gray-300">
                        Hello {profile?.displayName || 'Builder'}! I can help you manage your coins and navigate the app.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={() => setView('launch')}
                        className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center gap-4 font-bold hover:opacity-90 transition"
                    >
                        <Rocket size={24} />
                        <div className="text-left">
                            <div>Create Coin</div>
                            <div className="text-xs text-purple-200">Launch on Zora/Base</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/')}
                        className="p-4 bg-gray-800 rounded-xl flex items-center gap-4 font-bold hover:bg-gray-700 transition"
                    >
                        <Clock size={24} className="text-blue-400" />
                        <div className="text-left">
                            <div>Recent Coins</div>
                            <div className="text-xs text-gray-400">View new launches</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/profile')}
                        className="p-4 bg-gray-800 rounded-xl flex items-center gap-4 font-bold hover:bg-gray-700 transition"
                    >
                        <Wallet size={24} className="text-green-400" />
                        <div className="text-left">
                            <div>My Holdings</div>
                            <div className="text-xs text-gray-400">Check your portfolio</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => {
                            // Simple tour logic: navigate sequentially or just go to Home for now
                            navigate('/');
                            alert("Tour started! Check out the Home tab.");
                        }}
                        className="p-4 bg-gray-800 rounded-xl flex items-center gap-4 font-bold hover:bg-gray-700 transition"
                    >
                        <Map size={24} className="text-yellow-400" />
                        <div className="text-left">
                            <div>Tour App</div>
                            <div className="text-xs text-gray-400">Guided walkthrough</div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // Render Launch View
    if (view === 'launch') {
        return (
            <div className="flex flex-col h-full bg-gray-900 text-white p-4 overflow-y-auto">
                 <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('menu')} className="p-2 bg-gray-800 rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold">Launch Coin</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-400">Coin Name</label>
                        <input 
                            type="text" 
                            value={launchName}
                            onChange={(e) => setLaunchName(e.target.value)}
                            className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-purple-500 outline-none"
                            placeholder="e.g. Based Cat"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-400">Symbol</label>
                        <input 
                            type="text" 
                            value={launchSymbol}
                            onChange={(e) => setLaunchSymbol(e.target.value)}
                            className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-purple-500 outline-none"
                            placeholder="e.g. BCAT"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-400">Image</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                            />
                            <div className="absolute right-3 top-3 pointer-events-none">
                                <Upload size={20} className="text-gray-500" />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleLaunch}
                        disabled={isLaunching}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isLaunching ? 'Launching...' : 'Launch via Bot 🚀'}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Powered by Zora Factory & Pinata
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
