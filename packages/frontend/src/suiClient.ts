import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = getFullnodeUrl('mainnet');

// create a client connected to devnet
export const suiClient = new SuiClient({ url: rpcUrl });
