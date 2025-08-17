'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCity, formatDistrict } from '@/utils/locationUtils';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  district?: string;
  budgetMin: number;
  budgetMax: number;
  expiryDate: string;
  mileage?: number;
  mileageMin?: number;
  mileageMax?: number;
  categorySpecificData?: {
    brand?: string;
    model?: string;
    series?: string;
    fuelType?: string;
    transmission?: string;
    color?: string;
    yearMin?: number;
    yearMax?: number;
    [key: string]: any;
  };
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function CreateOfferPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // URL parameter veya query parameter'dan listingId'yi al
  const listingId = (params.id as string) || searchParams.get('listingId');

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    price: '',
    description: '',
    deliveryTime: '7',
    deliveryUnit: 'gün',
    experience: 'Orta',
    portfolio: 'Varsayılan portfolyo',
    guaranteeOffered: false,
    revisionCount: '2',
    additionalServices: [],
    // Kategori bazlı özel alanlar
    categorySpecificData: {} as Record<string, any>,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // İlan bilgilerini getir
  useEffect(() => {
    if (!listingId) {
      router.push('/listings');
      return;
    }
    
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error('İlan bilgileri alınamadı');
        }

        const data = await response.json();

        if (data.success && data.listing) {
          setListing({
            id: data.listing.id,
            title: data.listing.title,
            description: data.listing.description,
            category: data.listing.category,
            subcategory: data.listing.subcategory,
            location: data.listing.location,
            budgetMin: data.listing.budget?.min || data.listing.budgetMin,
            budgetMax: data.listing.budget?.max || data.listing.budgetMax,
            expiryDate: data.listing.expiresAt || data.listing.expiryDate,
            user: {
              id: data.listing.user.id,
              name: data.listing.user.name,
              image: data.listing.user.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'
            }
          });
        } else {
          throw new Error('İlan bulunamadı');
        }

        setIsLoading(false);
      } catch (err) {
        setError('İlan bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategorySpecificChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      categorySpecificData: {
        ...prev.categorySpecificData,
        [field]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Kategori bazlı form alanlarını render eden fonksiyon
  const renderCategorySpecificFields = () => {
    if (!listing) return null;

    const category = listing.category.toLowerCase();
    const subcategory = listing.subcategory?.toLowerCase() || '';
    
    // Kategori eşleştirme mantığını genişletiyoruz
    const isVehicle = ['otomobil', 'araç', 'araba', 'vasita', 'otomotiv', 'motor', 'motorsiklet', 'bisiklet', 'kamyon', 'minibüs'].includes(category) ||
      ['otomobil', 'araç', 'araba', 'vasita', 'otomotiv', 'motor', 'motorsiklet', 'bisiklet', 'kamyon', 'minibüs'].includes(subcategory);
    const isElectronics = ['elektronik', 'bilgisayar', 'laptop', 'telefon', 'tablet', 'teknoloji', 'donanım', 'yazılım', 'oyun', 'ses', 'görüntü'].includes(category) ||
      ['elektronik', 'bilgisayar', 'laptop', 'telefon', 'tablet', 'teknoloji', 'donanım', 'yazılım', 'oyun', 'ses', 'görüntü'].includes(subcategory);
    
    // Elektronik kategorisi kontrolü (bilgisayar dahil)
    if (isElectronics || subcategory === 'bilgisayar' || subcategory.includes('bilgisayar') || category.includes('bilgisayar')) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">💻 Elektronik Ürün Bilgileri ve Teklif Detayları</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marka</label>
              <input
                type="text"
                value={formData.categorySpecificData.brand || ''}
                onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                placeholder="Örn: Apple, Dell, HP, Asus"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <input
                type="text"
                value={formData.categorySpecificData.model || ''}
                onChange={(e) => handleCategorySpecificChange('model', e.target.value)}
                placeholder="Örn: MacBook Pro, Inspiron 15"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ürün Tipi</label>
              <select
                value={formData.categorySpecificData.productType || ''}
                onChange={(e) => handleCategorySpecificChange('productType', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Masaüstü Bilgisayar</option>
                <option value="tablet">Tablet</option>
                <option value="phone">Telefon</option>
                <option value="accessory">Aksesuar</option>
                <option value="component">Bilgisayar Parçası</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ürün Yaşı</label>
              <select
                value={formData.categorySpecificData.age || ''}
                onChange={(e) => handleCategorySpecificChange('age', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="yeni">Sıfır/Yeni</option>
                <option value="1-yil">1 Yıl ve Altı</option>
                <option value="2-yil">2 Yıl ve Altı</option>
                <option value="3-yil">3 Yıl ve Altı</option>
                <option value="eski">3 Yıldan Eski</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Teknik Özellikler</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">İşlemci</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.processor || ''}
                  onChange={(e) => handleCategorySpecificChange('processor', e.target.value)}
                  placeholder="Örn: Intel i7, AMD Ryzen 5"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">RAM</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.ram || ''}
                  onChange={(e) => handleCategorySpecificChange('ram', e.target.value)}
                  placeholder="Örn: 8GB, 16GB DDR4"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Depolama</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.storage || ''}
                  onChange={(e) => handleCategorySpecificChange('storage', e.target.value)}
                  placeholder="Örn: 512GB SSD, 1TB HDD"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ekran Kartı</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.graphics || ''}
                  onChange={(e) => handleCategorySpecificChange('graphics', e.target.value)}
                  placeholder="Örn: NVIDIA GTX 1650, AMD Radeon"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Diğer Özellikler</label>
              <textarea
                value={formData.categorySpecificData.otherSpecs || ''}
                onChange={(e) => handleCategorySpecificChange('otherSpecs', e.target.value)}
                placeholder="Ekran boyutu, işletim sistemi, bağlantı portları vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Garanti Durumu</label>
            <select
              value={formData.categorySpecificData.warranty || ''}
              onChange={(e) => handleCategorySpecificChange('warranty', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="yok">Garanti Yok</option>
              <option value="6-ay">6 Ay</option>
              <option value="1-yıl">1 Yıl</option>
              <option value="2-yıl">2 Yıl</option>
              <option value="üretici">Üretici Garantisi Var</option>
              <option value="bayi">Bayi Garantisi</option>
            </select>
          </div>
        </div>
      );
    }
    const isRealEstate = ['emlak', 'ev', 'daire', 'villa', 'arsa', 'ofis', 'mağaza', 'depo', 'gayrimenkul'].includes(category) ||
      ['emlak', 'ev', 'daire', 'villa', 'arsa', 'ofis', 'mağaza', 'depo', 'gayrimenkul'].includes(listing.subcategory?.toLowerCase() || '');
    const isService = ['hizmet', 'temizlik', 'tamir', 'bakım', 'eğitim', 'danışmanlık', 'tasarım', 'yazılım', 'web', 'grafik'].includes(category) ||
      ['hizmet', 'temizlik', 'tamir', 'bakım', 'eğitim', 'danışmanlık', 'tasarım', 'yazılım', 'web', 'grafik'].includes(listing.subcategory?.toLowerCase() || '');
    const isClothing = ['giyim', 'ayakkabı', 'çanta', 'aksesuar', 'moda', 'tekstil'].includes(category) ||
      ['giyim', 'ayakkabı', 'çanta', 'aksesuar', 'moda', 'tekstil'].includes(listing.subcategory?.toLowerCase() || '');
    const isFood = ['yemek', 'gıda', 'restoran', 'catering', 'aşçı', 'mutfak'].includes(category) ||
      ['yemek', 'gıda', 'restoran', 'catering', 'aşçı', 'mutfak'].includes(listing.subcategory?.toLowerCase() || '');
    const isHealth = ['sağlık', 'tıp', 'doktor', 'hemşire', 'fizyoterapi', 'diyet', 'spor'].includes(category) ||
      ['sağlık', 'tıp', 'doktor', 'hemşire', 'fizyoterapi', 'diyet', 'spor'].includes(listing.subcategory?.toLowerCase() || '');
    const isEducation = ['eğitim', 'öğretmen', 'kurs', 'ders', 'özel ders', 'akademik'].includes(category) ||
      ['eğitim', 'öğretmen', 'kurs', 'ders', 'özel ders', 'akademik'].includes(listing.subcategory?.toLowerCase() || '');
    const isSpareParts = ['yedek-parca', 'yedek parça', 'aksesuar', 'donanım', 'tuning', 'otomotiv ekipmanları', 'motosiklet ekipmanları'].includes(category) ||
      ['yedek-parca', 'yedek parça', 'aksesuar', 'donanım', 'tuning', 'otomotiv ekipmanları', 'motosiklet ekipmanları'].includes(listing.subcategory?.toLowerCase() || '');
    const isIndustrialMachinery = [
      'iş makineleri', 'sanayi', 'endüstriyel', 'makine', 'ekipman',
      'inşaat makineleri', 'tarım makineleri', 'forklift', 'vinç'
    ].some(cat => 
      listing.category?.toLowerCase().includes(cat) || 
      listing.subcategory?.toLowerCase().includes(cat)
    );
    const isVehicleEquipment = [
      'deniz aracı', 'hava aracı', 'atv', 'karavan', 'tekne', 'yat',
      'jet ski', 'uçak', 'helikopter', 'drone', 'motorsiklet ekipmanları'
    ].some(cat => 
      listing.category?.toLowerCase().includes(cat) || 
      listing.subcategory?.toLowerCase().includes(cat)
    );

    if (isVehicle) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🚗 Araç Bilgileri ve Teklif Detayları</h3>

          {/* Marka, Model ve Seri */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Marka <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.categorySpecificData.brand || ''}
                onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                placeholder="Örn: BMW, Mercedes, Toyota"
                className={`w-full rounded-md border ${errors.brand ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Model <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.categorySpecificData.model || ''}
                onChange={(e) => handleCategorySpecificChange('model', e.target.value)}
                placeholder="Örn: 3.20i, C180, Corolla"
                className={`w-full rounded-md border ${errors.model ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seri</label>
              <input
                type="text"
                value={formData.categorySpecificData.series || ''}
                onChange={(e) => handleCategorySpecificChange('series', e.target.value)}
                placeholder="Örn: 1.6 TDI, 2.0 TSI, Sport"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Araç Durumu */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Araç Durumu <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.vehicleCondition || ''}
              onChange={(e) => handleCategorySpecificChange('vehicleCondition', e.target.value)}
              className={`w-full rounded-md border ${errors.vehicleCondition ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="sifir">Sıfır Araç</option>
              <option value="ikinci-el-temiz">İkinci El - Temiz</option>
              <option value="ikinci-el-orta">İkinci El - Orta</option>
              <option value="ikinci-el-bakimli">İkinci El - Bakımlı</option>
              <option value="hasarli-tamir-edilebilir">Hasarlı - Tamir Edilebilir</option>
              <option value="hasarli-agir">Hasarlı - Ağır Hasar</option>
              <option value="hurda">Hurda</option>
            </select>
            {errors.vehicleCondition && <p className="text-xs text-destructive">{errors.vehicleCondition}</p>}
          </div>

          {/* Kilometre ve Model Yılı */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kilometre <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.categorySpecificData.mileage || ''}
                onChange={(e) => handleCategorySpecificChange('mileage', e.target.value)}
                placeholder="Örn: 150000"
                className={`w-full rounded-md border ${errors.mileage ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.mileage && <p className="text-xs text-destructive">{errors.mileage}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Model Yılı <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={formData.categorySpecificData.modelYear || ''}
                onChange={(e) => handleCategorySpecificChange('modelYear', e.target.value)}
                placeholder="Örn: 2020"
                className={`w-full rounded-md border ${errors.modelYear ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.modelYear && <p className="text-xs text-destructive">{errors.modelYear}</p>}
            </div>
          </div>

          {/* Yakıt ve Vites */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Yakıt Tipi <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.categorySpecificData.fuelType || ''}
                onChange={(e) => handleCategorySpecificChange('fuelType', e.target.value)}
                className={`w-full rounded-md border ${errors.fuelType ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              >
                <option value="">Seçiniz</option>
                <option value="benzin">Benzin</option>
                <option value="dizel">Dizel</option>
                <option value="lpg">LPG</option>
                <option value="benzin-lpg">Benzin + LPG</option>
                <option value="elektrik">Elektrik</option>
                <option value="hibrit">Hibrit</option>
                <option value="plug-in-hibrit">Plug-in Hibrit</option>
              </select>
              {errors.fuelType && <p className="text-xs text-destructive">{errors.fuelType}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Vites Tipi <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.categorySpecificData.transmission || ''}
                onChange={(e) => handleCategorySpecificChange('transmission', e.target.value)}
                className={`w-full rounded-md border ${errors.transmission ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              >
                <option value="">Seçiniz</option>
                <option value="manuel">Manuel</option>
                <option value="otomatik">Otomatik</option>
                <option value="yarimotomatik">Yarı Otomatik</option>
                <option value="cvt">CVT</option>
                <option value="dsg">DSG</option>
              </select>
              {errors.transmission && <p className="text-xs text-destructive">{errors.transmission}</p>}
            </div>
          </div>

          {/* Kasa Tipi */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kasa Tipi</label>
            <select
              value={formData.categorySpecificData.bodyType || ''}
              onChange={(e) => handleCategorySpecificChange('bodyType', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
              <option value="station-wagon">Station Wagon</option>
              <option value="suv">SUV</option>
              <option value="coupe">Coupe</option>
              <option value="cabrio">Cabrio</option>
              <option value="pickup">Pickup</option>
              <option value="minivan">Minivan</option>
              <option value="panelvan">Panelvan</option>
            </select>
          </div>

          {/* Renk */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Renk</label>
            <select
              value={formData.categorySpecificData.color || ''}
              onChange={(e) => handleCategorySpecificChange('color', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="beyaz">Beyaz</option>
              <option value="siyah">Siyah</option>
              <option value="gri">Gri</option>
              <option value="gumus">Gümüş</option>
              <option value="kirmizi">Kırmızı</option>
              <option value="mavi">Mavi</option>
              <option value="yesil">Yeşil</option>
              <option value="sari">Sarı</option>
              <option value="turuncu">Turuncu</option>
              <option value="mor">Mor</option>
              <option value="kahverengi">Kahverengi</option>
              <option value="pembe">Pembe</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          {/* Motor Hacmi ve Güç */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motor Hacmi (cc)</label>
              <input
                type="number"
                min="0"
                value={formData.categorySpecificData.engineSize || ''}
                onChange={(e) => handleCategorySpecificChange('engineSize', e.target.value)}
                placeholder="Örn: 1600"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motor Gücü (HP)</label>
              <input
                type="number"
                min="0"
                value={formData.categorySpecificData.enginePower || ''}
                onChange={(e) => handleCategorySpecificChange('enginePower', e.target.value)}
                placeholder="Örn: 150"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Hasar Bilgileri */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-700">🔧 Hasar ve Bakım Bilgileri</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Boyalı Parça Sayısı</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.categorySpecificData.paintedParts || ''}
                  onChange={(e) => handleCategorySpecificChange('paintedParts', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Değişen Parça Sayısı</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.categorySpecificData.replacedParts || ''}
                  onChange={(e) => handleCategorySpecificChange('replacedParts', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hasar Detayları</label>
              <textarea
                value={formData.categorySpecificData.damageDetails || ''}
                onChange={(e) => handleCategorySpecificChange('damageDetails', e.target.value)}
                placeholder="Varsa hasar detaylarını açıklayın (çizik, ezik, kaza geçmişi, boyalı parçalar vb.)"
                rows={3}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bakım Geçmişi</label>
              <textarea
                value={formData.categorySpecificData.maintenanceHistory || ''}
                onChange={(e) => handleCategorySpecificChange('maintenanceHistory', e.target.value)}
                placeholder="Araçın bakım geçmişi, değişen parçalar, servis kayıtları vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Ek Özellikler */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">⭐ Ek Özellikler ve Donanım</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Özel Donanımlar</label>
              <textarea
                value={formData.categorySpecificData.specialFeatures || ''}
                onChange={(e) => handleCategorySpecificChange('specialFeatures', e.target.value)}
                placeholder="Sunroof, deri döşeme, navigasyon, park sensörü, kamera, xenon far vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teslim Koşulları</label>
              <textarea
                value={formData.categorySpecificData.deliveryConditions || ''}
                onChange={(e) => handleCategorySpecificChange('deliveryConditions', e.target.value)}
                placeholder="Teslim yeri, nakliye durumu, belgeler, ek masraflar vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (isRealEstate) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">🏠 Emlak Bilgileri ve Teklif Detayları</h3>

          {/* Emlak Tipi */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Emlak Tipi <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.propertyType || ''}
              onChange={(e) => handleCategorySpecificChange('propertyType', e.target.value)}
              className={`w-full rounded-md border ${errors.propertyType ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="daire">Daire</option>
              <option value="villa">Villa</option>
              <option value="müstakil-ev">Müstakil Ev</option>
              <option value="dubleks">Dubleks</option>
              <option value="tripleks">Tripleks</option>
              <option value="residence">Residence</option>
              <option value="arsa">Arsa</option>
              <option value="işyeri">İşyeri</option>
              <option value="ofis">Ofis</option>
              <option value="mağaza">Mağaza</option>
            </select>
            {errors.propertyType && <p className="text-xs text-destructive">{errors.propertyType}</p>}
          </div>

          {/* Metrekare ve Oda Sayısı */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Metrekare (m²) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.categorySpecificData.squareMeters || ''}
                onChange={(e) => handleCategorySpecificChange('squareMeters', e.target.value)}
                placeholder="Örn: 120"
                className={`w-full rounded-md border ${errors.squareMeters ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.squareMeters && <p className="text-xs text-destructive">{errors.squareMeters}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Oda Sayısı <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.categorySpecificData.roomCount || ''}
                onChange={(e) => handleCategorySpecificChange('roomCount', e.target.value)}
                className={`w-full rounded-md border ${errors.roomCount ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              >
                <option value="">Seçiniz</option>
                <option value="1+0">1+0</option>
                <option value="1+1">1+1</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
                <option value="5+1">5+1</option>
                <option value="6+1">6+1</option>
                <option value="7+1">7+1</option>
                <option value="8+1">8+1</option>
              </select>
              {errors.roomCount && <p className="text-xs text-destructive">{errors.roomCount}</p>}
            </div>
          </div>

          {/* Bina Yaşı ve Kat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bina Yaşı <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.categorySpecificData.buildingAge || ''}
                onChange={(e) => handleCategorySpecificChange('buildingAge', e.target.value)}
                placeholder="Örn: 5"
                className={`w-full rounded-md border ${errors.buildingAge ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.buildingAge && <p className="text-xs text-destructive">{errors.buildingAge}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bulunduğu Kat</label>
              <input
                type="text"
                value={formData.categorySpecificData.floor || ''}
                onChange={(e) => handleCategorySpecificChange('floor', e.target.value)}
                placeholder="Örn: 3, Zemin, Çatı Katı"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Isıtma ve Banyo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Isıtma Tipi</label>
              <select
                value={formData.categorySpecificData.heatingType || ''}
                onChange={(e) => handleCategorySpecificChange('heatingType', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="merkezi">Merkezi Sistem</option>
                <option value="kombi">Kombi</option>
                <option value="klima">Klima</option>
                <option value="soba">Soba</option>
                <option value="yerden-isitma">Yerden Isıtma</option>
                <option value="güneş-enerjisi">Güneş Enerjisi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Banyo Sayısı</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.categorySpecificData.bathroomCount || ''}
                onChange={(e) => handleCategorySpecificChange('bathroomCount', e.target.value)}
                placeholder="Örn: 2"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Emlak Durumu */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-700">🏗️ Emlak Durumu ve Özellikler</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emlak Durumu</label>
              <select
                value={formData.categorySpecificData.propertyCondition || ''}
                onChange={(e) => handleCategorySpecificChange('propertyCondition', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="sifir">Sıfır</option>
                <option value="yeni">Yeni (1-2 yaş)</option>
                <option value="iyi">İyi Durumda</option>
                <option value="orta">Orta Durumda</option>
                <option value="eski">Eski</option>
                <option value="tadilat-gerekli">Tadilat Gerekli</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Balkon/Teras</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="balcony"
                    value="var"
                    checked={formData.categorySpecificData.balcony === 'var'}
                    onChange={(e) => handleCategorySpecificChange('balcony', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Var</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="balcony"
                    value="yok"
                    checked={formData.categorySpecificData.balcony === 'yok'}
                    onChange={(e) => handleCategorySpecificChange('balcony', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Yok</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Otopark</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="parking"
                    value="var"
                    checked={formData.categorySpecificData.parking === 'var'}
                    onChange={(e) => handleCategorySpecificChange('parking', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Var</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="parking"
                    value="yok"
                    checked={formData.categorySpecificData.parking === 'yok'}
                    onChange={(e) => handleCategorySpecificChange('parking', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Yok</span>
                </label>
              </div>
            </div>
          </div>

          {/* Ek Özellikler */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">⭐ Ek Özellikler ve Donanım</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Özel Özellikler</label>
              <textarea
                value={formData.categorySpecificData.specialFeatures || ''}
                onChange={(e) => handleCategorySpecificChange('specialFeatures', e.target.value)}
                placeholder="Asansör, güvenlik, havuz, spor salonu, çocuk parkı, jeneratör vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Konum Avantajları</label>
              <textarea
                value={formData.categorySpecificData.locationAdvantages || ''}
                onChange={(e) => handleCategorySpecificChange('locationAdvantages', e.target.value)}
                placeholder="Okul, hastane, alışveriş merkezi, toplu taşıma yakınlığı vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teslim Koşulları</label>
              <textarea
                value={formData.categorySpecificData.deliveryConditions || ''}
                onChange={(e) => handleCategorySpecificChange('deliveryConditions', e.target.value)}
                placeholder="Tapu durumu, krediye uygunluk, teslim tarihi, ek masraflar vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (isElectronics) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">💻 Elektronik Ürün Bilgileri ve Teklif Detayları</h3>

          {/* Marka ve Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Marka <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.categorySpecificData.brand || ''}
                onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                placeholder="Örn: Dell, HP, Apple, Samsung"
                className={`w-full rounded-md border ${errors.brand ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Model <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.categorySpecificData.model || ''}
                onChange={(e) => handleCategorySpecificChange('model', e.target.value)}
                placeholder="Örn: Inspiron 15, MacBook Pro, Galaxy S23"
                className={`w-full rounded-md border ${errors.model ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
            </div>
          </div>

          {/* Ürün Tipi ve Yaş */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ürün Tipi</label>
              <select
                value={formData.categorySpecificData.productType || ''}
                onChange={(e) => handleCategorySpecificChange('productType', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="laptop">Laptop</option>
                <option value="masaüstü">Masaüstü Bilgisayar</option>
                <option value="tablet">Tablet</option>
                <option value="telefon">Akıllı Telefon</option>
                <option value="monitör">Monitör</option>
                <option value="yazıcı">Yazıcı</option>
                <option value="kamera">Kamera</option>
                <option value="oyun-konsolu">Oyun Konsolu</option>
                <option value="diğer">Diğer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ürün Yaşı</label>
              <select
                value={formData.categorySpecificData.productAge || ''}
                onChange={(e) => handleCategorySpecificChange('productAge', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="sıfır">Sıfır (Hiç Kullanılmamış)</option>
                <option value="0-6-ay">0-6 Ay</option>
                <option value="6-12-ay">6-12 Ay</option>
                <option value="1-2-yıl">1-2 Yıl</option>
                <option value="2-3-yıl">2-3 Yıl</option>
                <option value="3-5-yıl">3-5 Yıl</option>
                <option value="5-yıl-üstü">5+ Yıl</option>
              </select>
            </div>
          </div>

          {/* Ürün Durumu */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Ürün Durumu <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.condition || ''}
              onChange={(e) => handleCategorySpecificChange('condition', e.target.value)}
              className={`w-full rounded-md border ${errors.condition ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="sıfır">Sıfır (Kutusunda)</option>
              <option value="sıfır-açılmış">Sıfır (Kutusu Açılmış)</option>
              <option value="çok-iyi">Çok İyi Durumda</option>
              <option value="iyi">İyi Durumda</option>
              <option value="orta">Orta Durumda</option>
              <option value="kullanılmış">Kullanılmış</option>
              <option value="hasarlı">Hasarlı/Tamire İhtiyaçlı</option>
              <option value="parça">Yedek Parça</option>
            </select>
            {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
          </div>

          {/* Teknik Özellikler */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">⚙️ Teknik Özellikler</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">İşlemci</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.processor || ''}
                  onChange={(e) => handleCategorySpecificChange('processor', e.target.value)}
                  placeholder="Örn: Intel i7, AMD Ryzen 5"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">RAM (GB)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.categorySpecificData.ram || ''}
                  onChange={(e) => handleCategorySpecificChange('ram', e.target.value)}
                  placeholder="Örn: 8, 16, 32"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Depolama</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.storage || ''}
                  onChange={(e) => handleCategorySpecificChange('storage', e.target.value)}
                  placeholder="Örn: 256GB SSD, 1TB HDD"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ekran Kartı</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.graphics || ''}
                  onChange={(e) => handleCategorySpecificChange('graphics', e.target.value)}
                  placeholder="Örn: NVIDIA GTX 1650, Intel UHD"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ekran Boyutu</label>
              <input
                type="text"
                value={formData.categorySpecificData.screenSize || ''}
                onChange={(e) => handleCategorySpecificChange('screenSize', e.target.value)}
                placeholder="Örn: 15.6 inç, 13.3 inç"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Garanti ve Aksesuar */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-700">📋 Garanti ve Aksesuar Bilgileri</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Garanti Durumu</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="warrantyStatus"
                    value="var"
                    checked={formData.categorySpecificData.warrantyStatus === 'var'}
                    onChange={(e) => handleCategorySpecificChange('warrantyStatus', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Garanti Var</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="warrantyStatus"
                    value="yok"
                    checked={formData.categorySpecificData.warrantyStatus === 'yok'}
                    onChange={(e) => handleCategorySpecificChange('warrantyStatus', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Garanti Yok</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Garanti Süresi</label>
              <input
                type="text"
                value={formData.categorySpecificData.warrantyPeriod || ''}
                onChange={(e) => handleCategorySpecificChange('warrantyPeriod', e.target.value)}
                placeholder="Örn: 2 yıl, 6 ay"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dahil Edilen Aksesuarlar</label>
              <textarea
                value={formData.categorySpecificData.accessories || ''}
                onChange={(e) => handleCategorySpecificChange('accessories', e.target.value)}
                placeholder="Şarj aleti, kulaklık, kılıf, fare, klavye vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teslim Koşulları</label>
              <textarea
                value={formData.categorySpecificData.deliveryConditions || ''}
                onChange={(e) => handleCategorySpecificChange('deliveryConditions', e.target.value)}
                placeholder="Kargo, elden teslim, test imkanı, iade koşulları vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (isService) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">🔧 Hizmet Bilgileri ve Teklif Detayları</h3>

          {/* Hizmet Türü */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Hizmet Türü <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.serviceType || ''}
              onChange={(e) => handleCategorySpecificChange('serviceType', e.target.value)}
              className={`w-full rounded-md border ${errors.serviceType ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="temizlik">Temizlik Hizmetleri</option>
              <option value="tamir">Tamir ve Onarım</option>
              <option value="bakım">Bakım Hizmetleri</option>
              <option value="kurulum">Kurulum ve Montaj</option>
              <option value="danışmanlık">Danışmanlık</option>
              <option value="eğitim">Eğitim ve Kurs</option>
              <option value="güvenlik">Güvenlik Hizmetleri</option>
              <option value="nakliye">Nakliye ve Taşımacılık</option>
              <option value="sağlık">Sağlık ve Bakım</option>
              <option value="teknoloji">Teknoloji Hizmetleri</option>
            </select>
            {errors.serviceType && <p className="text-xs text-destructive">{errors.serviceType}</p>}
          </div>

          {/* Deneyim ve Sertifika */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Deneyim (Yıl) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.categorySpecificData.experienceYears || ''}
                onChange={(e) => handleCategorySpecificChange('experienceYears', e.target.value)}
                placeholder="Örn: 5"
                className={`w-full rounded-md border ${errors.experienceYears ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sertifika/Belge</label>
              <select
                value={formData.categorySpecificData.certification || ''}
                onChange={(e) => handleCategorySpecificChange('certification', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="var">Sertifikalı</option>
                <option value="yok">Sertifikasız</option>
                <option value="süreçte">Süreçte</option>
              </select>
            </div>
          </div>

          {/* Hizmet Kapsamı */}
          <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-purple-700">📋 Hizmet Kapsamı ve Detayları</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hizmet Alanı</label>
              <select
                value={formData.categorySpecificData.serviceArea || ''}
                onChange={(e) => handleCategorySpecificChange('serviceArea', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="ev">Ev/Konut</option>
                <option value="ofis">Ofis/İşyeri</option>
                <option value="endüstriyel">Endüstriyel</option>
                <option value="açık-alan">Açık Alan</option>
                <option value="online">Online/Uzaktan</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Çalışma Saatleri</label>
              <select
                value={formData.categorySpecificData.workingHours || ''}
                onChange={(e) => handleCategorySpecificChange('workingHours', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="mesai-saatleri">Mesai Saatleri (09:00-18:00)</option>
                <option value="esnek">Esnek Saatler</option>
                <option value="7-24">7/24 Hizmet</option>
                <option value="hafta-sonu">Hafta Sonu Dahil</option>
                <option value="gece">Gece Vardiyası</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Aciliyet Durumu</label>
              <select
                value={formData.categorySpecificData.urgency || ''}
                onChange={(e) => handleCategorySpecificChange('urgency', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="acil">Acil (24 saat içinde)</option>
                <option value="hızlı">Hızlı (1-3 gün)</option>
                <option value="normal">Normal (1 hafta)</option>
                <option value="esnek">Esnek Zamanlama</option>
              </select>
            </div>
          </div>

          {/* Ekipman ve Malzeme */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">🛠️ Ekipman ve Malzeme Bilgileri</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ekipman Durumu</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="equipment"
                    value="kendi-ekipmanım"
                    checked={formData.categorySpecificData.equipment === 'kendi-ekipmanım'}
                    onChange={(e) => handleCategorySpecificChange('equipment', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Kendi Ekipmanım Var</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="equipment"
                    value="müşteri-sağlayacak"
                    checked={formData.categorySpecificData.equipment === 'müşteri-sağlayacak'}
                    onChange={(e) => handleCategorySpecificChange('equipment', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Müşteri Sağlayacak</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Malzeme Durumu</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="materials"
                    value="dahil"
                    checked={formData.categorySpecificData.materials === 'dahil'}
                    onChange={(e) => handleCategorySpecificChange('materials', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Malzeme Dahil</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="materials"
                    value="ayrı"
                    checked={formData.categorySpecificData.materials === 'ayrı'}
                    onChange={(e) => handleCategorySpecificChange('materials', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Malzeme Ayrı</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kullanılan Ekipman/Araçlar</label>
              <textarea
                value={formData.categorySpecificData.equipmentDetails || ''}
                onChange={(e) => handleCategorySpecificChange('equipmentDetails', e.target.value)}
                placeholder="Kullandığınız özel ekipman, araç, yazılım vb. detayları"
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Garanti ve Ek Hizmetler */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-700">✅ Garanti ve Ek Hizmetler</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Garanti Süresi</label>
              <select
                value={formData.categorySpecificData.warranty || ''}
                onChange={(e) => handleCategorySpecificChange('warranty', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="yok">Garanti Yok</option>
                <option value="1-ay">1 Ay</option>
                <option value="3-ay">3 Ay</option>
                <option value="6-ay">6 Ay</option>
                <option value="1-yıl">1 Yıl</option>
                <option value="2-yıl">2 Yıl</option>
                <option value="uzun-vadeli">2+ Yıl</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ek Hizmetler</label>
              <textarea
                value={formData.categorySpecificData.additionalServices || ''}
                onChange={(e) => handleCategorySpecificChange('additionalServices', e.target.value)}
                placeholder="Ücretsiz keşif, bakım hizmeti, 7/24 destek, eğitim vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referanslar ve Önceki Çalışmalar</label>
              <textarea
                value={formData.categorySpecificData.references || ''}
                onChange={(e) => handleCategorySpecificChange('references', e.target.value)}
                placeholder="Önceki müşteriler, tamamlanan projeler, başarı hikayeleri vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (isClothing) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">👗 Giyim ve Aksesuar Bilgileri</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marka</label>
              <input
                type="text"
                value={formData.categorySpecificData.brand || ''}
                onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                placeholder="Örn: Zara, H&M, Nike"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beden</label>
              <input
                type="text"
                value={formData.categorySpecificData.size || ''}
                onChange={(e) => handleCategorySpecificChange('size', e.target.value)}
                placeholder="Örn: M, 38, 42"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Renk</label>
              <input
                type="text"
                value={formData.categorySpecificData.color || ''}
                onChange={(e) => handleCategorySpecificChange('color', e.target.value)}
                placeholder="Örn: Siyah, Mavi, Kırmızı"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <select
                value={formData.categorySpecificData.condition || ''}
                onChange={(e) => handleCategorySpecificChange('condition', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="sıfır">Sıfır (Etiketli)</option>
                <option value="çok-iyi">Çok İyi</option>
                <option value="iyi">İyi</option>
                <option value="orta">Orta</option>
                <option value="kullanılmış">Kullanılmış</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (isFood) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">🍽️ Yemek ve Gıda Hizmetleri</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hizmet Türü</label>
            <select
              value={formData.categorySpecificData.serviceType || ''}
              onChange={(e) => handleCategorySpecificChange('serviceType', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="catering">Catering Hizmeti</option>
              <option value="aşçı">Özel Aşçı</option>
              <option value="pasta">Pasta/Tatlı</option>
              <option value="ev-yemeği">Ev Yemeği</option>
              <option value="diyet">Diyet Yemeği</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kişi Sayısı</label>
              <input
                type="number"
                min="1"
                value={formData.categorySpecificData.servingSize || ''}
                onChange={(e) => handleCategorySpecificChange('servingSize', e.target.value)}
                placeholder="Kaç kişilik"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mutfak Türü</label>
              <select
                value={formData.categorySpecificData.cuisineType || ''}
                onChange={(e) => handleCategorySpecificChange('cuisineType', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="türk">Türk Mutfağı</option>
                <option value="dünya">Dünya Mutfağı</option>
                <option value="vejetaryen">Vejetaryen</option>
                <option value="vegan">Vegan</option>
                <option value="diyet">Diyet</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (isHealth) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">🏥 Sağlık ve Bakım Hizmetleri</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hizmet Türü</label>
            <select
              value={formData.categorySpecificData.serviceType || ''}
              onChange={(e) => handleCategorySpecificChange('serviceType', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="doktor">Doktor Muayenesi</option>
              <option value="hemşire">Hemşire Bakımı</option>
              <option value="fizyoterapi">Fizyoterapi</option>
              <option value="diyet">Diyetisyen</option>
              <option value="spor">Spor Antrenörlüğü</option>
              <option value="yaşlı-bakım">Yaşlı Bakımı</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deneyim (Yıl)</label>
              <input
                type="number"
                min="0"
                value={formData.categorySpecificData.experienceYears || ''}
                onChange={(e) => handleCategorySpecificChange('experienceYears', e.target.value)}
                placeholder="Örn: 5"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sertifika/Diploma</label>
              <select
                value={formData.categorySpecificData.certification || ''}
                onChange={(e) => handleCategorySpecificChange('certification', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="var">Sertifikalı</option>
                <option value="lisans">Lisans Mezunu</option>
                <option value="yüksek-lisans">Yüksek Lisans</option>
                <option value="doktora">Doktora</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (isEducation) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">📚 Eğitim ve Öğretim Hizmetleri</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ders Türü</label>
            <select
              value={formData.categorySpecificData.subjectType || ''}
              onChange={(e) => handleCategorySpecificChange('subjectType', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="matematik">Matematik</option>
              <option value="fen">Fen Bilimleri</option>
              <option value="türkçe">Türkçe</option>
              <option value="ingilizce">İngilizce</option>
              <option value="müzik">Müzik</option>
              <option value="spor">Spor</option>
              <option value="bilgisayar">Bilgisayar</option>
              <option value="sanat">Sanat</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Eğitim Seviyesi</label>
              <select
                value={formData.categorySpecificData.educationLevel || ''}
                onChange={(e) => handleCategorySpecificChange('educationLevel', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="ilkokul">İlkokul</option>
                <option value="ortaokul">Ortaokul</option>
                <option value="lise">Lise</option>
                <option value="üniversite">Üniversite</option>
                <option value="yetişkin">Yetişkin Eğitimi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deneyim (Yıl)</label>
              <input
                type="number"
                min="0"
                value={formData.categorySpecificData.experienceYears || ''}
                onChange={(e) => handleCategorySpecificChange('experienceYears', e.target.value)}
                placeholder="Örn: 3"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ders Formatı</label>
            <select
              value={formData.categorySpecificData.lessonFormat || ''}
              onChange={(e) => handleCategorySpecificChange('lessonFormat', e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            >
              <option value="">Seçiniz</option>
              <option value="yüz-yüze">Yüz Yüze</option>
              <option value="online">Online</option>
              <option value="hibrit">Hibrit (Karma)</option>
              <option value="grup">Grup Dersi</option>
              <option value="bireysel">Bireysel</option>
            </select>
          </div>
        </div>
      );
    }

    if (isSpareParts) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">🔧 Yedek Parça ve Aksesuar Bilgileri</h3>

          {/* Parça Türü */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Parça Türü <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.partType || ''}
              onChange={(e) => handleCategorySpecificChange('partType', e.target.value)}
              className={`w-full rounded-md border ${errors.partType ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="motor-parçaları">Motor Parçaları</option>
              <option value="fren-sistemi">Fren Sistemi</option>
              <option value="süspansiyon">Süspansiyon</option>
              <option value="elektrik-sistemi">Elektrik Sistemi</option>
              <option value="kaporta">Kaporta</option>
              <option value="iç-aksesuar">İç Aksesuar</option>
              <option value="dış-aksesuar">Dış Aksesuar</option>
              <option value="lastik-jant">Lastik & Jant</option>
              <option value="yağlar">Yağlar & Kimyasallar</option>
              <option value="filtreler">Filtreler</option>
              <option value="tuning">Tuning & Performance</option>
              <option value="diğer">Diğer</option>
            </select>
            {errors.partType && <p className="text-xs text-destructive">{errors.partType}</p>}
          </div>

          {/* Marka ve Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Marka <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.categorySpecificData.brand || ''}
                onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                placeholder="Örn: Bosch, Brembo, NGK"
                className={`w-full rounded-md border ${errors.brand ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model/Parça Adı</label>
              <input
                type="text"
                value={formData.categorySpecificData.model || ''}
                onChange={(e) => handleCategorySpecificChange('model', e.target.value)}
                placeholder="Örn: Fren Balata, Amortisör"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Uyumlu Araç Bilgileri */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">🚗 Uyumlu Araç Bilgileri</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Araç Markası</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.vehicleBrand || ''}
                  onChange={(e) => handleCategorySpecificChange('vehicleBrand', e.target.value)}
                  placeholder="Örn: BMW, Mercedes, Toyota"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Araç Modeli</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.vehicleModel || ''}
                  onChange={(e) => handleCategorySpecificChange('vehicleModel', e.target.value)}
                  placeholder="Örn: 3 Serisi, C-Class"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Yılı</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.vehicleYear || ''}
                  onChange={(e) => handleCategorySpecificChange('vehicleYear', e.target.value)}
                  placeholder="Örn: 2015-2020"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motor Tipi/Kodu</label>
              <input
                type="text"
                value={formData.categorySpecificData.engineCode || ''}
                onChange={(e) => handleCategorySpecificChange('engineCode', e.target.value)}
                placeholder="Örn: N20B20, OM651, 1.6 TDI"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Parça Durumu ve Özellikleri */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-700">📋 Parça Durumu ve Özellikleri</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parça Durumu <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.categorySpecificData.condition || ''}
                  onChange={(e) => handleCategorySpecificChange('condition', e.target.value)}
                  className={`w-full rounded-md border ${errors.condition ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
                >
                  <option value="">Seçiniz</option>
                  <option value="sıfır">Sıfır (Kutusunda)</option>
                  <option value="sıfır-açık">Sıfır (Kutu Açık)</option>
                  <option value="az-kullanılmış">Az Kullanılmış</option>
                  <option value="kullanılmış">Kullanılmış</option>
                  <option value="yenilenmiş">Yenilenmiş</option>
                  <option value="hasarlı">Hasarlı (Tamir Edilebilir)</option>
                </select>
                {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parça Tipi</label>
                <select
                  value={formData.categorySpecificData.partCategory || ''}
                  onChange={(e) => handleCategorySpecificChange('partCategory', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="oem">OEM (Orijinal)</option>
                  <option value="aftermarket">Aftermarket</option>
                  <option value="performance">Performance</option>
                  <option value="ekonomik">Ekonomik</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Garanti Durumu</label>
              <select
                value={formData.categorySpecificData.warranty || ''}
                onChange={(e) => handleCategorySpecificChange('warranty', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="yok">Garanti Yok</option>
                <option value="3-ay">3 Ay</option>
                <option value="6-ay">6 Ay</option>
                <option value="1-yıl">1 Yıl</option>
                <option value="2-yıl">2 Yıl</option>
                <option value="üretici">Üretici Garantisi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Parça Kodu/OE Numarası</label>
              <input
                type="text"
                value={formData.categorySpecificData.partNumber || ''}
                onChange={(e) => handleCategorySpecificChange('partNumber', e.target.value)}
                placeholder="Örn: 34116794300, A0004201020"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Montaj ve Teslimat */}
          <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-orange-700">🔧 Montaj ve Teslimat Bilgileri</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Montaj Hizmeti</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="installationService"
                    value="dahil"
                    checked={formData.categorySpecificData.installationService === 'dahil'}
                    onChange={(e) => handleCategorySpecificChange('installationService', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Montaj Dahil</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="installationService"
                    value="ayrı"
                    checked={formData.categorySpecificData.installationService === 'ayrı'}
                    onChange={(e) => handleCategorySpecificChange('installationService', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Montaj Ayrı</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="installationService"
                    value="yok"
                    checked={formData.categorySpecificData.installationService === 'yok'}
                    onChange={(e) => handleCategorySpecificChange('installationService', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Sadece Parça</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teslimat Seçenekleri</label>
              <textarea
                value={formData.categorySpecificData.deliveryOptions || ''}
                onChange={(e) => handleCategorySpecificChange('deliveryOptions', e.target.value)}
                placeholder="Kargo, elden teslim, mağazadan alım, montaj yeri vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ek Hizmetler</label>
              <textarea
                value={formData.categorySpecificData.additionalServices || ''}
                onChange={(e) => handleCategorySpecificChange('additionalServices', e.target.value)}
                placeholder="Ücretsiz kontrol, ayar, test sürüşü, eski parça iadesi vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (isIndustrialMachinery) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">🏗️ İş Makineleri ve Sanayi Ekipmanları</h3>

          {/* Makine Türü */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Makine Türü <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.machineType || ''}
              onChange={(e) => handleCategorySpecificChange('machineType', e.target.value)}
              className={`w-full rounded-md border ${errors.machineType ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="ekskavatör">Ekskavatör</option>
              <option value="dozer">Dozer</option>
              <option value="forklift">Forklift</option>
              <option value="vinç">Vinç</option>
              <option value="jeneratör">Jeneratör</option>
              <option value="kompresör">Kompresör</option>
              <option value="kaynak-makinesi">Kaynak Makinesi</option>
              <option value="torna-tezgahı">Torna Tezgahı</option>
              <option value="freze-tezgahı">Freze Tezgahı</option>
              <option value="pres">Pres</option>
              <option value="konveyör">Konveyör Sistemi</option>
              <option value="paketleme">Paketleme Makinesi</option>
              <option value="tarım-makinesi">Tarım Makinesi</option>
              <option value="diğer">Diğer</option>
            </select>
            {errors.machineType && <p className="text-xs text-destructive">{errors.machineType}</p>}
          </div>

          {/* Marka ve Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Marka <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.categorySpecificData.brand || ''}
                onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                placeholder="Örn: Caterpillar, Komatsu, JCB"
                className={`w-full rounded-md border ${errors.brand ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
              />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <input
                type="text"
                value={formData.categorySpecificData.model || ''}
                onChange={(e) => handleCategorySpecificChange('model', e.target.value)}
                placeholder="Örn: 320D, PC200, 3CX"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Teknik Özellikler */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">⚙️ Teknik Özellikler</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Yılı</label>
                <input
                  type="number"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  value={formData.categorySpecificData.modelYear || ''}
                  onChange={(e) => handleCategorySpecificChange('modelYear', e.target.value)}
                  placeholder="Örn: 2020"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Çalışma Saati</label>
                <input
                  type="number"
                  min="0"
                  value={formData.categorySpecificData.workingHours || ''}
                  onChange={(e) => handleCategorySpecificChange('workingHours', e.target.value)}
                  placeholder="Örn: 5000"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motor Gücü (HP)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.categorySpecificData.enginePower || ''}
                  onChange={(e) => handleCategorySpecificChange('enginePower', e.target.value)}
                  placeholder="Örn: 150"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kapasite/Boyut</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.capacity || ''}
                  onChange={(e) => handleCategorySpecificChange('capacity', e.target.value)}
                  placeholder="Örn: 20 ton, 3m³, 2000kg"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Yakıt Tipi</label>
                <select
                  value={formData.categorySpecificData.fuelType || ''}
                  onChange={(e) => handleCategorySpecificChange('fuelType', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="dizel">Dizel</option>
                  <option value="benzin">Benzin</option>
                  <option value="elektrik">Elektrik</option>
                  <option value="hibrit">Hibrit</option>
                  <option value="lpg">LPG</option>
                  <option value="doğalgaz">Doğalgaz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Makine Durumu */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-700">📋 Makine Durumu ve Özellikleri</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Makine Durumu <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.categorySpecificData.condition || ''}
                  onChange={(e) => handleCategorySpecificChange('condition', e.target.value)}
                  className={`w-full rounded-md border ${errors.condition ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
                >
                  <option value="">Seçiniz</option>
                  <option value="sıfır">Sıfır (Hiç Kullanılmamış)</option>
                  <option value="az-kullanılmış">Az Kullanılmış</option>
                  <option value="iyi">İyi Durumda</option>
                  <option value="orta">Orta Durumda</option>
                  <option value="bakım-gerekli">Bakım Gerekli</option>
                  <option value="tamir-gerekli">Tamir Gerekli</option>
                  <option value="hurda">Hurda/Parça</option>
                </select>
                {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kullanım Alanı</label>
                <select
                  value={formData.categorySpecificData.usageArea || ''}
                  onChange={(e) => handleCategorySpecificChange('usageArea', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="inşaat">İnşaat</option>
                  <option value="tarım">Tarım</option>
                  <option value="madencilik">Madencilik</option>
                  <option value="lojistik">Lojistik</option>
                  <option value="üretim">Üretim/Fabrika</option>
                  <option value="orman">Orman</option>
                  <option value="belediye">Belediye</option>
                  <option value="genel">Genel Amaçlı</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bakım Durumu</label>
              <select
                value={formData.categorySpecificData.maintenanceStatus || ''}
                onChange={(e) => handleCategorySpecificChange('maintenanceStatus', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="güncel">Bakımları Güncel</option>
                <option value="yakın-zamanda">Yakın Zamanda Yapıldı</option>
                <option value="gerekli">Bakım Gerekli</option>
                <option value="büyük-bakım">Büyük Bakım Gerekli</option>
                <option value="bilinmiyor">Bilinmiyor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hasar/Arıza Durumu</label>
              <textarea
                value={formData.categorySpecificData.damageInfo || ''}
                onChange={(e) => handleCategorySpecificChange('damageInfo', e.target.value)}
                placeholder="Varsa hasar, arıza veya eksik parça bilgilerini belirtiniz"
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Ek Özellikler ve Donanım */}
          <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-orange-700">🔧 Ek Özellikler ve Donanım</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ek Donanımlar</label>
              <textarea
                value={formData.categorySpecificData.additionalEquipment || ''}
                onChange={(e) => handleCategorySpecificChange('additionalEquipment', e.target.value)}
                placeholder="Hidrolik sistem, klima, GPS, kamera, ek kepçe vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sertifikalar</label>
              <textarea
                value={formData.categorySpecificData.certificates || ''}
                onChange={(e) => handleCategorySpecificChange('certificates', e.target.value)}
                placeholder="CE, ISO, TSE vb. sertifikalar"
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Garanti Durumu</label>
              <select
                value={formData.categorySpecificData.warranty || ''}
                onChange={(e) => handleCategorySpecificChange('warranty', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="yok">Garanti Yok</option>
                <option value="3-ay">3 Ay</option>
                <option value="6-ay">6 Ay</option>
                <option value="1-yıl">1 Yıl</option>
                <option value="2-yıl">2 Yıl</option>
                <option value="üretici">Üretici Garantisi Var</option>
                <option value="servis">Servis Garantisi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teslimat ve Nakliye</label>
              <textarea
                value={formData.categorySpecificData.deliveryInfo || ''}
                onChange={(e) => handleCategorySpecificChange('deliveryInfo', e.target.value)}
                placeholder="Nakliye dahil mi, özel taşıma gerekli mi, montaj hizmeti vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (isVehicleEquipment) {
      return (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">🚁 Araç Ekipmanları ve Özel Araçlar</h3>

          {/* Araç Türü */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Araç Türü <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.categorySpecificData.vehicleType || ''}
              onChange={(e) => handleCategorySpecificChange('vehicleType', e.target.value)}
              className={`w-full rounded-md border ${errors.vehicleType ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
            >
              <option value="">Seçiniz</option>
              <option value="deniz-aracı">Deniz Aracı</option>
              <option value="hava-aracı">Hava Aracı</option>
              <option value="atv">ATV</option>
              <option value="karavan">Karavan</option>
              <option value="tekne">Tekne</option>
              <option value="yat">Yat</option>
              <option value="jet-ski">Jet Ski</option>
              <option value="uçak">Uçak</option>
              <option value="helikopter">Helikopter</option>
              <option value="drone">Drone</option>
              <option value="diğer">Diğer</option>
            </select>
            {errors.vehicleType && <p className="text-xs text-destructive">{errors.vehicleType}</p>}
          </div>

          {/* Marka, Model ve Seri - Elle Yazılacak */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-700">🏷️ Araç Bilgileri</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Marka <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.categorySpecificData.brand || ''}
                  onChange={(e) => handleCategorySpecificChange('brand', e.target.value)}
                  placeholder="Örn: Yamaha, Honda, Sea-Doo"
                  className={`w-full rounded-md border ${errors.brand ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
                />
                {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Model <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.categorySpecificData.model || ''}
                  onChange={(e) => handleCategorySpecificChange('model', e.target.value)}
                  placeholder="Örn: WaveRunner, CBR, Phantom"
                  className={`w-full rounded-md border ${errors.model ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
                />
                {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seri</label>
                <input
                  type="text"
                  value={formData.categorySpecificData.series || ''}
                  onChange={(e) => handleCategorySpecificChange('series', e.target.value)}
                  placeholder="Örn: VX Deluxe, 1000RR"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Teknik Özellikler */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-700">⚙️ Teknik Özellikler</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Yılı</label>
                <input
                  type="number"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  value={formData.categorySpecificData.modelYear || ''}
                  onChange={(e) => handleCategorySpecificChange('modelYear', e.target.value)}
                  placeholder="Örn: 2023"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motor Gücü (HP)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.categorySpecificData.enginePower || ''}
                  onChange={(e) => handleCategorySpecificChange('enginePower', e.target.value)}
                  placeholder="Örn: 150"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Çalışma Saati/Kilometre</label>
                <input
                  type="number"
                  min="0"
                  value={formData.categorySpecificData.usage || ''}
                  onChange={(e) => handleCategorySpecificChange('usage', e.target.value)}
                  placeholder="Örn: 500"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motor Tipi</label>
                <select
                  value={formData.categorySpecificData.engineType || ''}
                  onChange={(e) => handleCategorySpecificChange('engineType', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="benzin">Benzin</option>
                  <option value="dizel">Dizel</option>
                  <option value="elektrik">Elektrik</option>
                  <option value="hibrit">Hibrit</option>
                  <option value="2-zamanlı">2 Zamanlı</option>
                  <option value="4-zamanlı">4 Zamanlı</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Yakıt Kapasitesi (L)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.categorySpecificData.fuelCapacity || ''}
                  onChange={(e) => handleCategorySpecificChange('fuelCapacity', e.target.value)}
                  placeholder="Örn: 60"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Araç Durumu */}
          <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-orange-700">📋 Araç Durumu ve Özellikleri</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Araç Durumu <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.categorySpecificData.condition || ''}
                  onChange={(e) => handleCategorySpecificChange('condition', e.target.value)}
                  className={`w-full rounded-md border ${errors.condition ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm`}
                >
                  <option value="">Seçiniz</option>
                  <option value="sıfır">Sıfır (Hiç Kullanılmamış)</option>
                  <option value="az-kullanılmış">Az Kullanılmış</option>
                  <option value="iyi">İyi Durumda</option>
                  <option value="orta">Orta Durumda</option>
                  <option value="bakım-gerekli">Bakım Gerekli</option>
                  <option value="tamir-gerekli">Tamir Gerekli</option>
                  <option value="hasarlı">Hasarlı</option>
                </select>
                {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kullanım Amacı</label>
                <select
                  value={formData.categorySpecificData.usagePurpose || ''}
                  onChange={(e) => handleCategorySpecificChange('usagePurpose', e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="kişisel">Kişisel Kullanım</option>
                  <option value="ticari">Ticari</option>
                  <option value="yarış">Yarış/Spor</option>
                  <option value="turizm">Turizm</option>
                  <option value="eğitim">Eğitim</option>
                  <option value="kurtarma">Kurtarma</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bakım Durumu</label>
              <select
                value={formData.categorySpecificData.maintenanceStatus || ''}
                onChange={(e) => handleCategorySpecificChange('maintenanceStatus', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="güncel">Bakımları Güncel</option>
                <option value="yakın-zamanda">Yakın Zamanda Yapıldı</option>
                <option value="gerekli">Bakım Gerekli</option>
                <option value="büyük-bakım">Büyük Bakım Gerekli</option>
                <option value="bilinmiyor">Bilinmiyor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hasar/Problem Durumu</label>
              <textarea
                value={formData.categorySpecificData.damageInfo || ''}
                onChange={(e) => handleCategorySpecificChange('damageInfo', e.target.value)}
                placeholder="Varsa hasar, problem veya eksik parça bilgilerini belirtiniz"
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Ek Özellikler */}
          <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-purple-700">🎯 Ek Özellikler ve Donanım</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ek Donanımlar</label>
              <textarea
                value={formData.categorySpecificData.additionalEquipment || ''}
                onChange={(e) => handleCategorySpecificChange('additionalEquipment', e.target.value)}
                placeholder="GPS, sonar, autopilot, kamera, ses sistemi, klima vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sertifikalar ve Belgeler</label>
              <textarea
                value={formData.categorySpecificData.certificates || ''}
                onChange={(e) => handleCategorySpecificChange('certificates', e.target.value)}
                placeholder="Denizcilik belgesi, pilot lisansı, ruhsat, sigorta vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Garanti Durumu</label>
              <select
                value={formData.categorySpecificData.warranty || ''}
                onChange={(e) => handleCategorySpecificChange('warranty', e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="">Seçiniz</option>
                <option value="yok">Garanti Yok</option>
                <option value="6-ay">6 Ay</option>
                <option value="1-yıl">1 Yıl</option>
                <option value="2-yıl">2 Yıl</option>
                <option value="üretici">Üretici Garantisi Var</option>
                <option value="bayi">Bayi Garantisi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teslimat ve Nakliye</label>
              <textarea
                value={formData.categorySpecificData.deliveryInfo || ''}
                onChange={(e) => handleCategorySpecificChange('deliveryInfo', e.target.value)}
                placeholder="Nakliye dahil mi, özel taşıma gerekli mi, teslim yeri vb."
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.price.trim()) newErrors.price = 'Fiyat gereklidir.';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz.';
    } else if (listing && (Number(formData.price) < listing.budgetMin || Number(formData.price) > listing.budgetMax)) {
      newErrors.price = `Fiyat, bütçe aralığında olmalıdır (${listing.budgetMin} ₺ - ${listing.budgetMax} ₺).`;
    }

    if (!formData.description.trim()) newErrors.description = 'Açıklama gereklidir.';
    else if (formData.description.length < 30) newErrors.description = 'Açıklama en az 30 karakter olmalıdır.';
    else if (formData.description.length > 1000) newErrors.description = 'Açıklama en fazla 1000 karakter olabilir.';



    // Kategori bazlı validasyonlar
    if (listing) {
      const category = listing.category.toLowerCase();

      if (['otomobil', 'araç', 'araba', 'otomotiv'].includes(category)) {
        if (!formData.categorySpecificData.vehicleCondition) {
          newErrors.vehicleCondition = 'Araç durumu seçilmelidir.';
        }
        if (!formData.categorySpecificData.mileage) {
          newErrors.mileage = 'Kilometre bilgisi gereklidir.';
        } else if (isNaN(Number(formData.categorySpecificData.mileage)) || Number(formData.categorySpecificData.mileage) < 0) {
          newErrors.mileage = 'Geçerli bir kilometre değeri giriniz.';
        }
        if (!formData.categorySpecificData.modelYear) {
          newErrors.modelYear = 'Model yılı gereklidir.';
        } else if (isNaN(Number(formData.categorySpecificData.modelYear)) ||
          Number(formData.categorySpecificData.modelYear) < 1950 ||
          Number(formData.categorySpecificData.modelYear) > new Date().getFullYear() + 1) {
          newErrors.modelYear = 'Geçerli bir model yılı giriniz.';
        }
      }

      if (['elektronik', 'telefon', 'bilgisayar', 'laptop', 'tablet', 'teknoloji', 'donanım', 'yazılım'].includes(category)) {
        if (!formData.categorySpecificData.brand) {
          newErrors.brand = 'Marka bilgisi gereklidir.';
        }
        if (!formData.categorySpecificData.model) {
          newErrors.model = 'Model bilgisi gereklidir.';
        }
        if (!formData.categorySpecificData.condition) {
          newErrors.condition = 'Ürün durumu seçilmelidir.';
        }
      }

      // Yedek parça kategorisi için doğrulama
      const isSpareParts = [
      'yedek-parca', 'yedek parça', 'aksesuar', 'donanım', 'tuning',
      'otomotiv ekipmanları', 'motosiklet ekipmanları'
    ].some(cat => 
      listing.category?.toLowerCase().includes(cat) || 
      listing.subcategory?.toLowerCase().includes(cat)
    );

    const isIndustrialMachinery = [
      'iş makineleri', 'sanayi', 'endüstriyel', 'makine', 'ekipman',
      'inşaat makineleri', 'tarım makineleri', 'forklift', 'vinç'
    ].some(cat => 
      listing.category?.toLowerCase().includes(cat) || 
      listing.subcategory?.toLowerCase().includes(cat)
    );

    const isVehicleEquipment = [
      'deniz aracı', 'hava aracı', 'atv', 'karavan', 'tekne', 'yat',
      'jet ski', 'uçak', 'helikopter', 'drone', 'motorsiklet ekipmanları'
    ].some(cat => 
      listing.category?.toLowerCase().includes(cat) || 
      listing.subcategory?.toLowerCase().includes(cat)
    );

      if (isSpareParts) {
         if (!formData.categorySpecificData.partType) {
           newErrors.partType = 'Parça türü gereklidir';
         }
         if (!formData.categorySpecificData.brand) {
           newErrors.brand = 'Marka gereklidir';
         }
         if (!formData.categorySpecificData.condition) {
           newErrors.condition = 'Parça durumu gereklidir';
         }
       }

       // İş makineleri kategorisi için doğrulama
       const isIndustrialMachineryValidation = [
         'iş makineleri', 'sanayi', 'endüstriyel', 'makine', 'ekipman',
         'inşaat makineleri', 'tarım makineleri', 'forklift', 'vinç'
       ].some(cat => 
         listing.category?.toLowerCase().includes(cat) || 
         listing.subcategory?.toLowerCase().includes(cat)
       );

       if (isIndustrialMachineryValidation) {
         if (!formData.categorySpecificData.machineType) {
           newErrors.machineType = 'Makine türü gereklidir';
         }
         if (!formData.categorySpecificData.brand) {
           newErrors.brand = 'Marka gereklidir';
         }
         if (!formData.categorySpecificData.condition) {
           newErrors.condition = 'Makine durumu gereklidir';
         }
       }

       // Araç ekipmanları kategorisi için doğrulama
       if (isVehicleEquipment) {
         if (!formData.categorySpecificData.vehicleType) {
           newErrors.vehicleType = 'Araç türü gereklidir';
         }
         if (!formData.categorySpecificData.brand) {
           newErrors.brand = 'Marka gereklidir';
         }
         if (!formData.categorySpecificData.model) {
           newErrors.model = 'Model gereklidir';
         }
         if (!formData.categorySpecificData.condition) {
           newErrors.condition = 'Araç durumu gereklidir';
         }
       }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Portfolio kontrolü kaldırıldı - basit form için gerekli değil

    try {
      setIsSubmitting(true);
      setErrors({});

      const token = localStorage.getItem('token');
      if (!token) {
        setErrors(prev => ({ ...prev, submit: 'Giriş yapmanız gerekiyor.' }));
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          price: Number(formData.price),
          description: formData.description,
          deliveryTime: `${formData.deliveryTime} ${formData.deliveryUnit}`,
          experience: formData.experience,
          portfolio: formData.portfolio,
          guaranteeOffered: formData.guaranteeOffered,
          revisionCount: Number(formData.revisionCount),
          additionalServices: formData.additionalServices,
          categorySpecificData: formData.categorySpecificData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Teklif oluşturulurken bir hata oluştu');
      }

      const data = await response.json();

      // Başarı toast'ı göster
      toast({
        title: "Teklif Gönderildi! 🎉",
        description: "Teklifiniz başarıyla gönderildi ve ilan sahibine bildirim ulaştırıldı.",
        variant: "default",
        duration: 5000,
      });

      // İlan sayfasına geri dön
      router.push(`/listings/${listingId}`);

    } catch (error) {
      console.error('Teklif oluşturma hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Teklif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      setErrors(prev => ({ ...prev, submit: errorMessage }));

      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <Info className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">İlan Bulunamadı</h2>
          <p className="text-muted-foreground mb-6">{error || 'İstediğiniz ilan bulunamadı veya kaldırılmış olabilir.'}</p>
          <Link
            href="/listings"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            İlanlara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={listingId ? `/listings/${listingId}` : '/listings'} className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          İlana Geri Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Teklif Oluştur</h1>
            <p className="text-muted-foreground">
              {listing.title} ilanı için teklifinizi oluşturun.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Fiyat */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Teklif Fiyatı (₺) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Örn: 42500"
                  min="0"
                  className={`w-full rounded-md border ${errors.price ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                />
              </div>
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              <p className="text-xs text-muted-foreground">
                Bütçe Aralığı: {listing.budgetMin} ₺ - {listing.budgetMax} ₺
              </p>
            </div>

            {/* Açıklama */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Teklif Açıklaması <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Teklifinizi detaylı bir şekilde açıklayın. Ürün özellikleri, teslimat koşulları ve diğer önemli bilgileri belirtin."
                rows={6}
                className={`w-full rounded-md border ${errors.description ? 'border-destructive' : 'border-input'} px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>













            {/* Kategori Bazlı Özel Alanlar */}
            {renderCategorySpecificFields()}

            {/* Hata Mesajı */}
            {errors.submit && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            {/* Gönder Butonu */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Teklif Gönderiliyor...
                  </>
                ) : (
                  'Teklif Gönder'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sağ Kolon - İlan Bilgileri */}
        <div>
          <div className="sticky top-24 space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">İlan Bilgileri</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">İlan Başlığı</h4>
                  <p className="text-sm">{listing.title}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Kategori</h4>
                  <p className="text-sm">{listing.category}{listing.subcategory && ` - ${listing.subcategory}`}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Konum</h4>
                  <p className="text-sm">{listing.district && listing.location ? `${formatDistrict(listing.district)}, ${formatCity(listing.location)}` : formatCity(listing.location)}</p>
                </div>

                {/* Vasıta kategorisi için özel bilgiler */}
                {listing.category === 'Vasıta' && listing.categorySpecificData && (
                  <>
                    {listing.categorySpecificData.brand && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Marka</h4>
                        <p className="text-sm">{listing.categorySpecificData.brand}</p>
                      </div>
                    )}
                    
                    {listing.categorySpecificData.model && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Model</h4>
                        <p className="text-sm">{listing.categorySpecificData.model}</p>
                      </div>
                    )}
                    
                    {listing.categorySpecificData.series && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Seri</h4>
                        <p className="text-sm">{listing.categorySpecificData.series}</p>
                      </div>
                    )}
                    
                    {(listing.mileageMin || listing.mileageMax || listing.mileage) && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Kilometre</h4>
                        <p className="text-sm">
                          {listing.mileage ? 
                            `${listing.mileage.toLocaleString('tr-TR')} km` :
                            `${listing.mileageMin?.toLocaleString('tr-TR') || 0} - ${listing.mileageMax?.toLocaleString('tr-TR') || 0} km`
                          }
                        </p>
                      </div>
                    )}
                    
                    {(listing.categorySpecificData.yearMin || listing.categorySpecificData.yearMax) && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Model Yılı</h4>
                        <p className="text-sm">
                          {listing.categorySpecificData.yearMin === listing.categorySpecificData.yearMax ?
                            listing.categorySpecificData.yearMin :
                            `${listing.categorySpecificData.yearMin || ''} - ${listing.categorySpecificData.yearMax || ''}`
                          }
                        </p>
                      </div>
                    )}
                    
                    {listing.categorySpecificData.fuelType && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Yakıt Tipi</h4>
                        <p className="text-sm">{listing.categorySpecificData.fuelType}</p>
                      </div>
                    )}
                    
                    {listing.categorySpecificData.transmission && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Vites Tipi</h4>
                        <p className="text-sm">{listing.categorySpecificData.transmission}</p>
                      </div>
                    )}
                    
                    {listing.categorySpecificData.color && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Renk</h4>
                        <p className="text-sm">{listing.categorySpecificData.color}</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Bütçe Aralığı</h4>
                  <p className="text-sm">{listing.budgetMin.toLocaleString('tr-TR')} ₺ - {listing.budgetMax.toLocaleString('tr-TR')} ₺</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Son Tarih</h4>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                    <p className="text-sm">{new Date(listing.expiryDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">İlan Sahibi</h4>
                  <div className="flex items-center">
                    {listing.user.image ? (
                      <img
                        src={listing.user.image}
                        alt={listing.user.name}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted mr-2 flex items-center justify-center">
                        <span className="text-xs">{listing.user.name.charAt(0)}</span>
                      </div>
                    )}
                    <p className="text-sm">{listing.user.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Teklif İpuçları</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>Bütçe aralığına uygun bir fiyat teklifi verin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>Teklifinizin detaylarını açıkça belirtin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>Gerçekçi bir teslimat süresi belirleyin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>İlan sahibinin isteklerine uygun bir teklif hazırlayın.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);