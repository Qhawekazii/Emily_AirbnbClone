# Airbnb Clone — Capstone Project

A full-stack Airbnb clone built with React, Node.js, Express, and MongoDB.

## Projects

| App | Port | Description |
|-----|------|-------------|
| Backend API | 5000 | Node.js/Express REST API |
| Admin Dashboard | 3001 | React admin frontend |
| Airbnb Frontend | 3000 | React public-facing frontend |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Install dependencies
```bash
# Backend
npm install

# Admin frontend
cd admin-frontend && npm install

# Airbnb frontend
cd airbnb-frontend && npm install
```

### 2. Configure environment
The `.env` file at the root is already configured for local development:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/airbnb
JWT_SECRET=airbnb_secret_key_2024_capstone
```

### 3. Seed the database
```bash
node seed.js
```

### 4. Start all three servers (separate terminals)
```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Admin dashboard
cd admin-frontend && npm run dev

# Terminal 3 — Public frontend
cd airbnb-frontend && npm run dev
```

## Test Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@airbnb.com | admin123 |
| Host  | jane@example.com | password321 |
| User  | john@example.com | password123 |

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, Helmet, express-rate-limit

**Frontend:** React 18, Vite, React Router v7, Axios, CSS Modules

## Features

- JWT authentication with role-based access (user / host / admin)
- Full CRUD for accommodation listings with image upload
- Reservation system with dynamic cost calculator
- Admin dashboard with listings and reservations management
- Responsive design across all screen sizes
- Rate limiting and security headers
- Shimmer skeleton loading states
- Error boundary components
- Paginated API responses

## API Docs
See [API_DOCS.md](./API_DOCS.md) for full endpoint documentation.

## Deployment
Deploy backend to Heroku/Render. Deploy frontends to Vercel/Netlify.
Set `MONGO_URI` to your MongoDB Atlas connection string and `JWT_SECRET` to a secure random string.
