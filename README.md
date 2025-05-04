# Max Extract - Crypto Rugger Tracker

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4a42de0-6a37-4db7-975d-e6515adbe047/deploy-status)](https://app.netlify.com/sites/max-extract/deploys)

[![Deploy Supabase Edge Functions](https://github.com/jongan69/max-extract/actions/workflows/deploy.yml/badge.svg)](https://github.com/jongan69/max-extract/actions/workflows/deploy.yml)

---

## Overview

**Max Extract** is a web application for tracking, submitting, and voting on alleged crypto "ruggers"—Twitter accounts and their associated Ethereum or Solana wallets. The platform enables the community to:

- **Submit** Twitter handles and wallet addresses suspected of rug pulls or scams
- **Vote** (upvote/downvote) on submitted accounts
- **View** wallet balances and created coins for each account
- **Remove** an account (for a fee, via Stripe or SOL payment)
- **Authenticate** using Solana/Ethereum wallets for secure voting and submissions

The app is built with React, TypeScript, Vite, Tailwind CSS, and uses Supabase for backend/database and Edge Functions. Payments are handled via Stripe and direct SOL transfers.

---

## Features

- **Account Submission:**
  - Submit a Twitter handle and a wallet address (ETH or SOL) with an optional description.
  - Twitter profile images are fetched automatically.
  - Duplicate submissions are prevented.

- **Voting:**
  - Upvote or downvote accounts (one vote per user per account).
  - Voting requires wallet authentication.

- **Leaderboard & Search:**
  - See the most/least popular and most active accounts.
  - Search and sort accounts by newest, most liked, or least liked.

- **Wallet Integration:**
  - Connect with Solana wallets (Phantom, Torus, Solflare, Ledger, Coinbase, etc.).
  - Wallet authentication is used for voting and submissions.

- **Wallet & Coin Data:**
  - View live SOL and USDC balances for each wallet.
  - See coins created by the wallet (via external API).

- **Account Removal:**
  - Pay to remove an account (Stripe checkout for card payments, or direct SOL transfer).
  - After payment, the account is deleted from the database.

- **Dark Mode:**
  - Toggle between light and dark themes.

---

## Architecture

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **State Management:** React Context
- **Wallets:** @solana/wallet-adapter
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Payments:** Stripe (via Supabase Edge Functions), direct SOL transfer
- **APIs:**
  - Supabase Edge Functions for wallet balance, Twitter PFP, Stripe checkout/webhook
  - External API for created coins

---

## Supabase Edge Functions

- **stripe-checkout:** Creates Stripe Checkout sessions for account removal payments.
- **stripe-webhook:** Handles Stripe webhooks to confirm payment and update database.
- **get-twitter-pfp:** Fetches Twitter profile images for submitted handles.
- **wallet-balance:** Fetches SOL and USDC balances for a given wallet using Helius API.
- **wallet-authenticate:** Authenticates users by verifying wallet signatures and issues JWTs.

---

## Payments

- **Stripe:**
  - Used for card payments to remove accounts.
  - Price and product info in `src/stripe-config.ts`.
  - After successful payment, user is redirected to a success page and the account is deleted.

- **SOL Transfer:**
  - Users can pay in SOL directly from their wallet.
  - SOL price is fetched live from Kraken.
  - Payment is sent to the default wallet: `9ex8SZWhb2X5MRmqZt4Uu9UEbWtRbJDnMozbyN5sCU7N`.

---

## Running Locally

### Prerequisites
- Node.js >= 18
- pnpm or npm
- Supabase CLI (for local Edge Functions)

### Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/jongan69/max-extract.git
   cd max-extract
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_HELIUS_SECURE_RPC_URL` (for Solana wallet and balance)
     - Stripe and Helius keys for Edge Functions

4. **Start Supabase (for Edge Functions):**
   ```bash
   supabase start
   supabase functions serve --env-file .env.local
   ```
5. **Start the frontend:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

---

## Deployment

- **Frontend:** Deployed on Netlify (see badge above)
- **Edge Functions:** Deployed via GitHub Actions to Supabase (see badge above)
- **Custom Redirects:** See `public/_redirects` for SPA routing on Netlify

---

## Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_HELIUS_SECURE_RPC_URL` - Helius RPC endpoint for Solana
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe API keys (for Edge Functions)
- `HELIUS_API_KEY` - Helius API key (for wallet balances)

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React
- **Wallets:** @solana/wallet-adapter
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Payments:** Stripe, Solana
- **APIs:** Helius, Twitter profile API

---

## Credits

- Built with ❤️ using React, Tailwind, and Supabase
- Wallet UI inspired by Solana wallet adapter
- [Lucide React](https://lucide.dev/) for icons

---

## License

MIT
