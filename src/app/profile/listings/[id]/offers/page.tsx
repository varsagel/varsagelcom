'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Check, Clock, Eye, MessageSquare, User, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Offer {
  id: string;
  price: number;
  duration: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  budget: number;
}

export default function ListingOffersPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [listingId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch listing details
      const listingResponse = await fetch(`/api/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!listingResponse.ok) {
        throw new Error('İlan bulunamadı');
      }

      const listingData = await listingResponse.json();
      setListing(listingData.listing);

      // Fetch offers for this listing
      const offersResponse = await fetch(`/api/listings/${listingId}/offers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!offersResponse.ok) {
        throw new Error('Teklifler yüklenemedi');
      }

      const offersData = await offersResponse.json();
      setOffers(offersData.offers || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      setIsUpdating(offerId);
      const token = localStorage.getItem('token');
      
      // Convert status to action format that backend expects
      const action = status === 'accepted' ? 'accept' : 'reject';
      
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }) // Changed from { status } to { action }
      });
      
      if (!response.ok) {
        throw new Error('Teklif durumu güncellenemedi');
      }

      // Refresh offers
      await fetchData();
      
      // Başarı toast'ı göster
      const statusText = status === 'accepted' ? 'kabul edildi' : 'reddedildi';
      toast({
        title: "Başarılı",
        description: `Teklif ${statusText}.`,
        variant: "default",
        duration: 3000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (activeTab === 'all') return true;
    return offer.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>;
      case 'accepted':
        return <Badge variant="default">Kabul Edildi</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Teklifler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.back()}>Geri Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">Gelen Teklifler</h1>
          {listing && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
              <p className="text-muted-foreground mb-2">{listing.description}</p>
              <p className="text-sm text-muted-foreground">
                Bütçe: <span className="font-medium">₺{listing.budget?.toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü ({offers.length})</TabsTrigger>
          <TabsTrigger value="pending">Beklemede ({offers.filter(o => o.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="accepted">Kabul Edildi ({offers.filter(o => o.status === 'accepted').length})</TabsTrigger>
          <TabsTrigger value="rejected">Reddedildi ({offers.filter(o => o.status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOffers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Teklif Bulunamadı</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {activeTab === 'pending' && 'Henüz beklemede olan teklif bulunmuyor.'}
                  {activeTab === 'accepted' && 'Henüz kabul edilen teklif bulunmuyor.'}
                  {activeTab === 'rejected' && 'Henüz reddedilen teklif bulunmuyor.'}
                  {activeTab === 'all' && 'Bu ilan için henüz teklif gelmemiş.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{offer.user.name}</CardTitle>
                          <CardDescription>{offer.user.email}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          ₺{offer.price.toLocaleString()}
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Teklif Mesajı:</h4>
                        <p className="text-muted-foreground bg-muted/50 rounded-lg p-3">
                          {offer.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Teslimat: {offer.duration}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(offer.createdAt).toLocaleDateString('tr-TR')}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-4 border-t">
                        <Link href={`/offers/${offer.id}`} className="flex-1">
                          <Button variant="default" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            Teklif Detayı
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Info className="mr-2 h-4 w-4" />
                          Hızlı Görüntüle
                        </Button>
                        {offer.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateOfferStatus(offer.id, 'accepted')}
                              disabled={isUpdating === offer.id}
                              className="flex-1"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              {isUpdating === offer.id ? 'Güncelleniyor...' : 'Kabul Et'}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => updateOfferStatus(offer.id, 'rejected')}
                              disabled={isUpdating === offer.id}
                              className="flex-1"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reddet
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {offer.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-green-800 text-sm">
                              ✅ Bu teklifi kabul ettiniz. Teklif sahibi ile iletişime geçebilirsiniz.
                            </p>
                            <Button
                              onClick={() => {
                                // Konuşma ID'sini bulmak için API çağrısı yapabiliriz
                                // Şimdilik basit bir yönlendirme yapalım
                                window.location.href = '/messages';
                              }}
                              size="sm"
                              className="ml-4"
                            >
                              Mesajlaş
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {offer.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800 text-sm">
                            ❌ Bu teklifi reddettiniz.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Teklif Detayları Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teklif Detayları</DialogTitle>
            <DialogDescription>
              Teklif hakkında detaylı bilgileri görüntüleyin
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-6">
              {/* Teklif Sahibi Bilgileri */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Teklif Sahibi
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">İsim:</span> {selectedOffer.user.name}</p>
                  <p><span className="font-medium">E-posta:</span> {selectedOffer.user.email}</p>
                </div>
              </div>

              {/* Teklif Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-primary">💰</span>
                    Teklif Tutarı
                  </h4>
                  <p className="text-2xl font-bold text-primary">₺{selectedOffer.price.toLocaleString()}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    Teslimat Süresi
                  </h4>
                  <p className="text-lg font-medium text-green-700">{selectedOffer.duration}</p>
                </div>
              </div>

              {/* Teklif Mesajı */}
              <div>
                <h4 className="font-semibold mb-3">Teklif Mesajı</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">{selectedOffer.message}</p>
                </div>
              </div>

              {/* Teklif Tarihi ve Durum */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Teklif Tarihi: {new Date(selectedOffer.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <Badge variant={selectedOffer.status === 'pending' ? 'secondary' : 
                              selectedOffer.status === 'accepted' ? 'default' : 'destructive'}>
                  {selectedOffer.status === 'pending' ? 'Beklemede' :
                   selectedOffer.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                </Badge>
              </div>

              {/* Modal İçinde Aksiyon Butonları */}
              {selectedOffer.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      updateOfferStatus(selectedOffer.id, 'accepted');
                      setIsModalOpen(false);
                    }}
                    disabled={isUpdating === selectedOffer.id}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isUpdating === selectedOffer.id ? 'Güncelleniyor...' : 'Kabul Et'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateOfferStatus(selectedOffer.id, 'rejected');
                      setIsModalOpen(false);
                    }}
                    disabled={isUpdating === selectedOffer.id}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reddet
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}