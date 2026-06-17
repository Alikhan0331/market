# API Reference

## Base URL

```
http://localhost:3001
```

## Authentication

All protected endpoints require a Bearer JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Auth

### POST /auth/register

Register with email & password.

**Public** — no auth required.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "role": "BRAND" | "INFLUENCER"
}
```

**Response 201:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "uuid-v4",
  "user": { "id": "uuid", "email": "...", "role": "BRAND", "isVerified": false }
}
```

**Errors:** `409 Conflict` — email already registered

---

### POST /auth/login

**Public**

**Request Body:**
```json
{ "email": "...", "password": "..." }
```

**Response 200:** Same as register.

**Errors:** `401 Unauthorized` — invalid credentials

---

### POST /auth/refresh

Rotate refresh token (old token is invalidated).

**Public**

**Request Body:**
```json
{ "refreshToken": "uuid-v4" }
```

**Response 200:** New token pair.

**Errors:** `401 Unauthorized` — invalid or expired token

---

### POST /auth/logout

Invalidates all refresh tokens for the current user.

**Auth required**

**Response 204** No Content

---

### GET /auth/google

Redirects to Google OAuth. **Public**

---

### GET /auth/google/callback

OAuth callback. Issues JWT and redirects to:
```
{FRONTEND_URL}/auth/callback?access_token=...&refresh_token=...
```

---

## Brands

### POST /brands/profile

Create brand profile. **Role: BRAND**

**Request Body:** `CreateBrandDto`
```json
{
  "companyName": "Acme Corp",
  "industry": "Fashion",
  "country": "US",
  "website": "https://acme.com",
  "city": "New York"
}
```

**Response 201:** `BrandProfile`

---

### GET /brands/me

Get own brand profile. **Role: BRAND**

**Response 200:** `BrandProfile`

---

### PUT /brands/me

Update own brand profile. **Role: BRAND**

**Request Body:** Partial `BrandProfile` fields

---

### GET /brands/:id

Get brand by ID. **Auth required, public view**

---

## Influencers

### POST /influencers/profile

Create influencer profile. **Role: INFLUENCER**

**Request Body:** `CreateInfluencerDto`
```json
{
  "displayName": "Jane Doe",
  "country": "US",
  "categories": ["Fashion", "Beauty"],
  "instagramHandle": "janedoe",
  "instagramFollowers": 150000,
  "instagramER": 0.045
}
```

---

### GET /influencers/me

Get own profile. **Role: INFLUENCER**

---

### PUT /influencers/me

Update own profile. **Role: INFLUENCER**

---

### GET /influencers/:id

Public influencer profile. **Auth required**

---

## Search

### GET /influencers

Search and filter influencers. **Auth required**

**Query Parameters:**

| Param         | Type    | Description                              |
|---------------|---------|------------------------------------------|
| country       | string  | Filter by country                        |
| city          | string  | Filter by city (partial match)           |
| category      | string  | Filter by single category                |
| minFollowers  | number  | Minimum followers                        |
| maxFollowers  | number  | Maximum followers                        |
| minPrice      | number  | Min price (USD cents)                    |
| maxPrice      | number  | Max price (USD cents)                    |
| minER         | number  | Minimum engagement rate (decimal)        |
| platform      | string  | `instagram` \| `tiktok` \| `youtube`    |
| sortBy        | string  | `score` \| `followers` \| `price` \| `er` |
| sortOrder     | string  | `asc` \| `desc` (default: `desc`)       |
| page          | number  | Page number (default: 1)                 |
| limit         | number  | Per page, max 50 (default: 20)           |

**Response 200:**
```json
{
  "data": [InfluencerProfile],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Deals

### POST /deals

Brand sends offer to influencer. **Role: BRAND**

**Request Body:**
```json
{
  "influencerId": "uuid",
  "budget": 50000,
  "format": "REEL",
  "description": "...",
  "deadline": "2026-08-01"
}
```

**Formats:** `STORY` | `REEL` | `POST` | `VIDEO` | `INTEGRATION`

**Response 201:** `Deal`

---

### GET /deals

List own deals (filtered by role). **Auth required**

**Response 200:** `Deal[]`

---

### GET /deals/:id

Deal detail. **Auth required, participants only**

---

### PATCH /deals/:id/accept

Influencer accepts deal. **Role: INFLUENCER**

Valid when status is `PENDING` or `COUNTERED`.

---

### PATCH /deals/:id/reject

Influencer rejects. **Role: INFLUENCER**

---

### PATCH /deals/:id/counter

Influencer counters with different budget. **Role: INFLUENCER**

**Request Body:**
```json
{ "counterBudget": 75000, "counterNote": "Need a higher rate" }
```

---

### PATCH /deals/:id/complete

Brand marks deal completed. **Role: BRAND**

---

### PATCH /deals/:id/cancel

Cancel deal (brand or influencer). **Auth required**

---

## Scoring

### POST /scoring/calculate/:influencerId

Recalculate scores and update `InfluencerProfile`. **Auth required**

**Response 200:**
```json
{
  "reachScore": 7.5,
  "engagementScore": 6.8,
  "audienceScore": 6.7,
  "overallScore": 7.0,
  "verificationStatus": "VERIFIED"
}
```

---

### GET /scoring/history/:influencerId

Score history (last 20 entries). **Auth required**

---

## Swagger UI

Available at: `http://localhost:3001/api/docs`
