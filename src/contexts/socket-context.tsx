'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

// Socket mesaj tipleri
export interface SocketMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  createdAt: string
  tempId?: string
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  readBy: {
    userId: string
    readAt: string
  }[]
}

export interface TypingUser {
  userId: string
  userName: string
  conversationId: string
  isTyping: boolean
}

export interface SocketNotification {
  id: string
  type: 'message' | 'offer' | 'system'
  title: string
  message: string
  userId: string
  createdAt: string
  read: boolean
  data?: any
}

// Socket context tipi
interface SocketContextType {
  socket: any | null
  isConnected: boolean
  onlineUsers: Set<string>
  typingUsers: TypingUser[]
  notifications: SocketNotification[]
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (message: Omit<SocketMessage, 'id' | 'createdAt' | 'readBy'>) => void
  markMessagesAsRead: (conversationId: string) => void
  setTyping: (conversationId: string, isTyping: boolean) => void
  onMessage: (callback: (message: SocketMessage) => void) => () => void
  onMessageError: (callback: (error: { message: string; tempId?: string }) => void) => () => void
  onMessagesRead: (callback: (data: { conversationId: string; readerId: string }) => void) => () => void
  clearNotification: (notificationId: string) => void
  clearAllNotifications: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Geçici olarak tüm socket işlevleri devre dışı
  const [socket] = useState<any | null>(null)
  const [isConnected] = useState(false)
  const [onlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers] = useState<TypingUser[]>([])
  const [notifications] = useState<SocketNotification[]>([])
  
  const messageCallbacks = useRef<Set<(message: SocketMessage) => void>>(new Set())
  const messageErrorCallbacks = useRef<Set<(error: { message: string; tempId?: string }) => void>>(new Set())
  const messagesReadCallbacks = useRef<Set<(data: { conversationId: string; readerId: string }) => void>>(new Set())

  useEffect(() => {
    console.log('Socket provider loaded but connection disabled')
  }, [])

  // Dummy functions
  const joinConversation = () => {}
  const leaveConversation = () => {}
  const sendMessage = () => {}
  const markMessagesAsRead = () => {}
  const setTyping = () => {}
  const clearNotification = () => {}
  const clearAllNotifications = () => {}

  const onMessage = (callback: (message: SocketMessage) => void) => {
    messageCallbacks.current.add(callback)
    return () => messageCallbacks.current.delete(callback)
  }

  const onMessageError = (callback: (error: { message: string; tempId?: string }) => void) => {
    messageErrorCallbacks.current.add(callback)
    return () => messageErrorCallbacks.current.delete(callback)
  }

  const onMessagesRead = (callback: (data: { conversationId: string; readerId: string }) => void) => {
    messagesReadCallbacks.current.add(callback)
    return () => messagesReadCallbacks.current.delete(callback)
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    notifications,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessagesAsRead,
    setTyping,
    onMessage,
    onMessageError,
    onMessagesRead,
    clearNotification,
    clearAllNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider