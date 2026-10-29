/**
 * MessageList.jsx — Scrollable WhatsApp message stream
 */
import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return 'TODAY'
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  } catch {
    return ''
  }
}

function getDateKey(iso) {
  try {
    return new Date(iso).toDateString()
  } catch {
    return ''
  }
}

export default function MessageList({ messages, isLoading, currentUsername }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 250
    if (isNearBottom || messages.length <= 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="whatsapp-chat-body" ref={containerRef} aria-live="polite">
        <div className="chat-loading-indicator">
          <div className="spinner-sm" />
          <span>Loading messages…</span>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="whatsapp-chat-body" ref={containerRef} aria-live="polite">
        <div className="chat-welcome-pill">
          <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
        </div>
        <div className="chat-empty-hint">
          <p>No messages yet. Say hello!</p>
        </div>
      </div>
    )
  }

  // Group messages and generate date badges
  const items = []
  let lastDateKey = ''

  messages.forEach((msg, idx) => {
    const dateKey = getDateKey(msg.created_at)
    if (dateKey !== lastDateKey) {
      items.push({
        type: 'date',
        key: `date-${dateKey}`,
        label: formatDate(msg.created_at),
      })
      lastDateKey = dateKey
    }

    const prevMsg = messages[idx - 1]
    const nextMsg = messages[idx + 1]
    const sameSenderAsPrev =
      prevMsg && prevMsg.username === msg.username && getDateKey(prevMsg.created_at) === dateKey
    const sameSenderAsNext =
      nextMsg && nextMsg.username === msg.username && getDateKey(nextMsg.created_at) === dateKey

    items.push({
      type: 'message',
      key: `msg-${msg.id || idx}`,
      message: msg,
      isFirst: !sameSenderAsPrev,
      isLast: !sameSenderAsNext,
      isOwn: msg.username === currentUsername,
    })
  })

  return (
    <div
      className="whatsapp-chat-body"
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-label="Conversation messages"
    >
      <div className="chat-welcome-pill">
        <span>🔒 Messages are secured with end-to-end encryption.</span>
      </div>

      {items.map((item) => {
        if (item.type === 'date') {
          return (
            <div key={item.key} className="chat-date-separator">
              <span className="date-pill">{item.label}</span>
            </div>
          )
        }
        return (
          <MessageBubble
            key={item.key}
            message={item.message}
            isOwn={item.isOwn}
            isFirst={item.isFirst}
            isLast={item.isLast}
          />
        )
      })}

      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  )
}
