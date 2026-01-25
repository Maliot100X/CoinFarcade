import express from 'express';
import { uploadToPinata } from '../utils/pinata';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { file, fileName } = req.body;
    
    if (!file) {
        throw new Error('No file provided');
    }

    // Convert array back to buffer
    const buffer = Buffer.from(file);
    const cid = await uploadToPinata(buffer, fileName);
    
    if (!cid) throw new Error('Pinata upload failed');
    
    res.json({ cid });
  } catch (err: any) {
    console.error('Pinata route error', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
