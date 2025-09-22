"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, MapPin, Clock, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAllCategories } from "@/data/categories";
import { getAllCities, getDistrictsByCityId } from "@/data/cities";
import { carBrands, getAllBrands, getSeriesByBrand } from '@/data/car-brands';
import { motorcycleBrands, getAllMotorcycleBrands, getMotorcycleModelsByBrand } from '@/data/motorcycle-brands';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = getAllCategories();
const cities = getAllCities();

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface CategoryFormConfig {
  [key: string]: FormField[];
}

// Her kategori için özel form alanları
const categoryFormConfigs: CategoryFormConfig = {
  electronics: [
    { id: 'brand', label: 'Marka', type: 'text', required: true, placeholder: 'Örn: Apple, Samsung, Sony' },
    { id: 'model', label: 'Model', type: 'text', required: true, placeholder: 'Ürün modeli' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'warranty', label: 'Garanti Durumu', type: 'select', options: ['Var', 'Yok', 'Süresi Dolmuş'] },
    { id: 'color', label: 'Renk', type: 'text', placeholder: 'Ürün rengi' },
    { id: 'storage', label: 'Depolama Kapasitesi', type: 'text', placeholder: 'Örn: 128GB, 256GB' }
  ],
  automotive: [
    { id: 'brand', label: 'Marka', type: 'select', required: true },
    { id: 'series', label: 'Seri', type: 'select', required: true },
    { id: 'year', label: 'Model Yılı', type: 'number', required: true, placeholder: 'Örn: 2020' },
    { id: 'mileage', label: 'Kilometre', type: 'number', required: true, placeholder: 'Araç kilometresi' },
    { id: 'engine_size', label: 'Motor Hacmi', type: 'text', required: true, placeholder: 'Örn: 1.6, 2.0' },
    { id: 'fuel_type', label: 'Yakıt Türü', type: 'select', required: true, options: ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'] },
    { id: 'transmission', label: 'Vites Türü', type: 'select', required: true, options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
    { id: 'color', label: 'Renk', type: 'text', required: true, placeholder: 'Araç rengi' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'body_type', label: 'Kasa Tipi', type: 'select', options: ['Sedan', 'Hatchback', 'Station Wagon', 'SUV', 'Coupe', 'Cabrio', 'Pick-up'] }
  ],
  'home-living': [
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Örn: Ahşap, Metal, Plastik' },
    { id: 'dimensions', label: 'Boyutlar', type: 'text', placeholder: 'Genişlik x Yükseklik x Derinlik' },
    { id: 'color', label: 'Renk', type: 'text', placeholder: 'Ürün rengi' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'room_type', label: 'Oda Türü', type: 'select', options: ['Yatak Odası', 'Oturma Odası', 'Mutfak', 'Banyo', 'Çocuk Odası', 'Ofis'] },
    { id: 'style', label: 'Stil', type: 'text', placeholder: 'Örn: Modern, Klasik, Vintage' }
  ],
  'fashion-clothing': [
    { id: 'brand', label: 'Marka', type: 'text', placeholder: 'Giyim markası' },
    { id: 'size', label: 'Beden', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
    { id: 'color', label: 'Renk', type: 'text', required: true, placeholder: 'Ürün rengi' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'material', label: 'Kumaş/Malzeme', type: 'text', placeholder: 'Örn: Pamuk, Polyester, Deri' },
    { id: 'season', label: 'Mevsim', type: 'select', options: ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış', 'Dört Mevsim'] },
    { id: 'gender', label: 'Cinsiyet', type: 'select', options: ['Kadın', 'Erkek', 'Çocuk', 'Bebek', 'Unisex'] }
  ],
  'sports-outdoor': [
    { id: 'brand', label: 'Marka', type: 'text', placeholder: 'Spor markası' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'size', label: 'Beden/Boyut', type: 'text', placeholder: 'Ürün bedeni veya boyutu' },
    { id: 'sport_type', label: 'Spor Türü', type: 'text', placeholder: 'Hangi spor için kullanılıyor' },
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Ürün malzemesi' },
    { id: 'weight', label: 'Ağırlık', type: 'text', placeholder: 'Ürün ağırlığı' }
  ],
  'books-hobbies': [
    { id: 'author', label: 'Yazar/Marka', type: 'text', placeholder: 'Kitap yazarı veya ürün markası' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'language', label: 'Dil', type: 'select', options: ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'Diğer'] },
    { id: 'publication_year', label: 'Yayın Yılı', type: 'number', placeholder: 'Kitap yayın yılı' },
    { id: 'isbn', label: 'ISBN', type: 'text', placeholder: 'Kitap ISBN numarası' },
    { id: 'pages', label: 'Sayfa Sayısı', type: 'number', placeholder: 'Kitap sayfa sayısı' }
  ],
  'music-art': [
    { id: 'brand', label: 'Marka', type: 'text', placeholder: 'Enstrüman veya ekipman markası' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'instrument_type', label: 'Enstrüman Türü', type: 'text', placeholder: 'Örn: Akustik Gitar, Elektro Gitar' },
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Enstrüman malzemesi' },
    { id: 'accessories', label: 'Aksesuarlar', type: 'textarea', placeholder: 'Dahil olan aksesuarları listeleyin' },
    { id: 'case_included', label: 'Kılıf Dahil mi?', type: 'select', options: ['Evet', 'Hayır'] }
  ],
  motorcycles: [
    { id: 'brand', label: 'Marka', type: 'select', required: true },
    { id: 'model', label: 'Model', type: 'select', required: true },
    { id: 'year', label: 'Model Yılı', type: 'number', required: true, placeholder: 'Örn: 2020' },
    { id: 'mileage', label: 'Kilometre', type: 'number', required: true, placeholder: 'Motosiklet kilometresi' },
    { id: 'engine_size', label: 'Motor Hacmi', type: 'text', required: true, placeholder: 'Örn: 150cc, 600cc' },
    { id: 'fuel_type', label: 'Yakıt Türü', type: 'select', required: true, options: ['Benzin', 'Elektrik'] },
    { id: 'transmission', label: 'Vites Türü', type: 'select', required: true, options: ['Manuel', 'Otomatik', 'CVT'] },
    { id: 'color', label: 'Renk', type: 'text', required: true, placeholder: 'Motosiklet rengi' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'license_required', label: 'Gerekli Ehliyet', type: 'select', options: ['A1', 'A2', 'A', 'B'] }
  ],
  other: [
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Ürün malzemesi' },
    { id: 'dimensions', label: 'Boyutlar', type: 'text', placeholder: 'Ürün boyutları' },
    { id: 'weight', label: 'Ağırlık', type: 'text', placeholder: 'Ürün ağırlığı' },
    { id: 'usage_area', label: 'Kullanım Alanı', type: 'text', placeholder: 'Nerelerde kullanılabilir' }
  ]
};

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
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [dynamicFilters, setDynamicFilters] = useState<{[key: string]: string}>({});
  
  // Araç markaları ve serileri için state'ler
  const [selectedBrand, setSelectedBrand] = useState("");
  const [availableSeries, setAvailableSeries] = useState<any[]>([]);
  const [selectedMotorcycleBrand, setSelectedMotorcycleBrand] = useState("");
  const [availableMotorcycleModels, setAvailableMotorcycleModels] = useState<any[]>([]);

  // Tüm araç markalarını getir
  const getAllBrandsLocal = () => {
    return carBrands.map(brand => ({ id: brand.id, name: brand.name }));
  };

  // Tüm motosiklet markalarını getir
  const getAllMotorcycleBrandsLocal = () => {
    return motorcycleBrands.map(brand => ({ id: brand.name, name: brand.name }));
  };

  // İlanları getir
  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedSubCategory, searchTerm, dynamicFilters]);

  // Araç markası değiştiğinde serileri güncelle
  useEffect(() => {
    if (dynamicFilters.brand) {
      const series = getSeriesByBrand(dynamicFilters.brand);
      setAvailableSeries(series);
    } else {
      setAvailableSeries([]);
    }
  }, [dynamicFilters.brand]);

  // Motosiklet markası değiştiğinde modelleri güncelle
  useEffect(() => {
    if (selectedMotorcycleBrand) {
      const models = getMotorcycleModelsByBrand(selectedMotorcycleBrand);
      setAvailableMotorcycleModels(models);
    } else {
      setAvailableMotorcycleModels([]);
    }
  }, [selectedMotorcycleBrand]);

  // Şehir değiştiğinde ilçeleri güncelle
  useEffect(() => {
    if (selectedCity) {
      const cityData = cities.find(city => city.name === selectedCity);
      if (cityData) {
        setAvailableDistricts(cityData.districts);
      } else {
        setAvailableDistricts([]);
      }
    } else {
      setAvailableDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedCity]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedSubCategory) params.append('subCategoryId', selectedSubCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş ilanlar
  const filteredListings = listings.filter(listing => {
    const matchesCity = !selectedCity || listing.location.includes(selectedCity);
    const matchesPrice = (!priceMin || (listing.minPrice && listing.minPrice >= parseFloat(priceMin))) && 
                        (!priceMax || (listing.maxPrice && listing.maxPrice <= parseFloat(priceMax)));
    
    // Dinamik filtreler kontrolü
    const matchesDynamicFilters = Object.entries(dynamicFilters).every(([fieldId, value]) => {
      if (!value || value === '') return true;
      
      try {
        const categorySpecificData = listing.categorySpecificData ? 
          (typeof listing.categorySpecificData === 'string' ? 
            JSON.parse(listing.categorySpecificData) : 
            listing.categorySpecificData) : {};
        
        const fieldValue = categorySpecificData[fieldId];
        if (!fieldValue) return false;
        
        // String karşılaştırması (case-insensitive)
        return fieldValue.toString().toLowerCase().includes(value.toLowerCase());
      } catch (error) {
        console.error('Dinamik filtre hatası:', error);
        return true;
      }
    });
    
    return matchesCity && matchesPrice && matchesDynamicFilters;
  });

  // Sıralanmış ilanlar
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        return (a.minPrice || 0) - (b.minPrice || 0);
      case 'price-high':
        return (b.minPrice || 0) - (a.minPrice || 0);
      case 'most-viewed':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sol Sidebar - Filtreler */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
                </div>
                {(selectedCategory || searchTerm || selectedCity || selectedDistrict || priceMin || priceMax || Object.keys(dynamicFilters).length > 0) && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {[selectedCategory, searchTerm, selectedCity, selectedDistrict, priceMin, priceMax, ...Object.values(dynamicFilters)].filter(Boolean).length} aktif
                  </span>
                )}
              </div>
              
              {/* Arama */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arama
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="İlan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Kategori */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory("");
                    setDynamicFilters({});
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alt Kategori */}
              {selectedCategoryData && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                      setDynamicFilters({});
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tüm Alt Kategoriler</option>
                    {selectedCategoryData.subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.icon} {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Şehir */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedDistrict(""); // Şehir değiştiğinde ilçe seçimini temizle
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Şehirler</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* İlçe */}
              {selectedCity && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tüm İlçeler</option>
                    {availableDistricts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fiyat Aralığı */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat Aralığı
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Dinamik Filtreler - İlan Oluşturma Formu ile Aynı */}
              {selectedCategory && categoryFormConfigs[selectedCategory] && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <h3 className="text-sm font-medium text-blue-900">
                      {selectedCategoryData?.name} Filtreleri
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {categoryFormConfigs[selectedCategory].map((field) => {
                      // Automotive kategorisi için özel alan işlemleri
                      if (selectedCategory === 'automotive' && field.id === 'brand') {
                        return (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <select
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => {
                                const newBrand = e.target.value;
                                setSelectedBrand(newBrand);
                                setDynamicFilters(prev => ({
                                  ...prev,
                                  [field.id]: newBrand,
                                  series: '' // Marka değiştiğinde seri seçimini temizle
                                }));
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Tüm Markalar</option>
                              {getAllBrandsLocal().map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                  {brand.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }
                      
                      if (selectedCategory === 'automotive' && field.id === 'series') {
                        return (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <select
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => setDynamicFilters(prev => ({
                                ...prev,
                                [field.id]: e.target.value
                              }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={!dynamicFilters.brand}
                            >
                              <option value="">Tüm Seriler</option>
                              {availableSeries.map((series) => (
                                <option key={series.id} value={series.id}>
                                  {series.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }
                      
                      if (selectedCategory === 'motorcycles' && field.id === 'brand') {
                        return (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <select
                              value={selectedMotorcycleBrand}
                              onChange={(e) => {
                                setSelectedMotorcycleBrand(e.target.value);
                                setDynamicFilters(prev => ({
                                  ...prev,
                                  [field.id]: e.target.value
                                }));
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Tüm Markalar</option>
                              {getAllMotorcycleBrandsLocal().map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                  {brand.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }
                      
                      if (selectedCategory === 'motorcycles' && field.id === 'model') {
                        return (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <select
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => setDynamicFilters(prev => ({
                                ...prev,
                                [field.id]: e.target.value
                              }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={!selectedMotorcycleBrand}
                            >
                              <option value="">Tüm Modeller</option>
                              {availableMotorcycleModels.map((model) => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }
                      
                      // Genel alanlar
                      return (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          {field.type === 'select' && field.options ? (
                            <select
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => setDynamicFilters(prev => ({
                                ...prev,
                                [field.id]: e.target.value
                              }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Tümü</option>
                              {field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'number' ? (
                            <Input
                              type="number"
                              placeholder={field.placeholder}
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => setDynamicFilters(prev => ({
                                ...prev,
                                [field.id]: e.target.value
                              }))}
                            />
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              placeholder={field.placeholder}
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => setDynamicFilters(prev => ({
                                ...prev,
                                [field.id]: e.target.value
                              }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <Input
                              type="text"
                              placeholder={field.placeholder}
                              value={dynamicFilters[field.id] || ""}
                              onChange={(e) => setDynamicFilters(prev => ({
                                ...prev,
                                [field.id]: e.target.value
                              }))}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}



              {/* Aktif Filtreler */}
              {(selectedCategory || searchTerm || selectedCity || priceMin || priceMax || Object.keys(dynamicFilters).length > 0) && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Aktif Filtreler:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedCategoryData?.name}
                        <button
                          onClick={() => setSelectedCategory("")}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedCity && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {selectedCity}
                        <button
                          onClick={() => setSelectedCity("")}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(priceMin || priceMax) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {priceMin && priceMax ? `${priceMin}₺ - ${priceMax}₺` : priceMin ? `${priceMin}₺+` : `${priceMax}₺-`}
                        <button
                          onClick={() => {
                            setPriceMin("");
                            setPriceMax("");
                          }}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {Object.entries(dynamicFilters).map(([key, value]) => (
                      value && (
                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {value}
                          <button
                            onClick={() => setDynamicFilters(prev => ({ ...prev, [key]: "" }))}
                            className="ml-1 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Filtreleri Temizle */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedSubCategory("");
                  setSelectedCity("");
                  setPriceMin("");
                  setPriceMax("");
                  setDynamicFilters({});
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>

          {/* Sağ İçerik - İlanlar */}
          <div className="flex-1">
            {/* Üst Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    İlanlar
                    {selectedCategoryData && (
                      <span className="text-blue-600"> - {selectedCategoryData.name}</span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-600">
                      {sortedListings.length} ilan bulundu
                    </p>
                    {(selectedCategory || searchTerm || selectedCity || priceMin || priceMax || Object.keys(dynamicFilters).length > 0) && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {[
                            selectedCategory && 'Kategori',
                            searchTerm && 'Arama',
                            selectedCity && 'Şehir',
                            (priceMin || priceMax) && 'Fiyat',
                            Object.keys(dynamicFilters).length > 0 && 'Özel Filtreler'
                          ].filter(Boolean).length} filtre aktif
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Sıralama */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                    <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                    <option value="price-high">Fiyat (Yüksek-Düşük)</option>
                    <option value="most-viewed">En Çok Görüntülenen</option>
                  </select>

                  {/* Görünüm Modu */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* İlanlar */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">İlan bulunamadı</h3>
                <p className="text-gray-600 mb-6">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
                <Link href="/create-listing">
                  <Button>
                    İlk İlanı Sen Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {sortedListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link href={`/listings/${listing.listingNumber}`}>
                      <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                        viewMode === "list" ? "flex" : ""
                      }`}>
                      <CardContent className={`p-0 ${
                        viewMode === "list" ? "flex w-full" : ""
                      }`}>
                        {/* Resim */}
                        <div className={`relative ${
                          viewMode === "list" ? "w-48 h-32" : "h-48"
                        } bg-gray-200 overflow-hidden ${
                          viewMode === "list" ? "rounded-l-lg" : "rounded-t-lg"
                        }`}>
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <div className="text-4xl mb-2">📷</div>
                                <div className="text-sm">Resim Yok</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Favori Butonu */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* İçerik */}
                        <div className={`p-4 ${
                          viewMode === "list" ? "flex-1" : ""
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                              {listing.title}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                              #{listing.listingNumber}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {listing.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl font-bold text-blue-600">
                              {formatPriceRange(listing.minPrice, listing.maxPrice)}
                            </span>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Eye className="h-4 w-4 mr-1" />
                              {listing.views}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {listing.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(listing.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}