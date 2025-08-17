'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  Flag,
  Shield,
  Clock,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface ModerationItem {
  id: string;
  type: 'USER' | 'LISTING' | 'REVIEW' | 'MESSAGE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reportReason: string;
  reportedAt: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  target: {
    id: string;
    title?: string;
    content?: string;
    name?: string;
    email?: string;
  };
  moderatorNotes?: string;
  resolvedAt?: string;
  resolvedBy?: {
    id: string;
    name: string;
  };
}

interface ModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  urgent: number;
}

export default function AdminModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'reportedAt' | 'priority' | 'type'>('reportedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchModerationItems();
  }, [currentPage, searchTerm, typeFilter, statusFilter, priorityFilter, sortBy, sortOrder]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
        sortOrder,
        limit: '20'
      });

      const response = await fetch(`/api/admin/moderation?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
        setStats(data.stats);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch moderation items');
      }
    } catch (error) {
      console.error('Error fetching moderation items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemAction = async (itemId: string, action: 'approve' | 'reject' | 'flag', notes?: string) => {
    try {
      setIsUpdating(itemId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/moderation/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        fetchModerationItems();
      } else {
        console.error('Failed to update moderation item');
      }
    } catch (error) {
      console.error('Error updating moderation item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'flag') => {
    if (selectedItems.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/moderation/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          itemIds: selectedItems,
          action 
        })
      });

      if (response.ok) {
        setSelectedItems([]);
        fetchModerationItems();
      } else {
        console.error('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Beklemede' },
      'APPROVED': { color: 'bg-green-100 text-green-800', label: 'Onaylandı' },
      'REJECTED': { color: 'bg-red-100 text-red-800', label: 'Reddedildi' },
      'FLAGGED': { color: 'bg-orange-100 text-orange-800', label: 'İşaretlendi' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'LOW': { color: 'bg-gray-100 text-gray-800', label: 'Düşük' },
      'MEDIUM': { color: 'bg-blue-100 text-blue-800', label: 'Orta' },
      'HIGH': { color: 'bg-orange-100 text-orange-800', label: 'Yüksek' },
      'URGENT': { color: 'bg-red-100 text-red-800', label: 'Acil' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.LOW;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'USER': <User className="h-4 w-4" />,
      'LISTING': <FileText className="h-4 w-4" />,
      'REVIEW': <MessageSquare className="h-4 w-4" />,
      'MESSAGE': <MessageSquare className="h-4 w-4" />
    };
    
    return icons[type as keyof typeof icons] || <AlertTriangle className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'USER': 'Kullanıcı',
      'LISTING': 'İlan',
      'REVIEW': 'Değerlendirme',
      'MESSAGE': 'Mesaj'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moderasyon</h1>
          <p className="text-gray-600 mt-1">Raporlanan içerikleri ve kullanıcıları yönetin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-600">Moderasyon Merkezi</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Toplam Rapor</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Beklemede</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Onaylandı</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Reddedildi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
              <div className="text-sm text-gray-600">İşaretlendi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-gray-600">Acil</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rapor ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tür filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="USER">Kullanıcı</SelectItem>
                <SelectItem value="LISTING">İlan</SelectItem>
                <SelectItem value="REVIEW">Değerlendirme</SelectItem>
                <SelectItem value="MESSAGE">Mesaj</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="approved">Onaylandı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="flagged">İşaretlendi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Öncelik filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reportedAt-desc">En Yeni</SelectItem>
                <SelectItem value="reportedAt-asc">En Eski</SelectItem>
                <SelectItem value="priority-desc">Öncelik (Yüksek)</SelectItem>
                <SelectItem value="priority-asc">Öncelik (Düşük)</SelectItem>
                <SelectItem value="type-asc">Tür (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedItems.length} öğe seçildi
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Onayla
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reddet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('flag')}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  İşaretle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length && items.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(items.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hedef
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rapor Nedeni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raporlayan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Öncelik
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
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">
                          {item.target.title || item.target.name || 'N/A'}
                        </div>
                        {item.target.content && (
                          <div className="text-sm text-gray-500 truncate">
                            {item.target.content}
                          </div>
                        )}
                        {item.target.email && (
                          <div className="text-sm text-gray-500">
                            {item.target.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.reportReason}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.reportedBy.name}</div>
                        <div className="text-sm text-gray-500">{item.reportedBy.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(item.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(item.reportedAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.reportedAt).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/moderation/${item.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {item.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleItemAction(item.id, 'approve')}
                              disabled={isUpdating === item.id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleItemAction(item.id, 'reject')}
                              disabled={isUpdating === item.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleItemAction(item.id, 'flag')}
                              disabled={isUpdating === item.id}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Sayfa {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}