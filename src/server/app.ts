import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Middleware to check API keys if needed, or just public for now as it's a mini app backend

// --- Pinata Endpoint ---
app.post('/upload_image', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    
    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, { filename: req.file.originalname });
        
        // Use Pinata API Key/Secret if available, or JWT
        const headers: any = {
            ...formData.getHeaders()
        };

        if (process.env.PINATA_JWT) {
            headers['Authorization'] = `Bearer ${process.env.PINATA_JWT}`;
        } else if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
            headers['pinata_api_key'] = process.env.PINATA_API_KEY;
            headers['pinata_secret_api_key'] = process.env.PINATA_API_SECRET;
        }

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers
        });
        
        res.json({ cid: response.data.IpfsHash, url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}` });
    } catch (error) {
        console.error('Pinata upload failed:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// --- RPC Proxy ---
app.post('/base-rpc', async (req, res) => {
    try {
        const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
        const response = await axios.post(rpcUrl, req.body, {
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        console.error('RPC Proxy failed:', error);
        res.status(500).json({ error: 'RPC failed' });
    }
});

// --- Bitquery Helper ---
const fetchBitquery = async (query: string) => {
    const response = await fetch('https://streaming.bitquery.io/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.BITQUERY_API_KEY || ''
        },
        body: JSON.stringify({ query })
    });
    return response.json();
};

// --- Zora Metadata Helper ---
const fetchZoraMetadata = async (address: string) => {
    try {
        const query = `
          query Token {
            token(token: {address: "${address}", tokenId: "1"}) {
              token {
                name
                symbol
                image { url }
                description
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
        return result.data?.token?.token || {};
    } catch (e) {
        return {};
    }
};

// --- Zora Endpoints (Bitquery Backed) ---

// GET /zora_explore_new
app.get('/zora_explore_new', async (req, res) => {
  try {
    const query = `
    {
      EVM(network: base) {
        Transfers(
          orderBy: { descending: Block_Time }
          limit: { count: 20 }
          where: {
            Call: { Create: true }
            Transfer: {
              Sender: { is: "0x0000000000000000000000000000000000000000" }
            }
            Transaction: {
              To: { is: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789" }
            }
          }
        ) {
          Transfer {
            Currency {
              Name
              Symbol
              SmartContract
            }
          }
          Transaction {
            From
            Hash
          }
        }
      }
    }
    `;

    const result = await fetchBitquery(query);
    const nodes = result.data?.EVM?.Transfers || [];
    
    // Enrich with metadata (images) in parallel
    const coins = await Promise.all(nodes.map(async (n: any) => {
        const addr = n.Transfer.Currency.SmartContract;
        const meta = await fetchZoraMetadata(addr);
        return {
            id: addr,
            name: n.Transfer.Currency.Name,
            symbol: n.Transfer.Currency.Symbol,
            address: addr,
            creator: n.Transaction.From,
            image: meta.image?.url || 'https://via.placeholder.com/200?text=Coin'
        };
    }));

    res.json({ coins });
  } catch (error) {
    console.error('Error in /zora_explore_new:', error);
    res.json({ coins: [] });
  }
});

// GET /zora_trending
app.get('/zora_trending', async (req, res) => {
    try {
        const query = `
        {
          EVM(network: base) {
            DEXTrades(
              limit: { count: 20 }
              orderBy: { descending: Block_Time }
              where: { Trade: { Dex: { ProtocolName: { is: "zora_v4" } } } }
            ) {
              Trade {
                Buy {
                  Currency {
                    Name
                    Symbol
                    SmartContract
                  }
                }
              }
            }
          }
        }
        `;
        const result = await fetchBitquery(query);
        const trades = result.data?.EVM?.DEXTrades || [];
        
        // Deduplicate and enrich
        const seen = new Set();
        const coins = [];
        
        for (const t of trades) {
            const addr = t.Trade.Buy.Currency.SmartContract;
            if (addr && !seen.has(addr)) {
                seen.add(addr);
                const meta = await fetchZoraMetadata(addr);
                coins.push({
                    id: addr,
                    name: t.Trade.Buy.Currency.Name,
                    symbol: t.Trade.Buy.Currency.Symbol,
                    address: addr,
                    image: meta.image?.url || 'https://via.placeholder.com/200?text=Trending'
                });
            }
        }
        
        res.json({ coins });
    } catch (error) {
        console.error('Trending error:', error);
        res.json({ coins: [] });
    }
});

// GET /get_user_activity
app.get('/get_user_activity', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: 'Address required' });

        const apiKey = process.env.ALCHEMY_API_KEY;
        if (!apiKey) return res.json({ activities: [] });

        const response = await fetch(`https://base-mainnet.g.alchemy.com/v2/${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "alchemy_getAssetTransfers",
                params: [
                    {
                        fromBlock: "0x0",
                        fromAddress: address,
                        category: ["external", "erc20"],
                        maxCount: "20"
                    }
                ]
            })
        });

        const data = await response.json();
        const transfers = data.result?.transfers || [];
        
        const activities = transfers.map((t: any) => ({
            type: 'Transfer',
            hash: t.hash,
            value: t.value,
            asset: t.asset,
            to: t.to
        }));

        res.json({ activities });
    } catch (error) {
        console.error("Activity fetch failed:", error);
        res.json({ activities: [] });
    }
});

// GET /zora_get_coin/:id
// Purpose: Get details of a specific coin
app.get('/zora_get_coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch from Zora API for metadata (Allowed for details as Bitquery lacks metadata)
    const meta = await fetchZoraMetadata(id);
    
    if (meta && meta.name) {
        return res.json({
            id: meta.collectionAddress || id,
            name: meta.name,
            symbol: meta.symbol,
            description: meta.description || 'No description available',
            creator: meta.owner || 'Unknown',
            image: meta.image?.url
        });
    }

    // If not found in Zora, try Bitquery to confirm existence on Base
    const query = `
    {
      EVM(network: base) {
        Transfers(
          limit: { count: 1 }
          where: { Transfer: { Currency: { SmartContract: { is: "${id}" } } } }
        ) {
          Transfer {
            Currency {
              Name
              Symbol
            }
          }
        }
      }
    }
    `;
    const result = await fetchBitquery(query);
    const token = result.data?.EVM?.Transfers?.[0]?.Transfer?.Currency;
    
    if (token) {
        return res.json({
            id,
            name: token.Name,
            symbol: token.Symbol,
            description: 'Discovered via Bitquery on Base.',
            creator: 'Unknown',
            image: null // Frontend handles placeholder
        });
    }

    res.status(404).json({ error: 'Coin not found' });
  } catch (error) {
    console.error(`Error in /zora_get_coin/${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /ai_generate
// Purpose: Generate coin ideas (Rule-based to ensure reliability without external LLM key)
app.post('/ai_generate', async (req, res) => {
    try {
        const prefixes = ['Super', 'Mega', 'Cyber', 'Based', 'Degen', 'Happy', 'Grumpy', 'Space', 'Crypto', 'Golden'];
        const suffixes = ['Cat', 'Dog', 'Pepe', 'Chad', 'Rocket', 'Moon', 'Gem', 'Ape', 'Lion', 'Star'];
        
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        // Use standard placeholders if no image generation API
        res.json({
            name: `${p} ${s}`,
            symbol: `${p[0]}${s.substring(0,3).toUpperCase()}`,
            description: `${p} ${s} is a community-driven token on Base. Launched via CoinFarcade.`,
            image: `https://via.placeholder.com/300?text=${p}+${s}` // Frontend should handle upload of real image
        });
    } catch (error) {
        res.status(500).json({ error: "AI Failed" });
    }
});

// GET /zora_get_profile
app.get('/zora_get_profile', async (req, res) => {
  try {
    const { address } = req.query; 
    // Fetch ETH balance via RPC
    const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1
        })
    });
    const data = await response.json();
    const balanceHex = data.result;
    const balanceEth = balanceHex ? (parseInt(balanceHex, 16) / 1e18).toFixed(4) : '0.0000';

    res.json({ 
      address: address || '0x...', 
      balance: `${balanceEth} ETH`, 
      coinsOwned: [] 
    });
  } catch (error) {
    console.error('Error in /zora_get_profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /zora_get_holdings
app.get('/zora_get_holdings', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: 'Address required' });

        // Bitquery TokenHolders
        const query = `
        {
          EVM(network: base) {
            TokenHolders(
              limit: { count: 20 }
              where: {
                Holder: { Address: { is: "${address}" } }
                Balance: { Amount: { gt: "0" } }
              }
            ) {
              Balance {
                Amount
              }
              Currency {
                Name
                Symbol
                SmartContract
                Decimals
              }
            }
          }
        }
        `;
        
        const result = await fetchBitquery(query);
        const holders = result.data?.EVM?.TokenHolders || [];
        
        const coins = await Promise.all(holders.map(async (h: any) => {
             const addr = h.Currency.SmartContract;
             const meta = await fetchZoraMetadata(addr);
             return {
                 id: addr,
                 name: h.Currency.Name,
                 symbol: h.Currency.Symbol,
                 balance: h.Balance.Amount,
                 image: meta.image?.url,
                 address: addr
             };
        }));
        
        res.json({ coins });
    } catch (error) {
        console.error('Holdings error:', error);
        res.json({ coins: [] });
    }
});

// GET /zora_get_created
app.get('/zora_get_created', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: 'Address required' });

        // Created via Zora Factory
        const query = `
        {
          EVM(network: base) {
            Transfers(
              limit: { count: 20 }
              orderBy: { descending: Block_Time }
              where: {
                Call: { Create: true }
                Transfer: { Sender: { is: "0x0000000000000000000000000000000000000000" } }
                Transaction: {
                    From: { is: "${address}" }
                    To: { is: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789" }
                }
              }
            ) {
              Transfer {
                Currency {
                  Name
                  Symbol
                  SmartContract
                }
              }
            }
          }
        }
        `;
        
        const result = await fetchBitquery(query);
        const transfers = result.data?.EVM?.Transfers || [];
        
        const coins = await Promise.all(transfers.map(async (t: any) => {
            const addr = t.Transfer.Currency.SmartContract;
            const meta = await fetchZoraMetadata(addr);
            return {
                id: addr,
                name: t.Transfer.Currency.Name,
                symbol: t.Transfer.Currency.Symbol,
                image: meta.image?.url,
                address: addr
            };
        }));
        
        res.json({ coins });
    } catch (error) {
        console.error('Created error:', error);
        res.json({ coins: [] });
    }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
