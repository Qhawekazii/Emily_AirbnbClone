# Airbnb Clone — guest booking site, host dashboard and REST API

A full-stack booking platform: guests browse places to stay and reserve dates, and hosts manage their listings and see who has booked. Both sides run on one Express + MongoDB API.

| | Link |
|---|---|
| 🏠 **Guest site** | [emily-airbnbclone.onrender.com](https://emily-airbnbclone.onrender.com/) |
| 🛠️ **Host / admin dashboard** | [emily-airbnbclone-admin.onrender.com](https://emily-airbnbclone-admin.onrender.com/) |
| 📄 **Case study** | [The problem, decisions and what I'd improve](https://github.com/Qhawekazii/Qhawekazii/blob/main/case-studies/airbnb-clone.md) |
| 📚 **API docs** | [backend/API_DOCS.md](backend/API_DOCS.md) |

> Hosted on Render's free tier, so the first visit after a quiet spell can take up to a minute while the server wakes up.

---

## The problem

A booking platform has two sides that need different things from the same data. Guests want to find a place and book it; hosts want to create listings and see their reservations. Each side must only be able to change what belongs to them.

## What it does

**Guest site**
- Home page with location cards to inspire your next trip
- Browse listings for a location, then open a listing's details
- Reserve dates, with nights, weekly discount and total cost calculated as you choose
- "My reservations" for the signed-in guest
- Skeleton loading states, an error boundary and a 404 page

**Host / admin dashboard**
- Sign in, then a dashboard overview
- Create, edit and delete listings, including image upload
- See the reservations made on your listings

**API**
- Register, log in and fetch your profile
- Listings: read for everyone; create, update and delete for hosts
- Reservations: create and cancel your own, hosts see bookings on their listings, admins see everything

## Under the hood

| Area | How |
|---|---|
| Structure | Express 5 with routes, controllers and Mongoose models kept separate |
| Auth | JWT middleware on protected routes; passwords hashed with bcrypt in a Mongoose pre-save hook |
| Access control | Roles (user / host / admin): hosts can only change their own listings, and listing every reservation is admin-only |
| Errors | Central error handler returning the right status code (400, 401, 403, 404) so the frontends can tell the user what went wrong |
| Security | Helmet security headers and rate limiting |
| Uploads | Listing images through Multer |
| Tests | 43 API tests with Jest + Supertest against an in-memory MongoDB, so they run anywhere with no database setup |
| Frontends | React 18, Vite, React Router, Axios with the JWT added to each request |

## Tech stack

**Frontend:** React 18 · Vite · React Router · Axios · CSS
**Backend:** Node.js · Express 5 · MongoDB · Mongoose · JWT · bcrypt · Multer · Helmet · express-rate-limit
**Testing:** Jest · Supertest · mongodb-memory-server
**Hosting:** Render

## Project structure

```
Emily_AirbnbClone/
├── airbnb-frontend/   Guest site (React + Vite)
├── admin-frontend/    Host / admin dashboard (React + Vite)
└── backend/           REST API (Express + MongoDB), tests and API docs
```

## Run it locally

You need Node.js 18+ and a MongoDB connection string (a local MongoDB or a free MongoDB Atlas cluster).

```bash
# 1. API
cd backend
npm install
cp .env.example .env      # set MONGO_URI and JWT_SECRET
npm run seed              # optional: sample users and listings
npm run dev               # http://localhost:5000

# 2. Guest site (new terminal)
cd airbnb-frontend
npm install
npm run dev

# 3. Host / admin dashboard (new terminal)
cd admin-frontend
npm install
npm run dev
```

Both frontends read the API address from `VITE_API_BASE_URL` (in their `.env`), which defaults to `http://localhost:5000/api`.

Run the API tests:

```bash
cd backend
npm test
```

## Problems I had to solve

- **Express 5 changed wildcard route syntax**, which broke the catch-all routes. I rewrote them for the new path syntax.
- **Mongoose 9 changed save hooks**, so password hashing and reservation hooks silently stopped running. I fixed both.
- **Staying logged in after a refresh.** I reworked the auth context to restore the session and show clear login errors.

## What I'd improve next

- Block overlapping bookings so two guests can't reserve the same nights
- Store uploaded images in cloud storage, since a free host's disk resets on restart
- Search and filters by price, dates and number of guests

---

Built by **Emily Qhawekazi Maramani** · [Portfolio](https://my-portfolio-three-roan-41.vercel.app/) · [GitHub](https://github.com/Qhawekazii)
