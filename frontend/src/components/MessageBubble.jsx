/**
 * MessageBubble.jsx — WhatsApp Web styled message bubble
 */

function DoubleCheckIcon() {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="bubble-checks">
      <path d="M11.5 3.5L5.5 9.5L3 7" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 3.5L8.5 9.5L7.5 8.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function MessageBubble({ message, isOwn, isFirst, isLast }) {
  const rowClass = [
    'whatsapp-msg-row',
    isOwn ? 'outgoing' : 'incoming',
    isFirst ? 'group-first' : '',
    isLast ? 'group-last' : '',
  ].filter(Boolean).join(' ')

  const timeFormatted = formatTime(message.created_at)

  return (
    <div className={rowClass}>
      <div
        className="whatsapp-msg-bubble"
        role="article"
        aria-label={`${isOwn ? 'You' : message.username}: ${message.message}`}
      >
        {/* Sender name for incoming group messages */}
        {!isOwn && isFirst && (
          <div className="bubble-sender" aria-hidden="true">
            {message.username}
          </div>
        )}

        {/* Message body */}
        <span className="bubble-text">{message.message}</span>

        {/* Meta: Timestamp + Delivery Checks */}
        <span className="bubble-meta">
          <time className="bubble-time" dateTime={message.created_at}>
            {timeFormatted}
          </time>
          {isOwn && <DoubleCheckIcon />}
        </span>
      </div>
    </div>
  )
}
