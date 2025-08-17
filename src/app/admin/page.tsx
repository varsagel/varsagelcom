'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  Heart,
  Star,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalOffers: number;
  totalViews: number;
  totalFavorites: number;
  totalReviews: number;
  activeListings: number;
  pendingOffers: number;
  todayRegistrations: number;
  todayListings: number;
  averageRating: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'listing_created' | 'offer_made' | 'review_added';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'listing_created':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'offer_made':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'review_added':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-green-50 border-green-200';
      case 'listing_created':
        return 'bg-blue-50 border-blue-200';
      case 'offer_made':
        return 'bg-purple-50 border-purple-200';
      case 'review_added':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Varsagel platformunun genel durumu ve istatistikleri</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Toplam Kullanıcılar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.todayRegistrations} bugün</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Toplam İlanlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalListings)}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.todayListings} bugün</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Toplam Teklifler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Teklif</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalOffers)}</p>
                <p className="text-sm text-orange-600 mt-1">{stats.pendingOffers} beklemede</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Toplam Görüntülenme */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalViews)}</p>
                <p className="text-sm text-blue-600 mt-1">İlan görüntülenmeleri</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Eye className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Toplam Favoriler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Favori</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalFavorites)}</p>
                <p className="text-sm text-red-600 mt-1">Favori eklenmeler</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Ortalama Puan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-yellow-600 mt-1">{formatNumber(stats.totalReviews)} değerlendirme</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Aktif İlanlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif İlan</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.activeListings)}</p>
                <p className="text-sm text-green-600 mt-1">Yayında olan ilanlar</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Toplam Gelir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam İşlem Hacmi</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">Tamamlanan işlemler</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.user.name} ({activity.user.email})
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}