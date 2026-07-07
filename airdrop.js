import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { readFileSync } from "fs";

async function main() {
  // 1. Load wallet
  const secretKey = JSON.parse(readFileSync("wallet.json", "utf-8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  console.log("Wallet loaded:", wallet.publicKey.toBase58());

  // 2. Connect to Devnet RPC
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  console.log("Connected to Devnet RPC!");

  // 3. Balance before
  const balanceBefore = await connection.getBalance(wallet.publicKey);
  console.log("Balance before:", balanceBefore / LAMPORTS_PER_SOL, "SOL");

  // 4. Airdrop 2 SOL
  console.log("Requesting airdrop...");
  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );

  // 5. Confirm it landed
  await connection.confirmTransaction(airdropSignature);
  console.log("Airdrop confirmed! Signature:", airdropSignature);

  // 6. Balance after
  const balanceAfter = await connection.getBalance(wallet.publicKey);
  console.log("Balance after:", balanceAfter / LAMPORTS_PER_SOL, "SOL");
}

main();