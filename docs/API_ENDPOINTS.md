# API Endpoints

## Auth
- `POST /api/auth/register/customer`
- `POST /api/auth/register/vendor`
- `POST /api/auth/login`
- `POST /api/auth/social` (Google/Apple token verification)

## Vendor Profile
- `POST /api/vendors/profile`
- `GET /api/vendors/profile/:vendorId`
- `PUT /api/vendors/profile/:vendorId`
- `POST /api/vendors/logo-upload`
- `POST /api/vendors/categories`
- `PUT /api/vendors/categories`
- `GET /api/vendors/dashboard`

## Categories
- `GET /api/categories`

## User Preferences
- `POST /api/users/preferences`
- `GET /api/users/preferences`

## Subscriptions
- `POST /api/subscriptions/create-checkout-session`
- `POST /api/subscriptions/checkout-session` (backward-compatible alias)
- `GET /api/subscriptions/status/:vendorId`
- `POST /api/subscriptions/webhook` (Stripe raw webhook)

## Offers
- `GET /api/offers`
- `GET /api/offers?categories=food_restaurants,events_leisure`
- `GET /api/offers/:offerId`
- `POST /api/offers` (vendor draft creation)
- `PUT /api/offers/:offerId` (vendor draft update)
- `PATCH /api/offers/:offerId` (backward-compatible update)
- `DELETE /api/offers/:offerId`
- `POST /api/offers/:offerId/publish` (requires completed profile + active subscription + coupon)

## Coupons
- `POST /api/coupons/generate`
- `POST /api/coupons/upload`
- `GET /api/coupons/:couponId`
- `POST /api/coupons/:couponId/download`
- `POST /api/coupons/:couponId/mark-used`

## Notifications
- `POST /api/notifications/devices`
- `DELETE /api/notifications/devices/:expoPushToken`
- `POST /api/notifications/test`
- `POST /api/notifications/run-reminders` (admin)

## Admin
- `GET /api/admin/offers/pending`
- `PATCH /api/admin/offers/:id/moderate`
- `GET /api/admin/analytics`
