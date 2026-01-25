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
// Implementation: Fetch from Zora API
app.get('/zora_explore_new', async (req, res) => {
  try {
    const query = `
      query NewTokens {
        tokens(
          sort: {sortKey: CREATED, sortDirection: DESC}
          pagination: {limit: 20}
          networks: [{network: BASE, chain: BASE_MAINNET}]
        ) {
          nodes {
            token {
              tokenId
              name
              symbol
              image {
                url
              }
              collectionAddress
              owner
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.zora.co/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.ZORA_API_KEY || ''
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    
    if (result.data && result.data.tokens && result.data.tokens.nodes) {
      const coins = result.data.tokens.nodes.map((node: any) => ({
        id: node.token.tokenId,
        name: node.token.name || 'Unknown Coin',
        symbol: node.token.symbol || 'COIN',
        image: node.token.image?.url || 'https://via.placeholder.com/200',
        address: node.token.collectionAddress
      }));
      return res.json({ coins });
    }

    // Fallback to mock data if API returns empty or fails structure check
    throw new Error('Invalid API response');
  } catch (error) {
    console.error('Error in /zora_explore_new, falling back to mock:', error);
    const mockCoins = [
      { id: '1', name: 'Zora Cat', symbol: 'ZCAT', image: 'https://placekitten.com/200/200' },
      { id: '2', name: 'Base Doge', symbol: 'BDOGE', image: 'https://placedog.net/200/200' },
      { id: '3', name: 'Farcaster Punk', symbol: 'FPUNK', image: 'https://via.placeholder.com/200/0000FF/808080?text=Punk' },
      { id: '4', name: 'Meme King', symbol: 'KING', image: 'https://via.placeholder.com/200/FF0000/FFFFFF?text=King' },
      { id: '5', name: 'Crypto Ninja', symbol: 'NINJA', image: 'https://via.placeholder.com/200/000000/FFFFFF?text=Ninja' }
    ];
    res.json({ coins: mockCoins });
  }
});

// GET /zora_get_coin/:id
// Purpose: Get details of a specific coin
app.get('/zora_get_coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Query specific token from Zora
    const query = `
      query Token {
        token(token: {address: "${id}", tokenId: "1"}) {
          token {
            tokenId
            name
            symbol
            image { url }
            collectionAddress
            owner
            description
          }
        }
      }
    `;
    
    // If it's a real address, try fetching
    if (id.startsWith('0x')) {
         const response = await fetch('https://api.zora.co/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.ZORA_API_KEY || ''
          },
          body: JSON.stringify({ query })
        });
        const result = await response.json();
        if (result.data?.token?.token) {
            const t = result.data.token.token;
            return res.json({
                id: t.collectionAddress,
                name: t.name,
                symbol: t.symbol,
                description: t.description || 'No description',
                creator: t.owner,
                image: t.image?.url
            });
        }
    }

    // Fallback/Mock
    res.json({ 
      id, 
      name: `Coin ${id.substring(0,6)}...`, 
      symbol: `C${id.substring(0,3)}`, 
      description: 'This is a cool coin on Base.', 
      creator: '0xccd...ref' 
    });
  } catch (error) {
    console.error(`Error in /zora_get_coin/${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /ai_generate
// Purpose: Generate coin ideas
app.post('/ai_generate', async (req, res) => {
    try {
        // Mock AI generation (randomized)
        const adjectives = ['Super', 'Mega', 'Cyber', 'Based', 'Degen', 'Happy', 'Grumpy'];
        const nouns = ['Cat', 'Dog', 'Pepe', 'Chad', 'Rocket', 'Moon', 'Gem'];
        
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        
        res.json({
            name: `${randomAdj} ${randomNoun}`,
            symbol: `${randomAdj[0]}${randomNoun.substring(0,3).toUpperCase()}`,
            description: `${randomAdj} ${randomNoun} is the next big thing on Base. Launched via CoinFarcade.`,
            image: `https://via.placeholder.com/300?text=${randomAdj}+${randomNoun}`
        });
    } catch (error) {
        res.status(500).json({ error: "AI Failed" });
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
