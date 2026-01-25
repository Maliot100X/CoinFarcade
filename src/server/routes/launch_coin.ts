import express from 'express';
import multer from 'multer';
import { uploadToPinata } from '../utils/pinata.js';
import { createZoraCoin } from '../utils/zoraFactory.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/launch_coin', upload.single('file'), async (req, res) => {
    try {
        const { name, symbol, decimals, supply, farcasterProfile } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        if (!name || !symbol) {
            return res.status(400).json({ error: "Name and Symbol are required" });
        }

        // 1. Upload to Pinata
        const imageCid = await uploadToPinata(file.buffer, file.originalname);
        if (!imageCid) {
            return res.status(500).json({ error: "Failed to upload image to Pinata" });
        }
        const imageURI = `ipfs://${imageCid}`;

        // 2. Prepare Metadata
        let profileData = { displayName: 'Unknown', username: 'unknown' };
        try {
            if (farcasterProfile) {
                profileData = JSON.parse(farcasterProfile);
            }
        } catch (e) {
            // ignore parse error
        }

        const description = `Created by ${profileData.displayName} (@${profileData.username}) on CoinFarcade. Supply: ${supply}.`;

        // 3. Create Zora Coin
        // Note: decimals and supply might be fixed by Zora Factory, but we pass them if logic allows customization in future
        const { address, txHash } = await createZoraCoin({
            name,
            symbol,
            decimals: Number(decimals) || 18,
            supply: Number(supply) || 1000000,
            imageURI
        });

        // 4. Return Success
        res.json({
            success: true,
            coinAddress: address,
            txHash: txHash
        });

    } catch (error) {
        console.error("Launch Coin Route Error:", error);
        res.status(500).json({ error: (error as Error).message || "Internal Server Error" });
    }
});

export default router;
