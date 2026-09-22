# Game Achievement Maker

A desktop-friendly web application for designing visual game achievements and
testing how players unlock them. Developers capture meaningful gameplay
checkpoints, attach AI-generated achievement challenges, and review unlocks.
Players run local screen monitoring to unlock those challenges while playing.

## Technology

- React, TypeScript, Vite, and Electron
- NestJS and TypeScript
- PostgreSQL with Prisma
- OpenRouter for achievement-challenge generation

## Features

- Developer and Player views with role-aware navigation
- Visual gameplay checkpoints captured from a browser or Electron desktop shell
- Local perceptual fingerprinting for privacy-preserving screen matching
- Persistent player achievement unlocks
- AI-generated checkpoint challenges with an editable review screen
- JSON export for completed achievement challenges

## Repository layout

- `frontend/` — React interface and Electron screen-capture bridge
- `backend/` — NestJS API, Prisma data access, and OpenRouter integration
- `docs/` — gameplay monitoring API, privacy notes, and prototype limitations

## Requirements

- Node.js 20.19+, 22.13+, or 24+
- npm
- Docker with Docker Compose

## Run locally

### 1. Start PostgreSQL and the backend

```shell
cd backend
cp .env.example .env
docker compose up -d postgres
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

The backend runs at `http://localhost:3000`.

To generate challenges, set these values in `backend/.env`:

```dotenv
OPENROUTER_API_KEY=
OPENROUTER_MODEL=meta/muse-spark-1.3-contributor
```

The API key stays in the backend. Never expose it through a `VITE_` variable or
commit `backend/.env`.

### 2. Start the frontend

In a second terminal:

```shell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`.

For an OS-level capture shortcut that continues working while a game has focus,
keep Vite running and start the Electron shell in another terminal:

```shell
cd frontend
npm run desktop:dev
```

Use `Option+Shift+S` on macOS or `Alt+Shift+S` on Windows/Linux to capture the
display under the pointer. A browser tab can only receive the shortcut while
the page itself has focus.

### 3. Create a local demo game

If the game list is empty, create a DRM-free demo game while the backend is
running:

```shell
curl -X POST http://localhost:3000/games \
  -H 'Content-Type: application/json' \
  -d '{"title":"Checkpoint Quest","description":"A local game for testing visual achievement checkpoints.","integrationType":"drm_free"}'
```

## Product flow

1. Choose **Developer** from **View as**, select a DRM-free game, and open its
   checkpoint workspace.
2. Capture or upload a gameplay screenshot, describe the achievement, and save
   the checkpoint.
3. Add an achievement focus and generate its linked challenge.
4. Switch to **Player**, select the same game, and start screen monitoring.
5. When the current screen matches a checkpoint, the achievement and its
   challenge unlock for that player.

Player screenshots remain local: only a compact visual fingerprint is sent to
the backend. Developer checkpoint images are stored in PostgreSQL in this
prototype.

See [Achievement monitoring](docs/achievement-monitoring.md) for the API,
privacy notes, and prototype limitations.

## Verification

With PostgreSQL running and `backend/.env` configured:

```shell
cd backend
npx prisma validate
npm test
npm run test:e2e -- --runInBand
npm run lint
npm run build

cd ../frontend
npm run lint
npm run build
```
