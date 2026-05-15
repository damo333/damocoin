# DamoCoin (DAMO)

A custom Solana SPL token deployed on Solana Mainnet, with on-chain Metaplex metadata.

## Token details

| Field | Value |
|---|---|
| Name | DamoCoin |
| Symbol | DAMO |
| Mint address | `CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx` |
| Decimals | 9 |
| Total supply | 1,000,000,000 DAMO |
| Network | Solana Mainnet |
| Website | https://damo333.github.io/damocoin/ |

## Prerequisites

- Node.js installed
- Solana CLI installed (`solana-keygen new` to generate a keypair)
- A funded mainnet wallet (needs SOL for transaction fees)

## Setup

```bash
npm install
```

## Scripts

### Create a new token (create-token.js)

Creates a new SPL mint, sets on-chain Metaplex metadata, and mints the initial supply.

```bash
# Use default keypair (~/.config/solana/id.json) and default metadata URI
node create-token.js

# Custom keypair
node create-token.js path/to/keypair.json

# Custom keypair + custom metadata URI
node create-token.js path/to/keypair.json https://example.com/metadata.json

# Default keypair + custom metadata URI
node create-token.js https://example.com/metadata.json
```

### Set metadata on the existing mainnet token (set-metadata.js)

Creates or updates on-chain Metaplex metadata for the already-deployed DamoCoin mint.
Run this once to make wallets (Phantom, Solflare, etc.) recognise DAMO by name and symbol.

```bash
# Use default keypair — wallet must be the mint authority
node set-metadata.js

# Custom keypair
node set-metadata.js path/to/keypair.json

# Custom keypair + custom metadata URI
node set-metadata.js path/to/keypair.json https://example.com/metadata.json
```

The script automatically detects whether a metadata account already exists and creates or updates it accordingly.

## Metadata

`damocoin.json` contains the off-chain token metadata (name, symbol, image, description).
It is hosted on GitHub Pages at:

```
https://damo333.github.io/damocoin/damocoin.json
```

The logo is hosted at:

```
https://damo333.github.io/damocoin/damocoin-logo.svg
```

## Token visibility

### On-chain metadata (primary — wallets read this directly)

On-chain Metaplex metadata is already set on the mainnet mint. To update it:

```bash
node set-metadata.js
```

Phantom, Solflare, and most Solana wallets read this on-chain data — no registry PR needed for wallet display.

### Solana Explorer

Tokens with valid on-chain Metaplex metadata are automatically labelled:

```
https://explorer.solana.com/address/CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx
```

### Solscan

Submit token info at:
```
https://solscan.io/token/CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx
```
Click **"Update token info"** and fill in name, symbol, logo, website. Uses the data in `solana-token-list-entry.json`.

### Jupiter

Jupiter (jup.ag) now uses organic discovery — no PR required. Token page:
```
https://jup.ag/tokens/CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx
```
Community members can submit **smart likes** there to help get DAMO verified. Creating a liquidity pool on a DEX (Raydium, Orca) will make the token tradeable and discoverable.

### DexScreener / Birdeye

Both auto-list tokens once a liquidity pool exists. No manual submission needed — add liquidity on Raydium or Orca and the token appears automatically.

> Note: `solana-labs/token-list` and `jup-ag/token-list` on GitHub are both archived and no longer accept PRs. The `solana-token-list-entry.json` file is kept for reference.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
