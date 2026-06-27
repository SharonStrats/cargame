# Cargame

This workspace has two folders:

- `frontend/` contains the Vite + TypeScript app.
- `backend/` currently contains only `package.json` and `package-lock.json`; there is no server entry file to run yet.
- `packages/shared/` contains the shared multiplayer types and protocol contracts.

## Run the app
# Cargame

This workspace has two runtime folders and one shared package:

- `frontend/` contains the Vite + TypeScript client.
- `backend/` contains the Socket.IO + Express server.
- `packages/shared/` contains the shared multiplayer types and protocol contracts.

## Dev Setup

### Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Run frontend only

```bash
cd frontend
npm run dev
```

This starts Vite on `http://localhost:5173`.

### Run backend only

```bash
cd backend
npm run dev
```

This starts the Socket.IO server on `http://localhost:3000`.

### Run both with one command

```bash
cd frontend
npm run dev:all
```

That starts the backend and frontend together from the frontend folder.

## Production Setup

### Build frontend

```bash
cd frontend
npm run build
```

### Build backend

```bash
cd backend
npm run build
```

### Start backend in production mode

```bash
cd backend
npm run start
```

## Environment Variables

Copy the example files and fill in production values when you deploy.

- `frontend/.env.example` sets `VITE_BACKEND_URL`.
- `backend/.env.example` sets `PORT` and `FRONTEND_ORIGIN`.

For local development, the defaults already point to localhost.

## GitHub Actions

The repo now includes a basic CI workflow in `.github/workflows/ci.yml` that builds both apps on push and pull request.

For actual deployment, the easiest path is still provider-side auto deploys:

- Cloudflare Pages for the frontend
- DigitalOcean App Platform for the backend

## Shared Types

Import shared types from `@cargame/shared` in both apps.