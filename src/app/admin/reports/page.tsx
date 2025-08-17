'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import for charts to improve initial page load
const Line = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
});

const Bar = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
});

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Doughnut })), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
});

// Chart.js registration will be done when the component loads
const registerChartJS = async () => {
  const ChartJS = (await import('chart.js')).Chart;
  const {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  } = await import('chart.js');

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );
};

interface ReportData {
  userRegistrations: {
    labels: string[];
    data: number[];
  };
  listingCreations: {
    labels: string[];
    data: number[];
  };
  offerActivity: {
    labels: string[];
    data: number[];
  };
  categoryDistribution: {
    labels: string[];
    data: number[];
  };
  revenueData: {
    labels: string[];
    data: number[];
  };
  topUsers: {
    name: string;
    email: string;
    listingCount: number;
    offerCount: number;
  }[];
  topListings: {
    title: string;
    viewCount: number;
    offerCount: number;
    price: number;
  }[];
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'revenue'>('overview');
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    // Register Chart.js components when component mounts
    registerChartJS().then(() => {
      setChartsReady(true);
    });
  }, []);

  useEffect(() => {
    if (chartsReady) {
      fetchReportData();
    }
  }, [dateRange, chartsReady]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reports?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.reports);
      }
    } catch (error) {
      console.error('Raporlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-center text-gray-600">Raporlar yükleniyor...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">Rapor verileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar ve Analitik</h1>
        
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="1y">Son 1 Yıl</option>
          </select>
          
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Genel Bakış' },
            { id: 'users', name: 'Kullanıcılar' },
            { id: 'listings', name: 'İlanlar' },
            { id: 'revenue', name: 'Gelir' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Genel Bakış */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Kayıtları</h3>
            <Line
              data={{
                labels: reportData.userRegistrations.labels,
                datasets: [
                  {
                    label: 'Yeni Kayıtlar',
                    data: reportData.userRegistrations.data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İlan Oluşturma</h3>
            <Line
              data={{
                labels: reportData.listingCreations.labels,
                datasets: [
                  {
                    label: 'Yeni İlanlar',
                    data: reportData.listingCreations.data,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Teklif Aktivitesi</h3>
            <Bar
              data={{
                labels: reportData.offerActivity.labels,
                datasets: [
                  {
                    label: 'Teklifler',
                    data: reportData.offerActivity.data,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgb(245, 158, 11)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kategori Dağılımı</h3>
            <Doughnut
              data={{
                labels: reportData.categoryDistribution.labels,
                datasets: [
                  {
                    data: reportData.categoryDistribution.data,
                    backgroundColor: [
                      '#3B82F6',
                      '#10B981',
                      '#F59E0B',
                      '#EF4444',
                      '#8B5CF6',
                      '#F97316',
                      '#06B6D4',
                      '#84CC16',
                    ],
                  },
                ],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      )}

      {/* Kullanıcı Raporları */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Kayıt Trendi</h3>
            <Line
              data={{
                labels: reportData.userRegistrations.labels,
                datasets: [
                  {
                    label: 'Yeni Kayıtlar',
                    data: reportData.userRegistrations.data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">En Aktif Kullanıcılar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlan Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teklif Sayısı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.topUsers.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.listingCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.offerCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* İlan Raporları */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İlan Oluşturma Trendi</h3>
            <Line
              data={{
                labels: reportData.listingCreations.labels,
                datasets: [
                  {
                    label: 'Yeni İlanlar',
                    data: reportData.listingCreations.data,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">En Popüler İlanlar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görüntülenme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teklif Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.topListings.map((listing, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {listing.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.viewCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.offerCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {listing.price.toLocaleString('tr-TR')} TL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Gelir Raporları */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gelir Trendi</h3>
            <Line
              data={{
                labels: reportData.revenueData.labels,
                datasets: [
                  {
                    label: 'Gelir (TL)',
                    data: reportData.revenueData.data,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString('tr-TR') + ' TL';
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Toplam Gelir</div>
              <div className="text-2xl font-bold text-green-600">
                {reportData.revenueData.data.reduce((a, b) => a + b, 0).toLocaleString('tr-TR')} TL
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Ortalama Günlük Gelir</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(reportData.revenueData.data.reduce((a, b) => a + b, 0) / reportData.revenueData.data.length).toLocaleString('tr-TR')} TL
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">En Yüksek Günlük Gelir</div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...reportData.revenueData.data).toLocaleString('tr-TR')} TL
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}