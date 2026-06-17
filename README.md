# Influencer Marketplace Platform

A production-grade B2B platform connecting **Brands** with **Influencers**. Data-dense, minimal UI — closer to Linear than Instagram. Brands discover creators by stats and scores, send deal offers, and manage collaborations end-to-end.

## Architecture

```
/
├── apps/
│   ├── api/      NestJS REST API (localhost:3001)
│   └── web/      Next.js 14 App Router (localhost:3000)
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── database.md
└── README.md

┌──────────────────────┐         ┌──────────────────────┐
│   Next.js (web)      │  REST   │   NestJS (api)       │
│   TanStack Query     │ ──────► │   Passport JWT       │
│   next-auth v5       │         │   TypeORM            │
│   shadcn/ui          │         │   Swagger docs       │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                                 ┌──────────▼───────────┐
                                 │   PostgreSQL          │
                                 │   localhost:5432      │
                                 └──────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- npm 9+

### 1. Clone & Install

```bash
git clone <repo-url>
cd influencer-marketplace
npm install          # installs concurrently
npm run install:all  # installs both apps
```

### 2. Configure Environment

**Backend:**
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — set DB credentials, JWT secrets, Google OAuth keys
```

**Frontend:**
```bash
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local — set NEXTAUTH_SECRET, Google OAuth keys
```

### 3. Create Database

```bash
psql -U postgres -c "CREATE DATABASE influencer_marketplace;"
```

The API uses `synchronize: true` in development — tables are auto-created on first run.

### 4. Run

```bash
npm run dev           # starts both api (3001) and web (3000) concurrently
# or separately:
npm run dev:api       # NestJS on port 3001
npm run dev:web       # Next.js on port 3000
```

### 5. Open

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend app |
| http://localhost:3001/api/docs | Swagger API docs |

## Module Overview

| Module | Backend | Frontend |
|--------|---------|----------|
| **Auth** | JWT + refresh tokens, Google OAuth, global guard | Login/register pages, next-auth session |
| **Profiles** | Brand + Influencer CRUD | Edit profile, public view pages |
| **Search** | TypeORM QueryBuilder with filters | Discovery page with filter sidebar |
| **Deals** | Full status machine (7 states) | List, detail, new offer wizard |
| **Scoring** | Deterministic formula + fraud detection | Score badges on all cards/profiles |

## API

Base URL: `http://localhost:3001`

All protected endpoints require: `Authorization: Bearer <access_token>`

See [docs/api.md](docs/api.md) for full endpoint reference.

## Database

PostgreSQL with TypeORM. 6 tables: `users`, `refresh_tokens`, `brand_profiles`, `influencer_profiles`, `deals`, `score_history`.

See [docs/database.md](docs/database.md) for full schema and index strategy.

## Folder Structure

```
apps/api/src/
  auth/               JWT, Google OAuth, guards, decorators
  profiles/           Brand + Influencer profile CRUD
  search/             Filtered influencer search
  deals/              Deal lifecycle management
  scoring/            AI scoring algorithm + history
  common/entities/    Shared User + RefreshToken entities

apps/web/app/
  (auth)/             Login, register pages (no dashboard chrome)
  (dashboard)/        Search, deals, profile pages (with sidebar)
  api/auth/           next-auth route handler

apps/web/components/
  ui/                 shadcn/ui (base-ui v4)
  shared/             InfluencerCard, ScoreBadge, FilterSidebar, DealStatusBadge
  layout/             Sidebar, Topbar

apps/web/lib/
  api/                Typed fetch wrappers (auth, influencers, brands, deals)
  utils/              Price/follower/ER formatters
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 14 App Router |
| UI components | shadcn/ui (base-ui v4) |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Auth (frontend) | next-auth v5 |
| Backend framework | NestJS |
| ORM | TypeORM |
| Database | PostgreSQL |
| Auth (backend) | Passport JWT + Google OAuth |
| API docs | Swagger / OpenAPI |
