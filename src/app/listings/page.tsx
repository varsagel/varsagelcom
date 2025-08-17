'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Clock, Filter, Heart, MessageSquare, SlidersHorizontal, Star, TrendingUp, Grid, List, Eye, Users, Zap, Sparkles, Search } from 'lucide-react';
import { formatCity, formatDistrict, formatLocation } from '@/utils/locationUtils';

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: {
    min: number;
    max: number;
  };
  createdAt: string;
  images: string[];
  icon?: string;
  subcategory?: string;
  user: {
    id: string;
    name: string;
  };
  offerCount: number;
  favoriteCount: number;
  mileage?: number;
  mileageMin?: number;
  mileageMax?: number;
  categorySpecificData?: {
    brand?: string;
    model?: string;
    [key: string]: any;
  };
};

const categories = [
  {
    id: 'all',
    name: 'Tümü',
    subcategories: []
  },
  {
    id: 'emlak',
    name: 'Emlak',
    subcategories: ['Konut', 'İşyeri', 'Arsa', 'Bina', 'Devre Mülk', 'Turistik Tesis', 'Devren Satılık & Kiralık', 'Günlük Kiralık', 'Konut Projeleri', 'Ofis Projeleri', 'Diğer']
  },
  {
    id: 'vasita',
    name: 'Vasıta',
    subcategories: ['Otomobil', 'Arazi, SUV & Pickup', 'Motosiklet', 'Minivan & Panelvan', 'Kamyon & Kamyonet', 'Otobüs & Midibüs', 'Traktör', 'Deniz Araçları', 'Hava Araçları', 'ATV', 'UTV', 'Karavan', 'Treyler', 'Klasik Araçlar', 'Hasarlı Araçlar', 'Elektrikli Araçlar']
  },
  {
    id: 'yedek-parca',
    name: 'Yedek Parça, Aksesuar, Donanım & Tuning',
    subcategories: ['Otomotiv Ekipmanları', 'Motosiklet Ekipmanları', 'Deniz Aracı Ekipmanları', 'Hava Aracı Ekipmanları', 'ATV Ekipmanları', 'Karavan Ekipmanları', 'Diğer']
  },
  {
    id: 'ikinci-el-alisveris',
    name: 'İkinci El ve Sıfır Alışveriş',
    subcategories: ['Bilgisayar', 'Cep Telefonu', 'Fotoğraf & Kamera', 'Ev Dekorasyon', 'Ev Elektroniği', 'Elektrikli Ev Aletleri', 'Giyim & Aksesuar', 'Saat', 'Anne & Bebek', 'Kişisel Bakım & Kozmetik', 'Hobi & Oyuncak', 'Oyun & Konsol', 'Kitap, Dergi & Film', 'Müzik', 'Spor', 'Takı, Mücevher & Altın', 'Koleksiyon', 'Antika', 'Bahçe & Yapı Market', 'Teknik Elektronik', 'Ofis & Kırtasiye', 'Yiyecek & İçecek', 'Diğer Her Şey']
  },
  {
    id: 'is-makineleri-sanayi',
    name: 'İş Makineleri & Sanayi',
    subcategories: ['Tarım Makineleri', 'İş Makinesi', 'Sanayi', 'Elektrik & Enerji', 'Diğer']
  },
  {
    id: 'ustalar-hizmetler',
    name: 'Ustalar ve Hizmetler',
    subcategories: ['Tadilat & Dekorasyon', 'Nakliye', 'Temizlik', 'Güvenlik', 'Sağlık & Güzellik', 'Düğün & Organizasyon', 'Fotoğraf & Video', 'Bilgisayar & İnternet', 'Eğitim & Kurs', 'Diğer Hizmetler']
  },
  {
    id: 'ozel-ders',
    name: 'Özel Ders Verenler',
    subcategories: ['Lise', 'Üniversite', 'İlkokul', 'Ortaokul', 'Dil Dersleri', 'Bilgisayar', 'Müzik', 'Spor', 'Sanat', 'Diğer']
  },
  {
    id: 'is-ilanlari',
    name: 'İş İlanları',
    subcategories: ['Satış', 'Pazarlama', 'Muhasebe & Finans', 'İnsan Kaynakları', 'Bilgi İşlem', 'Mühendislik', 'Sağlık', 'Eğitim', 'Turizm & Otelcilik', 'İnşaat', 'Üretim', 'Lojistik', 'Güvenlik', 'Temizlik', 'Diğer']
  },
  {
    id: 'yardimci-arayanlar',
    name: 'Yardımcı Arayanlar',
    subcategories: ['Ev İşleri', 'Çocuk Bakımı', 'Yaşlı Bakımı', 'Hasta Bakımı', 'Evcil Hayvan Bakımı', 'Bahçıvanlık', 'Şoförlük', 'Diğer']
  },
  {
    id: 'hayvanlar-alemi',
    name: 'Hayvanlar Alemi',
    subcategories: ['Evcil Hayvanlar', 'Çiftlik Hayvanları', 'Aksesuarlar', 'Yem ve Mama', 'Sağlık Ürünleri', 'Diğer']
  }
];

const locations = [
  'Tümü',
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Şanlıurfa',
  'Kocaeli',
  'Mersin',
  'Diyarbakır',
  'Hatay',
  'Manisa',
  'Kayseri',
  'Eskişehir',
  'Samsun',
  'Denizli',
  'Malatya',
  'Kahramanmaraş',
  'Erzurum',
  'Van',
  'Batman',
  'Elazığ',
  'Iğdır',
  'Tokat',
  'Siirt',
  'Tekirdağ',
  'Edirne',
  'Çorum',
  'Ordu',
  'Afyon',
  'Kütahya',
  'Uşak',
  'Diğer'
];

const locationData: { [key: string]: string[] } = {
  'Tümü': [],
  'İstanbul': ['Tümü', 'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  'Ankara': ['Tümü', 'Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
  'İzmir': ['Tümü', 'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  'Bursa': ['Tümü', 'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
  'Antalya': ['Tümü', 'Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
  'Adana': ['Tümü', 'Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
  'Konya': ['Tümü', 'Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  'Gaziantep': ['Tümü', 'Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
  'Şanlıurfa': ['Tümü', 'Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'],
  'Kocaeli': ['Tümü', 'Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe'],
  'Mersin': ['Tümü', 'Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
  'Diyarbakır': ['Tümü', 'Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
  'Hatay': ['Tümü', 'Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
  'Manisa': ['Tümü', 'Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Turgutlu', 'Yunusemre'],
  'Kayseri': ['Tümü', 'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
  'Eskişehir': ['Tümü', 'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
  'Samsun': ['Tümü', 'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
  'Denizli': ['Tümü', 'Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  'Malatya': ['Tümü', 'Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'],
  'Diğer': ['Tümü']
};

const categoryIcons: { [key: string]: any } = {
  'Emlak': '🏠',
  'Vasıta': '🚗',
  'Yedek Parça, Aksesuar, Donanım & Tuning': '🔧',
  'İkinci El ve Sıfır Alışveriş': '🛒',
  'İş Makineleri & Sanayi': '🏭',
  'Ustalar ve Hizmetler': '🔨',
  'Özel Ders Verenler': '📚',
  'İş İlanları': '💼',
  'Yardımcı Arayanlar': '👥',
  'Hayvanlar Alemi': '🐕'
};

const sortOptions = [
  { value: 'newest', label: 'En Yeni', icon: Sparkles },
  { value: 'oldest', label: 'En Eski', icon: Clock },
  { value: 'budget-high', label: 'Bütçe (Yüksek → Düşük)', icon: TrendingUp },
  { value: 'budget-low', label: 'Bütçe (Düşük → Yüksek)', icon: TrendingUp },
  { value: 'offers', label: 'Teklif Sayısı', icon: Users },
  { value: 'favorites', label: 'En Popüler', icon: Star }
];

const statusOptions = [
  'Tümü',
  'Yeni',
  'İkinci El',
  'Sıfır',
  'Kullanılmış',
  'Hasarlı'
];

const dateRangeOptions = [
  'Tümü',
  'Son 24 Saat',
  'Son 3 Gün',
  'Son Hafta',
  'Son Ay',
  'Son 3 Ay'
];

const urgencyOptions = [
  'Tümü',
  'Acil',
  'Normal',
  'Esnek'
];

// Marka, Model ve Versiyon verileri
const brandData: { [key: string]: { [key: string]: string[] } } = {
  'Otomobil': {
    'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
    'BMW': ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', '6 Serisi', '7 Serisi', '8 Serisi', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4'],
    'Mercedes-Benz': ['A-Sınıfı', 'B-Sınıfı', 'C-Sınıfı', 'CLA', 'CLS', 'E-Sınıfı', 'S-Sınıfı', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Sınıfı'],
    'Volkswagen': ['Polo', 'Golf', 'Jetta', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'Caddy', 'Transporter'],
    'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'EcoSport', 'Kuga', 'Edge', 'Explorer', 'Transit', 'Ranger'],
    'Toyota': ['Yaris', 'Corolla', 'Camry', 'Prius', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Hilux'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Ridgeline'],
    'Nissan': ['Micra', 'Note', 'Sentra', 'Altima', 'Maxima', 'Juke', 'Qashqai', 'X-Trail', 'Murano', 'Pathfinder'],
    'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Kona', 'Tucson', 'Santa Fe'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Cerato', 'Optima', 'Stonic', 'Sportage', 'Sorento'],
    'Renault': ['Clio', 'Megane', 'Fluence', 'Talisman', 'Captur', 'Kadjar', 'Koleos'],
    'Peugeot': ['108', '208', '308', '508', '2008', '3008', '5008'],
    'Citroën': ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland'],
    'Skoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
    'SEAT': ['Ibiza', 'Leon', 'Toledo', 'Arona', 'Ateca', 'Tarraco'],
    'Fiat': ['500', 'Panda', 'Tipo', '500X', '500L'],
    'Alfa Romeo': ['Giulietta', 'Giulia', 'Stelvio'],
    'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
    'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-9'],
    'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV'],
    'Mitsubishi': ['Space Star', 'Lancer', 'Outlander', 'ASX'],
    'Suzuki': ['Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny'],
    'Dacia': ['Sandero', 'Logan', 'Duster', 'Lodgy'],
    'Tofaş': ['Şahin', 'Kartal', 'Doğan'],
    'Diğer': ['Diğer Model']
  },
  'Motosiklet': {
    'Honda': ['CBR', 'CB', 'CRF', 'PCX', 'Forza', 'SH'],
    'Yamaha': ['YZF', 'MT', 'XSR', 'NMAX', 'XMAX', 'Tenere'],
    'Kawasaki': ['Ninja', 'Z', 'Versys', 'KLX'],
    'Suzuki': ['GSX-R', 'GSX-S', 'V-Strom', 'Burgman'],
    'BMW': ['S', 'R', 'F', 'G', 'K', 'C'],
    'KTM': ['Duke', 'RC', 'Adventure', 'Supermoto'],
    'Ducati': ['Panigale', 'Monster', 'Multistrada', 'Scrambler'],
    'Harley-Davidson': ['Sportster', 'Dyna', 'Softail', 'Touring', 'Street'],
    'Aprilia': ['RSV4', 'Tuono', 'Shiver', 'Dorsoduro'],
    'Triumph': ['Speed Triple', 'Street Triple', 'Bonneville', 'Tiger'],
    'Bajaj': ['Pulsar', 'Dominar', 'Avenger'],
    'Mondial': ['HPS', 'SMX', 'Xtreme'],
    'Diğer': ['Diğer Model']
  },
  'Arazi, SUV & Pickup': {
    'Toyota': ['Land Cruiser', 'Prado', 'RAV4', 'Highlander', 'Hilux'],
    'Ford': ['Ranger', 'F-150', 'Explorer', 'Edge', 'Kuga'],
    'Nissan': ['Navara', 'Pathfinder', 'X-Trail', 'Qashqai'],
    'Mitsubishi': ['L200', 'Outlander', 'ASX', 'Pajero'],
    'Isuzu': ['D-Max', 'MU-X'],
    'Volkswagen': ['Amarok', 'Tiguan', 'Touareg'],
    'BMW': ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
    'Mercedes-Benz': ['GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Sınıfı'],
    'Audi': ['Q3', 'Q5', 'Q7', 'Q8'],
    'Jeep': ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade'],
    'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Evoque'],
    'Hyundai': ['Tucson', 'Santa Fe', 'Kona'],
    'Kia': ['Sportage', 'Sorento', 'Stonic'],
    'Renault': ['Duster', 'Kadjar', 'Koleos'],
    'Dacia': ['Duster'],
    'Diğer': ['Diğer Model']
  }
};

const versionData: { [key: string]: string[] } = {
  'default': ['1.0', '1.2', '1.4', '1.6', '1.8', '2.0', '2.2', '2.4', '2.5', '2.8', '3.0', '3.2', '3.5', '4.0', 'Hybrid', 'Electric', 'Diğer']
};

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Arama
  const [searchQuery, setSearchQuery] = useState('');

  // Sayfalama
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minBudget = searchParams.get('minBudget') || '';
    const maxBudget = searchParams.get('maxBudget') || '';

    setCurrentPage(page);
    fetchListings(page, search, category, minBudget, maxBudget);
  }, [searchParams]);

  const fetchListings = async (page: number, search?: string, category?: string, minBudget?: string, maxBudget?: string) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('sortBy', 'createdAt');
      queryParams.append('sortOrder', 'desc');
      queryParams.append('page', page.toString());
      queryParams.append('limit', '9');

      if (search && search.trim()) {
        queryParams.append('search', search.trim());
      }

      if (category && category.trim()) {
        queryParams.append('category', category.trim());
      }

      if (minBudget && minBudget.trim()) {
        queryParams.append('minBudget', minBudget.trim());
      }

      if (maxBudget && maxBudget.trim()) {
        queryParams.append('maxBudget', maxBudget.trim());
      }

      const response = await fetch(`/api/listings?${queryParams.toString()}`);
      if (!response.ok) throw new Error('İlanlar yüklenirken bir hata oluştu');
      const data = await response.json();

      // API'den gelen verileri frontend formatına dönüştür
      const formattedListings: Listing[] = data.listings.map((listing: any) => {
        // Parse category specific data for mileage information
        let categoryData = {};
        try {
          categoryData = listing.categorySpecificData ? JSON.parse(listing.categorySpecificData) : {};
        } catch (e) {
          categoryData = {};
        }

        return {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          location: formatCity(listing.location),
          budget: {
            min: listing.budgetMin || 0,
            max: listing.budgetMax || 0
          },
          createdAt: listing.createdAt,
          images: listing.images || [],
          user: {
            id: listing.user.id,
            name: listing.user.name
          },
          offerCount: listing._count?.offers || 0,
          favoriteCount: listing._count?.favorites || 0,
          mileage: (categoryData as any).mileage || listing.mileage || null,
          mileageMin: (categoryData as any).mileageMin || listing.mileageMin || null,
          mileageMax: (categoryData as any).mileageMax || listing.mileageMax || null
        };
      });

      setListings(formattedListings);
      setTotalPages(data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };





  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/listings?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  const handlePriceFilter = (minBudget: string, maxBudget: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (minBudget.trim()) {
      params.set('minBudget', minBudget.trim());
    } else {
      params.delete('minBudget');
    }
    if (maxBudget.trim()) {
      params.set('maxBudget', maxBudget.trim());
    } else {
      params.delete('maxBudget');
    }
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams();
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Arama Bölümü */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İlan ara... (örn: web tasarım, temizlik, nakliye)"
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl text-sm sm:text-base text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 input-mobile"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-14 sm:right-16 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm btn-touch"
                  >
                    ×
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 btn-touch"
                >
                  Ara
                </button>
              </div>
            </form>

            {/* Fiyat Filtreleme */}
            <div className="mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Fiyat Aralığı:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min ₺"
                    className="w-20 sm:w-24 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 input-mobile"
                    onChange={(e) => {
                      const minBudget = e.target.value;
                      const maxBudget = (e.target.parentNode?.parentNode?.querySelector('input[placeholder="Max ₺"]') as HTMLInputElement)?.value || '';
                      if (minBudget || maxBudget) {
                        handlePriceFilter(minBudget, maxBudget);
                      }
                    }}
                  />
                  <span className="text-slate-400 text-sm">-</span>
                  <input
                    type="number"
                    placeholder="Max ₺"
                    className="w-20 sm:w-24 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 input-mobile"
                    onChange={(e) => {
                      const maxBudget = e.target.value;
                      const minBudget = (e.target.parentNode?.querySelector('input[placeholder="Min ₺"]') as HTMLInputElement)?.value || '';
                      if (minBudget || maxBudget) {
                        handlePriceFilter(minBudget, maxBudget);
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const minInput = document.querySelector('input[placeholder="Min ₺"]') as HTMLInputElement;
                    const maxInput = document.querySelector('input[placeholder="Max ₺"]') as HTMLInputElement;
                    if (minInput) minInput.value = '';
                    if (maxInput) maxInput.value = '';
                    handlePriceFilter('', '');
                  }}
                  className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 text-xs sm:text-sm font-medium btn-touch"
                >
                  Temizle
                </button>
              </div>
            </div>

            {searchQuery && (
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>Arama: </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">"{searchQuery}"</span>
                <button
                  onClick={clearSearch}
                  className="ml-2 text-red-500 hover:text-red-600 transition-colors duration-200 btn-touch"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 sm:mb-8 flex justify-end">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl sm:rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 btn-touch ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-600 shadow-lg text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 btn-touch ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-600 shadow-lg text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* İlan Listesi */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">İlanlar Yükleniyor</h3>
            <p className="text-slate-600 dark:text-slate-400">En güncel ilanları getiriyoruz...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-4xl">😞</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Bir Hata Oluştu</h3>
            <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span>🔄</span>
              Tekrar Dene
            </button>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">İlan Bulunamadı</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              {searchQuery ? `"${searchQuery}" araması için ilan bulunamadı.` : 'Aramanıza uygun ilan bulunamadı.'}
            </p>
            <div className="flex gap-4">
              {searchQuery ? (
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span>🗑️</span>
                  Aramayı Temizle
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span>🔄</span>
                  Yenile
                </button>
              )}
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-300 hover:scale-105"
              >
                <span>➕</span>
                İlan Oluştur
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'space-y-4 sm:space-y-6'}>
          {listings.map((listing, index) => (
            viewMode === 'grid' ? (
              // Grid View Card
              <div key={listing.id} className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 animate-in slide-in-from-bottom-4 rounded-lg sm:rounded-xl" style={{ animationDelay: `${index * 100}ms` }}>


                {/* Image Section */}
                <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"

                    />
                  ) : (
                    // Resim yoksa önce icon kontrol et, yoksa varsayılan resim göster
                    listing.icon && (listing.category === 'Vasıta' || listing.category === 'vasita') && listing.subcategory === 'Otomobil' ? (
                      <img
                        src={`/api/icons?name=${listing.icon}`}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/images/defaults/varsagel.com.jpeg"
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )
                  )}

                  {/* Stats */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 rounded">
                      <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{listing.favoriteCount}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 rounded">
                      <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{listing.offerCount}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 sm:p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium text-gray-700 dark:text-gray-300 rounded">
                        <span className="text-xs">{categoryIcons[listing.category] || '📋'}</span>
                        <span className="hidden sm:inline">{listing.category}</span>
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100 line-clamp-2">
                    <Link href={`/listings/${listing.id}`} className="hover:text-gray-700 dark:hover:text-gray-300">
                      {listing.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 leading-relaxed">
                    {listing.description}
                  </p>

                  {/* Mileage for Vehicle Category */}
                  {(listing.category === 'Vasıta' || listing.category === 'vasita') && (listing.mileage || (listing.mileageMin && listing.mileageMax)) && (
                    <div className="mb-2">
                      <div className="inline-flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs">
                        <span>🚗</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {listing.mileage 
                            ? `${listing.mileage.toLocaleString('tr-TR')} km`
                            : `${listing.mileageMin?.toLocaleString('tr-TR')} - ${listing.mileageMax?.toLocaleString('tr-TR')} km`
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Brand and Model for Vehicle Category */}
                  {(listing.category === 'Vasıta' || listing.category === 'vasita') && listing.categorySpecificData && (listing.categorySpecificData.brand || listing.categorySpecificData.model) && (
                    <div className="mb-2">
                      <div className="inline-flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs">
                        <span>🏷️</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {listing.categorySpecificData.brand && listing.categorySpecificData.model 
                            ? `${listing.categorySpecificData.brand} ${listing.categorySpecificData.model}`
                            : listing.categorySpecificData.brand || listing.categorySpecificData.model
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 sm:gap-2 border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1 rounded-md">
                      <span className="text-xs sm:text-sm">💰</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        ₺{listing.budget?.min?.toLocaleString('tr-TR') || '0'} - ₺{listing.budget?.max?.toLocaleString('tr-TR') || '0'}
                      </span>
                    </div>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="inline-flex items-center gap-1 border border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-1 text-xs font-medium text-white dark:text-gray-900 transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 rounded-md btn-touch"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Detay</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // List View Card
              <div key={listing.id} className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 animate-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-64 aspect-video md:aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"

                      />
                    ) : (
                      // Check if listing has icon and is vehicle/automobile category
                      listing.icon && (listing.category === 'Vasıta' || listing.category === 'vasita') && listing.subcategory === 'Otomobil' ? (
                        <img
                          src={`/api/icons?name=${listing.icon}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="/images/defaults/varsagel.com.jpeg"
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      )
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span>{categoryIcons[listing.category] || '📋'}</span>
                            {listing.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Heart className="w-3 h-3 text-gray-500" />
                            <span>{listing.favoriteCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MessageSquare className="w-3 h-3 text-gray-500" />
                            <span>{listing.offerCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          <Link href={`/listings/${listing.id}`} className="hover:text-gray-700 dark:hover:text-gray-300">
                            {listing.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {listing.description}
                        </p>
                      </div>

                      {/* Mileage for Vehicle Listings */}
                      {listing.category === 'Vasıta' && (listing.mileage || listing.mileageMin || listing.mileageMax) && (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            🚗 
                            {listing.mileage 
                              ? `${listing.mileage.toLocaleString('tr-TR')} km`
                              : `${(listing.mileageMin || 0).toLocaleString('tr-TR')} - ${(listing.mileageMax || 0).toLocaleString('tr-TR')} km`
                            }
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4">
                        <div className="inline-flex items-center gap-1 sm:gap-2 border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1 rounded-md">
                          <span className="text-xs sm:text-sm">💰</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            ₺{listing.budget?.min?.toLocaleString('tr-TR') || '0'} - ₺{listing.budget?.max?.toLocaleString('tr-TR') || '0'}
                          </span>
                        </div>
                        <Link
                          href={`/listings/${listing.id}`}
                          className="inline-flex items-center gap-1 sm:gap-2 border border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white dark:text-gray-900 transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 rounded-md btn-touch"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Detayları Gör</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {!isLoading && !error && listings.length > 0 && totalPages > 1 && (
        <div className="mt-8 sm:mt-16">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* Sayfa Bilgisi */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{((currentPage - 1) * 9) + 1}</span>
                {' - '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * 9, listings.length)}</span>
                {' / '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{listings.length}</span>
                {' ilan gösteriliyor'}
              </p>
            </div>

            {/* Sayfalama Kontrolleri */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="group inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg btn-touch"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors rotate-180" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-110 btn-touch ${currentPage === pageNumber
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-xl border-0'
                          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="group inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg btn-touch"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </button>
            </div>

            {/* Hızlı Sayfa Atlama */}
            {totalPages > 5 && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed btn-touch"
                >
                  <span>⏮️</span>
                  İlk Sayfa
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed btn-touch"
                >
                  Son Sayfa
                  <span>⏭️</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 sm:mt-20">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 sm:p-12 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Floating Elements */}
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-20 h-20 sm:w-32 sm:h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-10 h-10 sm:w-16 sm:h-16 bg-blue-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm">
              <span className="text-2xl sm:text-4xl">🚀</span>
            </div>

            {/* Content */}
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Kendi İlanınızı Oluşturun
            </h2>
            <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Hizmetinizi tanıtın, yeteneklerinizi sergileyin ve binlerce potansiyel müşteriyle buluşun.
              <span className="font-semibold text-white">Ücretsiz</span> ve sadece birkaç dakika sürer!
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 sm:mb-10">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-xs sm:text-sm text-blue-200">Aktif İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-xs sm:text-sm text-blue-200">Mutlu Müşteri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-blue-200">Destek</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link
                href="/listings/create"
                className="group inline-flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-110 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 btn-touch"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                <span>Hemen İlan Oluştur</span>
                <span className="text-xl sm:text-2xl group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 btn-touch"
              >
                <span>❓</span>
                <span>Nasıl Çalışır?</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-blue-200 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <span>✅</span>
                <span>Ücretsiz Kayıt</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span>⚡</span>
                <span>Hızlı Onay</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span>🔒</span>
                <span>Güvenli Platform</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span>📱</span>
                <span>Mobil Uyumlu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}