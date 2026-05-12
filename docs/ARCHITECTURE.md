# Architecture and Flows

## 1) Project structure
```
/apps
  /mobile
    App.tsx
    /src
      /components
      /navigation
      /screens
      /i18n
      /services
      /store
      /theme
      /types
  /api
    /src
      /config
      /controllers
      /middleware
      /routes
      /services
      /utils
      /scripts
    /prisma
      schema.prisma
      seed.ts
  /admin
    /src
      App.tsx
      api.ts
      styles.css
```

## 2) Authentication flow
- Guest users browse with no token and receive limited offers.
- Email/password auth:
  - `POST /api/auth/register/customer`
  - `POST /api/auth/register/vendor`
  - `POST /api/auth/login`
- Social auth (real token verification):
  - `POST /api/auth/social`
  - Google: verifies `idToken` against `GOOGLE_CLIENT_IDS`
  - Apple: verifies `idToken` against Apple JWKS and `APPLE_AUDIENCES`
- JWT payload fields: `sub`, `email`, `role`.

## 3) Subscription logic (vendors)
- Price: CHF 10/month (`1000` cents).
- Vendor checkout flow:
  - `POST /api/subscriptions/checkout-session`
  - Stripe Checkout opens subscription payment
- Stripe webhook sync:
  - `POST /api/subscriptions/webhook`
  - updates local subscription status and period end
- Offer publishing guard:
  - `POST /api/offers` returns HTTP `402` when subscription is inactive.

## 4) Push notifications architecture
- Mobile registers Expo push token after login:
  - `POST /api/notifications/devices`
- Backend stores push devices in `PushDevice` table with optional geo coords.
- Trigger types:
  - New nearby offers when admin approves pending offers
  - Expiring offer reminders (scheduled job)
  - Vendor subscription renewal reminders (scheduled job)
- Scheduler:
  - Enabled by `ENABLE_REMINDER_JOBS=true`
  - Cron configured by `REMINDER_CRON` (default hourly)

## 5) Roles and permissions
- `GUEST`: list limited approved offers.
- `CUSTOMER`: download/use coupons, favorites, push notifications.
- `VENDOR`: manage own offers, subscription, dashboard.
- `ADMIN`: moderate offers, view analytics, run reminder jobs.

## 6) Search, location and filters
`GET /api/offers` supports:
- `category`
- `city`
- `lat`, `lng`, `maxDistance` (km)
- `expiringSoon=true`

Distance filtering uses Haversine formula.

## 7) Admin web panel
- Path: `apps/admin`
- Login with admin credentials
- Views:
  - KPI analytics cards
  - Pending offers moderation queue
  - Manual trigger for reminder jobs
