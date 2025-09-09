'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  MapPinIcon, 
  CalendarIcon, 
  TurkishLiraIcon,
  TagIcon,
  SearchIcon,
  FilterIcon,
  GridIcon,
  ListIcon
} from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  minPrice: number
  maxPrice: number
  city: string
  district: string
  createdAt: string
  status: string
  user: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  _count: {
    offers: number
    favorites: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

export default function CategoryPage() {
  const params = useParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (params?.slug) {
      fetchCategoryData()
    }
  }, [params?.slug, sortBy])

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true)
      
      // Kategori bilgilerini getir
      const categoryResponse = await fetch('/api/categories')
      const categories = await categoryResponse.json()
      const foundCategory = categories.find((cat: Category) => 
        cat.slug === params?.slug || 
        cat.name.toLowerCase().replace(/\s+/g, '-') === params?.slug
      )
      
      if (!foundCategory) {
        setError('Kategori bulunamadı')
        return
      }
      
      setCategory(foundCategory)
      
      // İlanları getir
      const listingsResponse = await fetch(
        `/api/listings?categoryId=${foundCategory.id}&sortBy=${sortBy}`
      )
      
      if (listingsResponse.ok) {
        const data = await listingsResponse.json()
        setListings(data.listings || [])
      } else {
        setError('İlanlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Kategori verileri yüklenirken hata:', error)
      setError('Veriler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
              <span>/</span>
              <span className="text-gray-900">{category?.name}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {category?.name}
                </h1>
                <p className="text-gray-600">
                  {filteredListings.length} ilan bulundu
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <GridIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ListIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="İlan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek-Düşük)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Bu kategoride henüz ilan bulunmuyor</p>
              <Link 
                href="/alim-ilan-sayfasi" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                İlk İlanı Sen Ver
              </Link>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/ilan/${listing.id}`}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group ${
                    viewMode === 'list' ? 'flex gap-6 p-6' : 'p-6'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {listing.category.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{listing.city}, {listing.district}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TurkishLiraIcon className="w-4 h-4" />
                          <span>{listing.minPrice.toLocaleString()} - {listing.maxPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          {listing.user.name}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          {listing._count.offers} teklif
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {listing.category.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {listing.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {listing.description}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{listing.city}, {listing.district}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TurkishLiraIcon className="w-4 h-4" />
                            <span>{listing.minPrice.toLocaleString()} - {listing.maxPrice.toLocaleString()}</span>
                          </div>
                          <span>{listing.user.name}</span>
                          <span className="text-blue-600 font-medium">
                            {listing._count.offers} teklif
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}