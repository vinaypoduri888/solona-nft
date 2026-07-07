const { Keypair } = require("@solana/web3.js");
const fs = require("fs");
const bs58 = require("bs58").default;

// Generate a brand new keypair (your wallet)
const wallet = Keypair.generate();
const encoded = bs58.encode(wallet.secretKey);
console.log("Wallet created!");
console.log(wallet);
console.log("Public Key (your address):", wallet.publicKey.toBase58());
console.log("Private Key (keep this safe!):", encoded);