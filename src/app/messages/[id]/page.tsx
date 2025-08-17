'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
}

export default function ConversationPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

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

    fetchConversation();
  }, [conversationId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mesajları okundu olarak işaretle
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!currentUser || messages.length === 0) return;
      
      // Okunmamış mesajları bul (kendi mesajlarım hariç)
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.senderId !== currentUser
      );
      
      if (unreadMessages.length === 0) return;
      
      try {
        const token = localStorage.getItem('token');
        
        // Her okunmamış mesaj için API çağrısı yap
        for (const message of unreadMessages) {
          await fetch(`/api/conversations/${conversationId}/messages/${message.id}/read`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
        
        // Header'daki mesaj sayacını güncelle
        window.dispatchEvent(new CustomEvent('messageRead'));
        
        // Local state'i güncelle
        setMessages(prev => prev.map(msg => 
          unreadMessages.some(unread => unread.id === msg.id) 
            ? { ...msg, isRead: true }
            : msg
        ));
      } catch (error) {
        console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
      }
    };
    
    markMessagesAsRead();
  }, [messages, currentUser, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
        setMessages(data.messages);
      } else if (response.status === 404) {
        router.push('/messages');
      } else {
        console.error('Konuşma yüklenemedi');
      }
    } catch (error) {
      console.error('Konuşma yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setMessageError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (response.ok) {
          const message = await response.json();
          setMessages(prev => [...prev, message]);
          setNewMessage('');
          setMessageError(null);
          
          // Header'daki mesaj sayacını güncelle
          window.dispatchEvent(new CustomEvent('messageRead'));
          
          // Mesaj gönderildikten sonra en alta scroll yap
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        } else {
          const errorData = await response.json();
          setMessageError(errorData.error || 'Mesaj gönderilemedi');
          console.error('Mesaj gönderilemedi:', errorData);
        }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      setMessageError('Mesaj gönderilirken bir hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = () => {
    if (!conversation || !currentUser) return null;
    
    if (currentUser === conversation.offer.userId) {
      // Teklif veren kişiyim, ilan sahibini göster
      return conversation.offer.listing.user;
    } else {
      // İlan sahibiyim, teklif veren kişiyi göster
      return conversation.offer.user;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Konuşma yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Konuşma bulunamadı</h2>
          <Link href="/messages" className="text-blue-600 hover:text-blue-700">
            Mesajlara geri dön
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Link
            href="/messages"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          
          {otherUser && (
            <>
              {otherUser.profileImage ? (
                <img
                  src={otherUser.profileImage}
                  alt={otherUser?.name || 'Kullanıcı'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{otherUser?.name || 'Bilinmeyen Kullanıcı'}</h2>
                <p className="text-sm text-gray-600">{conversation.offer.listing.title}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Conversation Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            {currentUser === conversation.offer.userId ? (
              // Teklif veren kişiyim - İlan bilgilerini göster
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg mb-2">📋 İlan Bilgileri</h3>
                    <h4 className="font-semibold text-gray-900 text-xl mb-2">{conversation.offer.listing.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">İlan Sahibi:</span>
                        <p className="font-medium text-gray-900">{conversation.offer.listing.user?.name || 'Bilinmeyen Kullanıcı'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Verdiğiniz Teklif:</span>
                        <p className="font-bold text-green-600 text-lg">{conversation.offer.price.toLocaleString('tr-TR')} TL</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      💰 Teklifiniz
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/listings/${conversation.offer.listing.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔍 İlanı Görüntüle
                  </Link>
                  <Link
                    href={`/offers/${conversation.offer.id}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    📄 Teklif Detayı
                  </Link>
                </div>
              </div>
            ) : (
              // İlan sahibiyim - Teklif bilgilerini göster
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg mb-2">💼 Teklif Bilgileri</h3>
                    <h4 className="font-semibold text-gray-900 text-xl mb-2">İlanınız: {conversation.offer.listing.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Teklif Veren:</span>
                        <p className="font-medium text-gray-900">{conversation.offer.user?.name || 'Bilinmeyen Kullanıcı'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Teklif Miktarı:</span>
                        <p className="font-bold text-green-600 text-lg">{conversation.offer.price.toLocaleString('tr-TR')} TL</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Teklif Durumu:</span>
                        <p className="font-medium text-blue-600">{conversation.offer.status === 'accepted' ? 'Kabul Edildi' : conversation.offer.status === 'pending' ? 'Beklemede' : 'Reddedildi'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      📋 İlanınız
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/listings/${conversation.offer.listing.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔍 İlanınızı Görüntüle
                  </Link>
                  <Link
                    href={`/offers/${conversation.offer.id}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    📄 Teklif Detayı
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUser;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="space-y-2">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (messageError) setMessageError(null);
                  }}
                  placeholder="Mesajınızı yazın..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    messageError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
            {messageError && (
              <div className="text-red-600 text-sm mt-2">
                {messageError}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}