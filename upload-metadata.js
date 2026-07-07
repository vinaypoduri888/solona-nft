import https from "https";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // fix for Windows SSL issue

import axios from "axios";
import { createReadStream } from "fs";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET_KEY;

// ─── STEP 1: Upload IMAGE ────────────────────────────────────────────────────
async function uploadImage() {
  console.log("Uploading image to IPFS...");

  const formData = new FormData();
  formData.append("file", createReadStream("nft-image.png"));

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ← also add here
    }
  );

  const imageUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  console.log("Image uploaded! URL:", imageUrl);
  return imageUrl;
}

// ─── STEP 2: Upload METADATA JSON ───────────────────────────────────────────
async function uploadMetadata(imageUrl) {
  console.log("Uploading metadata to IPFS...");

  const metadata = {
    name: "My First Solana NFT",
    symbol: "MFNFT",
    description: "This is my very first NFT minted on Solana devnet!",
    image: imageUrl,
    attributes: [
      { trait_type: "Background", value: "Blue" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Practice", value: "Yes" },
    ],
    properties: {
      files: [{ uri: imageUrl, type: "image/png" }],
    },
  };

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }), // ← also add here
    }
  );

  const metadataUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  console.log("Metadata uploaded! URL:", metadataUrl);
  return metadataUrl;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const imageUrl = await uploadImage();
  const metadataUrl = await uploadMetadata(imageUrl);

  console.log("\n✅ All uploaded! Save this metadata URL:");
  console.log("METADATA URL:", metadataUrl);
  console.log("\nYou will need this URL in the next step to mint the NFT.");
}

main();