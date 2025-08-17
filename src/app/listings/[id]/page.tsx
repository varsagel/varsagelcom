'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import QuestionSection from '@/components/ui/QuestionSection';
import { useViewCountStream } from '@/hooks/useViewCountStream';
import { formatCity, formatDistrict } from '@/utils/locationUtils';
import { 
  ArrowLeft, Calendar, Clock, Heart, MapPin, MessageSquare, Share2, User, 
  Eye, Star, Shield, Award, TrendingUp, Users, CheckCircle, 
  Camera, Play, Download, ExternalLink, Copy, Facebook, 
  Twitter, Linkedin, Mail, Phone, Globe, Bookmark,
  ChevronLeft, ChevronRight, ZoomIn, MoreHorizontal,
  Flag, AlertTriangle, ThumbsUp, ThumbsDown, ArrowRight,
  MessageCircle, Link as LinkIcon, X
} from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  district?: string;
  budget: {
    min: number;
    max: number;
  };
  createdAt: string;
  expiresAt: string;
  images: string[];
  icon?: string;
  videoUrl?: string;
  user: {
    id: string;
    name: string;
    image?: string;
    rating?: number;
    completedJobs?: number;
    responseTime?: string;
    verificationStatus?: 'verified' | 'pending' | 'unverified';
    joinedDate?: string;
    location?: string;
  };
  offerCount: number;
  favoriteCount: number;
  viewCount?: number;
  status: 'active' | 'expired' | 'closed';
  priority?: 'urgent' | 'normal' | 'low';
  skills?: string[];
  deliveryTime?: number;
  revisions?: number;
  tags?: string[];
  // Kategori-spesifik alanlar
  // Emlak alanları
  propertyType?: string;
  area?: string;
  rooms?: string;
  buildingAge?: string;
  floor?: string;
  totalFloors?: string;
  heating?: string;
  balcony?: string;
  furnished?: string;
  parking?: string;
  elevator?: string;
  garden?: string;
  terrace?: string;
  pool?: string;
  security?: string;
  // Vasıta alanları
  vehicleYear?: string;
  vehicleYearMin?: string;
  vehicleYearMax?: string;
  fuelType?: string;
  transmission?: string;
  mileage?: string;
  mileageMin?: number;
  mileageMax?: number;
  condition?: string;
  warranty?: string;
  brand?: string;
  model?: string;
  series?: string;
  bodyType?: string;
  color?: string;
  // Hizmet kategorileri için
  serviceType?: string;
  experience?: string;
  urgency?: string;
};

// JWT token'dan kullanıcı ID'sini çıkar
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwnListing, setIsOwnListing] = useState(false);
  
  // Real-time view count updates
  const { viewCount: realTimeViewCount, isConnected } = useViewCountStream(params.id as string || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [similarListings, setSimilarListings] = useState<any[]>([]);

  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/listings/${params.id}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error('İlan bulunamadı');
        }
        
        const data = await response.json();
        setListing(data.listing);
        setIsFavorite(data.listing.isFavorite || false);
        
        // Kullanıcının kendi ilanı olup olmadığını kontrol et
        const currentUserId = getCurrentUserId();
        if (currentUserId && data.listing.user.id === currentUserId) {
          setIsOwnListing(true);
        }
        
        setError(null);
        
        // Benzer ilanları getir
        fetchSimilarListings();
      } catch (err) {
        setError('İlan yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSimilarListings = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}/similar`);
        if (response.ok) {
          const data = await response.json();
          setSimilarListings(data.similarListings || []);
        }
      } catch (error) {
        console.error('Benzer ilanlar yüklenirken hata:', error);
      }
    };

    fetchListing();
    
    // Benzer ilanları periyodik olarak güncelle (30 saniyede bir)
    const interval = setInterval(() => {
      fetchSimilarListings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [params.id]);

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Kullanıcının kendi ilanını favoriye eklemesini engelle
      const currentUserId = getCurrentUserId();
      if (listing && listing.user.id === currentUserId) {
        alert('Kendi ilanınızı favorilere ekleyemezsiniz.');
        return;
      }

      const response = await fetch(`/api/favorites`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ listingId: params.id })
      });
      
      if (!response.ok) {
        throw new Error('İşlem başarısız');
      }
      
      setIsFavorite(!isFavorite);
      if (listing) {
        setListing({
          ...listing,
          favoriteCount: isFavorite ? listing.favoriteCount - 1 : listing.favoriteCount + 1
        });
      }
    } catch (err) {
      console.error('Favoriye ekleme/çıkarma hatası:', err);
    }
  };

  const handleMakeOffer = () => {
    router.push(`/offers/create?listingId=${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-xl text-destructive">{error || 'İlan bulunamadı'}</p>
          <Link href="/listings" className="mt-4 inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            İlanlara Dön
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Geçersiz tarih';
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const daysLeft = () => {
    if (!listing?.expiresAt) return 0;
    const today = new Date();
    const expiryDate = new Date(listing.expiresAt);
    if (isNaN(expiryDate.getTime())) return 0;
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    const allImages = [];
    if (listing?.icon) allImages.push(`/api/icons?name=${listing.icon}`);
    if (listing?.images && listing.images.length > 0) allImages.push(...listing.images);
    
    if (!allImages.length) return;
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = listing?.title || '';
    
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
        break;
    }
    setShowShareModal(false);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'from-red-500 to-red-600';
      case 'normal': return 'from-blue-500 to-blue-600';
      case 'low': return 'from-gray-500 to-gray-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'Acil';
      case 'normal': return 'Normal';
      case 'low': return 'Düşük Öncelik';
      default: return 'Normal';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/listings" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">İlanlara Dön</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Paylaş</span>
              </button>
              
              <button 
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Flag className="h-4 w-4" />
                <span className="text-sm font-medium">Şikayet Et</span>
              </button>
            </div>
          </div>
          
          {/* İlan Başlık ve Öncelik */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300">
                <AlertTriangle className="h-4 w-4" />
                {getPriorityText(listing?.priority)}
              </span>
              
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle className="h-4 w-4" />
                {listing?.category}
              </span>
              
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Eye className="h-4 w-4" />
                {realTimeViewCount !== null ? realTimeViewCount : (listing?.viewCount || 0)} Görüntülenme
                {isConnected && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Canlı güncelleme aktif"></span>}
              </span>
              
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4" />
                {formatDate(listing?.createdAt || '')}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
              {listing?.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-slate-500" />
                <span className="font-medium">
                  {formatCity(listing?.location)}
                  {listing?.district && `, ${formatDistrict(listing.district)}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <span className="font-medium">Son Tarih: {formatDate(listing?.expiresAt || '')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-500" />
                <span className="font-medium">{daysLeft()} gün kaldı</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-4">
          {/* Sol Kolon - İlan Detayları */}
          <div className="xl:col-span-3">
            <div className="space-y-10">

              {/* Gelişmiş Görsel Galeri */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Görsel Galeri
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({listing?.images?.length || 0} görsel)</span>
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setShowImageModal(true)}
                      className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Ana Görsel */}
                  <div className="relative">
                    <div className="aspect-[4/3] max-w-sm w-full overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 cursor-pointer group" onClick={() => setShowImageModal(true)}>
                      {(() => {
                        // Tüm görselleri birleştir (icon + images)
                        const allImages = [];
                        if (listing?.icon) {
                          allImages.push(`/api/icons?name=${listing.icon}`);
                        }
                        if (listing?.images && listing.images.length > 0) {
                          allImages.push(...listing.images);
                        }
                        
                        if (allImages.length > 0) {
                          return (
                            <img 
                              src={allImages[currentImageIndex]} 
                              alt={listing.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          );
                        } else {
                          return (
                            <img 
                              src="/images/defaults/varsagel.com.jpeg"
                              alt={listing.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          );
                        }
                      })()}
                      
                      {/* Büyüteç İkonu */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                          <ZoomIn className="h-6 w-6 text-slate-700" />
                        </div>
                      </div>
                      
                      {/* Navigation Arrows */}
                      {(() => {
                        const allImages = [];
                        if (listing?.icon) allImages.push(`/api/icons?name=${listing.icon}`);
                        if (listing?.images && listing.images.length > 0) allImages.push(...listing.images);
                        
                        return allImages.length > 1 ? (
                          <>
                            <button 
                              onClick={() => handleImageNavigation('prev')}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                            >
                              <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                            </button>
                            
                            <button 
                              onClick={() => handleImageNavigation('next')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                            >
                              <ChevronRight className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                            </button>
                          </>
                        ) : null;
                      })()}
                      
                      {/* Image Counter */}
                      {(() => {
                        const allImages = [];
                        if (listing?.icon) allImages.push(`/api/icons?name=${listing.icon}`);
                        if (listing?.images && listing.images.length > 0) allImages.push(...listing.images);
                        
                        return allImages.length > 1 ? (
                          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    
                    {/* Video Play Button */}
                    {listing?.videoUrl && (
                      <button className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Play className="w-6 h-6 text-slate-700 dark:text-slate-300 ml-1" />
                        </div>
                      </button>
                    )}
                  </div>
                  
                  {/* Thumbnail Grid */}
                  {(() => {
                    const allImages = [];
                    if (listing?.icon) allImages.push(`/api/icons?name=${listing.icon}`);
                    if (listing?.images && listing.images.length > 0) allImages.push(...listing.images);
                    
                    return allImages.length > 1 ? (
                      <div className="grid grid-cols-6 gap-2">
                        {allImages.slice(0, 6).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square overflow-hidden border transition-colors ${
                              currentImageIndex === index 
                                ? 'border-slate-900 dark:border-slate-100' 
                                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                          >
                            <img 
                              src={image} 
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                        
                        {allImages.length > 6 && (
                          <button 
                            onClick={() => setShowImageModal(true)}
                            className="aspect-square overflow-hidden border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                          >
                            <div className="text-center">
                              <MoreHorizontal className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                              <span className="text-xs font-medium text-slate-500">+{allImages.length - 6}</span>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : null
                  })()}
                </div>
              </div>

              {/* İlan Açıklaması */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  İstek Açıklaması
                </h2>
                
                <div className="prose max-w-none dark:prose-invert">
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 border border-slate-200 dark:border-slate-600">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{listing?.description}</p>
                  </div>
                </div>
                
                {/* Etiketler */}
                {listing?.tags && listing.tags.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Soru Sorma Sistemi */}
              <QuestionSection listingId={listing?.id || ''} listingOwnerId={listing?.user?.id || ''} />

              {/* Gelişmiş İlan Detayları */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  İstek Detayları
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kategori */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Kategori</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{listing?.category}</p>
                        {listing?.subcategory && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{listing.subcategory}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Konum */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-600 dark:bg-slate-500 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Konum</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCity(listing?.location)}{listing?.district && `, ${formatDistrict(listing.district)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bütçe */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 dark:bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">₺</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bütçe</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {listing?.budget?.min?.toLocaleString('tr-TR')} ₺ - {listing?.budget?.max?.toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Oluşturulma Tarihi */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Oluşturulma Tarihi</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {listing?.createdAt ? new Date(listing.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Marka */}
                  {listing?.brand && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 dark:bg-orange-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">M</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Marka</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.brand}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Model */}
                  {listing?.model && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-600 dark:bg-teal-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">M</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Model</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.model}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Beceriler */}
                {listing?.skills && listing.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Aranan Beceriler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Kategori-Spesifik Detaylar */}
                {(listing?.brand || listing?.model || listing?.vehicleYear || listing?.propertyType || listing?.area || listing?.rooms || listing?.fuelType || listing?.transmission || listing?.mileage || listing?.condition || listing?.warranty || listing?.serviceType || listing?.experience || listing?.urgency) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Ürün/Hizmet Detayları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Marka */}
                      {listing?.brand && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Marka</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.brand}</p>
                        </div>
                      )}
                      
                      {/* Model */}
                      {listing?.model && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Model</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.model}</p>
                        </div>
                      )}
                      
                      {/* Seri */}
                      {listing?.series && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Seri</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.series}</p>
                        </div>
                      )}
                      
                      {/* En Az Yıl */}
                      {listing?.vehicleYearMin && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">En Az Yıl</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.vehicleYearMin}</p>
                        </div>
                      )}
                      
                      {/* En Çok Yıl */}
                      {listing?.vehicleYearMax && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">En Çok Yıl</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.vehicleYearMax}</p>
                        </div>
                      )}
                      
                      {/* Emlak - Tür */}
                      {listing?.propertyType && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Emlak Türü</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.propertyType}</p>
                        </div>
                      )}
                      
                      {/* Alan */}
                      {listing?.area && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Alan</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.area} m²</p>
                        </div>
                      )}
                      
                      {/* Oda Sayısı */}
                      {listing?.rooms && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Oda Sayısı</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.rooms}</p>
                        </div>
                      )}
                      
                      {/* Bina Yaşı */}
                      {listing?.buildingAge && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bina Yaşı</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.buildingAge}</p>
                        </div>
                      )}
                      
                      {/* Kat */}
                      {listing?.floor && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Kat</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.floor}{listing?.totalFloors ? ` / ${listing.totalFloors}` : ''}</p>
                        </div>
                      )}
                      
                      {/* Isıtma */}
                      {listing?.heating && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Isıtma</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.heating}</p>
                        </div>
                      )}
                      
                      {/* Balkon */}
                      {listing?.balcony && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Balkon</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.balcony}</p>
                        </div>
                      )}
                      
                      {/* Eşyalı */}
                      {listing?.furnished && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Eşyalı</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.furnished}</p>
                        </div>
                      )}
                      
                      {/* Otopark */}
                      {listing?.parking && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Otopark</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.parking}</p>
                        </div>
                      )}
                      
                      {/* Asansör */}
                      {listing?.elevator && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Asansör</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.elevator}</p>
                        </div>
                      )}
                      
                      {/* Bahçe */}
                      {listing?.garden && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bahçe</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.garden}</p>
                        </div>
                      )}
                      
                      {/* Teras */}
                      {listing?.terrace && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Teras</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.terrace}</p>
                        </div>
                      )}
                      
                      {/* Havuz */}
                      {listing?.pool && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Havuz</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.pool}</p>
                        </div>
                      )}
                      
                      {/* Güvenlik */}
                      {listing?.security && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Güvenlik</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.security}</p>
                        </div>
                      )}
                      
                      {/* Yakıt Türü */}
                      {listing?.fuelType && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Yakıt Türü</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.fuelType}</p>
                        </div>
                      )}
                      
                      {/* Vites */}
                      {listing?.transmission && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Vites</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.transmission}</p>
                        </div>
                      )}
                      
                      {/* Kasa Tipi */}
                      {listing?.bodyType && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Kasa Tipi</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.bodyType}</p>
                        </div>
                      )}
                      
                      {/* Renk */}
                      {listing?.color && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Renk</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.color}</p>
                        </div>
                      )}
                      
                      {/* En Az Kilometre */}
                      {listing?.mileageMin && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">En Az Kilometre</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.mileageMin.toLocaleString('tr-TR')} km</p>
                        </div>
                      )}
                      
                      {/* En Çok Kilometre */}
                      {listing?.mileageMax && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">En Çok Kilometre</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.mileageMax.toLocaleString('tr-TR')} km</p>
                        </div>
                      )}
                      
                      {/* Durum */}
                      {listing?.condition && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Durum</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.condition}</p>
                        </div>
                      )}
                      
                      {/* Garanti */}
                      {listing?.warranty && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Garanti</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.warranty}</p>
                        </div>
                      )}
                      
                      {/* Hizmet Türü */}
                      {listing?.serviceType && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Hizmet Türü</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.serviceType}</p>
                        </div>
                      )}
                      
                      {/* Deneyim */}
                      {listing?.experience && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Deneyim</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.experience}</p>
                        </div>
                      )}
                      
                      {/* Aciliyet */}
                      {listing?.urgency && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Aciliyet</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{listing.urgency}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Gerekli Yetenekler */}
                {listing?.skills && listing.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Gerekli Yetenekler
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {listing.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full"></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>

          {/* Sağ Kolon - İlan Sahibi ve Teklif */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Gelişmiş Bütçe ve İstatistikler */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">İstek Bütçesi</h3>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 border border-slate-200 dark:border-slate-600">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Bütçe Aralığı</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      ₺{listing?.budget?.min?.toLocaleString('tr-TR') || '0'}
                    </p>
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">- ₺{listing?.budget?.max?.toLocaleString('tr-TR') || '0'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="w-8 h-8 mx-auto mb-2 bg-slate-600 dark:bg-slate-500 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{listing?.offerCount || 0}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Teklif Aldı</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="w-8 h-8 mx-auto mb-2 bg-slate-600 dark:bg-slate-500 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{listing?.favoriteCount || 0}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Favorilendi</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="w-8 h-8 mx-auto mb-2 bg-slate-600 dark:bg-slate-500 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{listing?.viewCount || 0}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Görüntülenme</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="w-8 h-8 mx-auto mb-2 bg-slate-600 dark:bg-slate-500 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{daysLeft()}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Gün Kaldı</div>
                  </div>
                </div>
              </div>

              {/* İlan Sahibi Profili */}
              <div className="bg-slate-50 dark:bg-slate-700 p-6 border border-slate-200 dark:border-slate-600">
                <div className="text-center mb-4">
                  <div className="relative inline-block mb-3">
                    <div className="w-16 h-16 bg-slate-600 dark:bg-slate-500 flex items-center justify-center text-white font-bold text-xl">
                      {listing?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {listing?.user?.verificationStatus && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 flex items-center justify-center border-2 border-white dark:border-slate-700">
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {listing?.user?.name || 'Kullanıcı'}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">İlan Sahibi</p>
                  
                  {listing?.user?.rating && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(listing.user.rating || 0)
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-slate-300 dark:text-slate-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {listing.user.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {listing?.user?.completedJobs || 0}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tamamlanan İş</div>
                    </div>
                    
                    <div className="text-center p-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {listing?.user?.responseTime || '< 1h'}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Yanıt Süresi</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <Mail className="h-3 w-3" />
                      </div>
                      <span className="font-medium">Email gizli</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <MapPin className="h-3 w-3" />
                      </div>
                      <span className="font-medium">{listing?.user?.location ? formatCity(listing.user.location) : 'Konum belirtilmemiş'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <span className="font-medium">
                        Üyelik: {listing?.user?.joinedDate ? formatDate(listing.user.joinedDate) : formatDate(listing?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            {/* Aksiyon Butonları */}
            <div className="bg-slate-50 dark:bg-slate-700 p-6 border border-slate-200 dark:border-slate-600 space-y-4">
              {!isOwnListing ? (
                <button
                  onClick={handleMakeOffer}
                  className="w-full bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 dark:hover:bg-slate-500 text-white font-bold py-3 border border-slate-700 dark:border-slate-500 transition-colors inline-flex items-center justify-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-base">Teklif Ver</span>
                  </div>
                </button>
              ) : (
                <div className="w-full inline-flex h-12 items-center justify-center bg-slate-200 dark:bg-slate-600 px-6 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-500">
                  <User className="mr-2 h-4 w-4" />
                  Kendi İlanınız
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleFavorite}
                  className={`font-bold py-3 border transition-colors inline-flex items-center justify-center ${
                    isFavorite 
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">
                      {isFavorite ? 'Favoride' : 'Favorile'}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300 font-bold py-3 transition-colors inline-flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Paylaş</span>
                  </div>
                </button>
              </div>
              
              <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium py-2 transition-colors inline-flex items-center justify-center"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  İlanı Şikayet Et
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
        
        {/* Benzer İlanlar Bölümü */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-slate-600 dark:bg-slate-500"></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Benzer İstekler</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarListings.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">Benzer ilan bulunamadı</p>
              </div>
            ) : (
              similarListings.map((similarListing, index) => (
                <Link key={similarListing.id || index} href={`/listings/${similarListing.id}`}>
                  <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{similarListing.category}</span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {similarListing.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{formatCity(similarListing.location)}</span>
                      </div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₺{similarListing.budget}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{similarListing.offers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{similarListing.timeLeft}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        

      </div>
      
      {/* Paylaşım Modalı */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">İlanı Paylaş</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowShareModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-sm font-semibold">WhatsApp</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl"
              >
                <Twitter className="h-6 w-6" />
                <span className="text-sm font-semibold">Twitter</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
              >
                <Facebook className="h-6 w-6" />
                <span className="text-sm font-semibold">Facebook</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('email')}
                className="flex flex-col items-center gap-2 p-4 bg-slate-600 hover:bg-slate-700 text-white rounded-2xl"
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm font-semibold">E-posta</span>
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Link Kopyala</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={`${window.location.origin}/listings/${listing?.id}`}
                  readOnly
                  className="flex-1 text-sm bg-transparent border-none outline-none text-slate-600 dark:text-slate-400"
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/listings/${listing?.id}`);
                    // Toast notification can be added here
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Şikayet Modalı */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">İlanı Şikayet Et</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReportModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Şikayet Sebebi
                </label>
                <select className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  <option>Uygunsuz içerik</option>
                  <option>Spam</option>
                  <option>Yanıltıcı bilgi</option>
                  <option>Telif hakkı ihlali</option>
                  <option>Diğer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea 
                  rows={4}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 resize-none"
                  placeholder="Şikayetinizi detaylandırın..."
                ></textarea>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Şikayet Et
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Resim Modalı */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <div className="relative">
              {(() => {
                // Tüm görselleri birleştir (icon + images)
                const allImages = [];
                if (listing?.icon) {
                  allImages.push(`/api/icons?name=${listing.icon}`);
                }
                if (listing?.images && listing.images.length > 0) {
                  allImages.push(...listing.images);
                }
                
                const currentImage = allImages[currentImageIndex] || '/images/defaults/varsagel.com.jpeg';
                
                return (
                  <>
                    <img 
                      src={currentImage}
                      alt={`Görsel ${currentImageIndex + 1}`}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                    />
                    
                    {allImages.length > 1 && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleImageNavigation('prev')}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleImageNavigation('next')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}