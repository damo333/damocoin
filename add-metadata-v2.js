import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import {
  mplTokenMetadata,
  createFungible,
} from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const MINT = 'DPbc8tyMmEc5NKiLnJQQZhuLErwL6A7SwKomFKV4z2Vx';
const RPC  = 'https://api.mainnet-beta.solana.com';

const keyPath = '/mnt/c/Users/damo3/.config/solana/id.json';
const secret  = JSON.parse(readFileSync(keyPath, 'utf8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));

const umi = createUmi(RPC).use(mplTokenMetadata());
umi.use(keypairIdentity(fromWeb3JsKeypair(keypair)));

const metadata = {
  name:   'DamoCoin',
  symbol: 'DAMO',
  uri:    'https://raw.githubusercontent.com/damo333/damocoin/main/damocoin-metadata.json',
};

console.log('Adding metadata to v2 token…');

const tx = await createFungible(umi, {
  mint:                    publicKey(MINT),
  name:                    metadata.name,
  symbol:                  metadata.symbol,
  uri:                     metadata.uri,
  sellerFeeBasisPoints:    { basisPoints: 0n, identifier: '%', decimals: 2 },
  isMutable:               true,
}).sendAndConfirm(umi);

console.log('Done! Metadata added.');
console.log('Signature:', Buffer.from(tx.signature).toString('base64'));
