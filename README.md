# 🍳 Servd — AI Recipe Platform

An intelligent recipe platform that turns your leftover ingredients into gourmet meals using AI. Snap a photo of your pantry, and Servd will identify your ingredients and generate personalized recipes — complete with nutritional info, cooking tips, and beautiful images.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Strapi](https://img.shields.io/badge/Strapi-5-blue?logo=strapi)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?logo=clerk)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange?logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?logo=tailwindcss)

## ✨ Features

- **📸 AI Pantry Scanner** — Upload a photo of your fridge/pantry and let Google Gemini Vision identify ingredients automatically
- **🤖 AI Recipe Generation** — Get personalized recipe suggestions based on your available ingredients
- **🌍 Global Recipe Discovery** — Browse thousands of recipes by cuisine, category, or search
- **📖 Digital Cookbook** — Save your favorite recipes to a personal collection
- **📄 PDF Export** — Download any recipe as a beautifully formatted PDF
- **🔐 Authentication** — Secure sign-in/sign-up powered by Clerk
- **💳 Subscription Plans** — Free tier with limits + Pro tier with unlimited access via Clerk Commerce & Stripe
- **🛡️ Rate Limiting & Security** — Arcjet-powered WAF, bot detection, and per-user rate limiting
- **📱 Responsive Design** — Works great on desktop and mobile

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend/CMS** | Strapi 5 (Headless CMS) |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **AI** | Google Gemini API (text + vision) |
| **Auth** | Clerk (with Commerce/Billing) |
| **Images** | Unsplash API |
| **Security** | Arcjet (WAF, bot detection, rate limiting) |
| **UI Components** | Radix UI, Lucide Icons, shadcn/ui |

## 📁 Project Structure

```
ai-recipe-platform/
├── backend/                 # Strapi 5 CMS
│   ├── config/              # Server, database, admin config
│   ├── src/
│   │   └── api/             # Content types & custom routes
│   │       ├── recipe/      # Recipe content type
│   │       ├── pantry-item/ # Pantry item content type
│   │       └── saved-recipe/# Saved recipe content type
│   └── .env                 # Backend environment variables
│
├── frontend/                # Next.js 16 App
│   ├── app/
│   │   ├── page.js          # Landing page
│   │   ├── (auth)/          # Sign-in / Sign-up pages
│   │   └── (main)/
│   │       ├── dashboard/   # Recipe discovery & browsing
│   │       ├── pantry/      # Pantry management & AI scanning
│   │       ├── recipe/      # Individual recipe page
│   │       └── recipes/     # Saved recipes & browse by category/cuisine
│   ├── actions/             # Server actions (recipe, pantry, mealdb)
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities, Arcjet config, user helpers
│   └── .env.local           # Frontend environment variables
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 6.x

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-recipe-platform.git
cd ai-recipe-platform
```

### 2. Backend Setup (Strapi)

```bash
cd backend
npm install
npm install better-sqlite3 --save
```

Create a `.env` file in the `backend/` directory:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=<generate-random-base64-keys>
API_TOKEN_SALT=<generate-random-base64>
ADMIN_JWT_SECRET=<generate-random-base64>
TRANSFER_TOKEN_SALT=<generate-random-base64>
JWT_SECRET=<generate-random-base64>
ENCRYPTION_KEY=<generate-random-base64>
```

> **Tip:** Generate random keys with: `node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"`

Start the backend:

```bash
npm run develop
```

Visit `http://localhost:1337/admin` and create your first admin account.

### 3. Generate Strapi API Token

1. Go to Strapi Admin → **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Set **Token type** to **Full access**
4. Copy the generated token

### 4. Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Strapi Backend
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Arcjet (Rate Limiting & Security)
ARCJET_KEY=your_arcjet_key

# Unsplash (Recipe Images)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

Start the frontend:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 🔑 API Keys Setup

| Service | Where to Get | Required |
|---------|-------------|----------|
| **Clerk** | [clerk.com](https://clerk.com) → Create app → API Keys | ✅ Yes |
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ✅ Yes |
| **Arcjet** | [app.arcjet.com](https://app.arcjet.com) → Create site → SDK Keys | ⚠️ Recommended |
| **Unsplash** | [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) → New App | ⚠️ Optional |
| **Stripe** | Connected via Clerk Commerce for subscriptions | ⚠️ Optional |

## 💳 Subscription Setup (Optional)

To enable the Pro subscription plan:

1. In Clerk Dashboard → **Commerce** → Enable Commerce
2. Connect your **Stripe** account
3. Create a **Plan** with key: `pro`
4. Copy the Plan ID and update it in `frontend/components/PricingSection.jsx`

### Plan Tiers

| Feature | Free (Sous Chef) | Pro (Head Chef) — $7.99/mo |
|---------|:-:|:-:|
| Pantry Scans | 10/month | Unlimited |
| AI Recipes | 5/month | Unlimited |
| Recipe Search | Unlimited | Unlimited |
| Saved Recipes | 3/month | Unlimited |
| Nutritional Analysis | ❌ | ✅ |
| Chef's Tips & Tricks | ❌ | ✅ |
| Ingredient Substitutions | ❌ | ✅ |

## 🧪 Running Both Servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run develop

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Strapi Admin | http://localhost:1337/admin |
| Strapi API | http://localhost:1337/api |

## 👨‍💻 Author

**Ketan Kamboj**
