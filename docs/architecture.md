# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
│                    Next.js 14 App Router                        │
│                      localhost:3000                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  (auth)/     │  │ (dashboard)/ │  │   TanStack Query     │  │
│  │  login       │  │  search      │  │   + Zustand          │  │
│  │  register    │  │  deals       │  │   (client state)     │  │
│  │  callback    │  │  profile     │  └──────────────────────┘  │
│  └──────────────┘  └──────────────┘                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST / Bearer JWT
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS API                                    │
│                   localhost:3001                                 │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ ┌─────────┐ │
│  │   Auth   │ │ Profiles │ │  Search  │ │ Deals │ │ Scoring │ │
│  │  Module  │ │  Module  │ │  Module  │ │Module │ │ Module  │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────┘ └─────────┘ │
│                                                                 │
│  Global: JwtAuthGuard (APP_GUARD) + ValidationPipe              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ TypeORM
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL                                    │
│                   localhost:5432                                 │
│  users │ refresh_tokens │ brand_profiles │ influencer_profiles  │
│  deals │ score_history                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Module Dependency Map

```
AppModule
  ├── ConfigModule (global)
  ├── TypeOrmModule (global)
  ├── AuthModule
  │     ├── User entity
  │     ├── RefreshToken entity
  │     ├── JwtModule
  │     ├── PassportModule
  │     ├── JwtStrategy
  │     └── GoogleStrategy
  ├── ProfilesModule
  │     ├── BrandProfile entity
  │     └── InfluencerProfile entity
  ├── SearchModule
  │     └── InfluencerProfile entity (read-only)
  ├── DealsModule
  │     ├── Deal entity
  │     └── ProfilesModule (for participant lookup)
  └── ScoringModule
        ├── InfluencerProfile entity
        └── ScoreHistory entity
```

## Auth Flow

```
Register:
  POST /auth/register → hash password → save User → generate JWT pair → return tokens

Login:
  POST /auth/login → verify password (bcrypt.compare) → generate JWT pair → return tokens

JWT Access:
  Bearer token in Authorization header
  JwtStrategy validates → attaches User to request
  JwtAuthGuard (global) blocks if missing, passes if @Public()

Refresh:
  POST /auth/refresh → SHA-256 hash lookup in refresh_tokens table
  → delete old token → generate new JWT pair (token rotation)

Google OAuth:
  GET /auth/google → Passport redirects to Google
  GET /auth/google/callback → GoogleStrategy → handleGoogleLogin()
  → upsert User → generate JWT pair → redirect to frontend /auth/callback?tokens
```

## Role-Based Access Matrix

| Action                          | BRAND | INFLUENCER | ADMIN |
|---------------------------------|-------|------------|-------|
| Search influencers              | ✅    | ✅         | ✅    |
| View influencer public profile  | ✅    | ✅         | ✅    |
| Edit own influencer profile     | ❌    | ✅         | ✅    |
| Edit own brand profile          | ✅    | ❌         | ✅    |
| Create deal (send offer)        | ✅    | ❌         | ✅    |
| Accept/reject/counter deal      | ❌    | ✅         | ✅    |
| Complete deal                   | ✅    | ❌         | ✅    |
| Calculate influencer score      | ❌    | ✅ (self)  | ✅    |

## Data Flow: Search Request

```
1. User sets filters in FilterSidebar
2. TanStack Query detects params change → fires GET /influencers?...
3. SearchController receives SearchInfluencersDto (validated by ValidationPipe)
4. SearchService builds TypeORM QueryBuilder:
   - Applies filters conditionally (country, category, platform, followers, price)
   - Platform-aware follower filter (instagramFollowers vs tiktokFollowers vs youtubeSubscribers)
   - sortBy maps to ORDER BY clause
   - Offset pagination (skip/take)
5. getManyAndCount() returns [data, total]
6. Response: { data: InfluencerProfile[], meta: { total, page, limit, totalPages } }
7. Frontend renders InfluencerCard grid
```

## Scoring Algorithm

```
Input: InfluencerProfile stats (followers, avgReach, ER per platform)

Platform benchmarks:
  Instagram: avgER = 3%, reachDivisor = 1,000,000
  TikTok:    avgER = 6%, reachDivisor = 2,000,000
  YouTube:   avgER = 4%, reachDivisor = 1,500,000

reachScore = avg(min(followers / reachDivisor, 1) * 10) across active platforms
engagementScore = avg(min(actualER / avgER, 1) * 10) across platforms with ER data
audienceScore = (number of active platforms / 3) * 10

overallScore = reachScore * 0.4 + engagementScore * 0.4 + audienceScore * 0.2

All scores clamped to [0, 10]

Fraud flags:
  if instagramER > 20%          → SUSPICIOUS
  if followers > 100k AND avgReach/followers < 1% → WARNING
  else                          → VERIFIED
```
