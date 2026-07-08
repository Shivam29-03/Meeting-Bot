# Meeting Bot

A Next.js app that sends an AI notetaker bot into video meetings, records calls, stores transcripts in MongoDB, and provides a dashboard to review recordings and meeting details.

## Features

- **Google sign-in** via NextAuth
- **Meeting bot deployment** to Google Meet, Zoom, or Microsoft Teams through [Recall.ai](https://www.recall.ai/)
- **Live status tracking** — requested, joining, in call, recording, done, failed
- **Paginated meeting history** with cursor-based "Load more" on the meetings page
- **Active recording limit** — up to 3 concurrent recordings per user
- **Platform URL validation** — only supported meeting links are accepted before a bot is created
- **Transcripts** with speaker labels and timestamps
- **Meeting detail page** with video playback, transcript panel, participants, and export
- **Actionable failure messages** — specific errors when a bot is blocked, login is required, or recording is denied
- **User settings** — bot name, recording preferences, integrations, and notifications
- **Webhook-driven updates** from Recall with Svix signature verification
- **Gallery-view recordings** — mixed MP4 uses Recall's `gallery_view_v2` layout for multi-participant meetings

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Auth | NextAuth (Google OAuth) |
| Database | MongoDB Atlas, Mongoose |
| Bot / Recording | Recall.ai API |
| Webhooks | Svix signature verification |

## Prerequisites

- Node.js 20+
- MongoDB Atlas cluster
- Google OAuth credentials
- Recall.ai API key and webhook secret

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Shivam29-03/Meeting-Bot.git
cd Meeting-Bot
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/

# Optional: standard connection string for production or when SRV DNS fails
# MONGODB_URI_STANDARD=mongodb://<user>:<password>@host1:27017,host2:27017,host3:27017/meetingbot?ssl=true&authSource=admin&replicaSet=...

# Recall.ai
RECALL_API=your-recall-api-key
RECALL_REGION=ap-northeast-1
RECALL_WEBHOOK_SECRET=whsec_your_webhook_secret
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. MongoDB Atlas setup

1. Create a free cluster on [MongoDB Atlas](https://www.cloud.mongodb.com/).
2. Add your IP under **Network Access** (or `0.0.0.0/0` for local development).
3. Create a database user and copy the connection string into `MONGODB_URI`.

The app stores data in the `meetingbot` database across three collections:

- `meetings` — bot sessions, status, recording metadata, failure sub-codes
- `meeting_transcripts` — transcript segments per meeting
- `user_settings` — per-user preferences

> **Windows note:** If `mongodb+srv://` fails due to DNS in development, the app automatically resolves Atlas hosts via public DNS and connects using a replica-set URI. You can also set `MONGODB_URI_STANDARD` manually.
>
> **Production note:** In production (`NODE_ENV=production`), the app prefers `MONGODB_URI_STANDARD` when set, and skips the SRV DNS fallback. Set this on Vercel or other hosts where SRV resolution is unreliable.

### 4. Recall.ai setup

1. Create an account and get your API key from the [Recall dashboard](https://www.recall.ai/).
2. Set `RECALL_REGION` to your Recall region (e.g. `ap-northeast-1`, `us-west-2`).
3. Register a webhook pointing to:

   ```
   https://<your-domain>/api/webhooks/recall
   ```

   Copy the webhook signing secret into `RECALL_WEBHOOK_SECRET`. Signature verification is always required — use a real `whsec_...` value even for local development.

4. For local development, expose your app with [ngrok](https://ngrok.com/) (or similar) and register the tunnel URL as the webhook endpoint in the Recall dashboard.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and start a meeting from the dashboard.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth routes
│   │   ├── meetings/             # CRUD, pagination, video download
│   │   ├── settings/             # User settings API
│   │   └── webhooks/recall/      # Recall webhook handler
│   ├── dashboard/                # Dashboard, meetings, settings, profile
│   └── login/                    # Sign-in page
├── components/                   # UI components
├── lib/                          # Business logic, DB, Recall client
├── models/                       # Mongoose schemas
├── services/                     # Client-side API helpers
└── hooks/                        # React hooks (e.g. meeting status polling)
```

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/meetings` | List meetings for the signed-in user (supports pagination) |
| `POST` | `/api/meetings` | Create a meeting and deploy a Recall bot |
| `GET` | `/api/meetings/[id]` | Get meeting details |
| `DELETE` | `/api/meetings/[id]` | Delete a meeting and its Recall bot |
| `GET` | `/api/meetings/[id]/video` | Stream meeting recording download |
| `GET` | `/api/settings` | Get user settings |
| `PUT` | `/api/settings` | Save user settings |
| `POST` | `/api/webhooks/recall` | Recall.ai webhook endpoint |

### `GET /api/meetings` query parameters

| Parameter | Type | Description |
|---|---|---|
| `limit` | number | Page size (1–100, default 50) |
| `cursor` | ISO date string | Return meetings created before this timestamp |

### `POST /api/meetings` constraints

- **Supported platforms:** `meet.google.com`, `zoom.us`, `*.zoom.us`, `teams.microsoft.com`, `teams.live.com`
- **Active limit:** Returns `429` if the user already has 3 recordings in progress (`requested`, `joining`, `in_call`, or `recording`)

## Meeting Flow

```mermaid
flowchart LR
    User[User] -->|POST /api/meetings| App[Next.js App]
    App -->|Create bot| Recall[Recall.ai]
    Recall -->|Joins call| Meeting[Video Meeting]
    Recall -->|Webhooks| Webhook["/api/webhooks/recall"]
    Webhook -->|Update status and transcript| MongoDB[(MongoDB)]
    App -->|Read data| MongoDB
    User -->|View recording and transcript| Dashboard[Dashboard]
```

## Reliability

- **Webhook verification** — all Recall webhooks are verified with Svix before processing
- **Terminal status protection** — meetings marked `done` or `failed` are not downgraded by late or out-of-order events
- **Orphan bot cleanup** — if database insert fails after bot creation, the Recall bot is deleted
- **Throttled status sync** — active meetings are synced from Recall at most once every 30 seconds during list requests
- **Streamed video downloads** — recordings are proxied without buffering the full file in memory

## Deployment

Deploy to [Vercel](https://vercel.com/) or any Node.js host that supports Next.js App Router. Set all environment variables in your hosting provider and update:

- `NEXTAUTH_URL` to your production URL
- `MONGODB_URI_STANDARD` if SRV DNS is unreliable on your host
- Recall webhook URL to `https://<your-domain>/api/webhooks/recall`
- MongoDB Atlas network access for your deployment IP

## Branches

| Branch | Purpose |
|---|---|
| `Develop` | Active development branch |
| `main` | Stable / production branch |

## License

Private project.
