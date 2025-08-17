'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  profileImage?: string;
}

interface Listing {
  id: string;
  title: string;
  userId: string;
  user: User;
}

interface Offer {
  id: string;
  userId: string;
  user: User;
  listing: Listing;
  price: number;
  status: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  offerId: string;
  offer: Offer;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Token'dan kullanıcı ID'sini al
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(payload.userId);
    } catch (error) {
      console.error('Token decode hatası:', error);
      router.push('/auth/login');
      return;
    }

    fetchConversations();
  }, [router]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        
        // Okunmamış mesaj sayısını hesapla
        const unreadMessages = data.filter((conversation: Conversation) => {
          const lastMessage = conversation.messages && conversation.messages.length > 0 ? conversation.messages[0] : null;
          return lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUser;
        });
        setUnreadCount(unreadMessages.length);
      } else {
        console.error('Konuşmalar yüklenemedi');
      }
    } catch (error) {
      console.error('Konuşmalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (currentUser === conversation.offer.userId) {
      // Teklif veren kişiyim, ilan sahibini göster
      return conversation.offer.listing.user;
    } else {
      // İlan sahibiyim, teklif veren kişiyi göster
      return conversation.offer.user;
    }
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[0];
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Mesajlarım</h1>
                  {unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-1">Kabul edilen teklifleriniz için mesajlaşmalarınız</p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">
                      {unreadCount} yeni mesajınız var
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz mesajınız yok</h3>
              <p className="text-gray-600 mb-4">Kabul edilen teklifleriniz için mesajlaşma başlatabilirsiniz.</p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                İlanları Keşfet
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const lastMessage = getLastMessage(conversation);
                const isUnread = lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUser;

                return (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className={`block p-6 transition-colors ${
                      isUnread 
                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {otherUser.profileImage ? (
                          <img
                            src={otherUser.profileImage}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-lg">
                              {otherUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-medium truncate ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {otherUser.name}
                          </h3>
                          {lastMessage && (
                            <span className="text-sm text-gray-500 flex-shrink-0">
                              {formatDate(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 truncate">
                          {conversation.offer.listing.title}
                        </p>
                        
                        {lastMessage ? (
                          <p className={`text-sm truncate ${
                            isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                          }`}>
                            {lastMessage.senderId === currentUser ? 'Siz: ' : ''}
                            {lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Henüz mesaj yok
                          </p>
                        )}
                      </div>
                      
                      {isUnread && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <span className="text-xs text-red-600 font-medium">Yeni</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}