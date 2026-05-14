import fs from "fs";
import path from "path";
import os from "os";
import {
  Connection,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

function readKeypairFromFile(filePath) {
  const secretKey = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

function getDefaultSolanaKeypairPath() {
  const home = os.homedir();
  return path.join(home, ".config", "solana", "id.json");
}

async function main() {
  let keypairPath = getDefaultSolanaKeypairPath();
  let metadataUri = "https://example.com/damocoin.json";

  // Parse arguments flexibly: can be (keypair), (keypair, metadata), or (metadata)
  const arg1 = process.argv[2];
  const arg2 = process.argv[3];

  if (arg1) {
    // Check if arg1 looks like a URL (starts with http)
    if (arg1.startsWith("http")) {
      metadataUri = arg1;
    } else {
      // Treat as keypair path
      keypairPath = arg1;
      if (arg2) {
        metadataUri = arg2;
      }
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
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const tokenName = "DamoCoin";
  console.log(`Creating new token: ${tokenName}`);
  console.log("Using wallet:", payer.publicKey.toBase58());

  const balance = await connection.getBalance(payer.publicKey);
  console.log("Current balance:", balance / LAMPORTS_PER_SOL, "SOL");
  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.warn("Low balance. Use `solana airdrop 2` on devnet before continuing.");
  }

  console.log("Creating new SPL token mint...");
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9
  );

  console.log("Mint address:", mint.toBase58());

  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log("Associated token account:", payerTokenAccount.address.toBase58());

  const initialSupply = BigInt(1000) * BigInt(10 ** 9);
  await mintTo(
    connection,
    payer,
    mint,
    payerTokenAccount.address,
    payer,
    initialSupply
  );

  console.log("Minted initial supply:", initialSupply.toString(), "units");

  console.log("Creating on-chain metadata for DamoCoin...");
  const [metadataPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const metadataData = {
    name: tokenName,
    symbol: "DMCN",
    uri: metadataUri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

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
        data: metadataData,
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  const tx = new Transaction().add(metadataIx);
  const metadataTxId = await connection.sendTransaction(tx, [payer], {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(metadataTxId, "confirmed");

  console.log("Metadata account:", metadataPDA.toBase58());
  console.log("Metadata transaction:", metadataTxId);
  console.log("Done! Your custom DamoCoin token is created on devnet.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
