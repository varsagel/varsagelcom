'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Tag, 
  Sparkles, 
  ArrowRight,
  Plus,
  X,
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Dumbbell,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface BuyerListingFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  district: string;
  urgency: 'low' | 'medium' | 'high';
  condition: string;
  brand?: string;
  model?: string;
  year?: string;
  specifications: { [key: string]: string };
}

// Kategori verileri
const categories = [
  { id: 'electronics', name: 'Elektronik', icon: Smartphone },
  { id: 'vehicles', name: 'Araçlar', icon: Car },
  { id: 'real-estate', name: 'Emlak', icon: Home },
  { id: 'fashion', name: 'Moda', icon: Shirt },
  { id: 'home', name: 'Ev & Bahçe', icon: Sofa },
  { id: 'sports', name: 'Spor', icon: Dumbbell }
];

const subcategories: { [key: string]: { id: string; name: string }[] } = {
  electronics: [
    { id: 'phone', name: 'Telefon' },
    { id: 'computer', name: 'Bilgisayar' },
    { id: 'tablet', name: 'Tablet' },
    { id: 'tv', name: 'Televizyon' },
    { id: 'camera', name: 'Kamera' },
    { id: 'gaming', name: 'Oyun Konsolu' }
  ],
  vehicles: [
    { id: 'car', name: 'Otomobil' },
    { id: 'motorcycle', name: 'Motosiklet' },
    { id: 'bicycle', name: 'Bisiklet' },
    { id: 'truck', name: 'Kamyon' }
  ],
  'real-estate': [
    { id: 'apartment', name: 'Daire' },
    { id: 'house', name: 'Ev' },
    { id: 'office', name: 'Ofis' },
    { id: 'land', name: 'Arsa' }
  ],
  fashion: [
    { id: 'clothing', name: 'Giyim' },
    { id: 'shoes', name: 'Ayakkabı' },
    { id: 'accessories', name: 'Aksesuar' },
    { id: 'bags', name: 'Çanta' }
  ],
  home: [
    { id: 'furniture', name: 'Mobilya' },
    { id: 'decoration', name: 'Dekorasyon' },
    { id: 'garden', name: 'Bahçe' },
    { id: 'appliances', name: 'Ev Aletleri' }
  ],
  sports: [
    { id: 'fitness', name: 'Fitness' },
    { id: 'outdoor', name: 'Outdoor' },
    { id: 'team-sports', name: 'Takım Sporları' },
    { id: 'water-sports', name: 'Su Sporları' }
  ]
};

// Şehir verileri
const cities = [
  { id: 'istanbul', name: 'İstanbul' },
  { id: 'ankara', name: 'Ankara' },
  { id: 'izmir', name: 'İzmir' },
  { id: 'bursa', name: 'Bursa' },
  { id: 'antalya', name: 'Antalya' },
  { id: 'adana', name: 'Adana' },
  { id: 'gaziantep', name: 'Gaziantep' }
];

const districts: { [key: string]: { id: string; name: string }[] } = {
  istanbul: [
    { id: 'kadikoy', name: 'Kadıköy' },
    { id: 'besiktas', name: 'Beşiktaş' },
    { id: 'sisli', name: 'Şişli' },
    { id: 'uskudar', name: 'Üsküdar' },
    { id: 'fatih', name: 'Fatih' },
    { id: 'bakirkoy', name: 'Bakırköy' }
  ],
  ankara: [
    { id: 'cankaya', name: 'Çankaya' },
    { id: 'kecioren', name: 'Keçiören' },
    { id: 'yenimahalle', name: 'Yenimahalle' },
    { id: 'mamak', name: 'Mamak' }
  ],
  izmir: [
    { id: 'konak', name: 'Konak' },
    { id: 'bornova', name: 'Bornova' },
    { id: 'karsiyaka', name: 'Karşıyaka' },
    { id: 'buca', name: 'Buca' }
  ]
};

// Kategori bazlı dinamik alanlar
interface FieldDefinition {
  label: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
}

const categoryFields: { [key: string]: { [key: string]: { [key: string]: FieldDefinition } } } = {
  electronics: {
    phone: {
      brand: { label: 'Marka', type: 'select', options: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo', 'Diğer'] },
      storage: { label: 'Depolama (GB)', type: 'select', options: ['64', '128', '256', '512', '1024'] },
      color: { label: 'Renk', type: 'text' }
    },
    computer: {
      brand: { label: 'Marka', type: 'select', options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Diğer'] },
      processor: { label: 'İşlemci', type: 'text' },
      ram: { label: 'RAM (GB)', type: 'select', options: ['4', '8', '16', '32', '64'] },
      storage: { label: 'Depolama (GB)', type: 'select', options: ['256', '512', '1024', '2048'] }
    }
  },
  vehicles: {
    car: {
      brand: { label: 'Marka', type: 'select', options: ['Toyota', 'Volkswagen', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Diğer'] },
      model: { label: 'Model', type: 'text' },
      year: { label: 'Yıl', type: 'number' },
      fuel: { label: 'Yakıt Türü', type: 'select', options: ['Benzin', 'Dizel', 'Hibrit', 'Elektrik', 'LPG'] },
      transmission: { label: 'Vites', type: 'select', options: ['Manuel', 'Otomatik'] }
    },
    motorcycle: {
      brand: { label: 'Marka', type: 'select', options: ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Diğer'] },
      model: { label: 'Model', type: 'text' },
      year: { label: 'Yıl', type: 'number' },
      engine: { label: 'Motor Hacmi (cc)', type: 'number' }
    }
  },
  'real-estate': {
    apartment: {
      rooms: { label: 'Oda Sayısı', type: 'select', options: ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'] },
      area: { label: 'Metrekare', type: 'number' },
      floor: { label: 'Kat', type: 'number' },
      heating: { label: 'Isıtma', type: 'select', options: ['Doğalgaz', 'Kombi', 'Merkezi', 'Klima', 'Diğer'] }
    },
    house: {
      rooms: { label: 'Oda Sayısı', type: 'select', options: ['2+1', '3+1', '4+1', '5+1', '6+1'] },
      area: { label: 'Metrekare', type: 'number' },
      garden: { label: 'Bahçe', type: 'select', options: ['Var', 'Yok'] },
      parking: { label: 'Park Yeri', type: 'select', options: ['Var', 'Yok'] }
    }
  }
};

export default function CreateBuyerListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<BuyerListingFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    district: '',
    urgency: 'medium',
    condition: '',
    specifications: {}
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleInputChange = (field: keyof BuyerListingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Kategori değiştiğinde alt kategoriyi ve özellikleri sıfırla
    if (field === 'category') {
      setFormData(prev => ({ 
        ...prev, 
        subcategory: '',
        specifications: {}
      }));
    }

    // Alt kategori değiştiğinde özellikleri sıfırla
    if (field === 'subcategory') {
      setFormData(prev => ({ 
        ...prev, 
        specifications: {}
      }));
    }

    // Şehir değiştiğinde ilçeyi sıfırla
    if (field === 'city') {
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/buyer-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'Alıcı ilanınız başarıyla oluşturuldu!' });
        setTimeout(() => {
          router.push(`/listings/${result.id}`);
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'İlan oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Hata:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category && formData.subcategory;
      case 2:
        return formData.minPrice && formData.maxPrice && formData.city && formData.district;
      case 3:
        return formData.condition && formData.urgency;
      default:
        return false;
    }
  };

  const getSelectedCategory = () => categories.find(cat => cat.id === formData.category);
  const getSelectedSubcategory = () => {
    if (!formData.category) return null;
    return subcategories[formData.category]?.find(sub => sub.id === formData.subcategory);
  };

  const getCurrentFields = (): { [key: string]: FieldDefinition } => {
    if (!formData.category || !formData.subcategory) return {};
    return categoryFields[formData.category]?.[formData.subcategory] || {};
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Alıcı İlanı Oluştur
          </h1>
          <p className="text-gray-600 text-lg">
            Aradığınız ürünü detaylı olarak tanımlayın, satıcılar size ulaşsın
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <ArrowRight className={`w-5 h-5 mx-3 transition-colors duration-300 ${
                    currentStep > step ? 'text-green-500' : 'text-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Step 1: Temel Bilgiler ve Kategori */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-xl border-0">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg p-6">
                <h2 className="flex items-center gap-3 text-2xl font-semibold">
                  <Search className="h-7 w-7" />
                  Ne Arıyorsunuz?
                </h2>
                <p className="text-green-100 mt-2">Aradığınız ürünün başlığını, açıklamasını ve kategorisini belirleyin</p>
              </div>
              <div className="p-8 space-y-6">
                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlan Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Örn: iPhone 14 Pro Max Arıyorum"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detaylı Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Aradığınız ürünün özelliklerini, durumunu ve diğer gereksinimlerinizi detaylı olarak açıklayın..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Kategori Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Kategori Seçin *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleInputChange('category', category.id)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.category === category.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <IconComponent className="h-8 w-8 mx-auto mb-2" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Alt Kategori */}
                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Alt Kategori Seçin *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {subcategories[formData.category]?.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          type="button"
                          onClick={() => handleInputChange('subcategory', subcategory.id)}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            formData.subcategory === subcategory.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <span className="text-sm font-medium">{subcategory.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Devam Et
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Fiyat ve Konum */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-xl border-0">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg p-6">
                <h2 className="flex items-center gap-3 text-2xl font-semibold">
                  <DollarSign className="h-7 w-7" />
                  Fiyat ve Konum
                </h2>
                <p className="text-green-100 mt-2">Bütçenizi ve konumunuzu belirleyin</p>
              </div>
              <div className="p-8 space-y-6">
                {/* Fiyat Aralığı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Fiyat (₺) *
                    </label>
                    <input
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => handleInputChange('minPrice', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimum Fiyat (₺) *
                    </label>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                      placeholder="100000"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Konum */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şehir *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Şehir seçin</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İlçe *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      disabled={!formData.city}
                    >
                      <option value="">İlçe seçin</option>
                      {formData.city && districts[formData.city]?.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Geri
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Devam Et
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Özellikler ve Tercihler */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-xl border-0">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg p-6">
                <h2 className="flex items-center gap-3 text-2xl font-semibold">
                  <Tag className="h-7 w-7" />
                  Özellikler ve Tercihler
                </h2>
                <p className="text-green-100 mt-2">Aradığınız ürünün özelliklerini ve tercihlerinizi belirleyin</p>
              </div>
              <div className="p-8 space-y-6">
                {/* Durum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ürün Durumu *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Sıfır', 'Az Kullanılmış', 'İyi Durumda', 'Orta Durumda', 'Tamir Gerekli', 'Fark Etmez'].map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => handleInputChange('condition', condition)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          formData.condition === condition
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{condition}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aciliyet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Aciliyet Durumu *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'low', label: 'Acil Değil', color: 'blue' },
                      { value: 'medium', label: 'Orta', color: 'yellow' },
                      { value: 'high', label: 'Acil', color: 'red' }
                    ].map((urgency) => (
                      <button
                        key={urgency.value}
                        type="button"
                        onClick={() => handleInputChange('urgency', urgency.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.urgency === urgency.value
                            ? `border-${urgency.color}-500 bg-${urgency.color}-50 text-${urgency.color}-700`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Clock className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{urgency.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dinamik Özellikler */}
                {Object.keys(getCurrentFields()).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Ürün Özellikleri
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(getCurrentFields()).map(([key, field]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            {field.label}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              value={formData.specifications[key] || ''}
                              onChange={(e) => handleSpecificationChange(key, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Seçin</option>
                              {field.options?.map((option: string) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={formData.specifications[key] || ''}
                              onChange={(e) => handleSpecificationChange(key, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder={field.label}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={!isStepValid(3) || isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        İlanı Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}