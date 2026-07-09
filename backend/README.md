# 🚀 CodePilot — Backend API

> AI-Powered Competitive Programming & Developer Growth Platform

CodePilot is a platform that aggregates coding activity from Codeforces, LeetCode, GitHub and more, analyzes performance with an AI coach, recommends personalized problems, and builds an automatic developer portfolio for students preparing for placements.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Systems Explained](#systems-explained)
- [Project Structure](#project-structure)

---

## Architecture Overview

```
Client (Frontend)
       │
       ▼
  Express API (Node.js)
       │
  ┌────┴────────────────────────────────────────────────────┐
  │  System 1: Auth + User Profile (JWT, OTP, Cloudinary)   │
  │  System 2: Analytics Engine (CP + GitHub stats)          │
  │  System 3: AI Coach (Gemini Flash + rule-based fallback) │
  │  System 4: Recommendation Engine (Problem Bank)          │
  │  System 5: Developer Portfolio (Public profiles)         │
  │  System 6: Career Readiness Dashboard (Score engine)     │
  └──────────────────────────────────────────────────────────┘
       │
  PostgreSQL (via Prisma ORM)
       │
  External APIs: Codeforces, LeetCode GraphQL, GitHub GraphQL
  Cloud: Cloudinary (avatars), Brevo SMTP (emails)
  AI:   Google Gemini 2.5 Flash
```

---

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Runtime        | Node.js (ESM)                        |
| Framework      | Express 5                            |
| Database       | PostgreSQL                           |
| ORM            | Prisma 6                             |
| Auth           | JWT (access + refresh tokens), OTP   |
| File Uploads   | Multer → Cloudinary                  |
| Email          | Nodemailer + Brevo SMTP              |
| AI             | Google Gemini 2.5 Flash              |
| Cron           | node-cron                            |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Accounts for: Cloudinary, Brevo SMTP, Google AI Studio, GitHub

### Installation

```bash
# 1. Clone the repo
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your real credentials

# 4. Run database migrations
npm run db:migrate

# 5. Seed the problem bank
npm run db:seed

# 6. Start the dev server
npm run dev
```

The server starts at `http://localhost:8000`.

---

## Environment Variables

See [.env.example](.env.example) for a full list with descriptions.

| Variable               | Required | Description                                  |
|------------------------|----------|----------------------------------------------|
| `DATABASE_URL`         | ✅       | PostgreSQL connection string                 |
| `ACCESS_TOKEN_SECRET`  | ✅       | JWT access token signing secret (64+ chars)  |
| `REFRESH_TOKEN_SECRET` | ✅       | JWT refresh token signing secret (64+ chars) |
| `SMTP_HOST`            | ✅       | Brevo SMTP host                              |
| `SMTP_PORT`            | ✅       | Brevo SMTP port (587)                        |
| `SMTP_USER`            | ✅       | Brevo SMTP username                          |
| `SMTP_PASS`            | ✅       | Brevo SMTP password                          |
| `MAIL_FROM`            | ✅       | Sender email address                         |
| `CLOUDINARY_CLOUD_NAME`| ✅       | Cloudinary cloud name                        |
| `CLOUDINARY_API_KEY`   | ✅       | Cloudinary API key                           |
| `CLOUDINARY_API_SECRET`| ✅       | Cloudinary API secret                        |
| `GITHUB_TOKEN`         | ✅       | GitHub Personal Access Token                 |
| `GEMINI_API_KEY`       | ✅       | Google Gemini API key                        |
| `ALLOWED_ORIGINS`      | ❌       | Comma-separated CORS origins (production)    |

> ⚠️ **Security**: Generate strong secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## API Reference

### Base URL: `/api/v1`

### Authentication (`/users`)

| Method | Endpoint                 | Auth | Description                     |
|--------|--------------------------|------|---------------------------------|
| POST   | `/users/register`        | ❌   | Register + send OTP email       |
| POST   | `/users/verify-otp`      | ❌   | Verify OTP → activate account   |
| POST   | `/users/resend-otp`      | ❌   | Resend OTP (rate limited)        |
| POST   | `/users/login`           | ❌   | Login → access + refresh tokens |
| POST   | `/users/refresh-token`   | ❌   | Rotate refresh token            |
| POST   | `/users/logout`          | ✅   | Revoke tokens + clear cookies   |
| GET    | `/users/me`              | ✅   | Get current user                |

### Password & Email

| Method | Endpoint                     | Auth | Description                  |
|--------|------------------------------|------|------------------------------|
| POST   | `/users/forgot-password`     | ❌   | Send password reset OTP      |
| POST   | `/users/reset-password`      | ❌   | Reset password with OTP      |
| POST   | `/users/change-password`     | ✅   | Change password (logged in)  |
| POST   | `/users/change-email`        | ✅   | Request email change OTP     |
| POST   | `/users/verify-email-change` | ✅   | Confirm email change         |

### Profile (`/users/profile`, `/users/info`, `/users/avatar`)

| Method | Endpoint                   | Auth | Description                  |
|--------|----------------------------|------|------------------------------|
| GET    | `/users/profile/:username` | ❌*  | Get public user profile      |
| PUT    | `/users/profile`           | ✅   | Upsert profile fields        |
| PATCH  | `/users/info`              | ✅   | Update fullName / username   |
| PATCH  | `/users/avatar`            | ✅   | Upload avatar to Cloudinary  |
| DELETE | `/users/delete-account`    | ✅   | Permanently delete account   |

> *Optional auth — needed to view own PRIVATE profile

### Portfolio Data (Education, Experience, Achievements, Projects)

| Method | Endpoint                    | Auth | Description               |
|--------|-----------------------------|------|---------------------------|
| POST   | `/users/education`          | ✅   | Add education entry       |
| PATCH  | `/users/education/:id`      | ✅   | Update education entry    |
| DELETE | `/users/education/:id`      | ✅   | Delete education entry    |
| POST   | `/users/experience`         | ✅   | Add experience entry      |
| PATCH  | `/users/experience/:id`     | ✅   | Update experience         |
| DELETE | `/users/experience/:id`     | ✅   | Delete experience         |
| POST   | `/users/achievement`        | ✅   | Add achievement           |
| PATCH  | `/users/achievement/:id`    | ✅   | Update achievement        |
| DELETE | `/users/achievement/:id`    | ✅   | Delete achievement        |
| POST   | `/users/project`            | ✅   | Add project               |
| PATCH  | `/users/project/:id`        | ✅   | Update project            |
| DELETE | `/users/project/:id`        | ✅   | Delete project            |
| PATCH  | `/users/project/reorder`    | ✅   | Reorder projects          |
| PUT    | `/users/social`             | ✅   | Upsert social link        |
| DELETE | `/users/social/:platform`   | ✅   | Delete social link        |

### Platform Sync (`/codingplatforms`)

| Method | Endpoint                         | Auth | Description                          |
|--------|----------------------------------|------|--------------------------------------|
| POST   | `/codingplatforms/sync/platform` | ✅   | Sync LeetCode / Codeforces / GFG     |
| POST   | `/codingplatforms/sync/github`   | ✅   | Sync GitHub stats                    |
| GET    | `/codingplatforms/contests/upcoming` | ❌ | List upcoming contests              |
| POST   | `/codingplatforms/contests/refresh`  | ❌ | Manually refresh contests           |
| GET    | `/codingplatforms/topics`        | ✅   | Get topic stats (filterable)         |
| GET    | `/codingplatforms/activity/github` | ✅ | GitHub contribution heatmap data    |
| GET    | `/codingplatforms/activity/cp`   | ✅   | CP submission heatmap data           |

**Platform sync body:** `{ "platform": "LEETCODE|CODEFORCES|CODECHEF|ATCODER|GEEKSFORGEEKS", "handle": "username" }`

> ⚠️ CodeChef, AtCoder, and GFG sync currently return 503 (no reliable public API available).

### Analytics (`/analytics`)

| Method | Endpoint                   | Auth | Description                             |
|--------|----------------------------|------|-----------------------------------------|
| GET    | `/analytics/dashboard`     | ✅   | Summary dashboard data                  |
| GET    | `/analytics/rating`        | ✅   | Rating history and growth per platform  |
| GET    | `/analytics/contests`      | ✅   | Contest participation analytics         |
| GET    | `/analytics/topics`        | ✅   | Topic-level strength/weakness scores    |
| GET    | `/analytics/difficulty`    | ✅   | Easy/Medium/Hard distribution           |
| GET    | `/analytics/progress`      | ✅   | Streaks, consistency, trajectories      |

### AI Coach (`/ai`)

| Method | Endpoint              | Auth | Cache    | Description                      |
|--------|-----------------------|------|----------|----------------------------------|
| GET    | `/ai/summary`         | ✅   | 12 hrs   | Daily coaching insight           |
| GET    | `/ai/weekly`          | ✅   | 3 days   | Weekly performance report        |
| GET    | `/ai/monthly`         | ✅   | 7 days   | Monthly deep-dive report         |
| GET    | `/ai/study-plan`      | ✅   | 48 hrs   | Personalized study plan          |
| GET    | `/ai/contest-review`  | ✅   | 24 hrs   | Contest performance review       |
| GET    | `/ai/history`         | ✅   | —        | Past insights history            |

Add `?refresh=true` to force regeneration instead of serving cached insights.

> Gemini 2.5 Flash is used when available; falls back to rule-based insights automatically.

### Recommendations (`/recommendations`)

| Method | Endpoint                   | Auth | Description                         |
|--------|----------------------------|------|-------------------------------------|
| GET    | `/recommendations`         | ✅   | Personalized problem list           |
| GET    | `/recommendations/topics`  | ✅   | Topic-grouped recommendations       |
| GET    | `/recommendations/daily`   | ✅   | 3-problem daily practice set        |

### Portfolio (`/portfolio`)

| Method | Endpoint               | Auth | Description                         |
|--------|------------------------|------|-------------------------------------|
| GET    | `/portfolio/:username` | ❌*  | Full public portfolio in one call   |

### Career Readiness (`/careerreadiness`)

| Method | Endpoint                          | Auth | Description                           |
|--------|-----------------------------------|------|---------------------------------------|
| GET    | `/careerreadiness/career/readiness`         | ✅ | Current career readiness score   |
| GET    | `/careerreadiness/career/readiness/history` | ✅ | Score history over time           |

Add `?refresh=true` to force score recomputation.

---

## Database Schema

Key models in the Prisma schema:

| Model                    | Purpose                                          |
|--------------------------|--------------------------------------------------|
| `User`                   | Identity, auth, relationships                    |
| `UserProfile`            | Handles, bio, avatar, visibility settings         |
| `CodingPlatformStats`    | Aggregate stats per platform (rating, solved, …) |
| `ContestHistory`         | Per-contest rating history (powers graphs)       |
| `TopicStats`             | Problems solved per topic per platform           |
| `CPDailyActivity`        | Submission heatmap data                          |
| `GitHubStats`            | Aggregate GitHub stats                           |
| `GitHubDailyActivity`    | Contribution calendar data                       |
| `Problem`                | Curated problem bank (seeded)                    |
| `AICoachInsight`         | Cached AI coaching insights                      |
| `CareerReadinessSnapshot`| Cached career readiness scores                   |
| `OTP`                    | Short-lived OTP codes for email verification     |
| `RefreshToken`           | Stored refresh tokens (hashed)                   |

---

## Systems Explained

### System 1 — Unified Coding Profile
- Users register with email + OTP verification
- Connect coding platform handles (LeetCode, Codeforces, GitHub, etc.)
- OAuth-ready schema (Google provider supported)
- Profile visibility: PUBLIC / PRIVATE

### System 2 — Analytics Engine
- Pure computation — no AI, fast
- Aggregates data already synced to DB
- Provides: rating history, topic analysis, difficulty breakdown, streak data, consistency score

### System 3 — AI Coach
- Uses Gemini 2.5 Flash for personalized insights
- Falls back to rule-based coaching if Gemini is unavailable
- 5 insight types: DAILY, WEEKLY, MONTHLY, STUDY_PLAN, CONTEST_REVIEW
- Results are cached in DB to avoid redundant AI calls

### System 4 — Recommendation Engine
- Uses the seeded Problem Bank (~40 curated problems)
- Identifies user's 5 weakest topics from TopicStats
- Determines difficulty level from CP ratings (EASY/MEDIUM/HARD)
- Returns topic-grouped recommendations with 3-level fallback

### System 5 — Developer Portfolio
- Public URL: `/api/v1/portfolio/:username`
- Returns everything for a full portfolio page in one API call
- Respects PRIVATE visibility setting
- Tracks profile views (only for external visitors)

### System 6 — Career Readiness Dashboard
- Computes 3 subscores (DSA, Development, Portfolio) → weighted composite
- DSA Score (40%): problems solved, difficulty, topic coverage, contest participation, rating
- Development Score (30%): GitHub contributions, repos, streaks, commits + PRs, projects
- Portfolio Score (30%): avatar, bio, country, education, social links, projects, achievements
- Results cached for 24hrs; `?refresh=true` to recompute

---

## Project Structure

```
backend/
├── server.js                    # Entry point (loads .env, starts server)
├── prisma.config.ts             # Prisma CLI config
├── scripts/
│   └── seedProblems.js          # Seeds Problem Bank with curated problems
├── prisma/
│   ├── schema.prisma            # Full database schema
│   └── migrations/              # Prisma migration history
└── src/
    ├── app.js                   # Express app setup (CORS, routes, cron)
    ├── config/
    │   ├── prisma.ts            # Prisma client singleton
    │   └── cloudinary.js        # Cloudinary upload helper
    ├── controllers/             # Route handlers (thin, delegate to services)
    │   ├── user.controller.js
    │   ├── sync.controller.js
    │   ├── analytics.controller.js
    │   ├── ai.controller.js
    │   ├── recommendation.controller.js
    │   ├── portfolio.controller.js
    │   └── careerreadiness.controller.js
    ├── services/                # Business logic
    │   ├── platformSync.service.js  # External API fetchers
    │   ├── analytics.service.js     # System 2 computations
    │   ├── aiCoach.service.js       # System 3 Gemini integration
    │   ├── recommendation.service.js # System 4 recommendation logic
    │   ├── careerreadiness.service.js # System 6 score computation
    │   └── email.service.js         # Nodemailer email sender
    ├── repositories/            # Data access layer (thin Prisma wrappers)
    │   ├── analytics.repository.js
    │   ├── aiCoach.repository.js
    │   └── recommendation.repository.js
    ├── routes/                  # Express router definitions
    │   ├── user.routes.js
    │   ├── sync.routes.js
    │   ├── analytics.routes.js
    │   ├── ai.routes.js
    │   ├── recommendation.routes.js
    │   ├── portfolio.routes.js
    │   └── careerreadiness.routes.js
    ├── middlewares/
    │   ├── auth.middleware.js       # JWT verification
    │   ├── error.middleware.js      # Global error handler
    │   ├── multer.middleware.js     # File upload handling
    │   └── rateLimiter.middleware.js # In-memory rate limiting
    └── utils/
        ├── ApiError.js             # Custom error class
        ├── ApiResponse.js          # Consistent response wrapper
        ├── asyncHandler.js         # Async error wrapper
        ├── generateOtp.js          # Cryptographic OTP generation
        ├── token.js                # JWT generation helpers
        ├── analyticsHelpers.js     # Pure computation helpers
        └── coachHelpers.js         # AI prompt builders + rule-based insights
```

---

## NPM Scripts

```bash
npm run dev              # Start development server (nodemon)
npm run start            # Start production server
npm run db:migrate       # Run Prisma migrations (dev)
npm run db:migrate:deploy # Run Prisma migrations (production)
npm run db:seed          # Seed the problem bank
npm run db:studio        # Open Prisma Studio (visual DB browser)
npm run db:generate      # Regenerate Prisma client
```

---

## Security Features

- **JWT tokens**: Short-lived access (1d) + rotating refresh tokens (7d)
- **OTP**: Cryptographically secure 6-digit codes via `crypto.randomInt()`
- **Rate limiting**: Auth endpoints (20/15min), OTP resend (5/hr), sync (10/5min)
- **CORS**: Whitelist-based in production
- **Password hashing**: bcrypt with salt rounds 10
- **Prisma errors**: Translated to safe user-facing messages
- **Profile privacy**: PRIVATE profiles blocked for non-owners

---

*Built by Vrushabh Kathiriya — CodePilot v1.0*
