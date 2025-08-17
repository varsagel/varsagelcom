'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useNotificationStream } from '@/hooks/useNotificationStream';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'listing' | 'system' | 'message' | 'question';
  read: boolean;
  createdAt: string;
  data?: {
    listingId?: string;
    offerId?: string;
    userId?: string;
    questionId?: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const { toast } = useToast();
  const { isConnected } = useNotificationStream();

  // Bildirimleri getir
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Oturum açmanız gerekiyor.');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`/api/notifications?page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Bildirimler alınamadı');
        }
        
        const data = await response.json();
        
        // API'den gelen verileri frontend formatına dönüştür
        const formattedNotifications = data.notifications.map((notif: any) => ({
          id: notif.id,
          title: getNotificationTitle(notif.type),
          message: notif.message,
          type: getNotificationType(notif.type),
          read: notif.isRead,
          createdAt: notif.createdAt,
          data: notif.metadata
        }));
        
        setNotifications(formattedNotifications);
        setUnreadCount(data.unreadCount);
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setIsLoading(false);
      } catch (err) {
        setError('Bildirimler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [currentPage]);

  // SSE'den gelen yeni bildirimleri dinle
  useEffect(() => {
    const handleNewNotifications = (event: CustomEvent) => {
      const newNotifications = event.detail;
      
      if (newNotifications && newNotifications.length > 0) {
        const formattedNotifications = newNotifications.map((notif: any) => ({
          id: notif.id,
          title: getNotificationTitle(notif.type),
          message: notif.message,
          type: getNotificationType(notif.type),
          read: notif.isRead,
          createdAt: notif.createdAt,
          data: notif.metadata
        }));
        
        // Yeni bildirimleri mevcut listeye ekle
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifs = formattedNotifications.filter((n: any) => !existingIds.has(n.id));
          
          if (newNotifs.length > 0) {
            return [...newNotifs, ...prev];
          }
          return prev;
        });
        
        setLastCheckTime(new Date());
      }
    };
    
    window.addEventListener('newNotifications', handleNewNotifications as EventListener);
    
    return () => {
      window.removeEventListener('newNotifications', handleNewNotifications as EventListener);
    };
  }, []);

  // Helper fonksiyonlar
  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_offer':
        return 'Yeni Teklif Aldınız';
      case 'offer_accepted':
        return 'Teklifiniz Kabul Edildi';
      case 'offer_rejected':
        return 'Teklifiniz Reddedildi';
      case 'new_question':
        return 'Yeni Soru Aldınız';
      case 'question_answered':
        return 'Sorunuz Cevaplandı';
      case 'listing_expiring':
        return 'İlanınızın Süresi Dolmak Üzere';
      case 'new_message':
        return 'Yeni Mesaj';
      default:
        return 'Bildirim';
    }
  };

  const getNotificationType = (type: string): Notification['type'] => {
    if (type.includes('offer')) return 'offer';
    if (type.includes('listing')) return 'listing';
    if (type.includes('message')) return 'message';
    if (type.includes('question')) return 'question';
    return 'system';
  };
  
  // Mesaj bildirimleri hariç bildirimleri filtrele
  const filteredNotifications = notifications.filter(notification => notification.type !== 'message');

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAsRead(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum açmanız gerekiyor.');
        setIsMarkingAsRead(false);
        return;
      }
      
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [],
        }),
      });
      
      if (!response.ok) throw new Error('Bildirimler okundu olarak işaretlenemedi');
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      setIsMarkingAsRead(false);
      toast({
        title: "Başarılı",
        description: "Tüm bildirimler okundu olarak işaretlendi.",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
        console.error('Bildirimleri okundu olarak işaretleme hatası:', error);
        setIsMarkingAsRead(false);
        toast({
          title: "Hata",
          description: "Bildirimler işaretlenirken bir hata oluştu.",
          variant: "destructive",
          duration: 5000,
        });
      }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum açmanız gerekiyor.');
        return;
      }
      
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [id],
        }),
      });
      
      if (!response.ok) throw new Error('Bildirim okundu olarak işaretlenemedi');
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast({
        title: "Başarılı",
        description: "Bildirim okundu olarak işaretlendi.",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
        console.error('Bildirimi okundu olarak işaretleme hatası:', error);
        toast({
          title: "Hata",
          description: "Bildirim işaretlenirken bir hata oluştu.",
          variant: "destructive",
          duration: 5000,
        });
      }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'offer':
        return (
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
            >
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
              <path d="M7 7h.01" />
            </svg>
          </div>
        );
      case 'listing':
        return (
          <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-amber-600 dark:text-amber-400"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-green-600 dark:text-green-400"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case 'question':
        return (
          <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-orange-600 dark:text-orange-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        );
      case 'system':
      default:
        return (
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-purple-600 dark:text-purple-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
        );
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'offer':
        return notification.data?.offerId 
          ? `/offers/${notification.data.offerId}` 
          : notification.data?.listingId 
            ? `/listings/${notification.data.listingId}` 
            : '#';
      case 'listing':
        return notification.data?.listingId 
          ? `/listings/${notification.data.listingId}` 
          : '#';
      case 'question':
        return notification.data?.listingId 
          ? `/listings/${notification.data.listingId}` 
          : '#';
      case 'message':
        return notification.data?.userId 
          ? `/messages/${notification.data.userId}` 
          : '#';
      case 'system':
      default:
        return '#';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <Info className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Bildirimler Yüklenemedi</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Bell className="mr-2 h-6 w-6" />
            Bildirimler
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                {unreadCount} yeni
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Toplam {totalCount} bildiriminiz var.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            className="mt-4 sm:mt-0"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAsRead}
          >
            {isMarkingAsRead ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                İşleniyor...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Tümünü Okundu İşaretle
              </>
            )}
          </Button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bildiriminiz Bulunmuyor</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Henüz hiç bildiriminiz yok. İlan oluşturduğunuzda veya teklifler aldığınızda burada görünecekler.
            </p>
            <Link href="/listings/create">
              <Button>
                İlan Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const notificationLink = getNotificationLink(notification);
            
            return (
              <Card 
                key={notification.id} 
                className={`transition-colors ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notification.type)}
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        {notificationLink !== '#' && (
                          <Link href={notificationLink}>
                            <Button variant="outline" size="sm">
                              Görüntüle
                            </Button>
                          </Link>
                        )}
                        
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Okundu İşaretle
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Önceki
            </Button>
            
            <span className="text-sm">
              Sayfa {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}