# NotoshaVault 🔐

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Zero-Knowledge Password Manager with Client-Side Encryption**

**Created by [NotoshaDev](https://github.com/notoshadev)** | [GitHub](https://github.com/notoshadev) | [LinkedIn](https://www.linkedin.com/in/gustavo-ernesto-villarroel-espinoza-4184ab246)

---

NotoshaVault is a modern, secure password manager built with privacy as the top priority. Unlike traditional password managers, your master password and decryption keys **never leave your device**. All encryption and decryption happens locally in your browser using military-grade AES-256-GCM encryption.

Your encrypted data is stored in a Supabase PostgreSQL database, but the server only ever sees encrypted blobs - it's cryptographically impossible for anyone (including the server) to decrypt your secrets without your master password.

**Perfect for individuals and teams who prioritize security and privacy.**

##  Features

- ** Zero-Knowledge Encryption**: AES-256-GCM with PBKDF2 key derivation (100,000 iterations)
- ** Cloud Sync**: Encrypted data stored in Supabase PostgreSQL with Row Level Security
- ** Multi-User Support**: Each user has their own isolated vault identified by email
- ** Password Generator**: Customizable strength with visual feedback and entropy calculation
- ** Security Dashboard**: Real-time password health analysis and security recommendations
- ** Instant Search**: Filter and find secrets in real-time
- ** Auto-Lock**: Automatic vault locking after 5 minutes of inactivity
- ** Modern UI**: Cyberpunk-themed interface with smooth animations
- ** Responsive Design**: Works seamlessly on desktop and mobile devices
- ** Hybrid Storage**: Database-first with localStorage cache for offline access

##  Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS + Custom Cyberpunk Theme
- **Encryption**: Web Crypto API (native browser, no external libraries)
- **Animations**: Framer Motion
- **Validation**: Zod
- **Font**: JetBrains Mono
- **Icons**: Lucide React

##  Project Structure

```
vaulsecretonotosha/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── vault/             # Vault management & secrets
│   │   └── security/      # Security dashboard
│   ├── password-generator/# Password generator tool
│   └── encryption-proof/  # Transparency page
├── components/
│   └── ui/                # Reusable UI components (Button, Input, Card, etc.)
├── contexts/              # React Context providers
│   ├── VaultContext.tsx   # Authentication & vault management
│   └── SecretsContext.tsx # Secrets CRUD operations
├── lib/
│   ├── crypto/            # Encryption utilities (AES-256-GCM, PBKDF2)
│   ├── supabase/          # Supabase client & types
│   ├── services/          # Database service layers
│   └── utils.ts           # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── supabase/              # Database migrations & schema
└── public/                # Static assets
```

##  Color Palette (Cyberpunk Theme)

- **Background**: Slate 950 (almost black)
- **Primary**: Cyan 400/500 (Matrix-style)
- **Secondary**: Emerald 400 (success states)
- **Alerts**: Amber/Red (warnings)
- **Text**: Slate 100/200
- **Borders**: Slate 800 with glow effects

##  Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/notoshadev/vaulsecretonotosha.git
cd vaulsecretonotosha

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run database migrations (optional, tables auto-create)
# See supabase/schema.sql for manual setup

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### First Time Setup
1. Click **"Register"** to create your first vault
2. Enter your email and a strong master password (min 8 characters)
3. **Important**: Your master password cannot be recovered - store it securely!
4. Start adding secrets to your vault

##  Development Roadmap

- [x] Module 1: Project Setup & Structure
- [x] Module 2: Cryptography System (AES-256-GCM + PBKDF2)
- [x] Module 3: UI Components (Cards, Inputs, Buttons, Alerts)
- [x] Module 4: Authentication (Register/Login with email)
- [x] Module 5: Secret Manager (CRUD operations)
- [x] Module 6: Password Generator (Customizable strength)
- [x] Module 7: Security Dashboard (Password health analysis)
- [x] Module 8: Animations & Polish (Framer Motion)
- [x] Module 9: Supabase Integration (Cloud sync)
- [x] Module 10: Multi-User Support (Email-based vaults)

##  Security Architecture

### Zero-Knowledge Encryption
- **Master Password**: Never sent to the server, stays only in your browser
- **Key Derivation**: PBKDF2 with 100,000 iterations + unique salt per vault
- **Encryption**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Data Flow**: Encrypt locally → Send encrypted blob → Store in database
- **Decryption**: Only possible with your master password on your device

### Database Security
- **Row Level Security (RLS)**: Supabase policies prevent unauthorized access
- **Encrypted Storage**: All secrets stored as Base64 encrypted strings
- **Cascade Delete**: Deleting a vault removes all associated secrets
- **No Plain Text**: Server never sees unencrypted data

##  Database Schema

```sql
-- Vaults table (one per user)
vaults (
  id: uuid (primary key)
  email: text (unique, indexed)
  salt: text (for PBKDF2 key derivation)
  created_at: timestamp
)

-- Secrets table (encrypted credentials)
secrets (
  id: uuid (primary key)
  vault_id: uuid (foreign key → vaults.id, CASCADE)
  encrypted_data: text (Base64 encoded encrypted JSON)
  created_at: timestamp
  updated_at: timestamp
)
```

---

<div align="center">

**Created & Designed by [NotoshaDev](https://github.com/notoshadev)**

[![GitHub](https://img.shields.io/badge/GitHub-notoshadev-181717?logo=github)](https://github.com/notoshadev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-notoshadev-0077B5?logo=linkedin)](https://www.linkedin.com/in/notoshadev)

🔐 *Zero-Knowledge Security*

</div>
