'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Trash2, AlertTriangle, Info, CheckCircle, XCircle, Calendar, User, Activity } from 'lucide-react';

interface LogEntry {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const LOG_LEVELS = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchTerm, levelFilter, actionFilter, dateRange]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        level: levelFilter,
        action: actionFilter,
        range: dateRange
      });
      
      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Loglar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: searchTerm,
        level: levelFilter,
        action: actionFilter,
        range: dateRange,
        export: 'true'
      });
      
      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Log export hatası:', error);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Tüm logları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    
    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchLogs();
      }
    } catch (error) {
      console.error('Log silme hatası:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLogs.length === 0) return;
    if (!confirm(`${selectedLogs.length} log kaydını silmek istediğinizden emin misiniz?`)) return;
    
    try {
      const response = await fetch('/api/admin/logs/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedLogs })
      });
      
      if (response.ok) {
        setSelectedLogs([]);
        fetchLogs();
      }
    } catch (error) {
      console.error('Toplu log silme hatası:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map(log => log.id));
    }
  };

  const toggleSelectLog = (id: string) => {
    setSelectedLogs(prev => 
      prev.includes(id) 
        ? prev.filter(logId => logId !== id)
        : [...prev, id]
    );
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'LOGIN': 'bg-purple-100 text-purple-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'VIEW': 'bg-indigo-100 text-indigo-800',
      'EXPORT': 'bg-orange-100 text-orange-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-center text-gray-600">Loglar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sistem Logları</h1>
        
        <div className="flex gap-2">
          {selectedLogs.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {selectedLogs.length} Kaydı Sil
            </button>
          )}
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
          
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Tümünü Sil
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Loglarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Seviyeler</option>
          <option value="info">Bilgi</option>
          <option value="warning">Uyarı</option>
          <option value="error">Hata</option>
          <option value="success">Başarılı</option>
        </select>
        
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Aksiyonlar</option>
          <option value="CREATE">Oluşturma</option>
          <option value="UPDATE">Güncelleme</option>
          <option value="DELETE">Silme</option>
          <option value="LOGIN">Giriş</option>
          <option value="LOGOUT">Çıkış</option>
          <option value="VIEW">Görüntüleme</option>
          <option value="EXPORT">Dışa Aktarma</option>
        </select>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1h">Son 1 Saat</option>
          <option value="24h">Son 24 Saat</option>
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
        </select>
        
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Log Kayıtları</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedLogs.length === logs.length && logs.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Tümünü Seç</span>
            </label>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seviye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksiyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesaj
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Adresi
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
              {logs.map((log) => {
                const LogIcon = LOG_LEVELS[log.level].icon;
                return (
                  <tr key={log.id} className={selectedLogs.includes(log.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => toggleSelectLog(log.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${LOG_LEVELS[log.level].bg} ${LOG_LEVELS[log.level].color}`}>
                        <LogIcon className="h-3 w-3" />
                        {log.level.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="text-sm text-gray-900 line-clamp-2">
                          {log.message}
                        </div>
                        {log.resource && (
                          <div className="text-xs text-gray-500 mt-1">
                            {log.resource}: {log.resourceId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.userName ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                          <div className="text-sm text-gray-500">{log.userEmail}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sistem</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Detayları Göster"
                      >
                        {expandedLog === log.id ? 'Gizle' : 'Detay'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Log Details */}
      {expandedLog && (
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Log Detayları</h4>
          {(() => {
            const log = logs.find(l => l.id === expandedLog);
            if (!log) return null;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mesaj</label>
                    <p className="mt-1 text-sm text-gray-900">{log.message}</p>
                  </div>
                  
                  {log.details && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Detaylar</label>
                      <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded overflow-x-auto">
                        {log.details}
                      </pre>
                    </div>
                  )}
                  
                  {log.userAgent && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">User Agent</label>
                      <p className="mt-1 text-sm text-gray-900 break-all">{log.userAgent}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Sayfa {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Önceki
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}