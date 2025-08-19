'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  MessageSquare, 
  Star,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalListings: number;
    totalOffers: number;
    totalReviews: number;
    totalRevenue: number;
    activeUsers: number;
    userGrowth: number;
    listingGrowth: number;
    offerGrowth: number;
    reviewGrowth: number;
  };
  userStats: {
    daily: Array<{ date: string; users: number; newUsers: number }>;
    monthly: Array<{ month: string; users: number; newUsers: number }>;
    demographics: Array<{ name: string; value: number; color: string }>;
  };
  listingStats: {
    daily: Array<{ date: string; listings: number; approved: number; pending: number }>;
    monthly: Array<{ month: string; listings: number; approved: number; pending: number }>;
    categories: Array<{ category: string; count: number; percentage: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
  offerStats: {
    daily: Array<{ date: string; offers: number; accepted: number; rejected: number }>;
    monthly: Array<{ month: string; offers: number; accepted: number; rejected: number }>;
    statusDistribution: Array<{ status: string; count: number; color: string }>;
  };
  reviewStats: {
    daily: Array<{ date: string; reviews: number; averageRating: number }>;
    monthly: Array<{ month: string; reviews: number; averageRating: number }>;
    ratingDistribution: Array<{ rating: number; count: number }>;
  };
  revenueStats: {
    daily: Array<{ date: string; revenue: number; transactions: number }>;
    monthly: Array<{ month: string; revenue: number; transactions: number }>;
    sources: Array<{ source: string; amount: number; percentage: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Analytics data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Analytics verisi yüklenemedi.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Son 7 Gün</SelectItem>
            <SelectItem value="30d">Son 30 Gün</SelectItem>
            <SelectItem value="90d">Son 90 Gün</SelectItem>
            <SelectItem value="1y">Son 1 Yıl</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${
                data.overview.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.overview.userGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.overview.userGrowth)}%
              </span>
              {' '}geçen döneme göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İlan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${
                data.overview.listingGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.overview.listingGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.overview.listingGrowth)}%
              </span>
              {' '}geçen döneme göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teklif</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalOffers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${
                data.overview.offerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.overview.offerGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.overview.offerGrowth)}%
              </span>
              {' '}geçen döneme göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{data.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1 inline" />
                +12.5%
              </span>
              {' '}geçen döneme göre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="listings">İlanlar</TabsTrigger>
          <TabsTrigger value="offers">Teklifler</TabsTrigger>
          <TabsTrigger value="reviews">Değerlendirmeler</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Günlük Kullanıcı Aktivitesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.userStats.daily.slice(-7).map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{day.date}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{day.users} kullanıcı</div>
                        <div className="text-xs text-green-600">+{day.newUsers} yeni</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Demografisi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.userStats.demographics.map((demo, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{demo.name}</span>
                      <span className="text-sm font-medium">{demo.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.listingStats.categories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{category.category}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{category.count} ilan</div>
                        <div className="text-xs text-gray-500">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fiyat Aralıkları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.listingStats.priceRanges.map((range, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{range.range}</span>
                      <span className="text-sm font-medium">{range.count} ilan</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Teklif Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.offerStats.statusDistribution.map((status, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{status.status}</span>
                      <span className="text-sm font-medium">{status.count} teklif</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Günlük Teklif Aktivitesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.offerStats.daily.slice(-7).map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{day.date}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{day.offers} teklif</div>
                        <div className="text-xs text-green-600">{day.accepted} kabul</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Puan Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.reviewStats.ratingDistribution.map((rating, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm flex items-center">
                        {rating.rating} <Star className="h-3 w-3 ml-1 text-yellow-500" />
                      </span>
                      <span className="text-sm font-medium">{rating.count} değerlendirme</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Günlük Değerlendirmeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.reviewStats.daily.slice(-7).map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{day.date}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{day.reviews} değerlendirme</div>
                        <div className="text-xs text-yellow-600">Ort: {day.averageRating.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}