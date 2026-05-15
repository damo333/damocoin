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

## Token registry

### On-chain metadata (primary — wallets read this)

Run `node set-metadata.js` to write Metaplex metadata on-chain. Phantom, Solflare, and most wallets read this directly — no registry PR needed.

### Jupiter token list (community standard)

`solana-labs/token-list` is archived and no longer maintained. The current community standard is the Jupiter token list:

1. Fork https://github.com/jup-ag/token-list
2. Add the entry from `solana-token-list-entry.json` to `src/tokens/solana.tokenlist.json`
3. Open a pull request

### Solana Explorer

Tokens with valid on-chain Metaplex metadata are automatically labelled in the explorer at:

```
https://explorer.solana.com/address/CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
