# Servd - AI Recipe Platform

An intelligent recipe platform that turns your leftover ingredients into gourmet meals using AI. Snap a photo of your pantry, and Servd will identify your ingredients and generate personalized recipes with nutritional info, cooking tips, and beautiful images.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4-green?logo=express)
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
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Express.js, Node.js |
| **Database** | MongoDB (Mongoose ODM) |
| **AI** | Google Gemini API (text + vision) |
| **Auth** | Clerk (with Commerce/Billing) |
| **Images** | Unsplash API |
| **Security** | Arcjet (WAF, bot detection, rate limiting) |
| **UI Components** | Radix UI, Lucide Icons, shadcn/ui |

## Project Structure

```
ai-recipe-platform/
├── backend/                 # Express.js API Server
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Recipe.js
│   │   │   ├── PantryItem.js
│   │   │   └── SavedRecipe.js
│   │   ├── routes/          # API routes
│   │   └── server.js        # Express app entry
│   └── .env                 # Backend environment variables
│
├── frontend/                # Next.js 16 App
│   ├── app/
│   │   ├── page.js          # Landing page
│   │   ├── (auth)/          # Sign-in / Sign-up pages
│   │   ├── (main)/
│   │   │   ├── dashboard/   # Recipe discovery & browsing
│   │   │   ├── pantry/      # Pantry management & AI scanning
│   │   │   ├── recipe/      # Individual recipe page
│   │   │   └── recipes/     # Saved recipes & browse by category/cuisine
│   │   └── api/webhooks/    # Clerk webhooks
│   ├── actions/             # Server actions (recipe, pantry, mealdb)
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities, Arcjet config, user helpers
│   └── .env.local           # Frontend environment variables
│
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

### 2. Backend Setup (Express.js)

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-platform
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

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
3. Enter URL: `https://your-domain.com/api/webhooks/clerk`
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

## Running Both Servers

Open two terminals:

```bash
# Terminal 1 - Backend
cd node-backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Railway/Render)

1. Connect your GitHub repo to [Railway](https://railway.app) or [Render](https://render.com)
2. Set root directory to `backend`
3. Add environment variables
4. Deploy

## Author

**Ketan Kamboj**
