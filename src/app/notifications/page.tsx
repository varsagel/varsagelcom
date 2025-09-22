"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Check, X, MessageCircle, DollarSign, Heart, User, Clock, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Notification {
  id: string;
  type: 'message' | 'offer' | 'favorite' | 'system' | 'question_asked' | 'question_answered' | 'message_received' | 'new_offer' | 'offer_accepted' | 'offer_rejected';
  title: string;
  content: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'message' | 'offer' | 'favorite' | 'system'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Bildirimin türüne göre yönlendirme
    switch (notification.type) {
      case 'message':
      case 'message_received':
        if (notification.fromUser) {
          router.push(`/messages?user=${notification.fromUser.id}`);
        } else {
          router.push('/messages');
        }
        break;
      case 'offer':
      case 'new_offer':
      case 'offer_accepted':
      case 'offer_rejected':
        if (notification.relatedId) {
          // Offer ID'si ile ilgili listing'i bul
          try {
            const response = await fetch(`/api/offers/${notification.relatedId}`);
            if (response.ok) {
              const offer = await response.json();
              router.push(`/listings/${offer.listing.listingNumber}`);
            }
          } catch (error) {
            console.error('Offer bilgisi alınırken hata:', error);
          }
        }
        break;
      case 'question_asked':
      case 'question_answered':
        if (notification.relatedId) {
          // Question ID'si ile ilgili listing'i bul
          try {
            const response = await fetch(`/api/questions/${notification.relatedId}`);
            if (response.ok) {
              const question = await response.json();
              router.push(`/listings/${question.listing.listingNumber}`);
            }
          } catch (error) {
            console.error('Question bilgisi alınırken hata:', error);
          }
        }
        break;
      case 'favorite':
        if (notification.relatedId) {
          router.push(`/listings/${notification.relatedId}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
      case 'message_received':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'offer':
      case 'new_offer':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'offer_accepted':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'offer_rejected':
        return <DollarSign className="h-5 w-5 text-red-500" />;
      case 'question_asked':
        return <HelpCircle className="h-5 w-5 text-purple-500" />;
      case 'question_answered':
        return <HelpCircle className="h-5 w-5 text-green-500" />;
      case 'favorite':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'message':
        return notifications.filter(n => n.type === 'message' || n.type === 'message_received');
      case 'offer':
        return notifications.filter(n => ['offer', 'new_offer', 'offer_accepted', 'offer_rejected'].includes(n.type));
      case 'favorite':
        return notifications.filter(n => n.type === 'favorite');
      case 'system':
        return notifications.filter(n => n.type === 'system' || n.type === 'question_asked');
      default:
        return notifications;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Bildirimler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="h-4 w-4 mr-2" />
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tümü', count: notifications.length },
              { key: 'unread', label: 'Okunmamış', count: unreadCount },
              { key: 'message', label: 'Mesajlar', count: notifications.filter(n => n.type === 'message' || n.type === 'message_received').length },
              { key: 'offer', label: 'Teklifler', count: notifications.filter(n => ['offer', 'new_offer', 'offer_accepted', 'offer_rejected'].includes(n.type)).length },
              { key: 'favorite', label: 'Favoriler', count: notifications.filter(n => n.type === 'favorite').length },
              { key: 'system', label: 'Sistem', count: notifications.filter(n => n.type === 'system' || n.type === 'question_asked').length },
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.key as any)}
                className="flex items-center gap-2"
              >
                {filterOption.label}
                {filterOption.count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filterOption.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'Henüz bildirim yok' : 'Bu kategoride bildirim yok'}
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'Yeni bildirimler burada görünecek.'
                    : 'Seçili kategoride henüz bildirim bulunmuyor.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {notification.message || notification.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.createdAt)}
                            </div>
                            {notification.fromUser && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {notification.fromUser.firstName} {notification.fromUser.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}