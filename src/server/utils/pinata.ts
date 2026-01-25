import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export async function uploadToPinata(fileBuffer: Buffer, fileName: string) {
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: fileName });

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: Infinity,
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders(),
      },
    });
    return res.data.IpfsHash;
  } catch (err) {
    console.error('Pinata upload error', err);
    return null;
  }
}
