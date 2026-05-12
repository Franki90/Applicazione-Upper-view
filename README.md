# Ticino Marketplace Platform

Mobile-first marketplace app for Ticino (Switzerland), connecting customers and local vendors.

## Tech stack
- Mobile: React Native + Expo + TypeScript
- Backend: Node.js + Express + Prisma + PostgreSQL
- Admin panel: React + Vite
- Auth: JWT + Google/Apple social identity tokens
- Payments: Stripe subscriptions (vendors)
- Notifications: Expo push tokens + backend scheduled reminders
- i18n: Italian, English, German, French, Spanish

## Project structure
```
ticino-marketplace-platform/
  apps/
    mobile/      # Expo mobile app
    api/         # Express REST API
    admin/       # Web admin panel for moderation and analytics
  docs/
```

## Quick start
1. Backend setup
   - `cd apps/api`
   - `npm install`
   - `copy .env.example .env`
   - configure Stripe, Google/Apple, and Expo env values
   - `npx prisma migrate dev`
   - `npm run seed`
   - `npm run dev`

2. Mobile setup
   - `cd apps/mobile`
   - `npm install`
   - `copy .env.example .env`
   - set `EXPO_PUBLIC_API_URL` and Google client IDs
   - `npm run start`

3. Admin web panel
   - `cd apps/admin`
   - `npm install`
   - `copy .env.example .env`
   - `npm run dev`
   - open `http://localhost:5174`

## Core capabilities included
- Role support: Guest, Customer, Vendor, Admin
- Guest restrictions (limited offers, no coupon download)
- Customer features (favorites, coupons, push-ready profile)
- Global category catalog with 14 sectors and multi-language labels
- Customer onboarding for preferred categories (personalized feed)
- Vendor category selection at registration and profile level
- Category-based matching and filtering (`/api/offers?categories=...`)
- Vendor onboarding with business profile, logo upload, and custom brand palette
- Vendor dashboard with profile completion, subscription state, and analytics
- Multi-step offer creation flow (basic info, included items, validity, coupon builder, preview)
- Coupon builder (generated/uploaded) with live preview and vendor branding defaults
- Offer publishing gated by completed profile + active subscription + coupon presence
- Stripe checkout + webhook subscription sync
- Real social auth endpoint (`/api/auth/social`) with Google/Apple token verification
- Push notification device registration endpoint + reminder scheduler
- Admin moderation with analytics and manual reminder-run trigger

## Default seed accounts
- Admin: `admin@ticino.market` / `Pass12345`
- Customer: `customer@ticino.market` / `Pass12345`
- Vendor: `vendor@ticino.market` / `Pass12345`

## Notes
- Configure `EXPO_ACCESS_TOKEN` in backend env for production-grade push delivery.
- Stripe webhooks must point to `/api/subscriptions/webhook` with raw body enabled.
- Reminder jobs run with cron (`REMINDER_CRON`) when `ENABLE_REMINDER_JOBS=true`.
- Vendor subscription is `CHF 25/month` and only `ACTIVE` vendors can publish offers.
- Backoffice local URL: `http://127.0.0.1:5174` (or `http://localhost:5174`).
