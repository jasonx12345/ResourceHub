# ResourceHub 🍏

Share study resources by course. Built with **Node/Express**, **TypeScript**, **Prisma**, and **Postgres**.  
Static UI is served from `/public`.

## Stack
- API: Express + TypeScript
- ORM: Prisma
- DB: Postgres
- Auth: JWT (bcrypt password hash)
- Dev tools: Docker, GitHub Actions

---

## Local Development

**Prereqs:** Node 20, Docker Desktop (for Postgres)

1. Copy envs:
   ```bash
   cp .env.example .env
Ensure DATABASE_URL matches your local DB and set a JWT_SECRET.

Start Postgres (either):

With Compose (recommended):

bash
Copy code
docker compose up -d
Or your own container (ensure port 5432 is free).

Prisma:

bash
Copy code
npx prisma generate
npx prisma migrate dev --name init
Run the API:

bash
Copy code
npm run dev
UI: http://localhost:8000/

Health: http://localhost:8000/healthz

Docker (single container using your existing local Postgres)
bash
Copy code
docker build -t resourcehub .
docker run --rm -p 8000:8000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/student_resources" \
  -e JWT_SECRET="dev_secret_change_later" \
  resourcehub
Docker Compose (API + DB)
bash
Copy code
docker compose up -d --build
UI → http://localhost:8000/

Deploy (Render example)
Build: npm ci && npx prisma generate && npm run build

Start: npx prisma migrate deploy && node dist/server.js

Env vars: DATABASE_URL (from Render Postgres), JWT_SECRET, NODE_ENV=production

Scripts
npm run dev – start API (watch)

npm run build – compile TypeScript

npm start – run compiled server

npm run typecheck – tsc --noEmit

Endpoints (quick)
GET /healthz – health

POST /auth/signup – { email, password }

POST /auth/login – { email, password } → { token }

GET /resources?course=CODE

POST /resources (Bearer token) – { title, link, courseCode }