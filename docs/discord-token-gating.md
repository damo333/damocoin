# Token-Gated Discord Channels for DAMO Holders

Goal: a **#holders-lounge** channel (and optionally an **#og-collectors** channel) that only verified DAMO / Damo OG NFT holders can see. Verification is done by a wallet-verification bot — members connect their Solana wallet once, the bot checks their balance, and assigns a role automatically.

## Recommended bot: Collab.Land (free tier)

[Collab.Land](https://www.collab.land) supports Solana SPL tokens and NFTs, and its
**Starter plan is free** — up to 25 verified members with balance re-checks every
24 hours. That's plenty to start; upgrade only if the community outgrows it.

(Matrica is the other major Solana option but now requires a paid business plan.)

### Step 1 — Create the roles in Discord

In **Server Settings → Roles**, create:

| Role | Who gets it |
|---|---|
| `DAMO Holder` | Anyone holding at least the minimum DAMO balance |
| `Damo OG` | Anyone holding a Damo OG Collection NFT |

Don't assign them to anyone manually — the bot will.

### Step 2 — Create the gated channels

1. Create a channel `#holders-lounge`
2. In the channel's **Permissions**:
   - `@everyone` → **View Channel: ✕ (deny)**
   - `DAMO Holder` → **View Channel: ✓ (allow)**
3. Optionally repeat for `#og-collectors` with the `Damo OG` role.

### Step 3 — Set up Collab.Land

1. Go to the Collab.Land Command Center: [cc.collab.land](https://cc.collab.land) and sign in with Discord
2. Select your server — it will prompt you to **invite the Collab.Land bot** (accept the role-management permission; that's how it assigns holder roles)
3. **Important:** in Server Settings → Roles, drag the Collab.Land bot's role **above** `DAMO Holder` and `Damo OG` (bots can only assign roles below their own)
4. In the Command Center, create **Token Gating Rules (TGRs)**:
   - **DAMO Holder**: token type **Solana FT**, address `DPbc8tyMmEc5NKiLnJQQZhuLErwL6A7SwKomFKV4z2Vx`, minimum balance of your choice (e.g. 100,000 DAMO — pick a threshold that means "real holder" but isn't exclusionary)
   - **Damo OG**: token type **Solana NFT**, filter **creators**, address `G5CMpZGvpx4znZywDsvmkfG3EEkXpxS9LTceNa7DcnPN` (the Candy Machine verified-creator PDA — NOT the collection mint; the filter determines how the address is interpreted), min amount 1
5. The bot posts a **"Let's Go!" / Connect Wallet** message — put it in a `#verify-wallet` channel (visible to everyone)

### Step 4 — Member experience

1. Member clicks the verify button in `#verify-wallet`
2. Signs a message with Phantom/Solflare (no transaction, no fee — just proof of ownership)
3. Collab.Land checks their balances and assigns roles automatically
4. Balances re-check every 24h on the free plan, so members who sell below the threshold lose access automatically

## Alternatives if Collab.Land doesn't work out

- **Guild.xyz** — free, multi-chain (verify current Solana support first)
- **Matrica** (business.matrica.io) — Solana-native, paid business plans
- **Hashlist** (hashlist.io) — Solana-native gating

## Tips

- Announce the holders' channel on Twitter/Discord once live — exclusive access is one of the few zero-cost utilities a small token can offer
- Post something in `#holders-lounge` regularly (alpha first, before public announcements) so the role is actually worth holding for
- Never DM members asking them to verify — scammers do that. State clearly that verification only happens via the pinned link in `#verify-wallet`
