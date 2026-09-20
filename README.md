# Project Pulse - Frontend

Real-Time Client Project Dashboard — Modern, high-performance React + TypeScript web application built with Vite, Tailwind CSS, TanStack Query, and Socket.io-client.

---

## Features
- **Role-Based Authentication & User Switching**:
  - In-memory JWT access token management with silent 401 refresh via `httpOnly` cookie.
  - Role route guards (`RequireRole`) for `ADMIN`, `PM`, and `DEVELOPER`.
  - Seamless User Switching & Logout: `UserNav` component in top navigation showing active user badge, email, and one-click "Switch User / Sign Out" button.
  - Non-blocking `LoginPage`: Displays current active session with "Continue to Dashboard" or "Sign Out", while allowing instant 1-click switching to any demo account (`ADMIN`, `PM`, `DEVELOPER`).
  - 1-click demo login buttons for instant evaluation.
- **Real-Time Kanban Board & Live Activity**:
  - 4-column drag/status-controlled board (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
  - In-place query cache patching upon receiving `activity:new` WebSocket events — tasks transition across columns with zero refetch latency.
  - Live activity feed with relative timestamps (`date-fns` `formatDistanceToNow`).
  - Missed-event catch-up on socket reconnection via `GET /api/activity`.
- **URL-Synced Task Filtering**:
  - `FilterBar` directly reads and writes URL search parameters (`status`, `priority`, `dueFrom`, `dueTo`).
  - Shareable URLs and filter state persistence across refreshes.
- **Real-Time Notifications**:
  - Notification bell with pulsing unread badge.
  - Popover dropdown with read/unread styling, task links, and "Mark all as read" action.
  - Immediate badge increment and list insertion on `notification:new` WebSocket events.
- **Live Online Presence**:
  - `PresenceBadge` displaying active online users via `presence:count` and `presence:join` events on the Admin Dashboard.
- **Role-Specific Dashboards**:
  - **Admin**: Global totals, overdue tasks count, live presence, status distribution, and system-wide activity.
  - **PM**: Owned projects summary, task counts by status/priority, due this week, and project progress percentage bars.
  - **Developer**: Assigned tasks sorted strictly by priority then due date, with interactive status controls and overdue alerts.
- **Polished UX**:
  - Structural loading skeletons across all views (no full-page spinners).
  - Distinct empty states ("No tasks match these filters" with "Reset Filters" button).
  - Visible overdue badges strictly derived from backend `isOverdue: boolean`.
  - Rich dark mode aesthetic with glassmorphism and subtle micro-animations.

---

## Local Development

### 1. Prerequisites
- Node.js 20+
- Backend running at `http://localhost:4000`

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
# Running on http://localhost:5173
```

### 5. Build for Production
```bash
npm run build
```

---

## Deployment to Vercel (Free Tier)

Per Section 10 of `frontend-spec.md`:

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New...** -> **Project**.
3. Import the repository and select `Technical-Assessment-Velozity-Frontend`.
4. Configure build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://<your-render-backend-url>/api`
   - `VITE_WS_URL`: `https://<your-render-backend-url>`
6. Click **Deploy**.
7. Confirm that your backend's `CLIENT_URL` environment variable on Render is set to your deployed Vercel URL to allow CORS and WebSocket handshakes.