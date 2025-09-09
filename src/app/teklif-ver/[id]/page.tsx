'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import DynamicForm from '@/components/forms/dynamic-form'
import { 
  MapPinIcon, 
  CalendarIcon, 
  TurkishLiraIcon, 
  UserIcon,
  ArrowLeftIcon,
  TagIcon
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
}

interface Category {
  id: string
  name: string
  slug: string
  fields?: any[]
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
}

interface OfferFormData {
  price: number
  description: string
  dynamicFields: Record<string, any>
}

const offerSchema = z.object({
  price: z.number().positive('Fiyat pozitif bir sayı olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  dynamicFields: z.record(z.string(), z.any()).optional()
})

export default function TeklifVer() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [formData, setFormData] = useState<OfferFormData>({
    price: 0,
    description: '',
    dynamicFields: {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (params?.id) {
      fetchListing()
    }
  }, [status, params?.id, router])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${params?.id}`)
      if (response.ok) {
        const data = await response.json()
        setListing(data)
        
        // Varsayılan fiyatı ilanın fiyatının %80'i olarak ayarla
        setFormData(prev => ({
          ...prev,
          price: Math.round(data.price * 0.8)
        }))
      } else {
        router.push('/404')
      }
    } catch (error) {
      console.error('İlan yüklenirken hata:', error)
      router.push('/404')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleDynamicFieldChange = (values: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: values
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      const validatedData = offerSchema.parse(formData)
      
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...validatedData,
          listingId: params?.id
        })
      })

      if (response.ok) {
        const offer = await response.json()
        router.push(`/ilan/${params?.id}?success=offer-created`)
      } else {
        const errorData = await response.json()
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {}
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path.join('.')] = error.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: errorData.error || 'Teklif gönderilirken bir hata oluştu' })
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          fieldErrors[err.path.join('.')] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: 'Beklenmeyen bir hata oluştu' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !listing) {
    return null
  }

  const isOwner = session?.user?.id === listing.user.id
  const daysRemaining = getDaysRemaining(listing.expiresAt)
  const isExpired = daysRemaining <= 0

  if (isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kendi ilanınıza teklif veremezsiniz
          </h1>
          <Link
            href={`/ilan/${listing.id}`}
            className="text-indigo-600 hover:text-indigo-500"
          >
            İlan detayına dön
          </Link>
        </div>
      </div>
    )
  }

  if (isExpired || listing.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bu ilan artık aktif değil
          </h1>
          <Link
            href={`/ilan/${listing.id}`}
            className="text-indigo-600 hover:text-indigo-500"
          >
            İlan detayına dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/ilan/${listing.id}`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            İlan detayına dön
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* İlan Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Özeti</h3>
              
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900 line-clamp-2">
                  {listing.title}
                </h4>
                
                <div className="flex items-center text-sm text-gray-500">
                  <TagIcon className="w-4 h-4 mr-1" />
                  {listing.category.name}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {listing.city}, {listing.district}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {formatDate(listing.createdAt)}
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <span className="text-sm text-gray-600">Maksimum Bütçe</span>
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatPrice(listing.price)}
                  </div>
                </div>
              </div>

              {/* İlan Sahibi */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">İlan Sahibi</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-700">{listing.user.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teklif Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Teklif Ver
                </h1>
                <p className="text-green-100">
                  Bu ilana teklifinizi gönderin ve satıcı ile iletişime geçin.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Teklif Fiyatı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TurkishLiraIcon className="inline w-4 h-4 mr-1" />
                    Teklif Fiyatı (TL) *
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Teklif fiyatınızı yazınız"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Maksimum bütçe: {formatPrice(listing.price)}
                  </p>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklif Açıklaması *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Teklifiniz hakkında detaylı bilgi verin. Ürün/hizmet özellikleri, teslimat süresi, garanti durumu vb..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Dinamik Alanlar */}
                {listing.category.fields && listing.category.fields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Ürün/Hizmet Özellikleri
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Sunacağınız ürün/hizmetin özelliklerini belirtin:
                    </p>
                    <DynamicForm
                      fields={listing.category.fields}
                      values={formData.dynamicFields}
                      onChange={handleDynamicFieldChange}
                      errors={errors}
                    />
                  </div>
                )}

                {/* İlan Özellikleri (Referans) */}
                {Object.keys(listing.dynamicFields).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      İlan Sahibinin Aradığı Özellikler (Referans)
                    </h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(listing.dynamicFields).map(([key, value]) => {
                        const field = listing.category.fields?.find(f => f.name === key)
                        return renderDynamicField(key, value, field)
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Link
                    href={`/ilan/${listing.id}`}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    İptal
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Teklif Gönderiliyor...
                      </>
                    ) : (
                      'Teklif Gönder'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}