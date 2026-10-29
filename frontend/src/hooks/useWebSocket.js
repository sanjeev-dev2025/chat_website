/**
 * useWebSocket.js — WebSocket lifecycle hook for conversations
 *
 * Manages WebSocket connection to the currently active conversation,
 * handles message deduplication, and cleans up when the conversation changes or unmounts.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { createChatSocket, WS_STATUS } from '../services/websocket.js'

export function useWebSocket(conversationId, token) {
  const [status, setStatus] = useState(WS_STATUS.DISCONNECTED)
  const [messages, setMessages] = useState([])
  const [wsError, setWsError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const socketRef = useRef(null)
  const seenIdsRef = useRef(new Set()) // deduplication guard

  const addMessage = useCallback((msg) => {
    if (!msg || !msg.id) return
    if (seenIdsRef.current.has(msg.id)) return
    seenIdsRef.current.add(msg.id)
    setMessages((prev) => [...prev, msg])
  }, [])

  useEffect(() => {
    // If no active conversation or no token, ensure disconnected state
    if (!conversationId || !token) {
      if (socketRef.current) {
        socketRef.current.destroy()
        socketRef.current = null
      }
      setStatus(WS_STATUS.DISCONNECTED)
      setMessages([])
      setWsError(null)
      setIsLoading(false)
      seenIdsRef.current.clear()
      return
    }

    setIsLoading(true)
    setMessages([])
    setWsError(null)
    seenIdsRef.current.clear()

    const socket = createChatSocket(conversationId, token, {
      onStatus: (s) => {
        setStatus(s)
        if (s === WS_STATUS.CONNECTED) {
          setWsError(null)
        }
      },
      onHistory: (historyMsgs) => {
        seenIdsRef.current = new Set(historyMsgs.map((m) => m.id))
        setMessages(historyMsgs)
        setIsLoading(false)
      },
      onMessage: (msg) => {
        setIsLoading(false)
        addMessage(msg)
      },
      onError: (errMsg) => {
        setWsError(errMsg)
        setIsLoading(false)
      },
    })

    socketRef.current = socket

    return () => {
      socket.destroy()
      socketRef.current = null
    }
  }, [conversationId, token, addMessage])

  const sendMessage = useCallback((text) => {
    socketRef.current?.send(text)
  }, [])

  return { status, messages, wsError, isLoading, sendMessage }
}
