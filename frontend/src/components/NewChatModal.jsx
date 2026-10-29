/**
 * NewChatModal.jsx — WhatsApp-style contact picker / new conversation modal
 */
import { useState, useEffect } from 'react'
import { getUsersList, startConversation } from '../services/api.js'

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

export default function NewChatModal({ isOpen, onClose, onSelectConversation }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [startingUserId, setStartingUserId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setIsLoading(true)
    setError(null)
    setSearch('')

    getUsersList()
      .then((data) => {
        if (isMounted) {
          setUsers(Array.isArray(data) ? data : [])
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load contacts.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleUserClick(userId) {
    if (startingUserId) return
    setStartingUserId(userId)
    setError(null)

    try {
      const conv = await startConversation(userId)
      onSelectConversation(conv)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not start conversation.')
    } finally {
      setStartingUserId(null)
    }
  }

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="New chat">
      <div className="new-chat-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="new-chat-header">
          <div className="new-chat-header-title">
            <h2>New Chat</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="new-chat-search">
          <div className="search-input-wrap">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search contacts by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="search-input"
            />
          </div>
        </div>

        {/* Error */}
        {error && <div className="modal-error-banner" role="alert">{error}</div>}

        {/* Contacts List */}
        <div className="new-chat-list" role="list">
          {isLoading ? (
            <div className="modal-loading">
              <div className="spinner-sm" />
              <span>Loading contacts...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="modal-empty">
              <div className="empty-avatar"><UserIcon /></div>
              <p>{search ? 'No matching contacts found' : 'No other users registered yet'}</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isStarting = startingUserId === u.id
              const initial = (u.username || '?')[0].toUpperCase()

              return (
                <button
                  key={u.id}
                  className="contact-item"
                  onClick={() => handleUserClick(u.id)}
                  disabled={isStarting}
                  role="listitem"
                >
                  <div className="contact-avatar">{initial}</div>
                  <div className="contact-info">
                    <span className="contact-name">{u.username}</span>
                    <span className="contact-subtitle">Tap to start chatting</span>
                  </div>
                  {isStarting && <div className="spinner-sm" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

