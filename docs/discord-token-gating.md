# Token-Gated Discord Channels for DAMO Holders

Goal: a **#holders-lounge** channel (and optionally an **#og-collectors** channel) that only verified DAMO / Damo OG NFT holders can see. Verification is done by a wallet-verification bot — members connect their Solana wallet once, the bot checks their balance, and assigns a role automatically.

## Recommended bot: Matrica

[Matrica](https://matrica.io) is the most widely used Solana wallet-verification service. The basic community tier is free and supports SPL token and NFT role gating.

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

### Step 3 — Set up Matrica

1. Go to [matrica.io](https://matrica.io) and sign in with Discord
2. Create a community for your server and invite the **Matrica bot** (it will request role-management permission — needed to assign the holder roles)
3. **Important:** in Server Settings → Roles, drag the Matrica bot's role **above** `DAMO Holder` and `Damo OG` (bots can only assign roles below their own)
4. In the Matrica dashboard, add role rules:
   - **DAMO Holder**: token rule → SPL token mint `DPbc8tyMmEc5NKiLnJQQZhuLErwL6A7SwKomFKV4z2Vx`, minimum balance of your choice (e.g. 100,000 DAMO — pick a threshold that means "real holder" but isn't exclusionary)
   - **Damo OG**: NFT rule → collection mint `NEPpgFCxJsfTo7hjGTsWTT3FXaXgokb6dbnZyHQsJUk`
5. Create a `#verify-wallet` channel (visible to everyone) and post the Matrica verification link there

### Step 4 — Member experience

1. Member clicks the link in `#verify-wallet`
2. Signs a message with Phantom/Solflare (no transaction, no fee — just proof of ownership)
3. Matrica checks their balances and assigns roles automatically
4. Roles update periodically, so members who sell below the threshold lose access automatically

## Alternatives if Matrica doesn't work out

- **Hashlist** (hashlist.io) — similar Solana-native gating
- **Guild.xyz** — multi-chain, free, supports Solana SPL tokens

## Tips

- Announce the holders' channel on Twitter/Discord once live — exclusive access is one of the few zero-cost utilities a small token can offer
- Post something in `#holders-lounge` regularly (alpha first, before public announcements) so the role is actually worth holding for
- Never DM members asking them to verify — scammers do that. State clearly that verification only happens via the pinned link in `#verify-wallet`
