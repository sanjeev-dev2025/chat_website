/**
 * auth.js — Authentication service
 *
 * All token handling lives here. Tokens are stored in localStorage for
 * development convenience (the backend uses query-string JWT for WebSocket,
 * which is already inherently less secure than cookie-based auth).
 *
 * ⚠️  PRODUCTION NOTE:
 *   Query-string JWT is NOT production-safe. Tokens appear in server logs,
 *   browser history, and can leak via Referrer headers.
 *   For production, the recommended approach is:
 *     1. Use HttpOnly cookies (remove token from query string entirely).
 *     2. In JWTAuthMiddleware, read the JWT from scope["cookies"] instead
 *        of query_string. This requires installing `channels` + `django-cookie-auth`
 *        or a custom approach that reads `scope["headers"]` for a Cookie header.
 *     3. Set CSRF protection for the WebSocket handshake (same-origin or CORS+CSRF).
 *   Ask the backend developer to implement cookie-based WS auth before deploying.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKEN_KEY  = 'chatroom_access'
const REFRESH_KEY = 'chatroom_refresh'
const USER_KEY   = 'chatroom_user'

// ── Token storage ──────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeSession(access, refresh, user) {
  localStorage.setItem(TOKEN_KEY, access)
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh)
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Login ──────────────────────────────────────────────────────────────────

/**
 * POST /api/authlogin/ (Django urls: path('api/auth', include('dj_rest_auth.urls')))
 * Accepts { username, password } or { email, password }
 * Returns { access, refresh, user }
 */
export async function login(usernameOrEmail, password) {
  const isEmail = usernameOrEmail.includes('@')
  const payload = isEmail
    ? { email: usernameOrEmail, username: usernameOrEmail, password }
    : { username: usernameOrEmail, password }

  // Try the project's exact route (/api/authlogin/) first, falling back to /api/auth/login/
  const endpoints = [
    `${API_BASE}/api/authlogin/`,
    `${API_BASE}/api/auth/login/`,
  ]

  let res
  let lastError = null

  for (const url of endpoints) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status !== 404) {
        break // Found the matching route
      }
    } catch (err) {
      lastError = err
    }
  }

  if (!res) {
    throw new Error(lastError?.message || 'Unable to connect to backend server.')
  }

  let body
  try {
    body = await res.json()
  } catch {
    throw new Error('Server returned an unexpected response. Please try again.')
  }

  if (!res.ok) {
    // dj-rest-auth returns errors in different shapes depending on the field
    const msg =
      body?.non_field_errors?.[0] ||
      body?.detail ||
      body?.username?.[0] ||
      body?.email?.[0] ||
      body?.password?.[0] ||
      'Login failed. Please check your credentials.'
    throw new Error(msg)
  }

  // dj-rest-auth returns `access` (or `access_token`).
  // When JWT_AUTH_HTTPONLY=True, `refresh` is intentionally sent as "" (empty string)
  // because the refresh token is delivered via an HttpOnly cookie.
  const accessToken = body.access || body.access_token || body.key
  const refreshToken = body.refresh || body.refresh_token || null

  if (!accessToken) {
    throw new Error('Server did not return an access token.')
  }

  // Prefer the user object returned by dj-rest-auth; fall back to a minimal object.
  const storedUser = body.user || { username: usernameOrEmail }
  storeSession(accessToken, refreshToken, storedUser)

  return { access: accessToken, user: storedUser }
}

// ── Logout ─────────────────────────────────────────────────────────────────

/**
 * POST /api/authlogout/  (dj-rest-auth)
 * Best-effort: clear local session regardless of server response.
 */
export async function logout() {
  const access = getAccessToken()
  try {
    if (access) {
      const endpoints = [
        `${API_BASE}/api/authlogout/`,
        `${API_BASE}/api/auth/logout/`,
      ]
      for (const url of endpoints) {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
          },
        })
        if (res.status !== 404) break
      }
    }
  } catch {
    // Ignore network errors — local session is cleared either way.
  } finally {
    clearSession()
  }
}

// ── Registration ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/registration
 * Accepts { username, email, password1, password2 }
 * Returns { access, refresh, user } on success
 */
export async function register(username, email, password1, password2) {
  const payload = {
    username,
    email,
    password1,
    password2: password2 || password1,
  }

  // Exact endpoint in urls.py is path('api/auth/registration', include(...)) without trailing slash
  const endpoints = [
    `${API_BASE}/api/auth/registration`,
    `${API_BASE}/api/auth/registration/`,
  ]

  let res
  let lastError = null

  for (const url of endpoints) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status !== 404) break
    } catch (err) {
      lastError = err
    }
  }

  if (!res) {
    throw new Error(lastError?.message || 'Unable to connect to backend server.')
  }

  let body
  try {
    body = await res.json()
  } catch {
    throw new Error('Server returned an unexpected response. Please try again.')
  }

  if (!res.ok) {
    // Extract any specific field errors or general errors
    const errorDetails = {}
    if (body?.username) errorDetails.username = Array.isArray(body.username) ? body.username[0] : body.username
    if (body?.email) errorDetails.email = Array.isArray(body.email) ? body.email[0] : body.email
    if (body?.password1) errorDetails.password = Array.isArray(body.password1) ? body.password1[0] : body.password1
    if (body?.password2) errorDetails.confirmPassword = Array.isArray(body.password2) ? body.password2[0] : body.password2

    const generalMsg =
      body?.non_field_errors?.[0] ||
      body?.detail ||
      errorDetails.username ||
      errorDetails.email ||
      errorDetails.password ||
      errorDetails.confirmPassword ||
      'Registration failed. Please check your information.'

    const err = new Error(generalMsg)
    err.fieldErrors = errorDetails
    throw err
  }

  const accessToken = body.access || body.access_token || body.key
  const refreshToken = body.refresh || body.refresh_token || null

  if (accessToken) {
    const storedUser = body.user || { username, email }
    storeSession(accessToken, refreshToken, storedUser)
    return { access: accessToken, user: storedUser }
  }

  return { detail: body.detail || 'Registration successful! Please sign in.' }
}


