import https from "https";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { readFileSync } from "fs";

async function main() {
  // ─── 1. Load your wallet ──────────────────────────────────────────────────
  const secretKey = JSON.parse(readFileSync("wallet.json", "utf-8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  console.log("Wallet loaded:", wallet.publicKey.toBase58());

  // ─── 2. Connect to Devnet RPC ─────────────────────────────────────────────
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("Connected to Devnet!");

  // ─── 3. Setup Metaplex ───────────────────────────────────────────────────
  // Metaplex is a helper layer on top of Solana
  // it handles all the complicated transaction building for us
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet)); // tell Metaplex to sign with our wallet

  // ─── 4. Mint the NFT ─────────────────────────────────────────────────────
  console.log("Minting NFT... please wait...");

  const { nft } = await metaplex.nfts().create({
    uri: "https://gateway.pinata.cloud/ipfs/QmS2Bodzosw87EKh5yJiasgd496uY18wd7PvcVac2WrXM7", // ← your metadata URL from step 3
    name: "My First Solana NFT",
    symbol: "MFNFT",
    sellerFeeBasisPoints: 0, // 0% royalty (basis points: 100 = 1%, 0 = 0%)
    isMutable: true,         // can update metadata later if needed
  });

  // ─── 5. Print results ─────────────────────────────────────────────────────
  console.log("\n🎉 NFT Minted Successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("NFT Name       :", nft.name);
  console.log("Mint Address   :", nft.address.toBase58());  // unique NFT address on-chain
  console.log("Metadata URL   :", nft.uri);
  console.log("Owner          :", wallet.publicKey.toBase58()); // your wallet owns it
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nView on Solana Explorer:");
  console.log(`https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);
}

main();