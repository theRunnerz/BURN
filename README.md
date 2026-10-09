# 🪦 TRON Wallet Autopsy & Retro Arcade
### *Your bags. Our diagnosis.* — Live on [thefootballalien.store](https://thefootballalien.store)

[![Deploy to GitHub Pages](https://github.com/USER/tron-wallet-autopsy/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: TRON](https://img.shields.io/badge/Network-TRON%20Mainnet-red.svg)](https://tronscan.org)

An interactive, dark-humored Web3 crypto forensic suite and 8-bit retro arcade built for the TRON community.

---

## ⚡ Features Overview

1. **💀 Forensic Bag Autopsy**:
   - Deep-dive TRON wallet token analysis, rug detection, and portfolio breakdown.
   - Calculates **Degen Score**, **Rug Survival Rating**, and hilarious AI **Cause of Death**.
   - Generates official cryptographic Autopsy Cards with stamp seals and TronScan verification links.

2. **⚰️ Bag Funeral & Burn-to-Unlock**:
   - Give dead meme coins a dignified burial.
   - Direct TronLink smart contract burn / transfer transactions to unredact sensitive coroner notes.

3. **🎃 Spooky Halloween Death Oracle**:
   - Enter your Astrological Zodiac Sign and TRON wallet address.
   - Summons an eerie prophecy revealing your wallet's predicted date of demise, celestial omens, and haunting rituals.

4. **🕹️ 0.25 TRX Retro Arcade Cabinet**:
   - **Tron Man** (Circuit maze chomper) & **X1roid** (Cyber vector asteroid blaster) built on HTML5 Canvas with Web Audio 8-bit synthesis.
   - **Community Revenue**: Every coin deposit of **0.25 TRX** is sent directly on-chain to community address:  
     `TENXRknaJG3acTjdm9pLzLrPHahZLgHygP`
   - Real-time TronLink coin drops, demo test quarter option, and global arcade leaderboard.

5. **💬 Degen Crypt Community Chat**:
   - Live community chat room with role badges (`CORONER`, `DEGEN`, `WHALE`, `CHAMPION`).
   - One-click **"Share My Autopsy"** broadcast to display autopsy cards directly in the chat stream.

---

## 🚀 Quick Setup & Local Development

### Prerequisites
- Node.js 18+ or 20+
- TronLink wallet browser extension (optional for signing transactions and arcade coin drops)

### Installation
```bash
# Clone the repository
git clone https://github.com/<YOUR-USERNAME>/tron-wallet-autopsy.git
cd tron-wallet-autopsy

# Install dependencies
npm install

# Start local full-stack development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Pushing to GitHub

To push this codebase to your own GitHub account:

1. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name your repo (e.g., `tron-wallet-autopsy` or `thefootballalien-store`)
   - Leave it public or private, and **do not** initialize with a README (this repo already has one).

2. **Link and push from your terminal**:
```bash
# Add your GitHub remote repository (replace with your GitHub username & repo name)
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/tron-wallet-autopsy.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

---

## 🌐 Linking to Your Domain: `thefootballalien.store`

You can connect `thefootballalien.store` using either **GitHub Pages** (free static hosting) or **Full-Stack Hosting** (Vercel, Render, Railway, or VPS).

### Option 1: GitHub Pages Setup (Recommended for Instant Deploy)

The repository includes a preconfigured `CNAME` file and `.github/workflows/deploy.yml` workflow.

1. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions**.
   - The workflow will automatically build Vite and deploy the `dist/` directory to GitHub Pages.
   - Under **Custom domain**, enter:  
     `thefootballalien.store`
   - Check **Enforce HTTPS** (this provisions a free SSL certificate).

2. **Configure DNS Records at your Domain Registrar** (e.g. Namecheap, GoDaddy, Cloudflare, Porkbun, Squarespace):
   - Add these **4 A Records** for the root apex domain (`@` or `thefootballalien.store`):
     | Type | Host / Name | Target / IP Address |
     | :--- | :--- | :--- |
     | **A** | `@` | `185.199.108.153` |
     | **A** | `@` | `185.199.109.153` |
     | **A** | `@` | `185.199.110.153` |
     | **A** | `@` | `185.199.111.153` |

   - Add a **CNAME Record** for the `www` subdomain:
     | Type | Host / Name | Target / Value |
     | :--- | :--- | :--- |
     | **CNAME** | `www` | `<YOUR-GITHUB-USERNAME>.github.io` |

*(DNS propagation typically takes 5 to 30 minutes).*

---

### Option 2: Full-Stack Hosting (Vercel / Railway / Render / Cloud Run)

If you wish to run the backend Express API for server-side Gemini AI generation and persistent server state:

#### Deploying on Vercel:
1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. Under **Domains**, add `thefootballalien.store`.
3. Follow Vercel's DNS instructions (pointing A record to `76.76.21.21` or CNAME to `cname.vercel-dns.com`).
4. Set Environment Variable:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.

#### Deploying with Docker on a VPS (Ubuntu / Debian):
```bash
# Build the Docker container
docker build -t tron-autopsy .

# Run on port 80/443 or behind Nginx
docker run -d -p 3000:3000 --name tron-autopsy-app \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-api-key" \
  tron-autopsy
```

**Nginx Configuration for `thefootballalien.store`:**
```nginx
server {
    server_name thefootballalien.store www.thefootballalien.store;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Obtain free SSL using Certbot:
```bash
sudo certbot --nginx -d thefootballalien.store -d www.thefootballalien.store
```

---

## 💰 Community Revenue Details
- **Arcade Fee**: 0.25 TRX per play credit.
- **Recipient Address**: `TENXRknaJG3acTjdm9pLzLrPHahZLgHygP`
- View transactions on TronScan: [TronScan Explorer](https://tronscan.org/#/address/TENXRknaJG3acTjdm9pLzLrPHahZLgHygP)

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas 2D API.
- **Audio Engine**: Web Audio API (zero audio file dependencies, pure programmatic 8-bit synthesizer).
- **Backend**: Express, Vite SSR Middleware mode, Google Gemini 2.5 Flash SDK.
- **Blockchain**: TronLink Integration (`window.tronWeb` & `tronLink` provider).

---

## 📄 License
MIT © 2026 TRON Wallet Autopsy Community.
