# Kiln & Kettle API

Express + MongoDB (Mongoose) REST API for a café: menu, orders, reservations, coupons, contact, settings, and an admin API.

## Setup
```bash
cd server && npm install
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET (32+ chars), CLIENT_URL
npm run seed              # creates settings, 12 dishes, 2 coupons, and the first admin
npm run dev               # http://localhost:5000/api/health
npm test                  # business-logic tests (no database needed)
```
**First admin:** set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ chars) in `.env`, then run `npm run seed`. There is no public admin registration; registration always creates a `customer`.

**MongoDB:** local (`mongodb://127.0.0.1:27017/kiln_kettle`) or a free MongoDB Atlas connection string.

**Razorpay:** add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, then add `"razorpay"` to `paymentMethods` via `PUT /api/admin/settings`. Flow: `POST /api/orders` with `paymentMethod:"razorpay"` returns `razorpay.{orderId,amount,keyId}`; open Razorpay Checkout in the client; send the result to `POST /api/orders/:id/verify-payment`. The server verifies the HMAC signature and only then marks the order paid. Without keys, only cash on pickup/delivery is offered.

## API (all responses: `{success, data}` or `{success:false, message, errors?}`)
| Method & path | Access |
|---|---|
| POST /api/auth/register, /login · GET /api/auth/me | public / user |
| GET /api/menu?category=&veg=true&search=&sort=price_asc\|price_desc · GET /api/menu/:id | public |
| POST, PUT, DELETE /api/menu(/:id) (delete archives) | admin |
| POST /api/orders · GET /api/orders/my-orders · GET /api/orders/:id · POST /api/orders/:id/verify-payment | user (own orders; admin can read any) |
| GET /api/admin/orders?status=&from=&to=&search= · PATCH /api/admin/orders/:id/status · GET /api/admin/stats | admin |
| POST /api/reservations · GET /api/reservations/my-reservations · PATCH /api/reservations/:id/cancel | user |
| GET /api/admin/reservations?date=&status= · PATCH /api/admin/reservations/:id/status | admin |
| POST /api/coupons/validate · POST /api/contact · GET /api/settings | public |
| GET /api/admin/messages · PUT /api/admin/settings | admin |

Prices, discounts, delivery, tax and totals are always computed on the server from the database; clients send only item ids, quantities and option names.

## Status
**Done:** all of the above, with validation (zod), bcrypt hashing (`bcryptjs`, pure JS), JWT, role checks, rate limits, helmet, CORS, central error handling, ownership checks, order-status and reservation-status state machines, seed script.
**Tested:** pricing, reservation conflicts and cancellation window, status transitions, payment signature (`npm test`).
**Not yet done / not verified:** the HTTP routes have not been run against a live MongoDB, so run `npm run seed` and try the endpoints before relying on them. No React client, admin UI, or image upload yet (menu images are URLs). Reservation overlap across *different* start times relies on the check-then-insert step; the unique index only blocks exact same-slot races, so very high concurrency could double-book.
