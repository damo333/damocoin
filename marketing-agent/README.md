# DamoCoin Marketing Bot

Discord bot that uses Claude AI to generate marketing content for DamoCoin.

## Setup

### 1. Create a Discord bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → name it "DamoCoin Bot"
3. Go to **Bot** → click **Add Bot**
4. Under **Token** click **Reset Token** → copy it (this is your `DISCORD_BOT_TOKEN`)
5. Under **Privileged Gateway Intents** — no intents needed (slash commands only)
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`
   - Copy the generated URL and open it to invite the bot to your server
7. Copy your **Application ID** from the General Information page (this is your `DISCORD_CLIENT_ID`)

### 2. Get your channel ID

In Discord: Settings → Advanced → enable **Developer Mode**.
Right-click your `#general` channel → **Copy Channel ID** → this is your `DISCORD_CHANNEL_ID`.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in all values. **Never commit `.env` to git.**

### 4. Install and run

```bash
npm install

# Register slash commands with Discord (run once, or after adding new commands)
npm run deploy-commands

# Start the bot
npm start
```

## Commands

| Command | Description |
|---|---|
| `/generate tweet` | Generates a tweet to copy-paste to Twitter |
| `/generate announcement` | Generates a Discord community post |
| `/generate price-update` | Generates a live price update |
| `/generate alpha` | Generates an alpha drop hype post |
| `/generate gm` | Generates a GM morning post |
| `/price` | Shows live $DAMO price |

All `/generate` commands show a preview **only visible to you** with three buttons:
- **Post** (or **Show tweet to copy** for tweets) — approves and posts/shows the content
- **Regenerate** — generates a fresh version
- **Discard** — cancels

Drafts expire after 1 hour if not approved.

## Daily GM draft

If `DISCORD_OWNER_ID` is set in `.env`, the bot DMs you a fresh GM post every
morning at `DAILY_GM_HOUR` (default 9:00 local time) with the same
approve/regenerate/discard buttons. Approving posts it straight to #general.

To get your user ID: Discord Settings → Advanced → enable Developer Mode,
then right-click your own name in any chat → **Copy User ID**.

> Note: the bot must share a server with you and you need DMs from server
> members enabled for the DM to arrive.

## Cheap hosting options

| Option | Cost | Notes |
|---|---|---|
| Your own PC | Free | Run `npm start`, keep terminal open |
| Railway | ~$5/month | Best paid option, deploy from GitHub |
| Fly.io | Free tier | 3 free VMs, may need card on file |
| Render | Free tier | Free services spin down after inactivity |

For minimal cost: just run `npm start` on your PC when you want to use it.
For always-on: Railway at $5/month is the easiest.
