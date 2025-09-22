"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { categoriesData, getCategoryById, getSubCategoryById, DynamicFormField } from '@/data/categories';
import { ArrowLeft, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { CarSelector } from '@/components/ui/car-selector';

interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  location: string;
  categoryId: string;
  subCategoryId: string;
  categorySpecificData: any;
  images: string[];
  views?: number;
  _count?: {
    offers: number;
    favorites: number;
    questions: number;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function OfferPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  
  // Dynamic form fields based on category
  const [dynamicFields, setDynamicFields] = useState<DynamicFormField[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (params.id) {
      fetchListing();
    }
  }, [params.id, status]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data);
        
        // Set dynamic fields based on category
        const category = getCategoryById(data.categoryId);
        const subCategory = getSubCategoryById(data.categoryId, data.subCategoryId);
        
        if (subCategory?.dynamicFields) {
          setDynamicFields(subCategory.dynamicFields);
        }
      } else {
        setMessage({ type: 'error', text: 'İlan bulunamadı' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'İlan yüklenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicFieldChange = (fieldId: string, value: any) => {
    setCategorySpecificData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setMessage({ type: 'error', text: 'Teklif vermek için giriş yapmanız gerekiyor' });
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setMessage({ type: 'error', text: 'Geçerli bir teklif miktarı giriniz' });
      return;
    }

    // Validate required dynamic fields
    const requiredFields = dynamicFields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!categorySpecificData[field.id]) {
        setMessage({ type: 'error', text: `${field.label} alanı zorunludur` });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);

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
          categorySpecificData: JSON.stringify(categorySpecificData)
        }),
      });

      if (response.ok) {
        const offerData = await response.json();
        setMessage({ type: 'success', text: 'Teklifiniz başarıyla gönderildi!' });
        setTimeout(() => {
          router.push(`/offers/${offerData.id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Teklif gönderilirken bir hata oluştu' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Teklif gönderilirken bir hata oluştu' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderDynamicField = (field: DynamicFormField) => {
    const value = categorySpecificData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          >
            <option value="">Seçiniz...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={field.placeholder}
            rows={3}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleDynamicFieldChange(field.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              required={field.required}
            />
            <label className="ml-2 text-sm text-gray-700">{field.label}</label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  required={field.required}
                />
                <label className="ml-2 text-sm text-gray-700">{option.label}</label>
              </div>
            ))}
          </div>
        );

      case 'car-selector':
        // Car-selector fields are handled in the main render logic above
        return null;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız ilan mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri Dön
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teklif Ver</h1>
          <p className="text-gray-600">İlan için detaylı teklifinizi oluşturun</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Offer Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Offer Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Detayları</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teklif Miktarı (TL) *
                      </label>
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Teklif miktarınızı giriniz"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
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
                </div>

                {/* Dynamic Category-Specific Fields */}
                {dynamicFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Kategori Özel Bilgiler
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {(() => {
                        const renderedFields: React.ReactElement[] = [];
                        const processedFields = new Set<string>();
                        
                        dynamicFields.forEach((field) => {
                          // Skip if already processed
                          if (processedFields.has(field.id)) return;
                          
                          // Handle car-selector fields specially
                          if (field.type === 'car-selector') {
                            // Find brand and series fields
                            const brandField = dynamicFields.find(f => f.type === 'car-selector' && f.fieldType === 'brand');
                            const seriesField = dynamicFields.find(f => f.type === 'car-selector' && f.fieldType === 'series');
                            
                            if (brandField && field.id === brandField.id) {
                              // Render combined car selector
                              renderedFields.push(
                                <div key="car-selector" className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marka ve Seri {brandField.required && '*'}
                                  </label>
                                  <CarSelector
                                    value={{
                                      brand: categorySpecificData['brand'],
                                      series: categorySpecificData['series']
                                    }}
                                    onChange={(carData) => {
                                      if (carData.brand !== undefined) {
                                        handleDynamicFieldChange('brand', carData.brand);
                                      }
                                      if (carData.series !== undefined) {
                                        handleDynamicFieldChange('series', carData.series);
                                      }
                                    }}
                                    required={brandField.required}
                                  />
                                </div>
                              );
                              
                              // Mark both fields as processed
                              processedFields.add(brandField.id);
                              if (seriesField) processedFields.add(seriesField.id);
                            }
                          } else {
                            // Render normal field
                            renderedFields.push(
                              <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {field.label} {field.required && '*'}
                                </label>
                                {renderDynamicField(field)}
                              </div>
                            );
                            processedFields.add(field.id);
                          }
                        });
                        
                        return renderedFields;
                      })()}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !offerAmount}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        Teklif Gönder
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Detailed Listing Info */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-8 space-y-6">
              {/* Main Image */}
              <div>
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
                <p className="text-3xl font-bold text-green-600 mb-3">
                  {listing.price 
                    ? `${listing.price.toLocaleString('tr-TR')} TL`
                    : listing.minPrice && listing.maxPrice
                    ? `${listing.minPrice.toLocaleString('tr-TR')} - ${listing.maxPrice.toLocaleString('tr-TR')} TL`
                    : listing.minPrice
                    ? `${listing.minPrice.toLocaleString('tr-TR')} TL'den başlayan fiyatlar`
                    : 'Fiyat belirtilmemiş'
                  }
                </p>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {listing.location}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Açıklama</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Category Specific Data */}
              {listing.categorySpecificData && Object.keys(listing.categorySpecificData).length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Teknik Özellikler</h4>
                  <div className="space-y-2">
                    {Object.entries(listing.categorySpecificData).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Images */}
              {listing.images && listing.images.length > 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Diğer Fotoğraflar</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {listing.images.slice(1, 5).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${listing.title} - ${index + 2}`}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                  {listing.images.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{listing.images.length - 5} fotoğraf daha
                    </p>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Alıcı Bilgileri</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.user.firstName} {listing.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">Satıcı</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-2 text-sm">Güvenlik İpuçları</h5>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Ürünü satın almadan önce mutlaka görün</li>
                    <li>• Güvenli ödeme yöntemlerini tercih edin</li>
                    <li>• Şüpheli durumları bildirin</li>
                  </ul>
                </div>
              </div>

              {/* Listing Stats */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">İlan İstatistikleri</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">
                      {listing._count?.offers || 0}
                    </div>
                    <div className="text-xs text-gray-600">Teklif</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">
                      {listing.views || 0}
                    </div>
                    <div className="text-xs text-gray-600">Görüntülenme</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}