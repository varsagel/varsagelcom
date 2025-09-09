'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import CategorySelector from '@/components/forms/category-selector'
import DynamicForm from '@/components/forms/dynamic-form'
import { MapPinIcon, CalendarIcon, TurkishLiraIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  fields?: any[]
}

interface FormData {
  title: string
  description: string
  categoryId: string
  price: number
  location: {
    city: string
    district: string
  }
  dynamicFields: Record<string, any>
  expiresAt?: string
}

const listingSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  categoryId: z.string().min(1, 'Kategori seçimi gereklidir'),
  price: z.number().positive('Fiyat pozitif bir sayı olmalıdır'),
  location: z.object({
    city: z.string().min(1, 'Şehir gereklidir'),
    district: z.string().min(1, 'İlçe gereklidir')
  }),
  dynamicFields: z.record(z.string(), z.any()).optional()
})

const turkishCities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
]

export default function AlimIlanSayfasi() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    location: {
      city: '',
      district: ''
    },
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

    fetchCategories()
  }, [status, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setFormData(prev => ({
      ...prev,
      categoryId: category.id,
      dynamicFields: {}
    }))
    setErrors({})
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
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
      const validatedData = listingSchema.parse(formData)
      
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedData)
      })

      if (response.ok) {
        const listing = await response.json()
        router.push(`/ilan/${listing.id}`)
      } else {
        const errorData = await response.json()
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {}
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path.join('.')] = error.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: errorData.error || 'İlan oluşturulurken bir hata oluştu' })
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err: any) => {
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Alım İlanı Oluştur
            </h1>
            <p className="text-indigo-100">
              İhtiyacınız olan ürün veya hizmeti tanımlayın, satıcılar size teklif versin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Kategori Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <CategorySelector
                categories={categories}
                selectedCategoryId={formData.categoryId}
                onCategorySelect={handleCategorySelect}
                placeholder="Kategori seçiniz"
              />
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Örn: iPhone 14 Pro Max Arıyorum"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="İhtiyacınız olan ürün veya hizmet hakkında detaylı bilgi verin..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Konum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="inline w-4 h-4 mr-1" />
                  Şehir *
                </label>
                <select
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Şehir seçiniz</option>
                  {turkishCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors['location.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.city']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlçe *
                </label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) => handleInputChange('location.district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="İlçe adını yazınız"
                />
                {errors['location.district'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.district']}</p>
                )}
              </div>
            </div>

            {/* Fiyat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TurkishLiraIcon className="inline w-4 h-4 mr-1" />
                Bütçe (TL) *
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Maksimum bütçenizi yazınız"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Dinamik Alanlar */}
            {selectedCategory && selectedCategory.fields && selectedCategory.fields.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedCategory.name} Özellikleri
                </h3>
                <DynamicForm
                  fields={selectedCategory.fields}
                  values={formData.dynamicFields}
                  onChange={handleDynamicFieldChange}
                  errors={errors}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    İlan Oluşturuluyor...
                  </>
                ) : (
                  'İlan Oluştur'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}