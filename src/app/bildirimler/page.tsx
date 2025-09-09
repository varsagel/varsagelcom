'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  Package, 
  DollarSign, 
  Clock,
  X,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
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

type FilterType = 'all' | 'unread' | 'NEW_MESSAGE' | 'NEW_OFFER' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'LISTING_EXPIRED' | 'SYSTEM'

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session, status, currentPage, filter, searchTerm])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (filter !== 'all') {
        if (filter === 'unread') {
          params.append('unread', 'true')
        } else {
          params.append('type', filter)
        }
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data: NotificationResponse = await response.json()
        setNotifications(data.notifications)
        setTotalPages(data.pagination.totalPages)
        setUnreadCount(data.unreadCount)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error)
    } finally {
      setLoading(false)
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

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      const response = await fetch(`/api/notifications?ids=${notificationIds.join(',')}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => !notificationIds.includes(notif.id)))
        setSelectedNotifications([])
        
        // Silinen okunmamış bildirimlerin sayısını hesapla
        const deletedUnreadCount = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.isRead
        ).length
        
        setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount))
        setTotal(prev => prev - notificationIds.length)
      }
    } catch (error) {
      console.error('Bildirimler silinirken hata:', error)
    }
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map(n => n.id))
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Okunmamışsa okundu olarak işaretle
    if (!notification.isRead) {
      markAsRead([notification.id])
    }
    
    // Eğer action URL varsa yönlendir
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageCircle className="h-5 w-5 text-blue-600" />
      case 'NEW_OFFER':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'OFFER_ACCEPTED':
        return <CheckCheck className="h-5 w-5 text-green-600" />
      case 'OFFER_REJECTED':
        return <X className="h-5 w-5 text-red-600" />
      case 'LISTING_EXPIRED':
        return <Clock className="h-5 w-5 text-orange-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case 'all': return 'Tümü'
      case 'unread': return 'Okunmamış'
      case 'NEW_MESSAGE': return 'Yeni Mesajlar'
      case 'NEW_OFFER': return 'Yeni Teklifler'
      case 'OFFER_ACCEPTED': return 'Kabul Edilen Teklifler'
      case 'OFFER_REJECTED': return 'Reddedilen Teklifler'
      case 'LISTING_EXPIRED': return 'Süresi Dolan İlanlar'
      case 'SYSTEM': return 'Sistem Bildirimleri'
      default: return filterType
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
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
              <p className="text-gray-600 mt-2">
                Toplam {total} bildirim, {unreadCount} okunmamış
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Tümünü Okundu İşaretle</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Bildirimlerde ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as FilterType)
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tümü</option>
                <option value="unread">Okunmamış</option>
                <option value="NEW_MESSAGE">Yeni Mesajlar</option>
                <option value="NEW_OFFER">Yeni Teklifler</option>
                <option value="OFFER_ACCEPTED">Kabul Edilen</option>
                <option value="OFFER_REJECTED">Reddedilen</option>
                <option value="LISTING_EXPIRED">Süresi Dolan</option>
                <option value="SYSTEM">Sistem</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedNotifications.length} bildirim seçildi
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => markAsRead(selectedNotifications)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Okundu İşaretle
                </button>
                <button
                  onClick={() => deleteNotifications(selectedNotifications)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Bildirimler yükleniyor...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirim bulunamadı</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Henüz hiç bildiriminiz yok.' 
                  : `"${getFilterLabel(filter)}" kategorisinde bildirim bulunamadı.`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === notifications.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Tümünü Seç
                  </span>
                </label>
              </div>

              {/* Notifications */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification.id])
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {notification.actionUrl ? (
                            <button
                              onClick={() => handleNotificationClick(notification)}
                              className="text-left w-full"
                            >
                              <h3 className={`text-lg font-medium text-gray-900 ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </button>
                          ) : (
                            <div>
                              <h3 className={`text-lg font-medium text-gray-900 ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            
                            {!notification.isRead && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Yeni
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Okundu işaretle"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotifications([notification.id])}
                            className="text-red-600 hover:text-red-800 p-2"
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
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Sayfa {currentPage} / {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}