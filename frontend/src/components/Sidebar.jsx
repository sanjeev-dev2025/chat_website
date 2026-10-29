/**
 * Sidebar.jsx — WhatsApp Web left panel: profile, search, conversation list, and new chat drawer
 */
import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import NewChatModal from './NewChatModal.jsx'

function NewChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function formatConversationDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' })
  } catch {
    return ''
  }
}

export default function Sidebar({
  conversations = [],
  activeConversationId,
  isLoading,
  onSelectConversation,
  onRefreshConversations,
}) {
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentUsername = user?.username || ''
  const myInitial = (currentUsername[0] || '?').toUpperCase()

  // Helper to extract the chat partner's username
  function getOtherUsername(conv) {
    if (!conv?.username || !Array.isArray(conv.username)) return 'Conversation'
    const other = conv.username.find((u) => u !== currentUsername)
    return other || conv.username[0] || 'Conversation'
  }

  // Filter conversations by contact name
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations
    const term = searchTerm.toLowerCase().trim()
    return conversations.filter((c) => {
      const name = getOtherUsername(c).toLowerCase()
      return name.includes(term)
    })
  }, [conversations, searchTerm, currentUsername])

  function handleConversationCreated(newConv) {
    onSelectConversation(newConv)
    if (onRefreshConversations) {
      onRefreshConversations()
    }
  }

  return (
    <aside className="sidebar-container" aria-label="Chats sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-top-bar">
        <div className="user-profile-summary" title={`Logged in as ${currentUsername}`}>
          <div className="user-profile-avatar" aria-hidden="true">
            {myInitial}
          </div>
          <span className="user-profile-name">{currentUsername}</span>
        </div>

        <div className="sidebar-top-actions">
          <button
            className="top-action-btn"
            onClick={() => setIsModalOpen(true)}
            aria-label="New chat"
            title="Start new conversation"
          >
            <NewChatIcon />
          </button>
          <button
            className="top-action-btn"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search-bar">
        <div className="search-box">
          <span className="search-box-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="search-box-input"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search chats"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversation-list" role="list" aria-label="Conversations">
        {isLoading ? (
          <div className="sidebar-loading-state">
            <div className="spinner-sm" />
            <span>Loading chats…</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="sidebar-empty-state">
            <p className="empty-chats-label">
              {searchTerm ? 'No chats found matching your search.' : 'No conversations yet.'}
            </p>
            <button
              className="start-chat-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Start a chat
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const partnerName = getOtherUsername(conv)
            const partnerInitial = (partnerName[0] || '?').toUpperCase()
            const isActive = conv.id === activeConversationId
            const dateStr = formatConversationDate(conv.created_at)

            return (
              <div
                key={conv.id}
                role="listitem"
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv)}
                aria-selected={isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectConversation(conv)
                  }
                }}
              >
                <div className="conv-avatar" aria-hidden="true">
                  {partnerInitial}
                </div>

                <div className="conv-main">
                  <div className="conv-header-line">
                    <span className="conv-partner-name">{partnerName}</span>
                    <span className="conv-date">{dateStr}</span>
                  </div>
                  <div className="conv-sub-line">
                    <span className="conv-preview">
                      Tap to open conversation
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal to pick contacts from /userslist/ and start new conversation */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectConversation={handleConversationCreated}
      />
    </aside>
  )
}
