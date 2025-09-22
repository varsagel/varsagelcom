"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  ArrowLeft,
  MapPin,
  DollarSign,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface Listing {
  id: string;
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD';
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    offers: number;
  };
}

export default function AdminListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchListings();
    }
  }, [status, router]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/admin/listings');
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === listingId ? { ...listing, status: newStatus as any } : listing
          )
        );
      }
    } catch (error) {
      console.error('İlan durumu güncellenirken hata:', error);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${listing.user.firstName} ${listing.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' || listing.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatPriceRange = (minPrice: number, maxPrice: number) => {
    if (minPrice && maxPrice && minPrice !== maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } else if (minPrice) {
      return formatPrice(minPrice);
    } else if (maxPrice) {
      return `En fazla ${formatPrice(maxPrice)}`;
    }
    return 'Fiyat belirtilmemiş';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
      REJECTED: { label: 'Reddedildi', className: 'bg-red-100 text-red-800' },
      SOLD: { label: 'Satıldı', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">İlanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">İlan Yönetimi</h1>
                  <p className="text-sm text-gray-600">{listings.length} toplam ilan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İlan ara (başlık, açıklama, konum, kullanıcı)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Tümü ({listings.length})
                </Button>
                <Button
                  variant={filterStatus === 'ACTIVE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('ACTIVE')}
                >
                  Aktif ({listings.filter(l => l.status === 'ACTIVE').length})
                </Button>
                <Button
                  variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('PENDING')}
                >
                  Beklemede ({listings.filter(l => l.status === 'PENDING').length})
                </Button>
                <Button
                  variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('REJECTED')}
                >
                  Reddedildi ({listings.filter(l => l.status === 'REJECTED').length})
                </Button>
                <Button
                  variant={filterStatus === 'SOLD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('SOLD')}
                >
                  Satıldı ({listings.filter(l => l.status === 'SOLD').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings List */}
        <Card>
          <CardHeader>
            <CardTitle>İlanlar ({filteredListings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredListings.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    İlan bulunamadı
                  </h3>
                  <p className="text-gray-500">
                    Arama kriterlerinize uygun ilan bulunmuyor.
                  </p>
                </div>
              ) : (
                filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        <Package className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {listing.title}
                          </h3>
                          {getStatusBadge(listing.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {listing.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatPriceRange(listing.minPrice, listing.maxPrice)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(listing.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {listing.user.firstName} {listing.user.lastName}
                          </div>
                          <span>{listing._count.offers} teklif</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/listings/${listing.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          {listing.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateListingStatus(listing.id, 'ACTIVE')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateListingStatus(listing.id, 'REJECTED')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reddet
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === 'ACTIVE' && (
                            <DropdownMenuItem 
                              onClick={() => updateListingStatus(listing.id, 'REJECTED')}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Pasif Yap
                            </DropdownMenuItem>
                          )}
                          {listing.status === 'REJECTED' && (
                            <DropdownMenuItem 
                              onClick={() => updateListingStatus(listing.id, 'ACTIVE')}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aktif Yap
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}