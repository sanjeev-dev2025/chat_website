/**
 * ChatHeader.jsx — WhatsApp chat header with contact info and responsive back button
 */
import { WS_STATUS } from '../services/websocket.js'

function ArrowBackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function MoreVertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  )
}

export default function ChatHeader({ conversation, currentUsername, status, onBack }) {
  // Find other participant's username
  const otherUsername =
    conversation?.username?.find((u) => u !== currentUsername) ||
    conversation?.username?.[0] ||
    'Chat'

  const initial = otherUsername[0]?.toUpperCase() || '?'

  let statusText = 'offline'
  let isOnline = false

  if (status === WS_STATUS.CONNECTED) {
    statusText = 'online'
    isOnline = true
  } else if (status === WS_STATUS.CONNECTING) {
    statusText = 'connecting…'
  }

  return (
    <header className="chat-panel-header" aria-label={`Chat with ${otherUsername}`}>
      <div className="chat-panel-header-left">
        {onBack && (
          <button
            className="mobile-back-btn"
            onClick={onBack}
            aria-label="Back to conversations list"
            title="Back to conversations"
          >
            <ArrowBackIcon />
          </button>
        )}

        <div className="header-contact-avatar" aria-hidden="true">
          {initial}
        </div>

        <div className="header-contact-details">
          <h2 className="header-contact-name">{otherUsername}</h2>
          <span className={`header-contact-status ${isOnline ? 'online' : ''}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="chat-panel-header-actions">
        <button className="icon-btn" aria-label="Search in conversation" title="Search">
          <SearchIcon />
        </button>
        <button className="icon-btn" aria-label="Menu" title="More options">
          <MoreVertIcon />
        </button>
      </div>
    </header>
  )
}

