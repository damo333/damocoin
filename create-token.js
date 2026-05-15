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
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import pkg from "@metaplex-foundation/mpl-token-metadata";
const {
  createCreateMetadataAccountV3Instruction,
  MPL_TOKEN_METADATA_PROGRAM_ID: PROGRAM_ID_STR,
} = pkg;

const MPL_TOKEN_METADATA_PROGRAM_ID =
  typeof PROGRAM_ID_STR === "string"
    ? new PublicKey(PROGRAM_ID_STR)
    : PROGRAM_ID_STR;

function readKeypairFromFile(filePath) {
  const secretKey = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

function getDefaultSolanaKeypairPath() {
  return path.join(os.homedir(), ".config", "solana", "id.json");
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

async function main() {
  let keypairPath = getDefaultSolanaKeypairPath();
  let metadataUri = "https://damo333.github.io/damocoin/damocoin.json";

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

  console.log(`Using keypair from: ${keypairPath}`);
  console.log(`Using metadata URI: ${metadataUri}`);

  if (!fs.existsSync(keypairPath)) {
    console.error(`Keypair file not found at: ${keypairPath}`);
    console.error("Generate a keypair with: solana-keygen new --outfile <path>");
    process.exit(1);
  }

  const payer = readKeypairFromFile(keypairPath);
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

  console.log("Using wallet:", payer.publicKey.toBase58());
  const balance = await connection.getBalance(payer.publicKey);
  console.log("Current balance:", balance / LAMPORTS_PER_SOL, "SOL");
  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.warn("Warning: low balance. Ensure you have enough SOL for fees.");
  }

  console.log("Creating new SPL token mint...");
  const mint = await createMint(connection, payer, payer.publicKey, null, 9);
  console.log("Mint address:", mint.toBase58());

  // Create on-chain Metaplex metadata
  console.log("Creating on-chain metadata...");
  const metadataPDA = deriveMetadataPDA(mint);
  const metadataIx = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: "DamoCoin",
          symbol: "DAMO",
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  const tx = new Transaction().add(metadataIx);
  await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("On-chain metadata created. PDA:", metadataPDA.toBase58());

  // Mint initial supply
  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("Associated token account:", payerTokenAccount.address.toBase58());

  const initialSupply = BigInt(1_000_000_000) * BigInt(10 ** 9);
  await mintTo(connection, payer, mint, payerTokenAccount.address, payer, initialSupply);
  console.log("Minted initial supply:", (initialSupply / BigInt(10 ** 9)).toString(), "DAMO");

  console.log("\nDamoCoin successfully created!");
  console.log("  Mint address:   ", mint.toBase58());
  console.log("  Token account:  ", payerTokenAccount.address.toBase58());
  console.log("  Metadata PDA:   ", metadataPDA.toBase58());
  console.log("  Metadata URI:   ", metadataUri);
  console.log("  Initial supply: 1,000,000,000 DAMO\n");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
