'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  Package, 
  DollarSign, 
  Clock,
  Settings
} from 'lucide-react'

interface Notification {
  id: string
  type: 'NEW_MESSAGE' | 'NEW_OFFER' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'LISTING_EXPIRED' | 'SYSTEM'
  title: string
  message: string
  isRead: boolean
  readAt?: string
  createdAt: string
  relatedId?: string
  relatedType?: 'LISTING' | 'OFFER' | 'MESSAGE' | 'USER'
  actionUrl?: string
}

interface NotificationResponse {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  unreadCount: number
}

export default function NotificationCenter() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
      // Her 30 saniyede bir bildirimleri güncelle
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async (pageNum = 1, append = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=10`)
      if (response.ok) {
        const data: NotificationResponse = await response.json()
        
        if (append) {
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          setNotifications(data.notifications)
        }
        
        setUnreadCount(data.unreadCount)
        setHasMore(data.pagination.page < data.pagination.totalPages)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount)
        
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAll: true })
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount)
        
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            isRead: true, 
            readAt: new Date().toISOString() 
          }))
        )
      }
    } catch (error) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?ids=${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        
        // Eğer silinen bildirim okunmamışsa sayacı güncelle
        const deletedNotif = notifications.find(n => n.id === notificationId)
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Bildirim silinirken hata:', error)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      case 'NEW_OFFER':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'OFFER_ACCEPTED':
        return <CheckCheck className="h-4 w-4 text-green-600" />
      case 'OFFER_REJECTED':
        return <X className="h-4 w-4 text-red-600" />
      case 'LISTING_EXPIRED':
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} dakika önce`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat önce`
    } else if (diffInHours < 168) { // 7 gün
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} gün önce`
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Okunmamışsa okundu olarak işaretle
    if (!notification.isRead) {
      markAsRead([notification.id])
    }
    
    // Eğer action URL varsa yönlendir
    if (notification.actionUrl) {
      setIsOpen(false)
      // Link component kullanarak yönlendirme yapılacak
    }
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bildirim Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Bildirim Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bildirim Listesi */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Bildirimler yükleniyor...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Henüz bildiriminiz yok</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {notification.actionUrl ? (
                              <Link
                                href={notification.actionUrl}
                                onClick={() => handleNotificationClick(notification)}
                                className="block"
                              >
                                <p className={`text-sm font-medium text-gray-900 ${
                                  !notification.isRead ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </Link>
                            ) : (
                              <div onClick={() => handleNotificationClick(notification)}>
                                <p className={`text-sm font-medium text-gray-900 ${
                                  !notification.isRead ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-2">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead([notification.id])}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Okundu işaretle"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Daha Fazla Yükle */}
                {hasMore && (
                  <div className="p-4 text-center border-t border-gray-200">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                    >
                      {loading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Link
              href="/bildirimler"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Tüm Bildirimleri Görüntüle
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}