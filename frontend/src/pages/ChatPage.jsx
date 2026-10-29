/**
 * ChatPage.jsx — WhatsApp Web Main Dashboard
 *
 * Integrates:
 *   - Sidebar with real conversations from GET /conversation/
 *   - New conversation modal using GET /userslist/ and POST /startconversation/
 *   - WebSocket connection scoped to active conversation: ws://.../ws/chat/<id>/?token=...
 *   - Message history loaded automatically on connect
 *   - Real-time incoming & outgoing message rendering
 *   - Mobile responsive navigation with back button
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useWebSocket } from '../hooks/useWebSocket.js'
import { WS_STATUS } from '../services/websocket.js'
import { getConversations } from '../services/api.js'

import Sidebar from '../components/Sidebar.jsx'
import ChatHeader from '../components/ChatHeader.jsx'
import MessageList from '../components/MessageList.jsx'
import Composer from '../components/Composer.jsx'
import EmptyChat from '../components/EmptyChat.jsx'

export default function ChatPage() {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [draft, setDraft] = useState('')

  // Load conversations on mount
  const refreshConversations = useCallback(async () => {
    try {
      const data = await getConversations()
      const convList = Array.isArray(data) ? data : []
      setConversations(convList)
      return convList
    } catch (err) {
      console.error('Failed to load conversations:', err)
      return []
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  useEffect(() => {
    refreshConversations()
  }, [refreshConversations])

  // WebSocket hook bound to active conversation
  const {
    status,
    messages,
    wsError,
    isLoading: isLoadingMessages,
    sendMessage,
  } = useWebSocket(activeConversation?.id, token)

  function handleSendMessage() {
    const text = draft.trim()
    if (!text || status !== WS_STATUS.CONNECTED) return
    sendMessage(text)
    setDraft('')
  }

  function handleSelectConversation(conv) {
    setActiveConversation(conv)
    setDraft('')
    // Add to conversations list if not already present
    setConversations((prev) => {
      if (prev.some((c) => c.id === conv.id)) return prev
      return [conv, ...prev]
    })
  }

  function handleBackToConversations() {
    setActiveConversation(null)
  }

  return (
    <div className={`whatsapp-app-layout ${activeConversation ? 'has-active-chat' : ''}`}>
      {/* Top green accent bar like WhatsApp Web */}
      <div className="whatsapp-top-bar" aria-hidden="true" />

      <div className="whatsapp-window-container">
        {/* Left Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          isLoading={isLoadingConversations}
          onSelectConversation={handleSelectConversation}
          onRefreshConversations={refreshConversations}
        />

        {/* Main Chat Area */}
        <main className="whatsapp-chat-panel" aria-label="Chat panel">
          {activeConversation ? (
            <div className="active-chat-container">
              {/* WhatsApp Header */}
              <ChatHeader
                conversation={activeConversation}
                currentUsername={user?.username}
                status={status}
                onBack={handleBackToConversations}
              />

              {/* WebSocket Error Banner */}
              {wsError && (
                <div className="chat-error-banner" role="alert">
                  <span>⚠️ {wsError}</span>
                </div>
              )}

              {/* Message List */}
              <MessageList
                messages={messages}
                isLoading={isLoadingMessages}
                currentUsername={user?.username}
              />

              {/* Composer */}
              <Composer
                value={draft}
                onChange={setDraft}
                onSend={handleSendMessage}
                disabled={status !== WS_STATUS.CONNECTED}
              />
            </div>
          ) : (
            <EmptyChat
              onOpenNewChat={() => {
                // Trigger modal opening in sidebar via synthetic event or click
                const newChatBtn = document.querySelector('.top-action-btn[aria-label="New chat"]')
                if (newChatBtn) newChatBtn.click()
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
