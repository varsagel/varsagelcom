export interface SubCategory {
  id: string;
  name: string;
  icon?: string;
  count?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: string;
  subcategories: SubCategory[];
}

export const categoriesData: Category[] = [
  {
    id: "electronics",
    name: "Elektronik",
    icon: "📱",
    count: "2.5K",
    subcategories: [
      { id: "smartphones", name: "Akıllı Telefonlar", icon: "📱", count: "450" },
      { id: "laptops", name: "Dizüstü Bilgisayarlar", icon: "💻", count: "320" },
      { id: "tablets", name: "Tabletler", icon: "📱", count: "180" },
      { id: "desktop-computers", name: "Masaüstü Bilgisayarlar", icon: "🖥️", count: "150" },
      { id: "gaming-consoles", name: "Oyun Konsolları", icon: "🎮", count: "120" },
      { id: "smartwatches", name: "Akıllı Saatler", icon: "⌚", count: "95" },
      { id: "headphones", name: "Kulaklıklar", icon: "🎧", count: "200" },
      { id: "speakers", name: "Hoparlörler", icon: "🔊", count: "85" },
      { id: "cameras", name: "Kameralar", icon: "📷", count: "110" },
      { id: "tv-monitors", name: "TV ve Monitörler", icon: "📺", count: "140" },
      { id: "home-appliances", name: "Ev Aletleri", icon: "🏠", count: "280" },
      { id: "kitchen-appliances", name: "Mutfak Aletleri", icon: "🍳", count: "160" },
      { id: "computer-accessories", name: "Bilgisayar Aksesuarları", icon: "⌨️", count: "190" },
      { id: "phone-accessories", name: "Telefon Aksesuarları", icon: "📱", count: "220" },
      { id: "gaming-accessories", name: "Oyun Aksesuarları", icon: "🎮", count: "75" },
      { id: "smart-home", name: "Akıllı Ev Sistemleri", icon: "🏡", count: "65" },
      { id: "audio-equipment", name: "Ses Sistemleri", icon: "🎵", count: "90" },
      { id: "networking", name: "Ağ Ekipmanları", icon: "📡", count: "55" },
      { id: "storage", name: "Depolama Cihazları", icon: "💾", count: "80" },
      { id: "power-accessories", name: "Güç ve Şarj Aksesuarları", icon: "🔋", count: "100" }
    ]
  },
  {
    id: "home-living",
    name: "Ev & Yaşam",
    icon: "🏠",
    count: "1.8K",
    subcategories: [
      { id: "furniture", name: "Mobilya", icon: "🪑", count: "320" },
      { id: "bedroom-furniture", name: "Yatak Odası Mobilyaları", icon: "🛏️", count: "180" },
      { id: "living-room-furniture", name: "Oturma Odası Mobilyaları", icon: "🛋️", count: "150" },
      { id: "kitchen-furniture", name: "Mutfak Mobilyaları", icon: "🍽️", count: "120" },
      { id: "office-furniture", name: "Ofis Mobilyaları", icon: "🪑", count: "90" },
      { id: "outdoor-furniture", name: "Bahçe Mobilyaları", icon: "🌳", count: "75" },
      { id: "home-decor", name: "Ev Dekorasyonu", icon: "🖼️", count: "200" },
      { id: "lighting", name: "Aydınlatma", icon: "💡", count: "140" },
      { id: "textiles", name: "Ev Tekstili", icon: "🛏️", count: "160" },
      { id: "curtains-blinds", name: "Perde ve Stor", icon: "🪟", count: "85" },
      { id: "rugs-carpets", name: "Halı ve Kilim", icon: "🏠", count: "110" },
      { id: "bathroom-accessories", name: "Banyo Aksesuarları", icon: "🛁", count: "95" },
      { id: "kitchen-accessories", name: "Mutfak Aksesuarları", icon: "🍴", count: "130" },
      { id: "storage-organization", name: "Depolama ve Organizasyon", icon: "📦", count: "105" },
      { id: "cleaning-supplies", name: "Temizlik Malzemeleri", icon: "🧽", count: "80" },
      { id: "garden-tools", name: "Bahçe Aletleri", icon: "🌱", count: "70" },
      { id: "plants-flowers", name: "Bitki ve Çiçekler", icon: "🌸", count: "60" },
      { id: "home-security", name: "Ev Güvenlik Sistemleri", icon: "🔒", count: "45" },
      { id: "home-improvement", name: "Ev Tadilat Malzemeleri", icon: "🔨", count: "90" },
      { id: "seasonal-decor", name: "Mevsimlik Dekorasyon", icon: "🎄", count: "55" }
    ]
  },
  {
    id: "fashion-clothing",
    name: "Moda & Giyim",
    icon: "👕",
    count: "3.2K",
    subcategories: [
      { id: "womens-clothing", name: "Kadın Giyim", icon: "👗", count: "800" },
      { id: "mens-clothing", name: "Erkek Giyim", icon: "👔", count: "650" },
      { id: "kids-clothing", name: "Çocuk Giyim", icon: "👶", count: "420" },
      { id: "baby-clothing", name: "Bebek Giyim", icon: "🍼", count: "280" },
      { id: "shoes", name: "Ayakkabı", icon: "👟", count: "380" },
      { id: "womens-shoes", name: "Kadın Ayakkabı", icon: "👠", count: "200" },
      { id: "mens-shoes", name: "Erkek Ayakkabı", icon: "👞", count: "150" },
      { id: "kids-shoes", name: "Çocuk Ayakkabı", icon: "👟", count: "120" },
      { id: "sports-shoes", name: "Spor Ayakkabı", icon: "👟", count: "180" },
      { id: "bags-accessories", name: "Çanta ve Aksesuarlar", icon: "👜", count: "250" },
      { id: "handbags", name: "El Çantaları", icon: "👜", count: "140" },
      { id: "backpacks", name: "Sırt Çantaları", icon: "🎒", count: "90" },
      { id: "wallets", name: "Cüzdanlar", icon: "💳", count: "70" },
      { id: "jewelry", name: "Takı ve Mücevher", icon: "💍", count: "160" },
      { id: "watches", name: "Saatler", icon: "⌚", count: "120" },
      { id: "sunglasses", name: "Güneş Gözlüğü", icon: "🕶️", count: "85" },
      { id: "hats-caps", name: "Şapka ve Bere", icon: "🧢", count: "60" },
      { id: "belts", name: "Kemerler", icon: "👔", count: "55" },
      { id: "scarves", name: "Atkı ve Şal", icon: "🧣", count: "45" },
      { id: "underwear", name: "İç Giyim", icon: "👙", count: "110" },
      { id: "swimwear", name: "Mayo ve Bikini", icon: "👙", count: "75" },
      { id: "formal-wear", name: "Resmi Giyim", icon: "🤵", count: "95" },
      { id: "casual-wear", name: "Günlük Giyim", icon: "👕", count: "300" },
      { id: "vintage-clothing", name: "Vintage Giyim", icon: "👗", count: "40" }
    ]
  },
  {
    id: "automotive",
    name: "Otomotiv",
    icon: "🚗",
    count: "950",
    subcategories: [
      { id: "cars", name: "Otomobiller", icon: "🚗", count: "320" },
      { id: "motorcycles", name: "Motosikletler", icon: "🏍️", count: "150" },
      { id: "trucks-vans", name: "Kamyon ve Minibüsler", icon: "🚚", count: "80" },
      { id: "car-parts", name: "Otomobil Yedek Parçaları", icon: "🔧", count: "180" },
      { id: "motorcycle-parts", name: "Motosiklet Yedek Parçaları", icon: "🏍️", count: "70" },
      { id: "car-accessories", name: "Otomobil Aksesuarları", icon: "🚗", count: "120" },
      { id: "car-electronics", name: "Araç Elektroniği", icon: "📻", count: "90" },
      { id: "tires-wheels", name: "Lastik ve Jant", icon: "🛞", count: "85" },
      { id: "car-care", name: "Araç Bakım Ürünleri", icon: "🧽", count: "60" },
      { id: "car-tools", name: "Araç Aletleri", icon: "🔧", count: "45" },
      { id: "car-audio", name: "Araç Ses Sistemleri", icon: "🎵", count: "55" },
      { id: "navigation", name: "Navigasyon Sistemleri", icon: "🗺️", count: "35" },
      { id: "car-security", name: "Araç Güvenlik Sistemleri", icon: "🔒", count: "40" },
      { id: "performance-parts", name: "Performans Parçaları", icon: "⚡", count: "50" },
      { id: "car-lighting", name: "Araç Aydınlatma", icon: "💡", count: "30" },
      { id: "car-interior", name: "Araç İç Aksesuarları", icon: "🪑", count: "65" },
      { id: "car-exterior", name: "Araç Dış Aksesuarları", icon: "🚗", count: "55" },
      { id: "commercial-vehicles", name: "Ticari Araçlar", icon: "🚛", count: "25" },
      { id: "classic-cars", name: "Klasik Otomobiller", icon: "🚗", count: "20" },
      { id: "electric-vehicles", name: "Elektrikli Araçlar", icon: "🔋", count: "15" }
    ]
  },
  {
    id: "sports-outdoor",
    name: "Spor & Outdoor",
    icon: "⚽",
    count: "1.1K",
    subcategories: [
      { id: "fitness-equipment", name: "Fitness Ekipmanları", icon: "🏋️", count: "180" },
      { id: "gym-equipment", name: "Spor Salonu Aletleri", icon: "💪", count: "120" },
      { id: "cardio-equipment", name: "Kardiyovasküler Aletler", icon: "🏃", count: "80" },
      { id: "weight-training", name: "Ağırlık Antrenman Aletleri", icon: "🏋️", count: "90" },
      { id: "yoga-pilates", name: "Yoga ve Pilates", icon: "🧘", count: "70" },
      { id: "team-sports", name: "Takım Sporları", icon: "⚽", count: "150" },
      { id: "football", name: "Futbol", icon: "⚽", count: "85" },
      { id: "basketball", name: "Basketbol", icon: "🏀", count: "60" },
      { id: "volleyball", name: "Voleybol", icon: "🏐", count: "40" },
      { id: "tennis", name: "Tenis", icon: "🎾", count: "55" },
      { id: "badminton", name: "Badminton", icon: "🏸", count: "35" },
      { id: "table-tennis", name: "Masa Tenisi", icon: "🏓", count: "30" },
      { id: "outdoor-sports", name: "Outdoor Sporlar", icon: "🏔️", count: "140" },
      { id: "camping", name: "Kamp Malzemeleri", icon: "⛺", count: "90" },
      { id: "hiking", name: "Doğa Yürüyüşü", icon: "🥾", count: "70" },
      { id: "cycling", name: "Bisiklet", icon: "🚴", count: "110" },
      { id: "running", name: "Koşu", icon: "🏃", count: "80" },
      { id: "swimming", name: "Yüzme", icon: "🏊", count: "60" },
      { id: "water-sports", name: "Su Sporları", icon: "🏄", count: "50" },
      { id: "winter-sports", name: "Kış Sporları", icon: "⛷️", count: "45" },
      { id: "fishing", name: "Balıkçılık", icon: "🎣", count: "65" },
      { id: "hunting", name: "Avcılık", icon: "🏹", count: "35" },
      { id: "martial-arts", name: "Dövüş Sporları", icon: "🥋", count: "40" },
      { id: "sports-apparel", name: "Spor Giyim", icon: "👕", count: "120" },
      { id: "sports-shoes", name: "Spor Ayakkabı", icon: "👟", count: "100" }
    ]
  },
  {
    id: "books-hobbies",
    name: "Kitap & Hobi",
    icon: "📚",
    count: "680",
    subcategories: [
      { id: "books", name: "Kitaplar", icon: "📖", count: "280" },
      { id: "fiction-books", name: "Roman ve Hikaye", icon: "📚", count: "120" },
      { id: "non-fiction", name: "Kişisel Gelişim", icon: "📖", count: "80" },
      { id: "educational-books", name: "Eğitim Kitapları", icon: "📚", count: "90" },
      { id: "children-books", name: "Çocuk Kitapları", icon: "📚", count: "70" },
      { id: "textbooks", name: "Ders Kitapları", icon: "📖", count: "60" },
      { id: "magazines", name: "Dergi ve Gazete", icon: "📰", count: "40" },
      { id: "comics", name: "Çizgi Roman", icon: "📚", count: "35" },
      { id: "art-crafts", name: "Sanat ve El Sanatları", icon: "🎨", count: "110" },
      { id: "painting", name: "Resim Malzemeleri", icon: "🎨", count: "50" },
      { id: "drawing", name: "Çizim Malzemeleri", icon: "✏️", count: "40" },
      { id: "crafting", name: "El İşi Malzemeleri", icon: "✂️", count: "60" },
      { id: "sewing", name: "Dikiş Malzemeleri", icon: "🧵", count: "35" },
      { id: "knitting", name: "Örgü Malzemeleri", icon: "🧶", count: "30" },
      { id: "collectibles", name: "Koleksiyon Eşyaları", icon: "🏆", count: "90" },
      { id: "coins", name: "Para Koleksiyonu", icon: "🪙", count: "25" },
      { id: "stamps", name: "Pul Koleksiyonu", icon: "📮", count: "20" },
      { id: "antiques", name: "Antika Eşyalar", icon: "🏺", count: "45" },
      { id: "board-games", name: "Masa Oyunları", icon: "🎲", count: "70" },
      { id: "puzzles", name: "Puzzle", icon: "🧩", count: "40" },
      { id: "card-games", name: "Kart Oyunları", icon: "🃏", count: "30" },
      { id: "model-kits", name: "Maket ve Model", icon: "✈️", count: "50" },
      { id: "educational-toys", name: "Eğitici Oyuncaklar", icon: "🧸", count: "60" },
      { id: "stationery", name: "Kırtasiye", icon: "✏️", count: "80" }
    ]
  },
  {
    id: "music-art",
    name: "Müzik & Sanat",
    icon: "🎵",
    count: "420",
    subcategories: [
      { id: "musical-instruments", name: "Müzik Aletleri", icon: "🎸", count: "180" },
      { id: "guitars", name: "Gitar", icon: "🎸", count: "70" },
      { id: "keyboards-pianos", name: "Klavye ve Piyano", icon: "🎹", count: "50" },
      { id: "drums", name: "Davul", icon: "🥁", count: "40" },
      { id: "wind-instruments", name: "Nefesli Çalgılar", icon: "🎺", count: "30" },
      { id: "string-instruments", name: "Telli Çalgılar", icon: "🎻", count: "25" },
      { id: "music-accessories", name: "Müzik Aksesuarları", icon: "🎵", count: "60" },
      { id: "audio-equipment", name: "Ses Ekipmanları", icon: "🎧", count: "80" },
      { id: "microphones", name: "Mikrofonlar", icon: "🎤", count: "35" },
      { id: "amplifiers", name: "Amfiler", icon: "🔊", count: "30" },
      { id: "recording-equipment", name: "Kayıt Ekipmanları", icon: "🎙️", count: "25" },
      { id: "dj-equipment", name: "DJ Ekipmanları", icon: "🎧", count: "40" },
      { id: "vinyl-records", name: "Plak", icon: "💿", count: "50" },
      { id: "cds-dvds", name: "CD ve DVD", icon: "💿", count: "35" },
      { id: "art-supplies", name: "Sanat Malzemeleri", icon: "🎨", count: "70" },
      { id: "canvas-paper", name: "Tuval ve Kağıt", icon: "🖼️", count: "25" },
      { id: "brushes-tools", name: "Fırça ve Aletler", icon: "🖌️", count: "30" },
      { id: "paints-colors", name: "Boya ve Renkler", icon: "🎨", count: "35" },
      { id: "sculpture-materials", name: "Heykel Malzemeleri", icon: "🗿", count: "15" },
      { id: "digital-art", name: "Dijital Sanat", icon: "💻", count: "20" },
      { id: "photography", name: "Fotoğrafçılık", icon: "📷", count: "40" },
      { id: "camera-accessories", name: "Kamera Aksesuarları", icon: "📸", count: "25" },
      { id: "lighting-equipment", name: "Aydınlatma Ekipmanları", icon: "💡", count: "20" },
      { id: "tripods-stands", name: "Tripod ve Standlar", icon: "📷", count: "15" }
    ]
  },
  {
    id: "other",
    name: "Diğer",
    icon: "📦",
    count: "890",
    subcategories: [
      { id: "services", name: "Hizmetler", icon: "🛠️", count: "200" },
      { id: "repair-services", name: "Tamir Hizmetleri", icon: "🔧", count: "80" },
      { id: "cleaning-services", name: "Temizlik Hizmetleri", icon: "🧽", count: "60" },
      { id: "delivery-services", name: "Teslimat Hizmetleri", icon: "🚚", count: "40" },
      { id: "professional-services", name: "Profesyonel Hizmetler", icon: "💼", count: "70" },
      { id: "education-services", name: "Eğitim Hizmetleri", icon: "📚", count: "50" },
      { id: "health-beauty", name: "Sağlık ve Güzellik", icon: "💄", count: "150" },
      { id: "cosmetics", name: "Kozmetik", icon: "💄", count: "80" },
      { id: "skincare", name: "Cilt Bakımı", icon: "🧴", count: "60" },
      { id: "haircare", name: "Saç Bakımı", icon: "💇", count: "40" },
      { id: "health-supplements", name: "Sağlık Ürünleri", icon: "💊", count: "50" },
      { id: "medical-equipment", name: "Medikal Ekipmanlar", icon: "🩺", count: "30" },
      { id: "baby-kids", name: "Bebek ve Çocuk", icon: "👶", count: "180" },
      { id: "baby-care", name: "Bebek Bakımı", icon: "🍼", count: "80" },
      { id: "baby-furniture", name: "Bebek Mobilyaları", icon: "🛏️", count: "60" },
      { id: "toys", name: "Oyuncaklar", icon: "🧸", count: "120" },
      { id: "educational-toys", name: "Eğitici Oyuncaklar", icon: "🎓", count: "50" },
      { id: "outdoor-toys", name: "Dış Mekan Oyuncakları", icon: "🏀", count: "40" },
      { id: "pets", name: "Evcil Hayvanlar", icon: "🐕", count: "120" },
      { id: "pet-food", name: "Evcil Hayvan Maması", icon: "🥘", count: "60" },
      { id: "pet-accessories", name: "Evcil Hayvan Aksesuarları", icon: "🦴", count: "50" },
      { id: "pet-care", name: "Evcil Hayvan Bakımı", icon: "🐾", count: "40" },
      { id: "office-supplies", name: "Ofis Malzemeleri", icon: "📎", count: "100" },
      { id: "business-equipment", name: "İş Ekipmanları", icon: "💼", count: "80" },
      { id: "industrial", name: "Endüstriyel", icon: "🏭", count: "60" },
      { id: "miscellaneous", name: "Çeşitli", icon: "📦", count: "90" }
    ]
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categoriesData.find(category => category.id === id);
};

export const getSubCategoryById = (categoryId: string, subCategoryId: string): SubCategory | undefined => {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subCategoryId);
};

export const getAllCategories = (): Category[] => {
  return categoriesData;
};

export const getCategoriesWithSubcategories = (): Category[] => {
  return categoriesData.filter(category => category.subcategories.length > 0);
};