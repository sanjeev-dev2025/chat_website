/**
 * websocket.js — WebSocket service
 *
 * Manages WebSocket connection to a specific conversation room:
 * ws://localhost:8000/ws/chat/<conversation_id>/?token=<token>
 */

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000] // exponential back-off

export const WS_STATUS = {
  CONNECTING:   'connecting',
  CONNECTED:    'connected',
  DISCONNECTED: 'disconnected',
}

/**
 * Creates a managed WebSocket connection for a specific conversation.
 *
 * @param {number|string} conversationId - The active conversation ID
 * @param {string}        token          - JWT access token
 * @param {object}        callbacks
 * @param {function}      callbacks.onStatus   - (status: WS_STATUS) => void
 * @param {function}      callbacks.onHistory  - (messages: Message[]) => void
 * @param {function}      callbacks.onMessage  - (message: Message) => void
 * @param {function}      callbacks.onError    - (errorMessage: string) => void
 * @returns {{ send: function, destroy: function }}
 */
export function createChatSocket(conversationId, token, callbacks) {
  let ws = null
  let reconnectTimer = null
  let attemptIndex = 0
  let destroyed = false

  const { onStatus, onHistory, onMessage, onError } = callbacks

  function connect() {
    if (destroyed || !conversationId || !token) return

    const url = `${WS_BASE}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`
    onStatus(WS_STATUS.CONNECTING)

    try {
      ws = new WebSocket(url)
    } catch (err) {
      onError('Failed to initialize WebSocket connection.')
      onStatus(WS_STATUS.DISCONNECTED)
      return
    }

    ws.addEventListener('open', () => {
      if (destroyed) {
        ws.close()
        return
      }
      attemptIndex = 0
      onStatus(WS_STATUS.CONNECTED)
    })

    ws.addEventListener('close', (evt) => {
      if (destroyed) return

      onStatus(WS_STATUS.DISCONNECTED)

      if (evt.code === 4401) {
        onError('Authentication failed. Please log in again.')
        return // Do not reconnect on auth failure
      }

      if (evt.code === 4403) {
        onError('You are not a participant in this conversation.')
        return // Do not reconnect if unauthorized
      }

      // Reconnect with back-off if not deliberately destroyed
      const delay = RECONNECT_DELAYS[Math.min(attemptIndex, RECONNECT_DELAYS.length - 1)]
      attemptIndex += 1
      reconnectTimer = setTimeout(connect, delay)
    })

    ws.addEventListener('error', () => {
      if (destroyed) return
      // Browser automatically triggers close event afterwards
    })

    ws.addEventListener('message', (evt) => {
      if (destroyed) return
      let data
      try {
        data = JSON.parse(evt.data)
      } catch {
        return
      }

      if (data.type === 'history') {
        onHistory(data.messages ?? [])
      } else if (data.type === 'message') {
        onMessage(data.message)
      }
    })
  }

  connect()

  return {
    /** Send a chat message to the server */
    send(messageText) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message: messageText }))
      }
    },
    /** Permanently close the socket */
    destroy() {
      destroyed = true
      clearTimeout(reconnectTimer)
      if (ws) {
        ws.close()
        ws = null
      }
    },
  }
}
