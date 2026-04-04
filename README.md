# Servd - AI Recipe Platform

An intelligent recipe platform that turns your leftover ingredients into gourmet meals using AI. Snap a photo of your pantry, and Servd will identify your ingredients and generate personalized recipes with nutritional info, cooking tips, and beautiful images.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?logo=clerk)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange?logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?logo=tailwindcss)

## Features

- **AI Pantry Scanner** - Upload a photo of your fridge/pantry and let Google Gemini Vision identify ingredients automatically
- **AI Recipe Generation** - Get personalized recipe suggestions based on your available ingredients
- **Global Recipe Discovery** - Browse thousands of recipes by cuisine, category, or search
- **Digital Cookbook** - Save your favorite recipes to a personal collection
- **PDF Export** - Download any recipe as a beautifully formatted PDF
- **Authentication** - Secure sign-in/sign-up powered by Clerk
- **Subscription Plans** - Free tier with limits + Pro tier with unlimited access via Clerk Commerce & Stripe
- **Rate Limiting & Security** - Arcjet-powered WAF, bot detection, and per-user rate limiting
- **Responsive Design** - Works great on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16, React 19 |
| **Styling** | Tailwind CSS 4 |
| **Database** | MongoDB (Mongoose ODM) |
| **AI** | Google Gemini API (text + vision) |
| **Auth** | Clerk (with Commerce/Billing) |
| **Images** | Unsplash API |
| **Security** | Arcjet (WAF, bot detection, rate limiting) |
| **UI Components** | Radix UI, Lucide Icons, shadcn/ui |

## Project Structure

```
ai-recipe-platform/
├── app/
│   ├── api/                 # API Routes (serverless functions)
│   │   ├── users/           # User CRUD endpoints
│   │   ├── recipes/         # Recipe CRUD endpoints
│   │   ├── pantry-items/    # Pantry CRUD endpoints
│   │   ├── saved-recipes/   # Saved recipes endpoints
│   │   └── webhooks/        # Clerk webhooks
│   ├── (auth)/              # Sign-in / Sign-up pages
│   └── (main)/              # Main app pages
│       ├── dashboard/       # Recipe discovery & browsing
│       ├── pantry/          # Pantry management & AI scanning
│       ├── recipe/          # Individual recipe page
│       └── recipes/         # Saved recipes & browse
├── actions/                 # Server actions (recipe, pantry, mealdb)
├── components/              # Reusable UI components
├── lib/
│   ├── db/                  # Database connection & models
│   │   ├── mongodb.js       # MongoDB connection with caching
│   │   └── models/          # Mongoose schemas
│   └── ...                  # Utilities, Arcjet config, etc.
├── public/                  # Static assets
├── .env.local               # Environment variables
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 6.x
- **MongoDB** (local or MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-recipe-platform.git
cd ai-recipe-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/recipe-platform

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Arcjet (Rate Limiting & Security)
ARCJET_KEY=your_arcjet_key

# Unsplash (Recipe Images)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## API Keys Setup

| Service | Where to Get | Required |
|---------|-------------|----------|
| **Clerk** | [clerk.com](https://clerk.com) - Create app - API Keys | Yes |
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Yes |
| **MongoDB** | [mongodb.com/atlas](https://mongodb.com/atlas) or local install | Yes |
| **Arcjet** | [app.arcjet.com](https://app.arcjet.com) - Create site - SDK Keys | Recommended |
| **Unsplash** | [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) - New App | Optional |
| **Stripe** | Connected via Clerk Commerce for subscriptions | Optional |

## Clerk Webhook Setup

To sync user deletions between Clerk and your database:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) - **Webhooks**
2. Click **Add Endpoint**
3. Enter URL: `https://your-domain.vercel.app/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the **Signing Secret** and add it as `CLERK_WEBHOOK_SECRET` in your environment

## Subscription Setup (Optional)

To enable the Pro subscription plan:

1. In Clerk Dashboard - **Commerce** - Enable Commerce
2. Connect your **Stripe** account
3. Create a **Plan** with key: `pro`
4. Copy the Plan ID and update it in `frontend/components/PricingSection.jsx`

### Plan Tiers

| Feature | Free (Sous Chef) | Pro (Head Chef) - $7.99/mo |
|---------|:-:|:-:|
| Pantry Scans | 10/month | Unlimited |
| AI Recipes | 5/month | Unlimited |
| Recipe Search | Unlimited | Unlimited |
| Saved Recipes | 3/month | Unlimited |
| Nutritional Analysis | No | Yes |
| Chef's Tips & Tricks | No | Yes |
| Ingredient Substitutions | No | Yes |

## Deployment (Vercel)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-recipe-platform)

### Manual Deploy

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Add all environment variables in Vercel dashboard
3. Deploy

**Note:** Make sure to use MongoDB Atlas for production (not localhost).

## Author

**Ketan Kamboj**
