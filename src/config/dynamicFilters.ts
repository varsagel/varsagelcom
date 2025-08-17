// Dinamik filtre sistemi konfigürasyonu

export interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'checkbox' | 'text' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  dependsOn?: string; // Başka bir filtreye bağımlı
  conditional?: {
    field: string;
    values: string[];
  };
}

export interface CategoryFilterConfig {
  id: string;
  name: string;
  filters: FilterField[];
}

// Genel filtreler (tüm kategorilerde görünür)
export const commonFilters: FilterField[] = [
  {
    id: 'query',
    label: 'Arama',
    type: 'text',
    placeholder: 'Ne arıyorsunuz?'
  },
  {
    id: 'location',
    label: 'Şehir',
    type: 'select',
    placeholder: 'Şehir seçin'
  },
  {
    id: 'district',
    label: 'İlçe',
    type: 'select',
    placeholder: 'İlçe seçin',
    dependsOn: 'location'
  },
  {
    id: 'priceRange',
    label: 'Fiyat Aralığı',
    type: 'range',
    min: 0,
    max: 10000000,
    step: 1000
  },
  {
    id: 'condition',
    label: 'Durumu',
    type: 'multiselect',
    options: [
      { value: 'new', label: 'Sıfır' },
      { value: 'like-new', label: 'Sıfır Ayarında' },
      { value: 'very-good', label: 'Çok İyi' },
      { value: 'good', label: 'İyi' },
      { value: 'fair', label: 'Orta' },
      { value: 'poor', label: 'Kötü' }
    ]
  },
  {
    id: 'hasImages',
    label: 'Fotoğraflı İlanlar',
    type: 'checkbox'
  },
  {
    id: 'hasVideo',
    label: 'Videolu İlanlar',
    type: 'checkbox'
  },
  {
    id: 'isNegotiable',
    label: 'Pazarlık Yapılabilir',
    type: 'checkbox'
  }
];

// Kategori bazlı filtre konfigürasyonları
export const categoryFilters: CategoryFilterConfig[] = [
  {
    id: 'emlak',
    name: 'Emlak',
    filters: [
      {
        id: 'subcategory',
        label: 'Alt Kategori',
        type: 'select',
        options: [
          { value: 'konut', label: 'Konut' },
          { value: 'is-yeri', label: 'İş Yeri' },
          { value: 'arsa', label: 'Arsa' },
          { value: 'devremulk', label: 'Devremülk' },
          { value: 'turistik-tesis', label: 'Turistik Tesis' }
        ]
      },
      {
        id: 'roomCount',
        label: 'Oda Sayısı',
        type: 'select',
        options: [
          { value: '1+0', label: '1+0' },
          { value: '1+1', label: '1+1' },
          { value: '2+1', label: '2+1' },
          { value: '3+1', label: '3+1' },
          { value: '4+1', label: '4+1' },
          { value: '5+1', label: '5+1' },
          { value: '6+', label: '6+' }
        ]
      },
      {
        id: 'propertyType',
        label: 'Emlak Tipi',
        type: 'select',
        options: [
          { value: 'daire', label: 'Daire' },
          { value: 'villa', label: 'Villa' },
          { value: 'mustakil-ev', label: 'Müstakil Ev' },
          { value: 'residence', label: 'Residence' },
          { value: 'apart', label: 'Apart' }
        ]
      },
      {
        id: 'buildingAge',
        label: 'Bina Yaşı',
        type: 'select',
        options: [
          { value: '0', label: 'Sıfır Bina' },
          { value: '1-5', label: '1-5 Yaş' },
          { value: '6-10', label: '6-10 Yaş' },
          { value: '11-15', label: '11-15 Yaş' },
          { value: '16-20', label: '16-20 Yaş' },
          { value: '21+', label: '21+ Yaş' }
        ]
      },
      {
        id: 'squareMeters',
        label: 'Metrekare',
        type: 'range',
        min: 0,
        max: 1000,
        step: 10
      },
      {
        id: 'floor',
        label: 'Kat',
        type: 'select',
        options: [
          { value: 'basement', label: 'Bodrum' },
          { value: 'ground', label: 'Zemin' },
          { value: '1-3', label: '1-3. Kat' },
          { value: '4-7', label: '4-7. Kat' },
          { value: '8-15', label: '8-15. Kat' },
          { value: '16+', label: '16+ Kat' }
        ]
      },
      {
        id: 'heating',
        label: 'Isıtma',
        type: 'select',
        options: [
          { value: 'central', label: 'Merkezi' },
          { value: 'individual', label: 'Bireysel' },
          { value: 'combi', label: 'Kombi' },
          { value: 'stove', label: 'Soba' },
          { value: 'none', label: 'Yok' }
        ]
      },
      {
        id: 'bathrooms',
        label: 'Banyo Sayısı',
        type: 'select',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4+', label: '4+' }
        ]
      },
      {
        id: 'balcony',
        label: 'Balkon',
        type: 'checkbox'
      },
      {
        id: 'parking',
        label: 'Otopark',
        type: 'checkbox'
      },
      {
        id: 'furnished',
        label: 'Eşyalı',
        type: 'select',
        options: [
          { value: 'furnished', label: 'Eşyalı' },
          { value: 'semi-furnished', label: 'Yarı Eşyalı' },
          { value: 'unfurnished', label: 'Eşyasız' }
        ]
      }
    ]
  },
  {
    id: 'vasita',
    name: 'Vasıta',
    filters: [
      {
        id: 'subcategory',
        label: 'Alt Kategori',
        type: 'select',
        options: [
          { value: 'otomobil', label: 'Otomobil' },
          { value: 'arazi-suv-pickup', label: 'Arazi, SUV & Pickup' },
          { value: 'motosiklet', label: 'Motosiklet' },
          { value: 'minivan-panelvan', label: 'Minivan & Panelvan' },
          { value: 'ticari-araclar', label: 'Ticari Araçlar' },
          { value: 'kiralik-araclar', label: 'Kiralık Araçlar' },
          { value: 'deniz-araclari', label: 'Deniz Araçları' },
          { value: 'hasarli-araclar', label: 'Hasarlı Araçlar' },
          { value: 'klasik-araclar', label: 'Klasik Araçlar' },
          { value: 'elektrikli-araclar', label: 'Elektrikli Araçlar' }
        ]
      },
      {
        id: 'carMake',
        label: 'Marka',
        type: 'select',
        placeholder: 'Marka seçin'
      },
      {
        id: 'carModel',
        label: 'Model',
        type: 'select',
        placeholder: 'Model seçin',
        dependsOn: 'carMake'
      },
      {
        id: 'year',
        label: 'Model Yılı',
        type: 'range',
        min: 1990,
        max: new Date().getFullYear() + 1,
        step: 1
      },
      {
        id: 'fuelType',
        label: 'Yakıt Tipi',
        type: 'select',
        options: [
          { value: 'gasoline', label: 'Benzin' },
          { value: 'diesel', label: 'Dizel' },
          { value: 'lpg', label: 'LPG' },
          { value: 'hybrid', label: 'Hibrit' },
          { value: 'electric', label: 'Elektrik' },
          { value: 'cng', label: 'CNG' }
        ]
      },
      {
        id: 'transmission',
        label: 'Vites Tipi',
        type: 'select',
        options: [
          { value: 'manual', label: 'Manuel' },
          { value: 'automatic', label: 'Otomatik' },
          { value: 'semi-automatic', label: 'Yarı Otomatik' }
        ]
      },
      {
        id: 'mileage',
        label: 'Kilometre',
        type: 'range',
        min: 0,
        max: 500000,
        step: 5000
      },
      {
        id: 'engineSize',
        label: 'Motor Hacmi',
        type: 'range',
        min: 800,
        max: 8000,
        step: 100
      },
      {
        id: 'bodyType',
        label: 'Kasa Tipi',
        type: 'select',
        options: [
          { value: 'sedan', label: 'Sedan' },
          { value: 'hatchback', label: 'Hatchback' },
          { value: 'station-wagon', label: 'Station Wagon' },
          { value: 'coupe', label: 'Coupe' },
          { value: 'convertible', label: 'Convertible' },
          { value: 'suv', label: 'SUV' },
          { value: 'pickup', label: 'Pickup' },
          { value: 'van', label: 'Van' }
        ]
      },
      {
        id: 'color',
        label: 'Renk',
        type: 'select',
        options: [
          { value: 'white', label: 'Beyaz' },
          { value: 'black', label: 'Siyah' },
          { value: 'gray', label: 'Gri' },
          { value: 'silver', label: 'Gümüş' },
          { value: 'red', label: 'Kırmızı' },
          { value: 'blue', label: 'Mavi' },
          { value: 'green', label: 'Yeşil' },
          { value: 'yellow', label: 'Sarı' },
          { value: 'brown', label: 'Kahverengi' },
          { value: 'orange', label: 'Turuncu' }
        ]
      },
      {
        id: 'warranty',
        label: 'Garanti',
        type: 'checkbox'
      }
    ]
  },
  {
    id: 'ikinci-el-ve-sifir-alisveris',
    name: 'İkinci El ve Sıfır Alışveriş',
    filters: [
      {
        id: 'subcategory',
        label: 'Ürün Kategorisi',
        type: 'select',
        options: [
          { value: 'bilgisayar', label: 'Bilgisayar' },
          { value: 'ev-dekorasyon', label: 'Ev Dekorasyon' },
          { value: 'giyim-aksesuar', label: 'Giyim & Aksesuar' },
          { value: 'kisisel-bakim-kozmetik', label: 'Kişisel Bakım & Kozmetik' },
          { value: 'kitap-dergi-film', label: 'Kitap, Dergi & Film' },
          { value: 'taki-mucevher-altin', label: 'Takı, Mücevher & Altın' },
          { value: 'bahce-yapi-market', label: 'Bahçe & Yapı Market' },
          { value: 'yiyecek-icecek', label: 'Yiyecek & İçecek' },
          { value: 'cep-telefonu-aksesuar', label: 'Cep Telefonu & Aksesuar' },
          { value: 'ev-elektronigi', label: 'Ev Elektroniği' },
          { value: 'elektronik', label: 'Elektronik' },
          { value: 'saat', label: 'Saat' },
          { value: 'hobi-oyuncak', label: 'Hobi & Oyuncak' }
        ]
      },
      {
        id: 'brand',
        label: 'Marka',
        type: 'select',
        placeholder: 'Marka seçin',
        dependsOn: 'subcategory'
      },
      {
        id: 'model',
        label: 'Model',
        type: 'select',
        placeholder: 'Model seçin',
        dependsOn: 'brand'
      },
      {
        id: 'warrantyStatus',
        label: 'Garanti Durumu',
        type: 'select',
        options: [
          { value: 'in-warranty', label: 'Garantili' },
          { value: 'out-of-warranty', label: 'Garantisiz' },
          { value: 'extended-warranty', label: 'Uzatılmış Garanti' }
        ]
      }
    ]
  },
  {
    id: 'yedek-parca-aksesuar-donanım-tuning',
    name: 'Yedek Parça, Aksesuar, Donanım & Tuning',
    filters: [
      {
        id: 'subcategory',
        label: 'Alt Kategori',
        type: 'select',
        options: [
          { value: 'otomotiv-ekipmanlari', label: 'Otomotiv Ekipmanları' },
          { value: 'motosiklet-ekipmanlari', label: 'Motosiklet Ekipmanları' },
          { value: 'deniz-araci-ekipmanlari', label: 'Deniz Aracı Ekipmanları' },
          { value: 'arac-dorse', label: 'Araç / Dorse' },
          { value: 'lastik-jant', label: 'Lastik & Jant' },
          { value: 'ses-goruntu-sistemleri', label: 'Ses & Görüntü Sistemleri' },
          { value: 'yedek-parca', label: 'Yedek Parça' },
          { value: 'tuning-modifiye', label: 'Tuning & Modifiye' },
          { value: 'oto-aksesuar', label: 'Oto Aksesuar' }
        ]
      },
      {
        id: 'carMake',
        label: 'Araç Markası',
        type: 'select',
        placeholder: 'Araç markası seçin'
      },
      {
        id: 'partBrand',
        label: 'Parça Markası',
        type: 'select',
        placeholder: 'Parça markası seçin'
      },
      {
        id: 'partCategory',
        label: 'Parça Kategorisi',
        type: 'select',
        options: [
          { value: 'motor-parcalari', label: 'Motor Parçaları' },
          { value: 'fren-sistemi', label: 'Fren Sistemi' },
          { value: 'amortisör-yay', label: 'Amortisör & Yay' },
          { value: 'elektrik-parcalari', label: 'Elektrik Parçaları' },
          { value: 'kaporta-parcalari', label: 'Kaporta Parçaları' },
          { value: 'ic-aksam', label: 'İç Aksam' },
          { value: 'lastik-jant', label: 'Lastik & Jant' }
        ]
      },
      {
        id: 'partCondition',
        label: 'Parça Durumu',
        type: 'select',
        options: [
          { value: 'new', label: 'Sıfır' },
          { value: 'used-original', label: 'İkinci El Orjinal' },
          { value: 'used-aftermarket', label: 'İkinci El Yan Sanayi' },
          { value: 'refurbished', label: 'Yenilenmiş' }
        ]
      },
      {
        id: 'yearCompatibility',
        label: 'Model Yılı Uyumluluğu',
        type: 'range',
        min: 1990,
        max: new Date().getFullYear() + 1,
        step: 1
      }
    ]
  },
  {
    id: 'ustalar-ve-hizmetler',
    name: 'Ustalar ve Hizmetler',
    filters: [
      {
        id: 'subcategory',
        label: 'Hizmet Türü',
        type: 'select',
        options: [
          { value: 'ev-tadilat-dekorasyon', label: 'Ev Tadilat & Dekorasyon' },
          { value: 'nakliye', label: 'Nakliye' },
          { value: 'arac-servis-bakim', label: 'Araç Servis & Bakım' },
          { value: 'ozel-ders', label: 'Özel Ders' },
          { value: 'saglik-guzellik', label: 'Sağlık & Güzellik' },
          { value: 'etkinlik-organizasyon', label: 'Etkinlik & Organizasyon' },
          { value: 'isletme-reklam', label: 'İşletme & Reklam' },
          { value: 'temizlik', label: 'Temizlik' },
          { value: 'yazilim-tasarim', label: 'Yazılım & Tasarım' },
          { value: 'danismanlik', label: 'Danışmanlık' },
          { value: 'fotograf-video', label: 'Fotoğraf & Video' },
          { value: 'dugun', label: 'Düğün' },
          { value: 'muzik-sanat', label: 'Müzik & Sanat' },
          { value: 'diger-hizmetler', label: 'Diğer Hizmetler' }
        ]
      },
      {
        id: 'experience',
        label: 'Deneyim',
        type: 'select',
        options: [
          { value: '0-1', label: '0-1 Yıl' },
          { value: '1-3', label: '1-3 Yıl' },
          { value: '3-5', label: '3-5 Yıl' },
          { value: '5-10', label: '5-10 Yıl' },
          { value: '10+', label: '10+ Yıl' }
        ]
      },
      {
        id: 'workingHours',
        label: 'Çalışma Saatleri',
        type: 'multiselect',
        options: [
          { value: 'weekdays', label: 'Hafta İçi' },
          { value: 'weekends', label: 'Hafta Sonu' },
          { value: 'evenings', label: 'Akşam Saatleri' },
          { value: '24-7', label: '7/24' }
        ]
      }
    ]
  },
  {
    id: 'is-ilanlari',
    name: 'İş İlanları',
    filters: [
      {
        id: 'subcategory',
        label: 'Sektör',
        type: 'select',
        options: [
          { value: 'avukatlik-hukuki-danismanlik', label: 'Avukatlık & Hukuki Danışmanlık' },
          { value: 'egitim', label: 'Eğitim' },
          { value: 'guzellik-bakim', label: 'Güzellik & Bakım' },
          { value: 'saglik', label: 'Sağlık' },
          { value: 'turizm', label: 'Turizm' },
          { value: 'restoran-konaklama', label: 'Restoran & Konaklama' },
          { value: 'guvenlik', label: 'Güvenlik' },
          { value: 'temizlik', label: 'Temizlik' },
          { value: 'uretim-imalathaneler', label: 'Üretim & İmalathaneler' },
          { value: 'muhasebe-finans', label: 'Muhasebe & Finans' },
          { value: 'pazarlama-reklam', label: 'Pazarlama & Reklam' },
          { value: 'muhendislik', label: 'Mühendislik' },
          { value: 'yonetim', label: 'Yönetim' },
          { value: 'magaza-market', label: 'Mağaza & Market' },
          { value: 'sofor-kurye', label: 'Şoför & Kurye' },
          { value: 'part-time-ek-is', label: 'Part Time & Ek İş' },
          { value: 'stajyer', label: 'Stajyer' },
          { value: 'diger-is-ilanlari', label: 'Diğer İş İlanları' }
        ]
      },
      {
        id: 'positionLevel',
        label: 'Pozisyon Seviyesi',
        type: 'select',
        options: [
          { value: 'entry', label: 'Giriş Seviyesi' },
          { value: 'junior', label: 'Junior' },
          { value: 'mid', label: 'Orta Seviye' },
          { value: 'senior', label: 'Senior' },
          { value: 'lead', label: 'Lead' },
          { value: 'manager', label: 'Yönetici' },
          { value: 'director', label: 'Direktör' }
        ]
      },
      {
        id: 'workType',
        label: 'Çalışma Şekli',
        type: 'multiselect',
        options: [
          { value: 'full-time', label: 'Tam Zamanlı' },
          { value: 'part-time', label: 'Yarı Zamanlı' },
          { value: 'remote', label: 'Uzaktan' },
          { value: 'hybrid', label: 'Hibrit' },
          { value: 'freelance', label: 'Freelance' },
          { value: 'internship', label: 'Staj' }
        ]
      },
      {
        id: 'salaryRange',
        label: 'Maaş Aralığı',
        type: 'range',
        min: 0,
        max: 100000,
        step: 1000
      }
    ]
  }
];

// Kategori ID'sine göre filtre konfigürasyonunu getir
export const getFilterConfigByCategory = (categoryId: string): CategoryFilterConfig | null => {
  return categoryFilters.find(config => config.id === categoryId) || null;
};

// Tüm kategorilerin ID'lerini getir
export const getAllCategoryIds = (): string[] => {
  return categoryFilters.map(config => config.id);
};

// Belirli bir kategorinin filtrelerini getir
export const getCategoryFilters = (categoryId: string): FilterField[] => {
  const config = getFilterConfigByCategory(categoryId);
  return config ? [...commonFilters, ...config.filters] : commonFilters;
};