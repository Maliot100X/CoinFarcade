import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const apiUrl = 'https://api.zora.co/graphql';
    const query = `{
      tokens(first: 5, sort: {key: CREATED, direction: DESC}, where: {chain: BASE_MAINNET}) {
        nodes {
          address
          name
          symbol
          image {
            url
          }
          owner
        }
      }
    }`;
    
    // Note: The user's query syntax was slightly off for Zora API ("sortBy:CREATED_AT_DESC" vs "sort: {key: CREATED...}").
    // I am using a standard Zora GraphQL query structure, but will fallback to the user's structure if they insist.
    // However, the user provided:
    // tokens(first:5, sortBy:CREATED_AT_DESC){ nodes { address name symbol imageURI owner { id } } }
    // Let's try to stick close to their intent but correct the syntax if needed. 
    // Actually, "sortBy: CREATED_AT_DESC" is common in some subgraphs. 
    // I'll stick to the user's EXACT query string first to respect "Copy Paste", 
    // but wrapping it in a try-catch to debug if it fails.
    
    const userQuery = `{ 
       tokens(first:5, sort: {sortKey: CREATED, sortDirection: DESC}){ 
         nodes { token { tokenContract { address name symbol image { url } } owner } } 
       } 
     }`;
     
    // WAIT, the user provided:
    // tokens(first:5, sortBy:CREATED_AT_DESC){ nodes { address name symbol imageURI owner { id } } }
    // This looks like a specific subgraph query.
    // I will use the user's query EXACTLY as provided in the prompt.
    
    const promptQuery = `{ 
       tokens(first:5, sortBy:CREATED_AT_DESC){ 
         nodes { address name symbol imageURI owner { id } } 
       } 
     }`;

    const response = await axios.post(apiUrl, { query: promptQuery }, {
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.errors) {
        console.error("Zora GraphQL Errors:", response.data.errors);
        throw new Error("Zora API Error");
    }

    res.json(response.data.data.tokens.nodes);
  } catch (err: any) {
    console.error('Zora Trending Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
