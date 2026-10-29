/**
 * api.js — Centralized REST API client
 *
 * Handles HTTP requests to the Django backend with automatic JWT
 * Authorization header injection and consistent error handling.
 */
import { getAccessToken, clearSession } from './auth.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Perform an authenticated fetch request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle unauthorized (expired token or invalid session)
  if (response.status === 401) {
    // Session is invalid; clear local credentials
    clearSession()
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new Error('Your session has expired. Please sign in again.')
  }

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.error || data.detail || (Array.isArray(data) ? data[0] : null))) ||
      `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Fetch all conversations for the authenticated user
 * GET /conversation/
 */
export async function getConversations() {
  return await apiRequest('/conversation/')
}

/**
 * Fetch list of other available users to start a conversation with
 * GET /userslist/
 */
export async function getUsersList() {
  return await apiRequest('/userslist/')
}

/**
 * Start or retrieve a 1-on-1 conversation with another user
 * POST /startconversation/
 * Payload: { user_id: number }
 */
export async function startConversation(userId) {
  return await apiRequest('/startconversation/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  })
}

/**
 * Fetch message list (fallback or history if needed)
 * GET /messages/
 */
export async function getMessages() {
  return await apiRequest('/messages/')
}

