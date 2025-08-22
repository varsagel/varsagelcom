import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationStreamData {
  type: 'connected' | 'new_notifications' | 'unread_count';
  message?: string;
  notifications?: Notification[];
  count?: number;
}

export function useNotificationStream(isLoggedIn: boolean = false) {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { toast } = useToast();
  const connectRef = useRef<() => void>(() => {});

  const getNotificationTitle = useCallback((type: string) => {
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
  }, []);

  const connect = useCallback(() => {
    // Kullanıcı giriş yapmamışsa bağlantı kurma
    if (!isLoggedIn) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      // Token yoksa sessizce çık, hata mesajı verme
      return;
    }

    // Mevcut bağlantıyı kapat
    setEventSource(prevEventSource => {
      if (prevEventSource) {
        prevEventSource.close();
      }
      return null;
    });

    try {
      // EventSource Authorization header desteklemediği için token'ı query parameter olarak gönderiyoruz
      const es = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
      
      es.onopen = () => {
        console.log('SSE bağlantısı kuruldu');
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data: NotificationStreamData = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('SSE bağlantısı onaylandı:', data.message);
              break;
              
            case 'new_notifications':
              if (data.notifications && data.notifications.length > 0) {
                // Yeni bildirim toast'ı göster
                if (data.notifications.length === 1) {
                  const notification = data.notifications[0];
                  toast({
                    title: getNotificationTitle(notification.type),
                    description: notification.message,
                    variant: "default",
                  });
                } else {
                  toast({
                    title: "Yeni Bildirimler",
                    description: `${data.notifications.length} yeni bildiriminiz var.`,
                    variant: "default",
                  });
                }
                
                // Custom event dispatch et
                window.dispatchEvent(new CustomEvent('newNotifications', {
                  detail: data.notifications
                }));
              }
              break;
              
            case 'unread_count':
              setUnreadCount(data.count || 0);
              // Header'daki bildirim sayısını güncellemek için custom event
              window.dispatchEvent(new CustomEvent('unreadCountUpdate', {
                detail: data.count || 0
              }));
              break;
          }
        } catch (error) {
          console.error('SSE mesaj parse hatası:', error);
        }
      };

      es.onerror = (error) => {
        console.error('SSE bağlantı hatası:', error);
        setIsConnected(false);
        
        // Token geçersizse yeniden bağlanmayı dene
        if (es.readyState === EventSource.CLOSED) {
          const currentToken = localStorage.getItem('token');
          if (currentToken && currentToken === token) {
            // Aynı token ile 5 saniye sonra yeniden bağlan
            setTimeout(() => {
              if (connectRef.current) {
                connectRef.current();
              }
            }, 5000);
          } else {
            console.warn('Token değişti veya silindi, SSE yeniden bağlantısı iptal edildi');
          }
        }
      };

      setEventSource(es);
      
    } catch (error) {
      console.error('SSE bağlantısı kurulamadı:', error);
      setIsConnected(false);
    }
  }, [toast, getNotificationTitle, isLoggedIn]);

  // connectRef'i güncel tut
  connectRef.current = connect;

  const disconnect = useCallback(() => {
    setEventSource(prevEventSource => {
      if (prevEventSource) {
        prevEventSource.close();
        setIsConnected(false);
        console.log('SSE bağlantısı kapatıldı');
      }
      return null;
    });
  }, []);

  useEffect(() => {
    // Sadece kullanıcı giriş yapmışken bağlan
    if (isLoggedIn) {
      connect();
    } else {
      // Kullanıcı çıkış yaptıysa bağlantıyı kapat
      disconnect();
    }

    // Component unmount olduğunda bağlantıyı kapat
    return () => {
      disconnect();
    };
  }, [isLoggedIn]);

  return {
    isConnected,
    unreadCount,
    connect,
    disconnect
  };
}