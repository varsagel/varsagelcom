'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, MessageSquare, Heart, TrendingUp, Award, Star } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  images: string[];
  viewCount: number;
  offerCount: number;
  favoriteCount: number;
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
  displayNumber: string;
}

interface TrendingListingsProps {
  type: 'most-viewed' | 'most-offers';
  position: 'left' | 'right';
}

export default function TrendingListings({ type, position }: TrendingListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchTrendingListings = async () => {
      try {
        setIsLoading(true);
        
        // Sol panel (most-offers) önce yüklenir, sağ panel (most-viewed) sol panelin ilanlarını exclude eder
        let url = `/api/listings/trending?type=${type}&limit=5`;
        
        if (type === 'most-viewed') {
          // Sağ panel için sol panelin ilanlarını exclude et
          const leftPanelIds = (window as any).leftPanelListingIds || [];
          if (leftPanelIds.length > 0) {
            url += `&exclude=${leftPanelIds.join(',')}`;
          }
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Trend ilanlar yüklenemedi');
        }
        
        const data = await response.json();
        setListings(data.listings);
        
        // Sol panel ise, ilan ID'lerini global olarak sakla
        if (type === 'most-offers') {
          (window as any).leftPanelListingIds = data.listings.map((listing: Listing) => listing.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    // Sol panel önce yüklensin diye küçük bir gecikme ekle
    if (type === 'most-viewed') {
      setTimeout(fetchTrendingListings, 100);
    } else {
      fetchTrendingListings();
    }
  }, [type]);

  const formatBudget = (min: number, max: number) => {
    if (min === max) {
      return `${min.toLocaleString('tr-TR')} TL`;
    }
    return `${min.toLocaleString('tr-TR')} - ${max.toLocaleString('tr-TR')} TL`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Otomatik kaydırma efekti
  useEffect(() => {
    if (listings.length === 0) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollDelay = 50;
    
    const autoScroll = () => {
      scrollAmount += scrollStep;
      scrollContainer.scrollTop = scrollAmount;
      
      // Eğer en alta ulaştıysak, başa dön
      if (scrollAmount >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollAmount = 0;
      }
    };
    
    const intervalId = setInterval(autoScroll, scrollDelay);
    
    // Mouse hover durumunda kaydırmayı durdur
    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => {
      const newIntervalId = setInterval(autoScroll, scrollDelay);
      return newIntervalId;
    };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      clearInterval(intervalId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [listings]);

  const title = type === 'most-viewed' ? 'En Çok Görüntülenen' : 'En Çok Teklif Alan';
  const icon = type === 'most-viewed' ? <Eye className="w-5 h-5" /> : <Award className="w-5 h-5" />;
  const bgGradient = type === 'most-viewed' 
    ? 'from-blue-500 to-purple-600' 
    : 'from-green-500 to-teal-600';

  // Listeyi ikiye katlayarak sürekli kaydırma efekti oluştur
  const duplicatedListings = [...listings, ...listings];

  return (
    <div 
      className={`sticky top-16 sm:top-20 w-full max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-30 m-2 sm:m-4`}
      style={{ animation: 'slideIn 0.5s ease-out' }}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${bgGradient} p-3 sm:p-4 text-white`}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-bold text-base sm:text-lg">{title}</h3>
          <TrendingUp className="w-4 h-4 ml-auto animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="h-96 overflow-hidden scrollbar-hide"
        style={{ scrollBehavior: 'auto' }}
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3 p-3 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Henüz ilan bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-0">
            {duplicatedListings.map((listing, index) => (
              <Link
                key={`${listing.id}-${index}`}
                href={`/listings/${listing.id}`}
                className="block p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 border-b border-gray-100 group"
              >
                <div className="flex gap-3 items-center">
                  {/* Ranking Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${bgGradient} text-white text-xs font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {(index % listings.length) + 1}
                  </div>
                  
                  {/* Image */}
                  <div className="flex-shrink-0 w-16 h-16 relative">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                    ) : (
                      <img
                       src="/images/defaults/varsagel.com.jpeg"
                       alt={listing.title}
                       className="w-full h-full object-cover"
                     />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-1">
                      #{listing.displayNumber} • {listing.category}
                    </p>
                    <p className="text-xs font-bold text-green-600 mb-2">
                      {formatBudget(listing.budgetMin, listing.budgetMax)}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-blue-500">
                        <Eye className="w-3 h-3" />
                        <span className="font-medium">{listing.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-500">
                        <MessageSquare className="w-3 h-3" />
                        <span className="font-medium">{listing.offerCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <Heart className="w-3 h-3" />
                        <span className="font-medium">{listing.favoriteCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t">
        <Link
          href={`/listings?sort=${type === 'most-viewed' ? 'views' : 'offers'}`}
          className={`block text-center text-sm font-medium text-white bg-gradient-to-r ${bgGradient} py-2 px-4 rounded-lg hover:opacity-90 transition-opacity`}
        >
          Tümünü Görüntüle
        </Link>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(${position === 'right' ? '100%' : '-100%'});
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}