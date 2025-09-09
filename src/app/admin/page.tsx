'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Package,
  DollarSign,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Settings,
  Eye,
  Ban,
  Check,
  X,
  Trash2
} from 'lucide-react'

interface AdminStats {
  overview: {
    totalUsers: number
    totalListings: number
    totalOffers: number
    totalMessages: number
    recentUsers: number
    recentListings: number
    recentOffers: number
  }
  charts: {
    userStats: Array<{ date: string; count: number }>
    listingStats: Array<{ date: string; count: number }>
    offerStats: Array<{ date: string; count: number; accepted: number; rejected: number }>
    categoryStats: Array<{ categoryId: string; categoryName: string; count: number }>
  }
  activeUsers: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    _count: {
      listings: number
      offers: number
      sentMessages: number
    }
  }>
  recentActivities: Array<{
    id: string
    title: string
    createdAt: string
    status: string
    user: {
      name: string
      email: string
    }
    category: {
      name: string
    }
  }>
  dateRange: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session, status, dateRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin?dateRange=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 403) {
        router.push('/')
      }
    } catch (error) {
      console.error('Admin istatistikleri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminAction = async (action: string, targetId: string, reason?: string) => {
    setActionLoading(targetId)
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, targetId, reason })
      })

      if (response.ok) {
        // Başarılı işlem sonrası istatistikleri yenile
        fetchStats()
      }
    } catch (error) {
      console.error('Admin işlemi sırasında hata:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      case 'DELETED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif'
      case 'PENDING': return 'Beklemede'
      case 'REJECTED': return 'Reddedildi'
      case 'DELETED': return 'Silindi'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya erişim için admin yetkisi gerekiyor.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-gray-600 mt-2">Sistem yönetimi ve istatistikler</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
                <option value="1y">Son 1 Yıl</option>
              </select>
              
              <Link
                href="/admin/users"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Kullanıcı Yönetimi</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.overview.totalUsers)}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats.overview.recentUsers} son {dateRange === '7d' ? '7 gün' : dateRange === '30d' ? '30 gün' : dateRange === '90d' ? '90 gün' : '1 yıl'}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.overview.totalListings)}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats.overview.recentListings} son {dateRange === '7d' ? '7 gün' : dateRange === '30d' ? '30 gün' : dateRange === '90d' ? '90 gün' : '1 yıl'}
                </p>
              </div>
              <Package className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Teklif</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.overview.totalOffers)}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats.overview.recentOffers} son {dateRange === '7d' ? '7 gün' : dateRange === '30d' ? '30 gün' : dateRange === '90d' ? '90 gün' : '1 yıl'}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.overview.totalMessages)}</p>
                <p className="text-sm text-gray-600 mt-1">Sistem geneli</p>
              </div>
              <MessageCircle className="h-12 w-12 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Kategori İstatistikleri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Popüler Kategoriler</h3>
              <PieChart className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {stats.charts.categoryStats.slice(0, 8).map((category, index) => {
                const percentage = (category.count / stats.overview.totalListings) * 100
                return (
                  <div key={category.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-blue-${(index % 3 + 1) * 200}`}></div>
                      <span className="text-sm font-medium text-gray-900">{category.categoryName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{category.count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* En Aktif Kullanıcılar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">En Aktif Kullanıcılar</h3>
              <Activity className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              {stats.activeUsers.slice(0, 8).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user._count.listings + user._count.offers + user._count.sentMessages} aktivite
                    </p>
                    <p className="text-xs text-gray-500">
                      {user._count.listings} ilan, {user._count.offers} teklif
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Son İlanlar</h3>
              <Link
                href="/admin/listings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Tümünü Görüntüle
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">#{activity.id.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.user.name}</p>
                        <p className="text-sm text-gray-500">{activity.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{activity.category.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(activity.status)
                      }`}>
                        {getStatusText(activity.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/ilan/${activity.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        {activity.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAdminAction('approve_listing', activity.id)}
                              disabled={actionLoading === activity.id}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAdminAction('reject_listing', activity.id, 'Admin tarafından reddedildi')}
                              disabled={actionLoading === activity.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {activity.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleAdminAction('delete_listing', activity.id, 'Admin tarafından silindi')}
                            disabled={actionLoading === activity.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}