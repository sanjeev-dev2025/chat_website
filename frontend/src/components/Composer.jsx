/**
 * Composer.jsx — WhatsApp Web styled message composer
 *
 * - Enter to send
 * - Shift+Enter for new line
 * - Emoji & Attachment placeholders
 * - Green send button when message has content
 */
import { useRef, useEffect } from 'react'

function EmojiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  )
}

function AttachIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

export default function Composer({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null)

  // Auto-grow height based on scrollHeight
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }

  function handleSendClick() {
    if (!disabled && value.trim()) {
      onSend()
      textareaRef.current?.focus()
    }
  }

  const hasText = value.trim().length > 0

  return (
    <footer className="whatsapp-composer" role="region" aria-label="Message Composer">
      <div className="composer-action-btns">
        <button
          type="button"
          className="composer-icon-btn"
          aria-label="Add emoji"
          title="Emojis"
          tabIndex={-1}
        >
          <EmojiIcon />
        </button>
        <button
          type="button"
          className="composer-icon-btn"
          aria-label="Attach file"
          title="Attach"
          tabIndex={-1}
        >
          <AttachIcon />
        </button>
      </div>

      <div className="composer-input-wrapper">
        <textarea
          ref={textareaRef}
          className="composer-input"
          placeholder={disabled ? 'Connecting…' : 'Type a message'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Type a message"
        />
      </div>

      <div className="composer-send-wrapper">
        <button
          type="button"
          className={`composer-send-btn ${hasText && !disabled ? 'active' : ''}`}
          onClick={handleSendClick}
          disabled={!hasText || disabled}
          aria-label="Send message"
          title="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </footer>
  )
}
