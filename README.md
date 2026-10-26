# Roamora — Stays & Travel Platform

Roamora is a full-stack travel and accommodation platform built with React, Node.js, Express, and MongoDB. It helps users discover stays, explore property details, manage wishlists and trips, and access travel-planning features.

## Features

- Browse accommodation listings and property details
- Explore stays by destination and category
- Map-based stay discovery
- Authentication with seeded demo accounts
- Wishlist and trip pages
- Travel Copilot for trip planning
- Sample listings, hosts, guests, and reviews

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Maps:** Leaflet, React Leaflet

## Run Locally

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string

### 1. Configure the backend

From the project root:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` with your MongoDB connection string, a private JWT secret, the frontend URL, and the backend port.

### 2. Seed demo data

Make sure `MONGO_URL` points to a development database you are comfortable resetting, then run this command from the `server` directory:

```powershell
npm run seed
```

**Warning:** The seed script recreates sample data in its configured database. Do not run it against a database containing data you need to keep.

### 3. Start the backend

From the `server` directory:

```powershell
npm run dev
```

### 4. Start the frontend

Open a second terminal from the project root:

```powershell
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Demo Accounts

Password: `demo1234`

- **Host:** `host@demo.com`
- **Guest:** `aarav@demo.com`

Use these demo credentials only in a local development environment.

## Production Build

From the `client` directory:

```powershell
npm run build
```

## Security

- Never commit `.env` files, credentials, API keys, or private secrets.
- Keep `.env.example` free of real credentials.
- Configure deployment environment variables separately.
- Use a strong, private JWT secret for each environment.

## Project Status

Roamora is a development project. Verify external integrations and application behavior before deploying it for public use.
