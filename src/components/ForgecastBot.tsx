import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sdk from '@farcaster/miniapp-sdk';
import { useAccount, useWalletClient } from 'wagmi';
import { createCoin } from '@zoralabs/coins-sdk';
import { publicActions } from 'viem';
import { X } from 'lucide-react';

interface ForgecastBotProps {
    onClose?: () => void;
}

export default function ForgecastBot({ onClose }: ForgecastBotProps) {
  const [profile, setProfile] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Fetch Farcaster profile
  useEffect(() => {
    const init = async () => {
      try {
        const context = await sdk.context;
        if (context?.user) {
          setProfile(context.user);
        }
      } catch (e) {
        console.warn("Farcaster SDK init failed:", e);
      }
    };
    init();
  }, []);

  const handleLaunch = async () => {
    if (!walletClient) return alert('Wallet not connected');
    if (!imageFile) return alert('Select an image');

    setLoading(true);
    try {
      // 1. Upload to Pinata
      const buffer = await imageFile.arrayBuffer();
      const res = await fetch('/api/upload_pinata', {
        method: 'POST',
        body: JSON.stringify({ file: Array.from(new Uint8Array(buffer)), fileName: imageFile.name }),
        headers: { 'Content-Type': 'application/json' },
      });
      const { cid } = await res.json();
      if (!cid) throw new Error('Pinata upload failed');

      // 2. Deploy Zora ERC20 from user wallet
      const client = walletClient.extend(publicActions);
      
      const coinArgs = {
        creator: address!,
        name: profile?.displayName || "My Coin",
        symbol: (profile?.username || "COIN").slice(0, 6).toUpperCase(),
        metadata: { type: 'RAW_URI' as const, uri: `ipfs://${cid}` },
        currency: 'ETH' as const, 
        payoutRecipientOverride: address!,
      };

      // When walletClient is provided, createCoin sends the tx and returns hash/receipt
      const { hash, address: coinAddress } = await createCoin({
        call: coinArgs,
        walletClient: client,
        publicClient: client,
      });

      if (!hash) throw new Error('Failed to deploy coin');

      // Wait for receipt just in case, though SDK might have done it
      await client.waitForTransactionReceipt({ hash });

      alert(`Coin launched! Address: ${coinAddress} | TxHash: ${hash}`);
    } catch (err: any) {
      console.error(err);
      alert('Launch failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgecast-bot h-full flex flex-col p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-800 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Forgecast Builder</h3>
        {onClose && (
            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                <X size={20} className="text-gray-400" />
            </button>
        )}
      </div>
      
      <div className="bot-nav grid grid-cols-2 gap-3 mb-8">
        <button className="p-3 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-600/40 transition font-medium" onClick={() => navigate('/create-profile-coin')}>Create Coin</button>
        <button className="p-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-750 transition font-medium" onClick={() => navigate('/recent-coins')}>Recent Coins</button>
        <button className="p-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-750 transition font-medium" onClick={() => navigate('/my-holdings')}>My Holdings</button>
        <button className="p-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-750 transition font-medium" onClick={() => navigate('/tour-app')}>Tour App</button>
      </div>

      <div className="launch-section border-t border-gray-800 pt-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-200">Launch New Coin</h4>
        
        <div className="mb-6 group">
            <label className="block text-sm text-gray-400 mb-2 group-hover:text-purple-400 transition-colors">Coin Image</label>
            <div className="relative">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-600 file:text-white
                      hover:file:bg-purple-700
                      cursor-pointer bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 transition-all"
                />
            </div>
        </div>

        <button 
            onClick={handleLaunch} 
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                loading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:shadow-purple-500/25 text-white'
            }`}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Launching...
                </span>
            ) : 'Launch Coin'}
        </button>
      </div>
    </div>
  );
}
