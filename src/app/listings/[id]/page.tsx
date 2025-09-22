"use client";

import { useEffect, useState, JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { carBrands } from '@/data/car-brands';
import { categoriesData, getCategoryById, getSubCategoryById } from '@/data/categories';
import { Heart, Share2, Eye, Calendar, MapPin, Phone, User, Star, DollarSign } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Listing {
  id: string;
  listingNumber: string;
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  categoryId: string;
  subCategoryId: string;
  categorySpecificData: any;
  images: string[];
  createdAt: string;
  views: number;
  status: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
  offers?: any[];
  _count?: {
    offers: number;
    favorites: number;
    questions: number;
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerCategoryData, setOfferCategoryData] = useState<any>({});
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setListing(data);
          
          // Görüntülenme sayısını artır
          await fetch(`/api/listings/${params.id}/view`, {
            method: 'POST'
          });
        } else {
          setError('İlan bulunamadı');
        }
      } catch (err) {
        setError('İlan yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const fetchQuestions = async () => {
    if (!listing?.id) return;
    
    setLoadingQuestions(true);
    try {
      const response = await fetch(`/api/questions?listingId=${listing.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Sorular yüklenirken hata:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (listing?.id) {
      fetchQuestions();
    }
  }, [listing?.id]);

  const handleSubmitOffer = async () => {
    if (!session) {
      alert('Teklif vermek için giriş yapmanız gerekiyor');
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Geçerli bir teklif miktarı giriniz');
      return;
    }

    setSubmittingOffer(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing?.id,
          amount: parseFloat(offerAmount),
          message: offerMessage,
          categorySpecificData: offerCategoryData
        }),
      });

      if (response.ok) {
        const offerData = await response.json();
        alert('Teklifiniz başarıyla gönderildi!');
        setShowOfferModal(false);
        setOfferAmount('');
        setOfferMessage('');
        setOfferCategoryData({});
        // Teklif sayfasına yönlendir
        window.location.href = `/offers/${offerData.id}`;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Teklif gönderilirken bir hata oluştu');
      }
    } catch (error) {
      alert('Teklif gönderilirken bir hata oluştu');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!session) {
      alert('Soru sormak için giriş yapmalısınız');
      return;
    }

    if (!questionText.trim()) {
      alert('Lütfen sorunuzu yazınız');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing?.id,
          question: questionText.trim()
        }),
      });

      if (response.ok) {
        alert('Sorunuz başarıyla gönderildi!');
        setShowQuestionModal(false);
        setQuestionText('');
        // Soruları yeniden yükle
        fetchQuestions();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Soru gönderilirken bir hata oluştu');
      }
    } catch (error) {
      alert('Soru gönderilirken bir hata oluştu');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!session) {
      alert('Cevap vermek için giriş yapmalısınız');
      return;
    }

    if (!answerText.trim()) {
      alert('Lütfen cevabınızı yazınız');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answerText.trim()
        }),
      });

      if (response.ok) {
        alert('Cevabınız başarıyla gönderildi!');
        setAnsweringQuestionId(null);
        setAnswerText('');
        // Soruları yeniden yükle
        fetchQuestions();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Cevap gönderilirken bir hata oluştu');
      }
    } catch (error) {
      alert('Cevap gönderilirken bir hata oluştu');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">İlan Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız ilan mevcut değil.'}</p>
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  // Dinamik alanları göstermek için fonksiyon
  const renderDynamicFields = () => {
    if (!listing?.categorySpecificData) {
      return null;
    }

    const category = getCategoryById(listing.categoryId);
    const subcategory = getSubCategoryById(listing.categoryId, listing.subCategoryId);
    
    if (!subcategory?.dynamicFields) return null;

    const fields: JSX.Element[] = [];

    // Her dinamik alan için değeri kontrol et ve göster
    subcategory.dynamicFields.forEach(field => {
      const value = listing.categorySpecificData[field.id];
      
      // Değer kontrolü - boş, undefined, null, 'farketmez' değerlerini atla
      if (!value || value === 'farketmez' || value === '' || value === null || value === undefined) {
        return;
      }

      // Araç kategorisi için brand ve series alanlarını atla (ayrı gösteriliyor)
       if (listing.categoryId === 'automotive' && listing.subCategoryId === 'cars' && 
           (field.id === 'brand' || field.id === 'series')) {
         return;
       }

      let displayValue = value;
      
      // Alan türüne göre değer formatlaması
      switch (field.type) {
        case 'select':
          if (field.options) {
            const option = field.options.find(opt => opt.value === value);
            if (option) {
              displayValue = option.label;
            }
          }
          break;
          
        case 'number':
          if (typeof value === 'number') {
            displayValue = value.toLocaleString('tr-TR');
            if (field.unit) {
              displayValue += ` ${field.unit}`;
            }
          }
          break;
          
        case 'textarea':
          // Uzun metinleri kısalt
          if (typeof value === 'string' && value.length > 100) {
            displayValue = value.substring(0, 100) + '...';
          }
          break;
          
        case 'checkbox':
          displayValue = value ? 'Evet' : 'Hayır';
          break;
          
        default:
          // Text ve diğer türler için özel formatlamalar
          if (field.id === 'mileage' && typeof value === 'number') {
            displayValue = `${value.toLocaleString('tr-TR')} km`;
          } else if (field.id === 'price' && typeof value === 'number') {
            displayValue = `${value.toLocaleString('tr-TR')} TL`;
          } else if (field.unit && typeof value === 'number') {
            displayValue = `${value} ${field.unit}`;
          }
          break;
      }

      // Özel alan isimleri için Türkçe karşılıklar
      let fieldLabel = field.label || field.name;
      
      // Yaygın alan isimleri için Türkçe karşılıklar
      const labelMap: { [key: string]: string } = {
        'brand': 'Marka',
        'model': 'Model',
        'year': 'Yıl',
        'color': 'Renk',
        'condition': 'Durum',
        'material': 'Malzeme',
        'size': 'Boyut',
        'weight': 'Ağırlık',
        'dimensions': 'Boyutlar',
        'warranty': 'Garanti',
        'storage': 'Depolama',
        'ram': 'RAM',
        'processor': 'İşlemci',
        'screen-size': 'Ekran Boyutu',
        'battery': 'Batarya',
        'camera': 'Kamera',
        'fuel-type': 'Yakıt Türü',
        'transmission': 'Vites',
        'mileage': 'Kilometre',
        'engine-size': 'Motor Hacmi',
        'body-type': 'Kasa Tipi',
        'features': 'Özellikler'
      };

      if (labelMap[field.id]) {
        fieldLabel = labelMap[field.id];
      }

      fields.push(
        <div key={field.id} className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">{fieldLabel}:</span>
          <span className="text-gray-900 text-right max-w-xs truncate" title={displayValue}>
            {displayValue}
          </span>
        </div>
      );
    });

    return fields;
  };

  // Marka ve seri bilgilerini al
  const getBrandInfo = () => {
    if (listing.categorySpecificData?.brand) {
      const brand = carBrands.find(b => b.id === listing.categorySpecificData.brand);
      const series = brand?.series.find(s => s.id === listing.categorySpecificData.series);
      return { brand, series };
    }
    return { brand: null, series: null };
  };

  const { brand, series } = getBrandInfo();

  // Teklif formu için kategori bilgilerini al
  const getOfferFormFields = () => {
    if (!listing) return [];
    
    const category = getCategoryById(listing.categoryId);
    const subcategory = getSubCategoryById(listing.categoryId, listing.subCategoryId);
    
    return subcategory?.dynamicFields || category?.dynamicFields || [];
  };

  const handleOfferCategoryDataChange = (fieldId: string, value: any) => {
    setOfferCategoryData((prev: Record<string, any>) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <a href="/" className="text-blue-600 hover:text-blue-800">Ana Sayfa</a>
          <span className="mx-2 text-gray-500">/</span>
          <a href="/categories" className="text-blue-600 hover:text-blue-800">Kategoriler</a>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-500">{listing.categoryId}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Resimler ve Detaylar */}
          <div className="lg:col-span-2">
            {/* Resim Galerisi */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {Array.isArray(listing.images) && listing.images.length > 0 ? (
                <div>
                  {/* Ana Resim */}
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={listing.images[selectedImageIndex] || '/placeholder-image.jpg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Küçük Resimler */}
                  {Array.isArray(listing.images) && listing.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {listing.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${listing.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Resim bulunmuyor</p>
                </div>
              )}
            </div>

            {/* İlan Başlığı ve Temel Bilgiler */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">İlan No: {listing.listingNumber}</div>
                  <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{listing.views} görüntülenme</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(listing.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPriceRange(listing.minPrice, listing.maxPrice)}
              </div>

              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* Ürün Özellikleri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ürün Özellikleri</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Araç kategorisi için özel marka ve seri gösterimi */}
                {listing.categoryId === 'automotive' && listing.subCategoryId === 'cars' && (
                  <>
                    {brand && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Marka:</span>
                        <span className="text-gray-900">{brand.name} ({brand.country})</span>
                      </div>
                    )}
                    
                    {series && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Seri:</span>
                        <span className="text-gray-900">{series.name}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Dinamik alanları göster */}
                {renderDynamicFields()}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Alıcı Bilgileri */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alıcı Bilgileri</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{listing.user.firstName} {listing.user.lastName}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>Üye</span>
                    {listing._count && (
                      <>
                        <span>•</span>
                        <span>{listing._count.offers} teklif</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                <p>Üyelik: {new Date(listing.user.createdAt).getFullYear()}</p>
              </div>

              <div className="space-y-3">
                {session && session.user?.email !== listing.user.email && listing.status === 'active' && (
                  <button 
                    onClick={() => router.push(`/listings/${listing.id}/offer`)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Teklif Ver
                  </button>
                )}
                
                {session && session.user?.email !== listing.user.email && listing.status === 'active' && (
                  <button 
                    onClick={() => setShowQuestionModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Soru Sor
                  </button>
                )}
                
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Diğer İlanları Gör
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Güvenlik İpuçları</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ürünü satın almadan önce mutlaka görün</li>
                  <li>• Güvenli ödeme yöntemlerini tercih edin</li>
                  <li>• Şüpheli durumları bildirin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sorular ve Cevaplar Bölümü */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sorular ve Cevaplar</h3>
          
          {loadingQuestions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Sorular yükleniyor...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Henüz soru sorulmamış. İlk soruyu siz sorun!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question: any) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {question.asker.firstName} {question.asker.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{question.question}</p>
                      
                      {question.isAnswered && question.answer ? (
                        <div className="bg-gray-50 rounded-lg p-4 mt-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {question.owner.firstName} {question.owner.lastName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {question.answeredAt ? new Date(question.answeredAt).toLocaleDateString('tr-TR') : ''}
                            </span>
                          </div>
                          <p className="text-gray-700">{question.answer}</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          {/* İlan sahibi ise cevap verme arayüzü göster */}
                          {session && session.user?.id === listing?.userId ? (
                            answeringQuestionId === question.id ? (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cevabınız
                                  </label>
                                  <textarea
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Soruya cevabınızı yazın..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAnswerSubmit(question.id)}
                                    disabled={submittingAnswer || !answerText.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {submittingAnswer ? 'Gönderiliyor...' : 'Cevapla'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAnsweringQuestionId(null);
                                      setAnswerText('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    İptal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500 italic">
                                  Henüz cevaplandırılmamış
                                </div>
                                <button
                                  onClick={() => setAnsweringQuestionId(question.id)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Cevapla
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              Henüz cevaplandırılmamış
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teklif Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Teklif Ver</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teklif Miktarı (TL)
              </label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Teklif miktarınızı giriniz"
                min="1"
              />
            </div>

            {/* Kategori-spesifik alanlar */}
            {getOfferFormFields().length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Teklifinizde Belirtmek İstediğiniz Özellikler</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {getOfferFormFields().map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {field.label || field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          value={offerCategoryData[field.id] || ''}
                          onChange={(e) => handleOfferCategoryDataChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={field.required}
                        >
                          <option value="">Seçiniz...</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={offerCategoryData[field.id] || ''}
                          onChange={(e) => handleOfferCategoryDataChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={field.placeholder}
                          min={field.min}
                          max={field.max}
                          required={field.required}
                        />
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={offerCategoryData[field.id] || ''}
                          onChange={(e) => handleOfferCategoryDataChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={field.placeholder}
                          rows={2}
                          required={field.required}
                        />
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={offerCategoryData[field.id] || false}
                            onChange={(e) => handleOfferCategoryDataChange(field.id, e.target.checked)}
                            className="mr-2"
                            required={field.required}
                          />
                          <span className="text-sm text-gray-600">{field.description || field.placeholder}</span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={offerCategoryData[field.id] || ''}
                          onChange={(e) => handleOfferCategoryDataChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesaj (İsteğe bağlı)
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Teklifinizle ilgili bir mesaj yazabilirsiniz..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submittingOffer}
              >
                İptal
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={submittingOffer || !offerAmount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingOffer ? 'Gönderiliyor...' : 'Teklif Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soru Sorma Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              İlan Hakkında Soru Sor
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sorunuz
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="İlan hakkında merak ettiğiniz soruyu yazınız..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submittingQuestion}
              >
                İptal
              </button>
              <button
                onClick={handleQuestionSubmit}
                disabled={submittingQuestion || !questionText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingQuestion ? 'Gönderiliyor...' : 'Soru Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}