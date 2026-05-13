# Solana SPL Token Sample

This sample shows how to create your own Solana-based token using the Solana devnet.

## What this does
- creates a new SPL token mint for `DamoCoin`
- creates an associated token account for your wallet
- mints an initial supply into that account

## Prerequisites
- Node.js installed
- Solana CLI installed
- A wallet keypair generated with `solana-keygen new`

## Setup
1. Set your devnet endpoint:
   ```bash
   solana config set --url devnet
   ```
2. Verify your keypair path and fund it:
   ```bash
   solana config get
   solana airdrop 2
   ```
3. Install dependencies:
   ```bash
   cd "C:\damoCoin"
   npm install
   ```

## Run
```bash
node create-token.js path/to/your/keypair.json
```

If no path is passed, the script will use the default Solana CLI keypair path from `solana config get`.

## Metadata
This script now also creates on-chain Metaplex metadata for `DamoCoin` so wallets and explorers can identify it by name and symbol.

A sample metadata file is included at `damocoin.json`.

### Use a real metadata URI
1. Host `damocoin.json` on a public URL such as GitHub Raw, Netlify, Vercel, or IPFS.
2. If you publish the sample repo under your GitHub profile, the URL can look like this:
   ```bash
   node create-token.js path/to/your/keypair.json https://raw.githubusercontent.com/damo333/<repo>/main/solana-token-sample/damocoin.json
   ```

### Publish as `damocoin` on GitHub
If you create a repo named `damocoin` under `github.com/damo333`, use this exact URL:
```bash
node create-token.js path/to/your/keypair.json https://raw.githubusercontent.com/damo333/damocoin/main/solana-token-sample/damocoin.json
```
Replace `main` with your branch name if needed.

### Publish your repo to GitHub
1. Create a new repository named `damocoin` on GitHub under `damo333`.
2. From the `C:\damoCoin` folder, initialize git and push, or use the helper script:
   ```powershell
git init
git add .
git commit -m "Initial DamoCoin sample"
git branch -M main
git remote add origin https://github.com/damo333/damocoin.git
git push -u origin main
```
   Or run:
   ```powershell
cd C:\damoCoin
.\publish.ps1
```
3. After pushing, your metadata file will be accessible at:
   `https://raw.githubusercontent.com/damo333/damocoin/main/solana-token-sample/damocoin.json`

### Deploy with GitHub Pages
If you want a web-hosted version of `damocoin.json` or the sample files, you can use GitHub Pages:
1. In your GitHub repo settings, enable Pages for the `main` branch and `/ (root)` folder.
2. Push your repo.
3. Your site will be published at `https://damo333.github.io/damocoin/`.
4. Then your metadata URL can be:
   `https://damo333.github.io/damocoin/solana-token-sample/damocoin.json`

### Optional: automate with GitHub Actions
To keep `damocoin.json` live after each push, add a GitHub Actions workflow that builds and deploys the repo to Pages automatically. This is helpful if you later update metadata or assets.

If you do not pass a URI, the script uses the placeholder `https://example.com/damocoin.json`.

### Update the image
The sample metadata uses a placeholder image URL. Replace `image` and `properties.files[0].uri` in `damocoin.json` with your own hosted asset for best results.

### DamoCoin logo
A sample logo is included at `damocoin-logo.svg`. You can host that file on IPFS or any static host and then update `damocoin.json` to point at that URL.

### Host on IPFS
1. Install an IPFS CLI or use a service like Web3.Storage or nft.storage.
2. Upload `damocoin.json` and `damocoin-logo.svg`.
3. Use the resulting IPFS gateway URLs in `create-token.js` and `damocoin.json`.

Example command with `ipfs` CLI:
```bash
ipfs add damocoin-logo.svg
ipfs add damocoin.json
```
Then update `damocoin.json`'s `image` and `properties.files[0].uri` to the gateway URL:
`https://ipfs.io/ipfs/<CID>`

## DamoCoin launch flow
Follow these steps to launch DamoCoin cleanly:

1. Verify your environment:
   - `node -v`
   - `npm -v`
   - `solana --version`
   - `solana config get`

2. Install dependencies:
   ```bash
   npm install
   ```

3. Fund your devnet wallet if needed:
   ```bash
   solana config set --url devnet
   solana airdrop 2
   ```

4. Create the mint and token:
   ```bash
   node create-token.js path/to/your/keypair.json
   ```

5. Host real metadata:
   - publish `damocoin.json` using GitHub Pages, GitHub Raw, or IPFS
   - host `damocoin-logo.svg` as the image asset

6. Re-run the script with the hosted metadata URI:
   ```bash
   node create-token.js path/to/your/keypair.json <METADATA_URL>
   ```

7. Publish the repo to GitHub:
   - push the `solana-token-sample` folder to `https://github.com/damo333/damocoin`
   - enable GitHub Pages if you want a website-hosted JSON URL

8. Confirm the mint and metadata:
   - check the mint address in Solana explorers
   - verify the metadata URI resolves
   - inspect the token in wallets that support SPL metadata

## What’s ready now
- `create-token.js` creates `DamoCoin` and mints a devnet supply
- `damocoin.json` includes sample metadata
- `damocoin-logo.svg` is available for branding
- GitHub Actions workflow deploys the sample to Pages automatically

## Contributing
Contributions are welcome! See `CONTRIBUTING.md` for contribution guidelines.

Issue templates are also included for bug reports and feature requests.
