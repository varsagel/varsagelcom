'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  User, 
  Clock,
  CheckCheck,
  Search,
  Package
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
}

interface Listing {
  id: string
  title: string
  price?: number
  status: string
}

interface Message {
  id: string
  content: string
  senderId: string
  conversationId: string
  isRead: boolean
  readAt?: string
  createdAt: string
  sender: User
}

interface Conversation {
  id: string
  listingId?: string
  createdAt: string
  updatedAt: string
  participants: User[]
  listing?: Listing
  messages: Message[]
  _count: {
    messages: number
  }
}

interface ConversationDetail {
  conversation: Conversation
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchConversations()
    }
  }, [status, router])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Konuşmalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedConversation(data)
        
        // Konuşma listesindeki okunmamış mesaj sayısını güncelle
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, _count: { messages: 0 } }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const otherParticipant = selectedConversation.conversation.participants.find(
        p => p.id !== session?.user?.id
      )

      if (!otherParticipant) return

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: otherParticipant.id,
          content: newMessage.trim(),
          listingId: selectedConversation.conversation.listingId
        })
      })

      if (response.ok) {
        const newMsg = await response.json()
        setSelectedConversation(prev => {
          if (!prev) return null
          return {
            ...prev,
            messages: [...prev.messages, newMsg]
          }
        })
        setNewMessage('')
        
        // Konuşma listesini güncelle
        fetchConversations()
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 168) { // 7 gün
      return date.toLocaleDateString('tr-TR', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== session?.user?.id)
  }

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv)
    const searchLower = searchTerm.toLowerCase()
    
    return (
      otherParticipant?.name?.toLowerCase().includes(searchLower) ||
      conv.listing?.title?.toLowerCase().includes(searchLower) ||
      conv.messages[0]?.content?.toLowerCase().includes(searchLower)
    )
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mesajlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-8rem)]">
          <div className="flex h-full">
            {/* Konuşma Listesi */}
            <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200 flex flex-col`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                    Mesajlar
                  </h1>
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </div>
                
                {/* Arama */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Konuşmalarda ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Konuşma Listesi */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Henüz mesajınız bulunmuyor</p>
                    <p className="text-sm mt-2">İlan sahipleriyle iletişime geçin</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation)
                    const lastMessage = conversation.messages[0]
                    const unreadCount = conversation._count.messages

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => fetchConversationMessages(conversation.id)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.conversation.id === conversation.id
                            ? 'bg-blue-50 border-blue-200'
                            : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {otherParticipant?.name || 'Bilinmeyen Kullanıcı'}
                              </p>
                              <div className="flex items-center space-x-2">
                                {lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(lastMessage.createdAt)}
                                  </span>
                                )}
                                {unreadCount > 0 && (
                                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {conversation.listing && (
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Package className="h-3 w-3 mr-1" />
                                <span className="truncate">{conversation.listing.title}</span>
                              </div>
                            )}
                            
                            {lastMessage && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {lastMessage.senderId === session?.user?.id ? 'Siz: ' : ''}
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Mesaj Alanı */}
            <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        
                        <div>
                          <h2 className="font-medium text-gray-900">
                            {getOtherParticipant(selectedConversation.conversation)?.name || 'Bilinmeyen Kullanıcı'}
                          </h2>
                          {selectedConversation.conversation.listing && (
                            <p className="text-sm text-gray-500 flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              {selectedConversation.conversation.listing.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mesajlar */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isOwn = message.senderId === session?.user?.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwn && message.isRead && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Mesaj Gönderme */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Mesajınızı yazın..."
                        rows={1}
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Mesajlaşmaya başlayın</p>
                    <p className="text-sm">Bir konuşma seçin veya yeni bir mesaj gönderin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}