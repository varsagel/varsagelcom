import { useEffect, useState, useCallback } from 'react';
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

export function useNotificationStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { toast } = useToast();

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
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token bulunamadı, SSE bağlantısı kurulamıyor');
      return;
    }

    // Mevcut bağlantıyı kapat
    if (eventSource) {
      eventSource.close();
    }

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
              connect();
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
  }, [eventSource, toast, getNotificationTitle]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
      console.log('SSE bağlantısı kapatıldı');
    }
  }, [eventSource]);

  useEffect(() => {
    // Component mount olduğunda bağlan
    connect();

    // Component unmount olduğunda bağlantıyı kapat
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    unreadCount,
    connect,
    disconnect
  };
}