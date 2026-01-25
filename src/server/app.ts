import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

// Middleware to check API keys if needed, or just public for now as it's a mini app backend

// --- Zora Endpoints ---

// GET /zora_explore_new
// Purpose: List new coins. 
// Implementation: Likely querying Zora API or our DB if we index them.
app.get('/zora_explore_new', async (req, res) => {
  try {
    // TODO: Integrate actual Zora API or DB query
    // For now, return a placeholder list
    const mockCoins = [
      { id: '1', name: 'Zora Cat', symbol: 'ZCAT', image: 'https://placekitten.com/200/200' },
      { id: '2', name: 'Base Doge', symbol: 'BDOGE', image: 'https://placedog.net/200/200' },
      { id: '3', name: 'Farcaster Punk', symbol: 'FPUNK', image: 'https://via.placeholder.com/200/0000FF/808080?text=Punk' },
      { id: '4', name: 'Meme King', symbol: 'KING', image: 'https://via.placeholder.com/200/FF0000/FFFFFF?text=King' },
      { id: '5', name: 'Crypto Ninja', symbol: 'NINJA', image: 'https://via.placeholder.com/200/000000/FFFFFF?text=Ninja' }
    ];
    res.json({ coins: mockCoins });
  } catch (error) {
    console.error('Error in /zora_explore_new:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /zora_get_coin/:id
// Purpose: Get details of a specific coin
app.get('/zora_get_coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Fetch coin details from Zora/DB
    res.json({ 
      id, 
      name: `Coin ${id}`, 
      symbol: `C${id}`, 
      description: 'This is a cool coin.', 
      creator: '0x123...' 
    });
  } catch (error) {
    console.error(`Error in /zora_get_coin/${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /zora_get_profile
// Purpose: Get user profile/wallet info
app.get('/zora_get_profile', async (req, res) => {
  try {
    // In a real app, we might get the user ID from auth headers or query param
    const { address } = req.query; 
    res.json({ 
      address: address || '0x...', 
      balance: '100 ETH', 
      coinsOwned: [] 
    });
  } catch (error) {
    console.error('Error in /zora_get_profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Base JSON-RPC Proxy ---
app.post('/base-rpc', async (req, res) => {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    return res.status(500).json({ error: "BASE_RPC_URL not configured" });
  }
  
  try {
    // Forward the JSON-RPC request to Base
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
        throw new Error(`RPC responded with ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('RPC Proxy Error:', error);
    res.status(500).json({ error: "RPC Call Failed" });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
