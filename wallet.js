import { Keypair } from "@solana/web3.js";
import { writeFileSync, existsSync } from "fs";

// GUARD — stops you from overwriting an existing wallet
if (existsSync("wallet.json")) {
  console.log("Wallet already exists! Not overwriting.");
  console.log("Delete wallet.json manually if you really want a new one.");
  process.exit(1);
}

const wallet = Keypair.generate();

writeFileSync("wallet.json", JSON.stringify(Array.from(wallet.secretKey)));

console.log("Wallet created!");
console.log("Public Key (your address):", wallet.publicKey.toBase58());