# Solana NFT Minting (Devnet Practice Project)

A minimal, end-to-end Node.js example that shows how to:

1. Generate a Solana wallet
2. Fund it with devnet SOL (via airdrop)
3. Upload an image + metadata to IPFS using **Pinata**
4. Mint an NFT on the **Solana devnet** using the **Metaplex JS SDK**

This is a learning/practice project — everything runs on Solana's **devnet** (a free test network), so no real money is involved.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [1. Clone & Install](#1-clone--install)
- [2. Create a Pinata Account & API Keys](#2-create-a-pinata-account--api-keys)
- [3. Configure Environment Variables](#3-configure-environment-variables)
- [4. Full Workflow — Mint Your NFT](#4-full-workflow--mint-your-nft)
- [Understanding the Output](#understanding-the-output)
- [Publishing This Project to GitHub](#publishing-this-project-to-github)
- [Security Notes](#security-notes)
- [License](#license)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [@solana/web3.js](https://www.npmjs.com/package/@solana/web3.js) | Solana blockchain SDK (wallet, connection, transactions) |
| [@metaplex-foundation/js](https://www.npmjs.com/package/@metaplex-foundation/js) | Metaplex SDK — handles NFT minting logic on Solana |
| [Pinata](https://www.pinata.cloud/) | Pins files to IPFS (decentralized storage) for the NFT image + metadata |
| [axios](https://www.npmjs.com/package/axios) | HTTP client used to call the Pinata API |
| [dotenv](https://www.npmjs.com/package/dotenv) | Loads secrets from `.env` into `process.env` |

## Project Structure

```
solana-nft/
├── wallet.js            # Generates a new Solana wallet and saves it to wallet.json
├── airdrop.js           # Requests free devnet SOL for your wallet
├── upload-metadata.js   # Uploads nft-image.png + metadata JSON to IPFS via Pinata
├── mint-nft.js          # Mints the actual NFT on Solana devnet using Metaplex
├── nft-image.png        # Sample image used as the NFT artwork
├── wallet.json           # Your wallet's secret key (generated locally — NEVER commit this)
├── .env                  # Pinata API keys (generated locally — NEVER commit this)
├── package.json          # Project dependencies
└── .gitignore             # Excludes secrets/dependencies from git
```

> `test.js` is a leftover/legacy script that also generates a keypair (using CommonJS `require`). It isn't part of the main workflow — use `wallet.js` instead.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer installed
- A free [Pinata](https://www.pinata.cloud/) account
- Git (for pushing to GitHub)

## 1. Clone & Install

```bash
git clone https://github.com/vinaypoduri888/solona-nft.git
cd solona-nft
npm install
```

`npm install` reads `package.json` and downloads all dependencies (`@solana/web3.js`, `@metaplex-foundation/js`, `axios`, `bs58`, `dotenv`) into a local `node_modules/` folder.

## 2. Create a Pinata Account & API Keys

Pinata is used here to host your NFT's image and metadata JSON on IPFS (NFTs don't store images directly on-chain — they store a URL pointing to metadata, and that metadata points to the image).

1. Go to [https://app.pinata.cloud/register](https://app.pinata.cloud/register) and sign up for a free account.
2. Once logged in, go to **API Keys** (left sidebar) → **New Key**.
3. Give the key **Admin** permissions (or at minimum `pinFileToIPFS` and `pinJSONToIPFS`) and click **Create Key**.
4. Pinata will show you three values **once** — copy them immediately:
   - `API Key`
   - `API Secret`
   - `JWT`
5. Save these somewhere safe (a password manager) — Pinata will not show the secret again.

## 3. Configure Environment Variables

Create a file named `.env` in the project root (this file is git-ignored and stays on your machine only):

```env
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_api_secret_here
```

> ⚠️ If you already have an `.env` file with real keys in this folder, **do not commit it**. See [Security Notes](#security-notes) below — you should rotate those keys before going further, since they've been sitting in a plain-text file.

## 4. Full Workflow — Mint Your NFT

Run these scripts **in order**. Each one is a plain Node.js file — run with `node <filename>`.

### Step 1 — Create a wallet

```bash
node wallet.js
```

**What happens:** generates a new Solana keypair (`Keypair.generate()`), and writes the secret key array to `wallet.json`. It refuses to run again if `wallet.json` already exists, so you don't accidentally overwrite your wallet. It prints your **public key** (your wallet address) — this is safe to share.

### Step 2 — Fund the wallet with devnet SOL

```bash
node airdrop.js
```

**What happens:** connects to Solana's devnet RPC endpoint, checks your wallet's SOL balance, then requests a free airdrop of 2 SOL (devnet SOL has no real value — it's only for testing). It waits for the transaction to confirm, then prints the balance before and after. You need a small amount of SOL in your wallet to pay the network fee for minting the NFT later.

### Step 3 — Upload image + metadata to IPFS

```bash
node upload-metadata.js
```

**What happens:**
1. Uploads `nft-image.png` to Pinata → gets back an IPFS URL for the image.
2. Builds a metadata JSON object (name, symbol, description, image URL, attributes) following the [Metaplex NFT metadata standard](https://developers.metaplex.com/token-metadata/token-standard), and uploads that JSON to Pinata too.
3. Prints the **metadata URL** — copy this, you need it in the next step.

> To use your own artwork, replace `nft-image.png` with your own file (keep the same filename, or update the path in `upload-metadata.js`). You can also edit the `name`, `symbol`, `description`, and `attributes` fields inside `upload-metadata.js`.

### Step 4 — Mint the NFT

Open `mint-nft.js` and paste the metadata URL from Step 3 into the `uri` field:

```js
const { nft } = await metaplex.nfts().create({
  uri: "https://gateway.pinata.cloud/ipfs/YOUR_METADATA_HASH_HERE",
  name: "My First Solana NFT",
  symbol: "MFNFT",
  sellerFeeBasisPoints: 0,
  isMutable: true,
});
```

Then run:

```bash
node mint-nft.js
```

**What happens:** loads your wallet from `wallet.json`, connects to devnet, and uses the Metaplex SDK to build and send the on-chain transaction that mints a brand-new NFT pointing at your metadata URL. Metaplex handles creating the mint account, token account, and metadata account for you under the hood.

### Step 5 — View your NFT

Copy the Solana Explorer link printed at the end of Step 4 and open it in a browser (make sure the URL includes `?cluster=devnet`, since this NFT doesn't exist on mainnet).

---

## Understanding the Output

Example output after running `node mint-nft.js`:

```
🎉 NFT Minted Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NFT Name       : My First Solana NFT
Mint Address   : GCzbRNp2M2G7nDnN3bJtjj7Andys3XkHuCgeuStDv79R
Metadata URL   : https://gateway.pinata.cloud/ipfs/QmS2Bodzosw87EKh5yJiasgd496uY18wd7PvcVac2WrXM7
Owner          : WVAJ9prvbhdmWFbVUfYoWuBXSaDP47nK18Vd6xaS9nr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View on Solana Explorer:
https://explorer.solana.com/address/GCzbRNp2M2G7nDnN3bJtjj7Andys3XkHuCgeuStDv79R?cluster=devnet
```

| Field | Meaning |
|---|---|
| **NFT Name** | The human-readable name stored in the on-chain metadata |
| **Mint Address** | The unique on-chain address that identifies this specific NFT (its "token ID" equivalent on Solana). This is what you look up on any explorer or marketplace. |
| **Metadata URL** | The IPFS link (from Step 3) that the NFT's on-chain record points to, containing the image URL, description, and attributes |
| **Owner** | The wallet address that currently holds this NFT — your wallet's public key |
| **Explorer link** | Opens [Solana Explorer](https://explorer.solana.com/) filtered to devnet, showing the NFT's full on-chain transaction history, holders, and metadata |

---

## Publishing This Project to GitHub

Here's what each line in the standard GitHub setup does:

```bash
echo "# solona-nft" >> README.md
```
Creates (or appends to) `README.md` with a single heading line. `>>` appends — it won't overwrite an existing file. *(We've now replaced that placeholder with this full README.)*

```bash
git init
```
Initializes a new, empty Git repository in the current folder (creates a hidden `.git/` folder that tracks history).

```bash
git add README.md
```
Stages `README.md` — marks it to be included in the next commit. Only staged files get committed.

```bash
git commit -m "first commit"
```
Saves a permanent snapshot of the staged files into the repository's history, labeled with the message `"first commit"`.

```bash
git branch -M main
```
Renames the current branch to `main` (the modern default branch name, replacing the older `master` convention).

```bash
git remote add origin https://github.com/vinaypoduri888/solona-nft.git
```
Registers the GitHub repository URL as a remote named `origin` — this is where `git push`/`git pull` will send/receive data by default.

```bash
git push -u origin main
```
Uploads your local `main` branch to the `origin` remote (GitHub) for the first time. `-u` sets up tracking, so future pushes/pulls from this branch can just be `git push` / `git pull` without specifying the remote and branch again.

### Pushing the rest of the project

Now that `.gitignore` exists, you can safely stage everything else without leaking secrets:

```bash
git add .
git commit -m "Add Solana NFT minting scripts and README"
git push
```

`git add .` stages all files in the current folder **except** the ones excluded by `.gitignore` (`node_modules/`, `.env`, `wallet.json`). Run `git status` beforehand if you want to double check exactly what will be staged.

---

## Security Notes

- **Never commit `.env` or `wallet.json`.** `.env` holds your Pinata API secret; `wallet.json` holds your wallet's private key. Anyone with either can act as you (spend your Pinata quota, or — on mainnet — drain funds). Both are already excluded via `.gitignore` in this repo.
- **If a secret was ever saved to a file before `.gitignore` existed**, it's good practice to treat it as compromised: regenerate a new Pinata API key/secret from the Pinata dashboard and delete the old one, and generate a fresh wallet with `wallet.js` if you ever plan to use it beyond devnet.
- This project only ever touches **devnet**, so a leaked devnet wallet key has no real monetary value — but the habit of never committing secret keys matters just as much for when you eventually work with mainnet.

## License

This project is for educational purposes. Add a license of your choice (e.g. [MIT](https://choosealicense.com/licenses/mit/)) if you plan to share or accept contributions.
