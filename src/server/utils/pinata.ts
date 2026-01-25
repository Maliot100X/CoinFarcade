import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export async function uploadToPinata(fileBuffer: Buffer, fileName: string = 'image.png'): Promise<string | null> {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: fileName });

        const headers = {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.PINATA_JWT}`
        };

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers
        });

        if (response.data && response.data.IpfsHash) {
            return response.data.IpfsHash;
        }
        
        return null;
    } catch (error) {
        console.error('Pinata upload failed:', error);
        return null;
    }
}
