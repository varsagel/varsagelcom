'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/providers/SessionProvider'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MapPinIcon, 
  CalendarIcon, 
  TurkishLiraIcon, 
  UserIcon, 
  HeartIcon,
  ShareIcon,
  ClockIcon,
  TagIcon
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  fields?: any[]
}

interface Offer {
  id: string
  price: number
  description: string
  dynamicFields: Record<string, any>
  status: string
  createdAt: string
  user: User
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  city: string
  district: string
  dynamicFields: Record<string, any>
  status: string
  createdAt: string
  expiresAt: string
  user: User
  category: Category
  offers: Offer[]
  _count: {
    offers: number
    favorites: number
  }
}

export default function IlanDetay() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchListing()
    }
  }, [params?.id])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${params?.id}`)
      if (response.ok) {
        const data = await response.json()
        setListing(data)
      } else if (response.status === 404) {
        setError('İlan bulunamadı')
      } else {
        setError('İlan yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('İlan yüklenirken hata:', error)
      setError('İlan yüklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const renderDynamicField = (key: string, value: any, field?: any) => {
    if (!value) return null

    return (
      <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-600 capitalize">
          {field?.label || key.replace(/([A-Z])/g, ' $1').trim()}
        </span>
        <span className="font-medium text-gray-900">
          {typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : value}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'İlan bulunamadı'}
          </h1>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.id === listing.user.id
  const daysRemaining = getDaysRemaining(listing.expiresAt)
  const isExpired = daysRemaining <= 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* İlan Başlığı ve Durum */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <TagIcon className="w-4 h-4 mr-1" />
                      {listing.category.name}
                    </span>
                    <span className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {listing.city}, {listing.district}
                    </span>
                    <span className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors">
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Durum Göstergesi */}
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isExpired 
                    ? 'bg-red-100 text-red-800'
                    : listing.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isExpired ? 'Süresi Dolmuş' : listing.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                </span>
                {!isExpired && (
                  <span className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {daysRemaining} gün kaldı
                  </span>
                )}
              </div>

              {/* Fiyat */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700">Maksimum Bütçe</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {formatPrice(listing.price)}
                  </span>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Açıklama</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Dinamik Alanlar */}
            {Object.keys(listing.dynamicFields).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {listing.category.name} Özellikleri
                </h3>
                <div className="space-y-1">
                  {Object.entries(listing.dynamicFields).map(([key, value]) => {
                    const field = listing.category.fields?.find(f => f.name === key)
                    return renderDynamicField(key, value, field)
                  })}
                </div>
              </div>
            )}

            {/* Teklifler */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gelen Teklifler ({listing._count.offers})
                </h3>
                {!isOwner && !isExpired && session && (
                  <Link
                    href={`/teklif-ver/${listing.id}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Teklif Ver
                  </Link>
                )}
              </div>

              {listing.offers.length > 0 ? (
                <div className="space-y-4">
                  {listing.offers.map((offer) => (
                    <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{offer.user.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(offer.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatPrice(offer.price)}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            offer.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : offer.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {offer.status === 'PENDING' ? 'Bekliyor' : 
                             offer.status === 'ACCEPTED' ? 'Kabul Edildi' : 'Reddedildi'}
                          </span>
                        </div>
                      </div>
                      {offer.description && (
                        <p className="text-gray-700 mb-2">{offer.description}</p>
                      )}
                      {isOwner && offer.status === 'PENDING' && (
                        <div className="flex space-x-2 mt-3">
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            Kabul Et
                          </button>
                          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                            Reddet
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Henüz teklif verilmemiş.</p>
                  {!isOwner && !isExpired && session && (
                    <p className="mt-2">İlk teklifi siz verin!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* İlan Sahibi */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Sahibi</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{listing.user.name}</p>
                  <p className="text-sm text-gray-500">
                    Üye olma: {formatDate(listing.user.createdAt)}
                  </p>
                </div>
              </div>
              {!isOwner && session && (
                <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Mesaj Gönder
                </button>
              )}
            </div>

            {/* İstatistikler */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Görüntülenme</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teklif Sayısı</span>
                  <span className="font-medium">{listing._count.offers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favori</span>
                  <span className="font-medium">{listing._count.favorites}</span>
                </div>
              </div>
            </div>

            {/* İlan Yönetimi (Sadece sahip görebilir) */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Yönetimi</h3>
                <div className="space-y-2">
                  <Link
                    href={`/ilan/duzenle/${listing.id}`}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors block text-center"
                  >
                    İlanı Düzenle
                  </Link>
                  <button className="w-full bg-yellow-100 text-yellow-700 py-2 px-4 rounded-md hover:bg-yellow-200 transition-colors">
                    {listing.status === 'ACTIVE' ? 'Pasif Yap' : 'Aktif Yap'}
                  </button>
                  <button className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors">
                    İlanı Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}