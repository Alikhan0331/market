# Database Schema

## ER Diagram

```
users
  id (PK, uuid)
  email (unique)
  password (nullable)
  role (enum: BRAND|INFLUENCER|ADMIN)
  googleId (nullable)
  isVerified
  createdAt
  updatedAt
    │
    ├──< refresh_tokens (userId FK → users.id, CASCADE DELETE)
    │       id (PK, uuid)
    │       token (SHA-256 hash)
    │       userId (FK)
    │       expiresAt
    │       createdAt
    │
    ├──< brand_profiles (userId FK → users.id, unique, CASCADE DELETE)
    │       id (PK, uuid)
    │       userId (FK, unique)
    │       companyName
    │       website (nullable)
    │       industry
    │       description (nullable)
    │       logoUrl (nullable)
    │       country
    │       city (nullable)
    │       createdAt
    │       updatedAt
    │         │
    │         └──< deals (brandId FK → brand_profiles.id)
    │
    └──< influencer_profiles (userId FK → users.id, unique, CASCADE DELETE)
            id (PK, uuid)
            userId (FK, unique)
            displayName
            bio (nullable)
            avatarUrl (nullable)
            country
            city (nullable)
            categories (simple-array)
            languages (nullable, simple-array)
            priceFrom (nullable, cents)
            priceTo (nullable, cents)
            --- Instagram ---
            instagramHandle (nullable)
            instagramFollowers (default 0)
            instagramER (decimal 5,2, default 0)
            instagramAvgReach (default 0)
            --- TikTok ---
            tiktokHandle (nullable)
            tiktokFollowers (default 0)
            tiktokAvgViews (default 0)
            --- YouTube ---
            youtubeHandle (nullable)
            youtubeSubscribers (default 0)
            youtubeAvgViews (default 0)
            --- AI Scores ---
            reachScore (decimal 4,2, nullable)
            engagementScore (decimal 4,2, nullable)
            audienceScore (decimal 4,2, nullable)
            overallScore (decimal 4,2, nullable)
            verificationStatus (enum: UNVERIFIED|VERIFIED|WARNING|SUSPICIOUS)
            createdAt
            updatedAt
              │
              ├──< deals (influencerId FK → influencer_profiles.id)
              └──< score_history (influencerId FK → influencer_profiles.id)

deals
  id (PK, uuid)
  brandId (FK → brand_profiles.id)
  influencerId (FK → influencer_profiles.id)
  status (enum: PENDING|ACCEPTED|REJECTED|COUNTERED|ACTIVE|COMPLETED|CANCELLED)
  budget (integer, cents)
  format (enum: STORY|REEL|POST|VIDEO|INTEGRATION)
  description (text)
  deadline (date)
  counterBudget (nullable, cents)
  counterNote (nullable, text)
  createdAt
  updatedAt

score_history
  id (PK, uuid)
  influencerId (FK → influencer_profiles.id, CASCADE DELETE)
  reachScore (decimal 4,2)
  engagementScore (decimal 4,2)
  overallScore (decimal 4,2)
  calculatedAt (timestamp)
```

## All Tables

### `users`
| Column      | Type                               | Constraints         |
|-------------|------------------------------------|---------------------|
| id          | uuid                               | PK, default gen     |
| email       | varchar                            | UNIQUE, NOT NULL    |
| password    | varchar                            | nullable            |
| role        | enum(BRAND,INFLUENCER,ADMIN)       | NOT NULL, default INFLUENCER |
| googleId    | varchar                            | nullable            |
| isVerified  | boolean                            | default false       |
| createdAt   | timestamp                          | auto                |
| updatedAt   | timestamp                          | auto                |

### `refresh_tokens`
| Column    | Type    | Constraints              |
|-----------|---------|--------------------------|
| id        | uuid    | PK                       |
| token     | varchar | NOT NULL (SHA-256 hash)  |
| userId    | uuid    | FK → users.id, CASCADE   |
| expiresAt | timestamp | NOT NULL               |
| createdAt | timestamp | auto                   |

### `brand_profiles`
| Column      | Type    | Constraints                  |
|-------------|---------|------------------------------|
| id          | uuid    | PK                           |
| userId      | uuid    | FK → users.id, UNIQUE        |
| companyName | varchar | NOT NULL                     |
| website     | varchar | nullable                     |
| industry    | varchar | NOT NULL                     |
| description | text    | nullable                     |
| logoUrl     | varchar | nullable                     |
| country     | varchar | NOT NULL                     |
| city        | varchar | nullable                     |
| createdAt   | timestamp | auto                       |
| updatedAt   | timestamp | auto                       |

### `influencer_profiles`
(See ER diagram above for full column list)

### `deals`
| Column        | Type                                  | Constraints            |
|---------------|---------------------------------------|------------------------|
| id            | uuid                                  | PK                     |
| brandId       | uuid                                  | FK → brand_profiles    |
| influencerId  | uuid                                  | FK → influencer_profiles |
| status        | enum(PENDING…CANCELLED)              | NOT NULL               |
| budget        | integer                               | NOT NULL (cents)       |
| format        | enum(STORY,REEL,POST,VIDEO,INTEGRATION) | NOT NULL             |
| description   | text                                  | NOT NULL               |
| deadline      | date                                  | NOT NULL               |
| counterBudget | integer                               | nullable               |
| counterNote   | text                                  | nullable               |
| createdAt     | timestamp                             | auto                   |
| updatedAt     | timestamp                             | auto                   |

### `score_history`
| Column          | Type           | Constraints                  |
|-----------------|----------------|------------------------------|
| id              | uuid           | PK                           |
| influencerId    | uuid           | FK → influencer_profiles, CASCADE |
| reachScore      | decimal(4,2)   | NOT NULL                     |
| engagementScore | decimal(4,2)   | NOT NULL                     |
| overallScore    | decimal(4,2)   | NOT NULL                     |
| calculatedAt    | timestamp      | auto                         |

## Index Strategy

```sql
-- High-cardinality lookups (PK / FK — already indexed by DB)
-- Additional recommended indexes:

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens("userId");
CREATE INDEX idx_brand_profiles_user ON brand_profiles("userId");
CREATE INDEX idx_influencer_profiles_user ON influencer_profiles("userId");
CREATE INDEX idx_influencer_profiles_country ON influencer_profiles(country);
CREATE INDEX idx_influencer_profiles_score ON influencer_profiles("overallScore" DESC NULLS LAST);
CREATE INDEX idx_deals_brand ON deals("brandId");
CREATE INDEX idx_deals_influencer ON deals("influencerId");
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_score_history_influencer ON score_history("influencerId", "calculatedAt" DESC);
```

## Notes

- All monetary values stored as **integers in USD cents** to avoid float precision issues.
- `categories` and `languages` use TypeORM `simple-array` (comma-separated varchar). For scale, migrate to a junction table.
- `synchronize: true` in development (auto-creates/alters tables). Set `synchronize: false` in production and use TypeORM migrations.
- `simple-array` columns use `LIKE %value%` for filtering, which is not index-friendly. At scale, add a separate normalized `influencer_categories` table.
