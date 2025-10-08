# The Aura Decore - Backend

## Overview
Node.js + Express + MongoDB backend with:
- Products CRUD with discount automation
- Collections CRUD
- Discounts (rules) management
- Admin auth (JWT)
- Simple rates endpoint for frontend currency conversion

## Setup
1. Copy files into a project folder.
2. `npm install`
3. Create `.env` from `.env.example` and set `MONGO_URI` and `JWT_SECRET`.
4. `npm run seed` to create admin user and sample content.
5. `npm run dev` to start in dev mode.

## Endpoints (summary)
- `POST /api/auth/login` -> { email, password } returns `{ token }`
- `GET /api/products` -> public
- `GET /api/products/:id` -> public
- `POST/PUT/DELETE /api/products` -> protected (admin JWT)
- `GET /api/collections` -> public
- `POST/PUT/DELETE /api/collections` -> protected
- `GET /api/discounts` -> public
- `POST/PUT/DELETE /api/discounts` -> protected (will re-evaluate product discounts)
- `GET /api/rates` -> returns `{ base, rates: { USD, INR } }`
- `GET /api/deals` -> returns active deals summary

--- END OF DOCUMENT ---
