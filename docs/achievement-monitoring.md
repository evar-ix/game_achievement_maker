# Achievement challenge and gameplay monitoring

## Prototype flow

1. Select a DRM-free game and open the developer **Checkpoints** view.
2. Pause the game at a meaningful area and capture the game window with the
   button, `Alt+Shift+S` on Windows/Linux, or `Option+Shift+S` on macOS while
   the platform page is focused. Describe the achievement significance of the
   area. The shortcut does not fire while typing in a form control.
3. Save the checkpoint. The browser creates a 64-bit perceptual fingerprint and
   the backend stores it with a configurable Hamming-distance threshold.
4. Generate an achievement challenge for the checkpoint. The backend uses the shared OpenRouter
   activity generator and requires a configured API key.
5. Switch to a seeded player. A player screen capture is fingerprinted locally;
   only the fingerprint is sent to the matching endpoint.
6. When the fingerprint is within the developer's threshold, the backend records
   an idempotent player/checkpoint unlock and returns the checkpoint quiz.

## Local setup

Copy `backend/.env.example` to `backend/.env`, then configure the PostgreSQL URL.
An OpenRouter API key is required to generate a quiz.

```dotenv
OPENROUTER_API_KEY=
OPENROUTER_MODEL=meta/muse-spark-1.3-contributor
```

Run the database migration after pulling the feature:

```shell
cd backend
npx prisma migrate deploy
```

The Vite development server proxies backend routes to `http://localhost:3000`.

The backend returns an error if OpenRouter is unavailable or the generated output
is invalid. It does not substitute demo questions.

## REST endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/learning/checkpoints` | Save a developer visual checkpoint and unlock trigger |
| `GET` | `/learning/games/:gameId/checkpoints` | Show checkpoints and player unlocks |
| `POST` | `/learning/materials/generate` | Generate and publish a checkpoint-linked quiz |
| `POST` | `/learning/scans` | Compare a player screen fingerprint and record matches |
| `GET` | `/learning/games/:gameId/players/:playerId/materials` | Return locked metadata or unlocked quiz questions |

## Privacy and security

- macOS may request Screen Recording access for the browser. If required, grant
  it in macOS Privacy & Security settings and restart the browser.
- The integration sends game context, checkpoint descriptions, developer notes,
  and achievement focus, but no player identifiers or screenshots.
- The API key remains in the backend environment and is never exposed through a
  `VITE_` variable.
- Full developer screenshots are stored in PostgreSQL as data URLs for this demo.
  A production version should move encrypted images to object storage, apply a
  retention policy, and add explicit consent and access controls.
- Developer checkpoint requests are capped at 5 MB.
- Player screenshot pixels remain in the browser in this prototype; the backend
  receives only the derived visual fingerprint.

## Prototype limitations

- Average-hash matching is lightweight and explainable, but visually similar game
  scenes can collide. Production use should crop to stable HUD/scene regions and
  combine perceptual hashing with a stronger computer-vision matcher.
- Seeded demo players replace authentication and enrolment.
- Quiz answers and scores are held in the current browser session. Checkpoint
  unlocks are persisted in PostgreSQL.
- Generated quizzes are published immediately. Developer review/edit/publish can
  be added on top of the existing activity editor.
