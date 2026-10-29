# ChatRoom Frontend (React + Vite + Tailwind CSS)

A modern, responsive real-time chat client built with React 18, Vite, and Tailwind CSS, connecting to Django Channels and Django REST Framework (`dj-rest-auth`).

---

## Features

- **Authentication & Registration**: Connects to `POST /api/authlogin/` and `POST /api/auth/registration` supporting username/email login and new account registration with real-time field validation, error alerts, and automatic session initialization.
- **Real-time Messaging**: Django Channels WebSocket connection (`/ws/chat/?token=...`) with separate handlers for `history` and live `message` broadcasts.
- **Connection Resilience**: Reconnection with exponential back-off, live status indicator (`Connected`, `Connecting…`, `Disconnected`), and deduplication guards.
- **Modern UI & Aesthetics**: Navy & blue color system, polished message bubbles with grouping by sender, timestamps, auto-scroll, empty states, and responsive mobile sidebar.
- **Accessible & Keyboard Friendly**: <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line, ARIA attributes, and accessible labels.

---

## Environment Configuration

Create a `.env` file in the `frontend` directory (a `.env.example` is provided):

```env
# Django backend REST API base URL (no trailing slash)
VITE_API_BASE_URL=http://localhost:8000

# Django Channels WebSocket base URL (no trailing slash)
VITE_WS_BASE_URL=ws://localhost:8000
```

---

## Getting Started

### 1. Start the Backend Services

Ensure Redis is running:
```bash
# Windows (via WSL or redis-server) or Docker:
docker run -p 6379:6379 -d redis:alpine
```

Run Django migrations and start the Daphne ASGI server:
```bash
cd core
# With your virtual environment activated:
python manage.py migrate
python manage.py runserver 8000
```

### 2. Start the Frontend Development Server

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## Production Build

To test the production build:
```bash
cd frontend
npm run build
npm run preview
```

---

## Security Considerations

### Current Architecture (Development)
The WebSocket client passes the JWT access token in the query string:
`ws://localhost:8000/ws/chat/?token=ACCESS_TOKEN`

### Production Recommendation
Query-string tokens are **not** production-safe because:
1. Tokens are written to server access logs and proxy logs in plain text.
2. Tokens can leak via `Referer` headers to external resources.
3. Tokens are visible in browser history.

**For a production release**, the recommended approach is:
1. Issue JWT tokens inside **HttpOnly, Secure, SameSite cookies** upon login.
2. Update Django Channels middleware (`jwtmiddleware.py`) to read the JWT from `scope["cookies"]` or parse the `Cookie` header from `scope["headers"]`.
3. Remove the query parameter entirely from the frontend WebSocket connection URL.
