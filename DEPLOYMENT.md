# Deployment Guide — Airbnb Clone

## Architecture on Heroku

A single Heroku dyno serves all three apps:
- **Backend API** — Express on `PORT` (set by Heroku)
- **Admin Dashboard** — React static build served at `/admin`
- **Public Frontend** — React static build served at `/`

The `heroku-postbuild` script automatically builds both React apps before the dyno starts.

---

## Pre-requisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster
3. Git installed and project committed

---

## Step 1 — Create MongoDB Atlas Database

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (M0 Free Tier)
3. Under **Database Access** → Add a database user with username + password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all, required for Heroku)
5. Click **Connect** → **Connect your application** → copy the connection string

It looks like:
```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/airbnb?retryWrites=true&w=majority
```

---

## Step 2 — Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new app (choose your own name)
heroku create your-airbnb-clone

# Verify the remote was added
git remote -v
```

---

## Step 3 — Set Environment Variables

Set these in the Heroku dashboard under **Settings → Config Vars**, or via CLI:

```bash
heroku config:set MONGO_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/airbnb?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your_very_long_random_secret_string_here"
heroku config:set NODE_ENV="production"
```

> **Tip:** Generate a strong JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Step 4 — Deploy

```bash
# Make sure all changes are committed
git add .
git commit -m "chore: prepare for Heroku deployment"

# Push to Heroku (this triggers heroku-postbuild automatically)
git push heroku main
```

Heroku will:
1. Install backend `node_modules`
2. Run `npm run heroku-postbuild` → builds both React apps into `dist/` folders
3. Start the server with `npm start` (runs `node server.js`)

---

## Step 5 — Seed the Database (optional)

After first deploy, seed the database with sample data:

```bash
heroku run node seed.js
```

---

## Step 6 — Verify

```bash
heroku open
```

| URL | App |
|-----|-----|
| `https://your-app.herokuapp.com/` | Airbnb Public Frontend |
| `https://your-app.herokuapp.com/admin` | Admin Dashboard |
| `https://your-app.herokuapp.com/api/accommodations` | Backend API |

---

## Useful Commands

```bash
# View live logs
heroku logs --tail

# Open app in browser
heroku open

# Check dyno status
heroku ps

# Restart dynos
heroku restart

# Run a one-off command
heroku run node seed.js
```

---

## Environment Summary

| Variable | Development | Production |
|----------|-------------|------------|
| `PORT` | 5000 | Set by Heroku automatically |
| `MONGO_URI` | `mongodb://localhost:27017/airbnb` | MongoDB Atlas connection string |
| `JWT_SECRET` | `airbnb_secret_key_2024_capstone` | Strong random secret |
| `NODE_ENV` | `development` | `production` |

---

## Troubleshooting

**Build fails:**
- Check `heroku logs --tail` for the error
- Ensure `npm install --legacy-peer-deps` is used (Vite 8 needs it)

**MongoDB connection error:**
- Verify `MONGO_URI` config var is set correctly
- Check Atlas Network Access allows `0.0.0.0/0`

**App crashes on start:**
- Check `Procfile` exists with `web: node server.js`
- Ensure `package.json` has `"start": "node server.js"`
