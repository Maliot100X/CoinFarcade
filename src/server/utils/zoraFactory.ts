import { createCoin } from '@zoralabs/coins-sdk';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export async function createZoraCoin(metadata: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
    imageURI: string;
}): Promise<{ address: string; txHash: string }> {
    try {
        // NOTE: A private key is required for backend signing. 
        // Ensure DEPLOYER_PRIVATE_KEY is set in .env.local
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
        if (!privateKey) {
            throw new Error("DEPLOYER_PRIVATE_KEY not configured on server.");
        }

        const account = privateKeyToAccount(privateKey);

        const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
        }).extend(publicActions);

        // Prepare coin arguments
        const coinArgs = {
            creator: account.address,
            name: metadata.name,
            symbol: metadata.symbol,
            metadata: { type: "RAW_URI" as const, uri: metadata.imageURI },
            currency: "ETH" as const, // Zora coins usually use ETH or ERC20
            chainId: base.id,
            payoutRecipientOverride: account.address,
            // supply is handled by the contract defaults or minting, 
            // Zora Coins SDK creates a standard ERC20. 
            // If supply logic is needed, we might need to mint after creation if the contract supports it.
            // For now, we follow the standard createCoin flow.
        };

        console.log("Creating Zora Coin with args:", coinArgs);

        const { error, parameters, contractAddress } = await createCoin({
            call: coinArgs,
            walletClient,
            publicClient: walletClient, // publicActions extended
        });

        if (error) {
            throw new Error(`Zora SDK Error: ${error}`);
        }

        // Execute transaction
        const hash = await walletClient.writeContract(parameters.request);
        
        // Wait for receipt
        await walletClient.waitForTransactionReceipt({ hash });

        return {
            address: contractAddress || '0x...', // SDK might predict address
            txHash: hash
        };

    } catch (error) {
        console.error("Zora Factory Failed:", error);
        throw error;
    }
}
