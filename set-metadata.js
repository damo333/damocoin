/**
 * Sets or updates Metaplex on-chain metadata for an existing SPL token mint.
 *
 * Usage:
 *   node set-metadata.js [keypair-path] [metadata-uri]
 *
 * Defaults:
 *   keypair: ~/.config/solana/id.json
 *   mint:    CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx  (DamoCoin mainnet)
 *   uri:     https://damo333.github.io/damocoin/damocoin.json
 */

import fs from "fs";
import path from "path";
import os from "os";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import pkg from "@metaplex-foundation/mpl-token-metadata";
const {
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
  MPL_TOKEN_METADATA_PROGRAM_ID: PROGRAM_ID_STR,
} = pkg;

const MINT_ADDRESS = "CuhkVj1PKAMphKu8LsgaQ4wQLb95cb2w9wG7Ub9K6Xmx";
const DEFAULT_METADATA_URI = "https://damo333.github.io/damocoin/damocoin.json";

const MPL_TOKEN_METADATA_PROGRAM_ID =
  typeof PROGRAM_ID_STR === "string"
    ? new PublicKey(PROGRAM_ID_STR)
    : PROGRAM_ID_STR;

function readKeypairFromFile(filePath) {
  const secretKey = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

function deriveMetadataPDA(mint) {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}

async function metadataAccountExists(connection, pda) {
  const info = await connection.getAccountInfo(pda);
  return info !== null;
}

async function main() {
  let keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  let metadataUri = DEFAULT_METADATA_URI;

  const arg1 = process.argv[2];
  const arg2 = process.argv[3];
  if (arg1) {
    if (arg1.startsWith("http")) {
      metadataUri = arg1;
    } else {
      keypairPath = arg1;
      if (arg2) metadataUri = arg2;
    }
  }

  if (!fs.existsSync(keypairPath)) {
    console.error(`Keypair not found: ${keypairPath}`);
    process.exit(1);
  }

  const payer = readKeypairFromFile(keypairPath);
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const mint = new PublicKey(MINT_ADDRESS);
  const metadataPDA = deriveMetadataPDA(mint);

  console.log("Wallet:       ", payer.publicKey.toBase58());
  console.log("Mint:         ", MINT_ADDRESS);
  console.log("Metadata PDA: ", metadataPDA.toBase58());
  console.log("Metadata URI: ", metadataUri);

  const balance = await connection.getBalance(payer.publicKey);
  console.log("Balance:      ", balance / LAMPORTS_PER_SOL, "SOL");
  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    console.error("Insufficient balance for transaction fees.");
    process.exit(1);
  }

  const exists = await metadataAccountExists(connection, metadataPDA);
  const tokenData = {
    name: "DamoCoin",
    symbol: "DAMO",
    uri: metadataUri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  let ix;
  if (exists) {
    console.log("Metadata account already exists — updating...");
    ix = createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: payer.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: tokenData,
          updateAuthority: payer.publicKey,
          primarySaleHappened: null,
          isMutable: true,
        },
      }
    );
  } else {
    console.log("No metadata account found — creating...");
    ix = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: tokenData,
          isMutable: true,
          collectionDetails: null,
        },
      }
    );
  }

  const tx = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("\nSuccess! Transaction signature:", sig);
  console.log("Metadata PDA:", metadataPDA.toBase58());
  console.log("View on explorer: https://explorer.solana.com/address/" + metadataPDA.toBase58());
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
