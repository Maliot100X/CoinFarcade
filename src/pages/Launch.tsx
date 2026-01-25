import { useState } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { Rocket, Upload, Sparkles } from 'lucide-react';
import { createCoin } from '@zoralabs/coins-sdk';
import { base } from 'viem/chains';

export function Launch() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);

    try {
        if (!imageFile) throw new Error("Image required");
        if (!walletClient) throw new Error("Wallet not connected");
        if (!address) throw new Error("No address");

        // 1. Upload Image to Pinata
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadRes = await fetch('/upload_image', {
            method: 'POST',
            body: formData
        });
        
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const { cid: imageCid } = await uploadRes.json();
        const imageIpfsUrl = `ipfs://${imageCid}`;

        // 2. Upload Metadata to Pinata
        const metadata = {
            name: name,
            symbol: symbol,
            description: description,
            image: imageIpfsUrl
        };
        
        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], 'metadata.json');
        
        const metaFormData = new FormData();
        metaFormData.append('file', metadataFile);
        
        const metaRes = await fetch('/upload_image', {
            method: 'POST',
            body: metaFormData
        });
        
        if (!metaRes.ok) throw new Error("Metadata upload failed");
        const { cid: metaCid } = await metaRes.json();
        const metaIpfsUrl = `ipfs://${metaCid}`;

        // 3. Create Coin using Zora SDK
        // This ensures we use the REAL Zora contracts and factory logic
        const coinArgs = {
            creator: address,
            name: name,
            symbol: symbol,
            metadata: { type: "RAW_URI" as const, uri: metaIpfsUrl },
            currency: "ETH" as const,
            chainId: base.id,
            payoutRecipientOverride: address,
        };
        
        console.log("Launching with args:", coinArgs);

        const result = await createCoin({
            call: coinArgs,
            walletClient: walletClient,
            publicClient: publicClient as any,
        });

        console.log("Launch result:", result);

        alert("Coin Launched successfully on Base! Tx: " + result.hash);
        setIsLaunching(false);
        // Reset form
        setName('');
        setSymbol('');
        setImageFile(null);
        setImagePreview('');
        setDescription('');

    } catch (err) {
        console.error("Launch failed", err);
        alert("Launch failed: " + (err as Error).message);
        setIsLaunching(false);
    }
  };

  const generateWithAI = async () => {
      try {
          // Call our MCP AI endpoint
          const response = await fetch('/ai_generate', { method: 'POST' });
          if (!response.ok) throw new Error("AI failed");
          
          const data = await response.json();
          setName(data.name);
          setSymbol(data.symbol);
          setDescription(data.description);
          // For AI image, we might still use the URL but we need to fetch and convert to file if we want to upload to Pinata?
          // Or we just set the preview and let user upload a real one?
          // The prompt says: "User uploads REAL image file... NO IMAGE URL INPUTS... NO AI-ONLY IMAGES WITHOUT IPFS STORAGE."
          // So if AI generates an image URL, we should probably fetch it server side and pin it, or ask user to download/upload.
          // For simplicity/compliance, we'll just set text fields.
          // setImagePreview(data.image); // Optional: show AI suggestion
      } catch (err) {
          console.error("AI Generation error:", err);
          setName("Galactic Kitty");
          setSymbol("GKIT");
          setDescription("A kitty that travels through the galaxy.");
      }
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
              <label className="block text-sm font-medium mb-1 text-gray-300">Image File (Required)</label>
              <div className="flex flex-col gap-2">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 outline-none transition-colors" 
                    required
                />
                {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                )}
              </div>
          </div>
          
          <div className="pt-4">
            <button 
                type="submit" 
                disabled={isLaunching}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLaunching ? (
                    <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading & Launching...</span>
                    </>
                ) : (
                    <>
                        <Rocket size={20} />
                        <span>Launch Coin</span>
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
