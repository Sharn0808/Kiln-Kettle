# Kiln & Kettle

A café and restaurant web app: customers can browse the menu, order for takeaway, delivery or dine-in, book tables and track orders. The owner manages everything from an admin dashboard.

**Sample brand.** The name, address, phone number and team on the About page are placeholders. Replace them in Admin → Settings before going live.

## What's inside

```
kiln-kettle/
  server/   Node.js + Express + MongoDB (Mongoose) REST API
  client/   React + Vite website and admin dashboard
```

**Customers:** menu with search, filters and sorting; dish options (size, extras, notes); a saved cart with coupons; checkout; order tracking; table reservations with cancellation; About and Contact pages; accounts.

**Admin:** dashboard stats; order search and status updates; reservation management; menu add, edit and archive; customer messages; restaurant settings (hours, tax, delivery, payment methods).

**Security:** passwords hashed, JWT login, role checks on the server, rate limits, input validation, and all prices and totals calculated on the server.

## Requirements

- Node.js 18 or newer
- A MongoDB database: a free MongoDB Atlas cluster, or a local MongoDB

## Run it on your computer

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```

Open `.env` and fill in:

| Setting | What to put |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Any random text, 32+ characters |
| `CLIENT_URL` | `http://localhost:5173` |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD` | 12+ characters |

Then load the starter data and start the API:

```bash
npm run seed     # creates the admin account, 12 dishes, 2 coupons
npm run dev      # http://localhost:5000/api/health
```

### 2. Website

In a second terminal:

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

Sign in with your admin email and password to see the **Admin** tab.

## Tests

```bash
cd server
npm test
```

These cover pricing, reservation conflicts and the cancellation window, order status rules and Razorpay signature checking. The HTTP routes and the website do not have automated tests yet.

## Online payments (optional)

By default customers pay on pickup or delivery. To enable Razorpay, add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `server/.env`, restart the server, then tick Razorpay in Admin → Settings. The server verifies each payment signature before marking an order paid.

## Useful starter coupons

`WELCOME10` gives 10% off. `CHAI15` gives 15% off orders of ₹400 or more.

## Keeping secrets safe

Never commit your `.env` file. The included `.gitignore` already excludes it. If a secret is ever uploaded by mistake, change it right away (your database password, `JWT_SECRET` and admin password), because deleting the file later does not remove it from Git history.

## Known limitations

- No image upload yet: dishes use an image link, or a drawn plate if none is set.
- Very busy simultaneous bookings at different start times could in rare cases overlap, because the check happens just before saving.
- Styling is plain CSS rather than Tailwind, and there are no Framer Motion animations or Lucide icons.
- The server's HTTP routes and the website have no automated tests.

## Putting it online

The backend and website need hosting, plus a production MongoDB. Set the same environment variables on your host and set `CLIENT_URL` to your website's address. Build the website with `npm run build` in `client`.
