/**
 * EmptyChat.jsx — WhatsApp Web empty state view when no conversation is selected
 */

function WhatsAppIllustration() {
  return (
    <svg width="250" height="250" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="150" cy="150" r="130" fill="#E9EDEF" opacity="0.6" />
      <circle cx="150" cy="150" r="95" fill="#FFFFFF" />
      <path
        d="M150 75C108.58 75 75 108.58 75 150C75 163.26 78.44 175.71 84.47 186.53L76 224L114.47 215.76C124.96 221.43 137.07 225 150 225C191.42 225 225 191.42 225 150C225 108.58 191.42 75 150 75ZM188.75 180.89C187.14 185.45 180.76 189.13 176.01 190.15C172.76 190.84 168.49 191.38 154.24 185.48C136.03 177.94 124.31 159.5 123.4 158.29C122.5 157.08 116 148.43 116 139.5C116 130.57 120.57 126.22 122.38 124.36C123.89 122.81 126.39 122.1 128.4 122.1C129.05 122.1 129.64 122.13 130.17 122.16C131.73 122.23 132.51 122.32 133.54 124.79C134.82 127.88 137.94 135.51 138.32 136.29C138.7 137.07 139.08 138.13 138.55 139.19C138.02 140.25 137.57 140.97 136.78 141.89C136 142.81 135.15 143.83 134.45 144.59C133.64 145.47 132.77 146.43 133.72 148.06C134.67 149.69 137.94 155.03 142.75 159.31C148.96 164.84 154.02 166.6 155.83 167.36C157.64 168.12 158.7 167.97 159.76 166.76C160.82 165.55 164.33 161.47 165.69 159.66C167.05 157.85 168.41 158.12 170.22 158.8C172.03 159.48 181.74 164.27 183.75 165.28C185.76 166.29 187.1 166.79 187.55 167.57C188 168.35 188 172.13 186.39 176.69L188.75 180.89Z"
        fill="#25D366"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  )
}

export default function EmptyChat({ onOpenNewChat }) {
  return (
    <div className="empty-chat-container" aria-label="No conversation selected">
      <div className="empty-chat-content">
        <WhatsAppIllustration />
        <h1 className="empty-chat-title">WhatsApp Web</h1>
        <p className="empty-chat-subtitle">
          Send and receive messages in real time. Select a chat from the sidebar or start a new conversation with any contact.
        </p>
        {onOpenNewChat && (
          <button className="empty-chat-action-btn" onClick={onOpenNewChat}>
            Start New Chat
          </button>
        )}
      </div>

      <div className="empty-chat-footer">
        <LockIcon />
        <span>End-to-end encrypted</span>
      </div>
    </div>
  )
}

