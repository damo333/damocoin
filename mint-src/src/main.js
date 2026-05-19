import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  mplCandyMachine,
  fetchCandyMachine,
  mintV2,
  safeFetchCandyGuard,
} from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { setComputeUnitLimit, findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';
import { publicKey, generateSigner, some, transactionBuilder } from '@metaplex-foundation/umi';

const CANDY_MACHINE_ID = '5jCny4bDZPaU6X9e2avDFzmL2vukXHcontyAyT3W2ukt';
const DAMO_MINT = 'CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx';
const RPC = 'https://mainnet.helius-rpc.com/?api-key=ce0b165e-e422-4d7a-a1d5-3e83c667f953';
const FALLBACK_RPCS = [
  'https://mainnet.helius-rpc.com/?api-key=ce0b165e-e422-4d7a-a1d5-3e83c667f953',
  'https://api.mainnet-beta.solana.com',
];
const CREATOR = 'DibC6reBiwRETsy7esXQ3fb15DbxvmrT8hQgLEvRbSqK';

let umi;
let wallet;
let candyMachine;
let candyGuard;

const connectBtn = document.getElementById('connectBtn');
const mintBtn = document.getElementById('mintBtn');
const statusEl = document.getElementById('status');
const remainingEl = document.getElementById('remaining');
const balanceEl = document.getElementById('damoBalance');
const balanceAmountEl = document.getElementById('balanceAmount');

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function clearStatus() {
  statusEl.className = 'status';
}

async function initUmi() {
  umi = createUmi(RPC)
    .use(mplCandyMachine())
    .use(mplTokenMetadata());
}

async function loadCandyMachine() {
  try {
    candyMachine = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
    candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
    const remaining = Number(candyMachine.data.itemsAvailable) - Number(candyMachine.itemsRedeemed);
    remainingEl.textContent = remaining;
    if (remaining === 0) {
      mintBtn.textContent = 'Sold Out';
      mintBtn.disabled = true;
    }
  } catch (e) {
    candyMachine = undefined;
    candyGuard = undefined;
  }
}

async function getDamoBalance(walletPubkey) {
  for (const rpc of FALLBACK_RPCS) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getTokenAccountsByOwner',
          params: [walletPubkey, { mint: DAMO_MINT }, { encoding: 'jsonParsed' }]
        })
      });
      const data = await res.json();
      if (data.error) continue;
      return data.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
    } catch {
      continue;
    }
  }
  throw new Error('Could not fetch DAMO balance — RPC unavailable. Try again.');
}

connectBtn.addEventListener('click', async () => {
  try {
    setStatus('Connecting wallet…', 'loading');
    wallet = new PhantomWalletAdapter();
    await wallet.connect();
    umi.use(walletAdapterIdentity(wallet));

    const address = wallet.publicKey.toString();
    connectBtn.textContent = address.slice(0, 4) + '…' + address.slice(-4);
    connectBtn.disabled = true;

    let balance = null;
    try {
      balance = await getDamoBalance(address);
    } catch (e) {
      // RPC unavailable — on-chain guard will enforce 10 DAMO requirement
    }

    mintBtn.style.display = 'block';

    if (balance !== null) {
      balanceAmountEl.textContent = balance + ' DAMO';
      balanceEl.style.display = 'block';
      mintBtn.disabled = balance < 10;
      if (balance < 10) {
        setStatus('You need at least 10 DAMO to mint.', 'error');
      } else {
        clearStatus();
      }
    } else {
      balanceAmountEl.textContent = '— (unavailable)';
      balanceEl.style.display = 'block';
      mintBtn.disabled = false;
      setStatus('Wallet connected. Balance check unavailable — 10 DAMO required on-chain.', 'loading');
    }
  } catch (e) {
    setStatus('Failed to connect wallet: ' + e.message, 'error');
  }
});

mintBtn.addEventListener('click', async () => {
  try {
    mintBtn.disabled = true;
    setStatus('Minting… please approve in Phantom.', 'loading');

    if (!candyMachine) {
      setStatus('Loading candy machine…', 'loading');
      await loadCandyMachine();
    }
    if (!candyMachine) {
      setStatus('Could not load candy machine. Please refresh the page and try again.', 'error');
      mintBtn.disabled = false;
      return;
    }

    const nftMint = generateSigner(umi);

    const [creatorAta] = findAssociatedTokenPda(umi, {
      mint: publicKey(DAMO_MINT),
      owner: publicKey(CREATOR),
    });

    let tx = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        candyGuard: candyGuard?.publicKey,
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        mintArgs: candyGuard?.guards?.tokenPayment ? {
          tokenPayment: some({
            mint: publicKey(DAMO_MINT),
            destinationAta: creatorAta,
          }),
        } : {},
      }));

    await tx.sendAndConfirm(umi, {
      send: { skipPreflight: true },
      confirm: { commitment: 'confirmed' },
    });

    const remaining = Number(candyMachine.data.itemsAvailable) - Number(candyMachine.itemsRedeemed) - 1;
    remainingEl.textContent = Math.max(0, remaining);

    setStatus('Minted successfully! View in your wallet.', 'success');
    mintBtn.textContent = 'Mint Another';
    mintBtn.disabled = false;
  } catch (e) {
    setStatus('Mint failed: ' + (e.message || 'Unknown error'), 'error');
    mintBtn.disabled = false;
  }
});

initUmi().then(() => loadCandyMachine());
