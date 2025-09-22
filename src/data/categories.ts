export interface DynamicFormField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'number' | 'textarea' | 'checkbox' | 'radio' | 'car-selector';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  label?: string;
  description?: string;
  fieldType?: 'brand' | 'series' | 'model';
  dependsOn?: string;
  dependentValue?: string | number | boolean;
  unit?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SubCategory {
  id: string;
  name: string;
  icon?: string;
  count?: string;
  dynamicFields?: DynamicFormField[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: string;
  subcategories: SubCategory[];
  dynamicFields?: DynamicFormField[];
}

export const categoriesData: Category[] = [
  {
    id: "electronics",
    name: "Elektronik",
    icon: "📱",
    count: "2.5K",
    subcategories: [
      { 
        id: "smartphones", 
        name: "Akıllı Telefonlar", 
        icon: "📱", 
        count: "450",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "apple", label: "Apple" },
              { value: "samsung", label: "Samsung" },
              { value: "xiaomi", label: "Xiaomi" },
              { value: "huawei", label: "Huawei" },
              { value: "oppo", label: "Oppo" },
              { value: "vivo", label: "Vivo" },
              { value: "oneplus", label: "OnePlus" },
              { value: "google", label: "Google" },
              { value: "sony", label: "Sony" },
              { value: "lg", label: "LG" },
              { value: "motorola", label: "Motorola" },
              { value: "nokia", label: "Nokia" },
              { value: "realme", label: "Realme" },
              { value: "honor", label: "Honor" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "model",
            name: "Model",
            type: "text",
            required: true,
            placeholder: "Örn: iPhone 15 Pro, Galaxy S24",
            label: "Model"
          },
          {
            id: "storage",
            name: "Depolama",
            type: "select",
            required: true,
            label: "Depolama",
            options: [
              { value: "16gb", label: "16 GB" },
              { value: "32gb", label: "32 GB" },
              { value: "64gb", label: "64 GB" },
              { value: "128gb", label: "128 GB" },
              { value: "256gb", label: "256 GB" },
              { value: "512gb", label: "512 GB" },
              { value: "1tb", label: "1 TB" }
            ]
          },
          {
            id: "ram",
            name: "RAM",
            type: "select",
            required: true,
            label: "RAM",
            options: [
              { value: "2gb", label: "2 GB" },
              { value: "3gb", label: "3 GB" },
              { value: "4gb", label: "4 GB" },
              { value: "6gb", label: "6 GB" },
              { value: "8gb", label: "8 GB" },
              { value: "12gb", label: "12 GB" },
              { value: "16gb", label: "16 GB" },
              { value: "18gb", label: "18 GB" }
            ]
          },
          {
            id: "screen-size",
            name: "Ekran Boyutu",
            type: "select",
            required: false,
            label: "Ekran Boyutu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "4-5", label: "4.0 - 5.0 inç" },
              { value: "5-5.5", label: "5.0 - 5.5 inç" },
              { value: "5.5-6", label: "5.5 - 6.0 inç" },
              { value: "6-6.5", label: "6.0 - 6.5 inç" },
              { value: "6.5-7", label: "6.5 - 7.0 inç" },
              { value: "7+", label: "7.0 inç üzeri" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "gri", label: "Gri" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "mor", label: "Mor" },
              { value: "pembe", label: "Pembe" },
              { value: "altin", label: "Altın" },
              { value: "gumus", label: "Gümüş" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" },
              { value: "uzatilmis", label: "Uzatılmış Garanti" }
            ]
          }
        ]
      },
      { 
         id: "laptops", 
         name: "Dizüstü Bilgisayarlar", 
         icon: "💻", 
         count: "320",
         dynamicFields: [
           {
             id: "brand",
             name: "Marka",
             type: "select",
             required: true,
             label: "Marka",
             options: [
               { value: "apple", label: "Apple" },
               { value: "asus", label: "Asus" },
               { value: "acer", label: "Acer" },
               { value: "hp", label: "HP" },
               { value: "dell", label: "Dell" },
               { value: "lenovo", label: "Lenovo" },
               { value: "msi", label: "MSI" },
               { value: "samsung", label: "Samsung" },
               { value: "huawei", label: "Huawei" },
               { value: "microsoft", label: "Microsoft" },
               { value: "lg", label: "LG" },
               { value: "toshiba", label: "Toshiba" },
               { value: "sony", label: "Sony" },
               { value: "alienware", label: "Alienware" },
               { value: "diger", label: "Diğer" }
             ]
           },
           {
             id: "model",
             name: "Model",
             type: "text",
             required: true,
             placeholder: "Örn: MacBook Pro, ThinkPad X1",
             label: "Model"
           },
           {
             id: "processor",
             name: "İşlemci",
             type: "select",
             required: true,
             label: "İşlemci",
             options: [
               { value: "intel-i3", label: "Intel Core i3" },
               { value: "intel-i5", label: "Intel Core i5" },
               { value: "intel-i7", label: "Intel Core i7" },
               { value: "intel-i9", label: "Intel Core i9" },
               { value: "amd-ryzen3", label: "AMD Ryzen 3" },
               { value: "amd-ryzen5", label: "AMD Ryzen 5" },
               { value: "amd-ryzen7", label: "AMD Ryzen 7" },
               { value: "amd-ryzen9", label: "AMD Ryzen 9" },
               { value: "apple-m1", label: "Apple M1" },
               { value: "apple-m2", label: "Apple M2" },
               { value: "apple-m3", label: "Apple M3" },
               { value: "diger", label: "Diğer" }
             ]
           },
           {
             id: "ram",
             name: "RAM",
             type: "select",
             required: true,
             label: "RAM",
             options: [
               { value: "4gb", label: "4 GB" },
               { value: "8gb", label: "8 GB" },
               { value: "16gb", label: "16 GB" },
               { value: "32gb", label: "32 GB" },
               { value: "64gb", label: "64 GB" }
             ]
           },
           {
             id: "storage",
             name: "Depolama",
             type: "select",
             required: true,
             label: "Depolama",
             options: [
               { value: "128gb-ssd", label: "128 GB SSD" },
               { value: "256gb-ssd", label: "256 GB SSD" },
               { value: "512gb-ssd", label: "512 GB SSD" },
               { value: "1tb-ssd", label: "1 TB SSD" },
               { value: "2tb-ssd", label: "2 TB SSD" },
               { value: "500gb-hdd", label: "500 GB HDD" },
               { value: "1tb-hdd", label: "1 TB HDD" },
               { value: "2tb-hdd", label: "2 TB HDD" }
             ]
           },
           {
             id: "graphics",
             name: "Ekran Kartı",
             type: "select",
             required: false,
             label: "Ekran Kartı",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "integrated", label: "Entegre" },
               { value: "nvidia-gtx", label: "NVIDIA GTX Serisi" },
               { value: "nvidia-rtx", label: "NVIDIA RTX Serisi" },
               { value: "amd-radeon", label: "AMD Radeon" },
               { value: "intel-iris", label: "Intel Iris" }
             ]
           },
           {
             id: "screen-size",
             name: "Ekran Boyutu",
             type: "select",
             required: false,
             label: "Ekran Boyutu",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "11-13", label: "11-13 inç" },
               { value: "13-14", label: "13-14 inç" },
               { value: "14-15", label: "14-15 inç" },
               { value: "15-16", label: "15-16 inç" },
               { value: "16-17", label: "16-17 inç" },
               { value: "17+", label: "17 inç üzeri" }
             ]
           },
           {
             id: "condition",
             name: "Durum",
             type: "select",
             required: true,
             label: "Durum",
             options: [
               { value: "sifir", label: "Sıfır" },
               { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
               { value: "cok-iyi", label: "Çok İyi" },
               { value: "iyi", label: "İyi" },
               { value: "orta", label: "Orta" },
               { value: "hasarli", label: "Hasarlı" }
             ]
           },
           {
             id: "warranty",
             name: "Garanti Durumu",
             type: "select",
             required: false,
             label: "Garanti Durumu",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "var", label: "Garanti Var" },
               { value: "yok", label: "Garanti Yok" },
               { value: "uzatilmis", label: "Uzatılmış Garanti" }
             ]
           }
         ]
       },
      { 
         id: "tablets", 
         name: "Tabletler", 
         icon: "📱", 
         count: "180",
         dynamicFields: [
           {
             id: "brand",
             name: "Marka",
             type: "select",
             required: true,
             label: "Marka",
             options: [
               { value: "apple", label: "Apple" },
               { value: "samsung", label: "Samsung" },
               { value: "huawei", label: "Huawei" },
               { value: "xiaomi", label: "Xiaomi" },
               { value: "lenovo", label: "Lenovo" },
               { value: "microsoft", label: "Microsoft" },
               { value: "amazon", label: "Amazon" },
               { value: "google", label: "Google" },
               { value: "asus", label: "Asus" },
               { value: "lg", label: "LG" },
               { value: "sony", label: "Sony" },
               { value: "diger", label: "Diğer" }
             ]
           },
           {
             id: "model",
             name: "Model",
             type: "text",
             required: true,
             placeholder: "Örn: iPad Pro, Galaxy Tab S9",
             label: "Model"
           },
           {
             id: "screen-size",
             name: "Ekran Boyutu",
             type: "select",
             required: true,
             label: "Ekran Boyutu",
             options: [
               { value: "7-8", label: "7-8 inç" },
               { value: "8-9", label: "8-9 inç" },
               { value: "9-10", label: "9-10 inç" },
               { value: "10-11", label: "10-11 inç" },
               { value: "11-12", label: "11-12 inç" },
               { value: "12+", label: "12 inç üzeri" }
             ]
           },
           {
             id: "storage",
             name: "Depolama",
             type: "select",
             required: true,
             label: "Depolama",
             options: [
               { value: "16gb", label: "16 GB" },
               { value: "32gb", label: "32 GB" },
               { value: "64gb", label: "64 GB" },
               { value: "128gb", label: "128 GB" },
               { value: "256gb", label: "256 GB" },
               { value: "512gb", label: "512 GB" },
               { value: "1tb", label: "1 TB" }
             ]
           },
           {
             id: "operating-system",
             name: "İşletim Sistemi",
             type: "select",
             required: false,
             label: "İşletim Sistemi",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "ios", label: "iOS" },
               { value: "android", label: "Android" },
               { value: "windows", label: "Windows" },
               { value: "fire-os", label: "Fire OS" }
             ]
           },
           {
             id: "connectivity",
             name: "Bağlantı",
             type: "select",
             required: false,
             label: "Bağlantı",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "wifi", label: "Wi-Fi" },
               { value: "wifi-cellular", label: "Wi-Fi + Cellular" }
             ]
           },
           {
             id: "condition",
             name: "Durum",
             type: "select",
             required: true,
             label: "Durum",
             options: [
               { value: "sifir", label: "Sıfır" },
               { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
               { value: "cok-iyi", label: "Çok İyi" },
               { value: "iyi", label: "İyi" },
               { value: "orta", label: "Orta" },
               { value: "hasarli", label: "Hasarlı" }
             ]
           },
           {
             id: "warranty",
             name: "Garanti Durumu",
             type: "select",
             required: false,
             label: "Garanti Durumu",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "var", label: "Garanti Var" },
               { value: "yok", label: "Garanti Yok" },
               { value: "uzatilmis", label: "Uzatılmış Garanti" }
             ]
           }
         ]
       },
      { id: "desktop-computers", name: "Masaüstü Bilgisayarlar", icon: "🖥️", count: "150" },
      { id: "gaming-consoles", name: "Oyun Konsolları", icon: "🎮", count: "120" },
      { id: "smartwatches", name: "Akıllı Saatler", icon: "⌚", count: "95" },
      { id: "headphones", name: "Kulaklıklar", icon: "🎧", count: "200" },
      { id: "speakers", name: "Hoparlörler", icon: "🔊", count: "85" },
      { 
        id: "cameras", 
        name: "Kameralar", 
        icon: "📷", 
        count: "110",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "canon", label: "Canon" },
              { value: "nikon", label: "Nikon" },
              { value: "sony", label: "Sony" },
              { value: "fujifilm", label: "Fujifilm" },
              { value: "olympus", label: "Olympus" },
              { value: "panasonic", label: "Panasonic" },
              { value: "leica", label: "Leica" },
              { value: "pentax", label: "Pentax" },
              { value: "hasselblad", label: "Hasselblad" },
              { value: "gopro", label: "GoPro" },
              { value: "dji", label: "DJI" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "model",
            name: "Model",
            type: "text",
            required: true,
            placeholder: "Örn: EOS R5, A7 IV, X-T5",
            label: "Model"
          },
          {
            id: "camera-type",
            name: "Kamera Türü",
            type: "select",
            required: true,
            label: "Kamera Türü",
            options: [
              { value: "dslr", label: "DSLR" },
              { value: "mirrorless", label: "Mirrorless" },
              { value: "point-shoot", label: "Kompakt" },
              { value: "action", label: "Aksiyon Kamerası" },
              { value: "instant", label: "Anında Baskı" },
              { value: "film", label: "Film Kamera" },
              { value: "medium-format", label: "Orta Format" }
            ]
          },
          {
            id: "megapixel",
            name: "Megapiksel",
            type: "select",
            required: false,
            label: "Megapiksel",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "10-15", label: "10-15 MP" },
              { value: "16-20", label: "16-20 MP" },
              { value: "21-30", label: "21-30 MP" },
              { value: "31-40", label: "31-40 MP" },
              { value: "41-50", label: "41-50 MP" },
              { value: "50+", label: "50 MP üzeri" }
            ]
          },
          {
            id: "lens-mount",
            name: "Lens Bağlantısı",
            type: "select",
            required: false,
            label: "Lens Bağlantısı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "canon-ef", label: "Canon EF" },
              { value: "canon-rf", label: "Canon RF" },
              { value: "nikon-f", label: "Nikon F" },
              { value: "nikon-z", label: "Nikon Z" },
              { value: "sony-e", label: "Sony E" },
              { value: "sony-fe", label: "Sony FE" },
              { value: "fuji-x", label: "Fujifilm X" },
              { value: "micro-43", label: "Micro Four Thirds" },
              { value: "sabit-lens", label: "Sabit Lens" }
            ]
          },
          {
            id: "video-capability",
            name: "Video Özelliği",
            type: "select",
            required: false,
            label: "Video Özelliği",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "1080p", label: "Full HD (1080p)" },
              { value: "4k", label: "4K" },
              { value: "8k", label: "8K" },
              { value: "yok", label: "Video Yok" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" },
              { value: "uzatilmis", label: "Uzatılmış Garanti" }
            ]
          }
        ]
      },
      { 
         id: "tv-monitors", 
         name: "TV ve Monitörler", 
         icon: "📺", 
         count: "140",
         dynamicFields: [
           {
             id: "brand",
             name: "Marka",
             type: "select",
             required: true,
             label: "Marka",
             options: [
               { value: "samsung", label: "Samsung" },
               { value: "lg", label: "LG" },
               { value: "sony", label: "Sony" },
               { value: "tcl", label: "TCL" },
               { value: "hisense", label: "Hisense" },
               { value: "philips", label: "Philips" },
               { value: "panasonic", label: "Panasonic" },
               { value: "toshiba", label: "Toshiba" },
               { value: "xiaomi", label: "Xiaomi" },
               { value: "asus", label: "Asus" },
               { value: "acer", label: "Acer" },
               { value: "dell", label: "Dell" },
               { value: "hp", label: "HP" },
               { value: "benq", label: "BenQ" },
               { value: "aoc", label: "AOC" },
               { value: "diger", label: "Diğer" }
             ]
           },
           {
             id: "model",
             name: "Model",
             type: "text",
             required: true,
             placeholder: "Örn: QLED Q90C, OLED C3, UltraGear 27GP950",
             label: "Model"
           },
           {
             id: "device-type",
             name: "Cihaz Türü",
             type: "select",
             required: true,
             label: "Cihaz Türü",
             options: [
               { value: "tv", label: "Televizyon" },
               { value: "monitor", label: "Monitör" },
               { value: "smart-tv", label: "Smart TV" },
               { value: "gaming-monitor", label: "Oyuncu Monitörü" },
               { value: "professional-monitor", label: "Profesyonel Monitör" }
             ]
           },
           {
             id: "screen-size",
             name: "Ekran Boyutu",
             type: "select",
             required: true,
             label: "Ekran Boyutu",
             options: [
               { value: "19-22", label: "19-22 inç" },
               { value: "23-25", label: "23-25 inç" },
               { value: "26-28", label: "26-28 inç" },
               { value: "29-32", label: "29-32 inç" },
               { value: "33-40", label: "33-40 inç" },
               { value: "41-50", label: "41-50 inç" },
               { value: "51-60", label: "51-60 inç" },
               { value: "61-70", label: "61-70 inç" },
               { value: "71-80", label: "71-80 inç" },
               { value: "80+", label: "80 inç üzeri" }
             ]
           },
           {
             id: "resolution",
             name: "Çözünürlük",
             type: "select",
             required: true,
             label: "Çözünürlük",
             options: [
               { value: "hd", label: "HD (720p)" },
               { value: "full-hd", label: "Full HD (1080p)" },
               { value: "2k", label: "2K (1440p)" },
               { value: "4k", label: "4K (2160p)" },
               { value: "8k", label: "8K (4320p)" }
             ]
           },
           {
             id: "panel-type",
             name: "Panel Türü",
             type: "select",
             required: false,
             label: "Panel Türü",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "led", label: "LED" },
               { value: "oled", label: "OLED" },
               { value: "qled", label: "QLED" },
               { value: "mini-led", label: "Mini LED" },
               { value: "ips", label: "IPS" },
               { value: "va", label: "VA" },
               { value: "tn", label: "TN" }
             ]
           },
           {
             id: "refresh-rate",
             name: "Yenileme Hızı",
             type: "select",
             required: false,
             label: "Yenileme Hızı",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "60hz", label: "60 Hz" },
               { value: "75hz", label: "75 Hz" },
               { value: "120hz", label: "120 Hz" },
               { value: "144hz", label: "144 Hz" },
               { value: "165hz", label: "165 Hz" },
               { value: "240hz", label: "240 Hz" },
               { value: "360hz", label: "360 Hz" }
             ]
           },
           {
             id: "smart-features",
             name: "Akıllı Özellikler",
             type: "select",
             required: false,
             label: "Akıllı Özellikler",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "android-tv", label: "Android TV" },
               { value: "webos", label: "webOS" },
               { value: "tizen", label: "Tizen" },
               { value: "roku", label: "Roku" },
               { value: "fire-tv", label: "Fire TV" },
               { value: "yok", label: "Akıllı Özellik Yok" }
             ]
           },
           {
             id: "condition",
             name: "Durum",
             type: "select",
             required: true,
             label: "Durum",
             options: [
               { value: "sifir", label: "Sıfır" },
               { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
               { value: "cok-iyi", label: "Çok İyi" },
               { value: "iyi", label: "İyi" },
               { value: "orta", label: "Orta" },
               { value: "hasarli", label: "Hasarlı" }
             ]
           },
           {
             id: "warranty",
             name: "Garanti Durumu",
             type: "select",
             required: false,
             label: "Garanti Durumu",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "var", label: "Garanti Var" },
               { value: "yok", label: "Garanti Yok" },
               { value: "uzatilmis", label: "Uzatılmış Garanti" }
             ]
           }
         ]
       },
      { 
        id: "home-appliances", 
        name: "Ev Aletleri", 
        icon: "🏠", 
        count: "280",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "samsung", label: "Samsung" },
              { value: "lg", label: "LG" },
              { value: "bosch", label: "Bosch" },
              { value: "siemens", label: "Siemens" },
              { value: "whirlpool", label: "Whirlpool" },
              { value: "beko", label: "Beko" },
              { value: "arcelik", label: "Arçelik" },
              { value: "vestel", label: "Vestel" },
              { value: "gaggenau", label: "Gaggenau" },
              { value: "ge", label: "GE" },
              { value: "maytag", label: "Maytag" },
              { value: "electrolux", label: "Electrolux" },
              { value: "miele", label: "Miele" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "appliance-type",
            name: "Cihaz Türü",
            type: "select",
            required: true,
            label: "Cihaz Türü",
            options: [
              { value: "buzdolabi", label: "Buzdolabı" },
              { value: "camasir-makinesi", label: "Çamaşır Makinesi" },
              { value: "bulasik-makinesi", label: "Bulaşık Makinesi" },
              { value: "kurutma-makinesi", label: "Kurutma Makinesi" },
              { value: "firin", label: "Fırın" },
              { value: "mikrodalga", label: "Mikrodalga" },
              { value: "ocak", label: "Ocak" },
              { value: "davlumbaz", label: "Davlumbaz" },
              { value: "klima", label: "Klima" },
              { value: "supurge", label: "Süpürge" },
              { value: "su-isitici", label: "Su Isıtıcı" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "energy-class",
            name: "Enerji Sınıfı",
            type: "select",
            required: false,
            label: "Enerji Sınıfı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "a+++", label: "A+++" },
              { value: "a++", label: "A++" },
              { value: "a+", label: "A+" },
              { value: "a", label: "A" },
              { value: "b", label: "B" },
              { value: "c", label: "C" },
              { value: "d", label: "D" }
            ]
          },
          {
            id: "capacity",
            name: "Kapasite",
            type: "text",
            required: false,
            placeholder: "Örn: 8 kg, 500 lt, 60 cm",
            label: "Kapasite/Boyut"
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "beyaz", label: "Beyaz" },
              { value: "siyah", label: "Siyah" },
              { value: "gri", label: "Gri" },
              { value: "gumush", label: "Gümüş" },
              { value: "inox", label: "İnox" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" },
              { value: "uzatilmis", label: "Uzatılmış Garanti" }
            ]
          }
        ]
      },
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
      { 
        id: "furniture", 
        name: "Mobilya", 
        icon: "🪑", 
        count: "320",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "ikea", label: "IKEA" },
              { value: "west-elm", label: "West Elm" },
              { value: "ashley", label: "Ashley Furniture" },
              { value: "crate-barrel", label: "Crate & Barrel" },
              { value: "restoration-hardware", label: "Restoration Hardware" },
              { value: "article", label: "Article" },
              { value: "cb2", label: "CB2" },
              { value: "anthropologie", label: "Anthropologie" },
              { value: "la-z-boy", label: "La-Z-Boy" },
              { value: "best-home", label: "Best Home Furnishings" },
              { value: "copeland", label: "Copeland" },
              { value: "hooker", label: "Hooker Furniture" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "furniture-type",
            name: "Mobilya Türü",
            type: "select",
            required: true,
            label: "Mobilya Türü",
            options: [
              { value: "koltuk", label: "Koltuk" },
              { value: "masa", label: "Masa" },
              { value: "sandalye", label: "Sandalye" },
              { value: "dolap", label: "Dolap" },
              { value: "yatak", label: "Yatak" },
              { value: "komodin", label: "Komodin" },
              { value: "kitaplik", label: "Kitaplık" },
              { value: "tv-unitesi", label: "TV Ünitesi" },
              { value: "yemek-masasi", label: "Yemek Masası" },
              { value: "ofis-masasi", label: "Ofis Masası" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "material",
            name: "Malzeme",
            type: "select",
            required: false,
            label: "Malzeme",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "ahsap", label: "Ahşap" },
              { value: "metal", label: "Metal" },
              { value: "cam", label: "Cam" },
              { value: "plastik", label: "Plastik" },
              { value: "kumas", label: "Kumaş" },
              { value: "deri", label: "Deri" },
              { value: "mdf", label: "MDF" },
              { value: "lam", label: "Lam" },
              { value: "mermer", label: "Mermer" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "room",
            name: "Oda",
            type: "select",
            required: false,
            label: "Hangi Oda İçin",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "oturma-odasi", label: "Oturma Odası" },
              { value: "yatak-odasi", label: "Yatak Odası" },
              { value: "yemek-odasi", label: "Yemek Odası" },
              { value: "mutfak", label: "Mutfak" },
              { value: "ofis", label: "Ofis" },
              { value: "cocuk-odasi", label: "Çocuk Odası" },
              { value: "bahce", label: "Bahçe" },
              { value: "balkon", label: "Balkon" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "beyaz", label: "Beyaz" },
              { value: "siyah", label: "Siyah" },
              { value: "kahverengi", label: "Kahverengi" },
              { value: "gri", label: "Gri" },
              { value: "bej", label: "Bej" },
              { value: "mavi", label: "Mavi" },
              { value: "yesil", label: "Yeşil" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "sari", label: "Sarı" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "size",
            name: "Boyut",
            type: "text",
            required: false,
            placeholder: "Örn: 200x100x80 cm",
            label: "Boyut (En x Boy x Yükseklik)"
          }
        ]
      },
      { id: "bedroom-furniture", name: "Yatak Odası Mobilyaları", icon: "🛏️", count: "180" },
      { id: "living-room-furniture", name: "Oturma Odası Mobilyaları", icon: "🛋️", count: "150" },
      { id: "kitchen-furniture", name: "Mutfak Mobilyaları", icon: "🍽️", count: "120" },
      { id: "office-furniture", name: "Ofis Mobilyaları", icon: "🪑", count: "90" },
      { id: "outdoor-furniture", name: "Bahçe Mobilyaları", icon: "🌳", count: "75" },
      { id: "home-decor", name: "Ev Dekorasyonu", icon: "🖼️", count: "200" },
      { 
        id: "lighting", 
        name: "Aydınlatma", 
        icon: "💡", 
        count: "140",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "philips", label: "Philips" },
              { value: "osram", label: "Osram" },
              { value: "ikea", label: "IKEA" },
              { value: "west-elm", label: "West Elm" },
              { value: "restoration-hardware", label: "Restoration Hardware" },
              { value: "cb2", label: "CB2" },
              { value: "anthropologie", label: "Anthropologie" },
              { value: "crate-barrel", label: "Crate & Barrel" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "lighting-type",
            name: "Aydınlatma Türü",
            type: "select",
            required: true,
            label: "Aydınlatma Türü",
            options: [
              { value: "avize", label: "Avize" },
              { value: "sarkıt", label: "Sarkıt" },
              { value: "masa-lambasi", label: "Masa Lambası" },
              { value: "ayakli-lamba", label: "Ayaklı Lamba" },
              { value: "duvar-lambasi", label: "Duvar Lambası" },
              { value: "tavan-lambasi", label: "Tavan Lambası" },
              { value: "spot", label: "Spot" },
              { value: "led-serit", label: "LED Şerit" },
              { value: "gece-lambasi", label: "Gece Lambası" },
              { value: "bahce-aydinlatma", label: "Bahçe Aydınlatma" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "bulb-type",
            name: "Ampul Türü",
            type: "select",
            required: false,
            label: "Ampul Türü",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "led", label: "LED" },
              { value: "halojen", label: "Halojen" },
              { value: "floresan", label: "Floresan" },
              { value: "akkor", label: "Akkor" },
              { value: "akilli-ampul", label: "Akıllı Ampul" },
              { value: "dahili", label: "Dahili" }
            ]
          },
          {
            id: "power",
            name: "Güç",
            type: "select",
            required: false,
            label: "Güç (Watt)",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "5w-altı", label: "5W altı" },
              { value: "5-10w", label: "5-10W" },
              { value: "10-20w", label: "10-20W" },
              { value: "20-40w", label: "20-40W" },
              { value: "40-60w", label: "40-60W" },
              { value: "60-100w", label: "60-100W" },
              { value: "100w-ustu", label: "100W üstü" }
            ]
          },
          {
            id: "color-temperature",
            name: "Renk Sıcaklığı",
            type: "select",
            required: false,
            label: "Renk Sıcaklığı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "sicak-beyaz", label: "Sıcak Beyaz (2700K-3000K)" },
              { value: "dogal-beyaz", label: "Doğal Beyaz (3500K-4000K)" },
              { value: "soguk-beyaz", label: "Soğuk Beyaz (5000K-6500K)" },
              { value: "renkli", label: "Renkli" },
              { value: "ayarlanabilir", label: "Ayarlanabilir" }
            ]
          },
          {
            id: "room",
            name: "Oda",
            type: "select",
            required: false,
            label: "Hangi Oda İçin",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "oturma-odasi", label: "Oturma Odası" },
              { value: "yatak-odasi", label: "Yatak Odası" },
              { value: "yemek-odasi", label: "Yemek Odası" },
              { value: "mutfak", label: "Mutfak" },
              { value: "banyo", label: "Banyo" },
              { value: "koridor", label: "Koridor" },
              { value: "cocuk-odasi", label: "Çocuk Odası" },
              { value: "ofis", label: "Ofis" },
              { value: "bahce", label: "Bahçe" },
              { value: "balkon", label: "Balkon" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
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
      { 
        id: "womens-clothing", 
        name: "Kadın Giyim", 
        icon: "👗", 
        count: "800",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "zara", label: "Zara" },
              { value: "hm", label: "H&M" },
              { value: "mango", label: "Mango" },
              { value: "lcw", label: "LC Waikiki" },
              { value: "koton", label: "Koton" },
              { value: "defacto", label: "DeFacto" },
              { value: "pull-bear", label: "Pull & Bear" },
              { value: "bershka", label: "Bershka" },
              { value: "stradivarius", label: "Stradivarius" },
              { value: "nike", label: "Nike" },
              { value: "adidas", label: "Adidas" },
              { value: "puma", label: "Puma" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "clothing-type",
            name: "Giyim Türü",
            type: "select",
            required: true,
            label: "Giyim Türü",
            options: [
              { value: "elbise", label: "Elbise" },
              { value: "bluz", label: "Bluz" },
              { value: "gomlek", label: "Gömlek" },
              { value: "tisort", label: "T-shirt" },
              { value: "kazak", label: "Kazak" },
              { value: "hirka", label: "Hırka" },
              { value: "ceket", label: "Ceket" },
              { value: "mont", label: "Mont" },
              { value: "pantolon", label: "Pantolon" },
              { value: "jean", label: "Jean" },
              { value: "etek", label: "Etek" },
              { value: "sort", label: "Şort" },
              { value: "takim", label: "Takım" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Beden",
            type: "select",
            required: true,
            label: "Beden",
            options: [
              { value: "xs", label: "XS" },
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
              { value: "xxl", label: "XXL" },
              { value: "xxxl", label: "3XL" },
              { value: "34", label: "34" },
              { value: "36", label: "36" },
              { value: "38", label: "38" },
              { value: "40", label: "40" },
              { value: "42", label: "42" },
              { value: "44", label: "44" },
              { value: "46", label: "46" },
              { value: "48", label: "48" },
              { value: "50", label: "50" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "gri", label: "Gri" },
              { value: "lacivert", label: "Lacivert" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "mor", label: "Mor" },
              { value: "pembe", label: "Pembe" },
              { value: "kahverengi", label: "Kahverengi" },
              { value: "bej", label: "Bej" },
              { value: "desenli", label: "Desenli" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { 
        id: "mens-clothing", 
        name: "Erkek Giyim", 
        icon: "👔", 
        count: "650",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "zara", label: "Zara" },
              { value: "hm", label: "H&M" },
              { value: "lcw", label: "LC Waikiki" },
              { value: "koton", label: "Koton" },
              { value: "defacto", label: "DeFacto" },
              { value: "pull-bear", label: "Pull & Bear" },
              { value: "nike", label: "Nike" },
              { value: "adidas", label: "Adidas" },
              { value: "puma", label: "Puma" },
              { value: "lacoste", label: "Lacoste" },
              { value: "polo", label: "Polo Ralph Lauren" },
              { value: "tommy", label: "Tommy Hilfiger" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "clothing-type",
            name: "Giyim Türü",
            type: "select",
            required: true,
            label: "Giyim Türü",
            options: [
              { value: "gomlek", label: "Gömlek" },
              { value: "tisort", label: "T-shirt" },
              { value: "polo", label: "Polo" },
              { value: "kazak", label: "Kazak" },
              { value: "hirka", label: "Hırka" },
              { value: "ceket", label: "Ceket" },
              { value: "mont", label: "Mont" },
              { value: "pantolon", label: "Pantolon" },
              { value: "jean", label: "Jean" },
              { value: "sort", label: "Şort" },
              { value: "takim", label: "Takım" },
              { value: "yelek", label: "Yelek" },
              { value: "sweatshirt", label: "Sweatshirt" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Beden",
            type: "select",
            required: true,
            label: "Beden",
            options: [
              { value: "xs", label: "XS" },
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
              { value: "xxl", label: "XXL" },
              { value: "xxxl", label: "3XL" },
              { value: "38", label: "38" },
              { value: "40", label: "40" },
              { value: "42", label: "42" },
              { value: "44", label: "44" },
              { value: "46", label: "46" },
              { value: "48", label: "48" },
              { value: "50", label: "50" },
              { value: "52", label: "52" },
              { value: "54", label: "54" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "gri", label: "Gri" },
              { value: "lacivert", label: "Lacivert" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "kahverengi", label: "Kahverengi" },
              { value: "bej", label: "Bej" },
              { value: "desenli", label: "Desenli" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { id: "kids-clothing", name: "Çocuk Giyim", icon: "👶", count: "420" },
      { id: "baby-clothing", name: "Bebek Giyim", icon: "🍼", count: "280" },
      { 
        id: "shoes", 
        name: "Ayakkabı", 
        icon: "👟", 
        count: "380",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "nike", label: "Nike" },
              { value: "adidas", label: "Adidas" },
              { value: "puma", label: "Puma" },
              { value: "converse", label: "Converse" },
              { value: "vans", label: "Vans" },
              { value: "new-balance", label: "New Balance" },
              { value: "reebok", label: "Reebok" },
              { value: "fila", label: "Fila" },
              { value: "birkenstock", label: "Birkenstock" },
              { value: "crocs", label: "Crocs" },
              { value: "clarks", label: "Clarks" },
              { value: "timberland", label: "Timberland" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "shoe-type",
            name: "Ayakkabı Türü",
            type: "select",
            required: true,
            label: "Ayakkabı Türü",
            options: [
              { value: "spor", label: "Spor Ayakkabı" },
              { value: "sneaker", label: "Sneaker" },
              { value: "klasik", label: "Klasik Ayakkabı" },
              { value: "bot", label: "Bot" },
              { value: "topuklu", label: "Topuklu" },
              { value: "sandalet", label: "Sandalet" },
              { value: "terlik", label: "Terlik" },
              { value: "babet", label: "Babet" },
              { value: "loafer", label: "Loafer" },
              { value: "oxford", label: "Oxford" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Numara",
            type: "select",
            required: true,
            label: "Numara",
            options: [
              { value: "35", label: "35" },
              { value: "36", label: "36" },
              { value: "37", label: "37" },
              { value: "38", label: "38" },
              { value: "39", label: "39" },
              { value: "40", label: "40" },
              { value: "41", label: "41" },
              { value: "42", label: "42" },
              { value: "43", label: "43" },
              { value: "44", label: "44" },
              { value: "45", label: "45" },
              { value: "46", label: "46" },
              { value: "47", label: "47" },
              { value: "48", label: "48" }
            ]
          },
          {
            id: "gender",
            name: "Cinsiyet",
            type: "select",
            required: true,
            label: "Cinsiyet",
            options: [
              { value: "kadin", label: "Kadın" },
              { value: "erkek", label: "Erkek" },
              { value: "unisex", label: "Unisex" },
              { value: "cocuk", label: "Çocuk" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "gri", label: "Gri" },
              { value: "kahverengi", label: "Kahverengi" },
              { value: "lacivert", label: "Lacivert" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "pembe", label: "Pembe" },
              { value: "bej", label: "Bej" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { id: "womens-shoes", name: "Kadın Ayakkabı", icon: "👠", count: "200" },
      { id: "mens-shoes", name: "Erkek Ayakkabı", icon: "👞", count: "150" },
      { id: "kids-shoes", name: "Çocuk Ayakkabı", icon: "👟", count: "120" },
      { id: "sports-shoes", name: "Spor Ayakkabı", icon: "👟", count: "180" },
      { 
        id: "bags-accessories", 
        name: "Çanta ve Aksesuarlar", 
        icon: "👜", 
        count: "250",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "louis-vuitton", label: "Louis Vuitton" },
              { value: "gucci", label: "Gucci" },
              { value: "prada", label: "Prada" },
              { value: "chanel", label: "Chanel" },
              { value: "hermes", label: "Hermès" },
              { value: "coach", label: "Coach" },
              { value: "michael-kors", label: "Michael Kors" },
              { value: "kate-spade", label: "Kate Spade" },
              { value: "furla", label: "Furla" },
              { value: "zara", label: "Zara" },
              { value: "hm", label: "H&M" },
              { value: "mango", label: "Mango" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "product-type",
            name: "Ürün Türü",
            type: "select",
            required: true,
            label: "Ürün Türü",
            options: [
              { value: "el-cantasi", label: "El Çantası" },
              { value: "sirt-cantasi", label: "Sırt Çantası" },
              { value: "omuz-cantasi", label: "Omuz Çantası" },
              { value: "cuzdan", label: "Cüzdan" },
              { value: "clutch", label: "Clutch" },
              { value: "bel-cantasi", label: "Bel Çantası" },
              { value: "laptop-cantasi", label: "Laptop Çantası" },
              { value: "seyahat-cantasi", label: "Seyahat Çantası" },
              { value: "kemer", label: "Kemer" },
              { value: "sapka", label: "Şapka" },
              { value: "atki", label: "Atkı" },
              { value: "eldiven", label: "Eldiven" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "material",
            name: "Malzeme",
            type: "select",
            required: false,
            label: "Malzeme",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "deri", label: "Deri" },
              { value: "suni-deri", label: "Suni Deri" },
              { value: "kanvas", label: "Kanvas" },
              { value: "nylon", label: "Nylon" },
              { value: "polyester", label: "Polyester" },
              { value: "pamuk", label: "Pamuk" },
              { value: "yun", label: "Yün" },
              { value: "metal", label: "Metal" },
              { value: "plastik", label: "Plastik" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "kahverengi", label: "Kahverengi" },
              { value: "bej", label: "Bej" },
              { value: "lacivert", label: "Lacivert" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "pembe", label: "Pembe" },
              { value: "gri", label: "Gri" },
              { value: "altin", label: "Altın" },
              { value: "gumus", label: "Gümüş" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { id: "handbags", name: "El Çantaları", icon: "👜", count: "140" },
      { id: "backpacks", name: "Sırt Çantaları", icon: "🎒", count: "90" },
      { id: "wallets", name: "Cüzdanlar", icon: "💳", count: "70" },
      { 
        id: "jewelry", 
        name: "Takı ve Mücevher", 
        icon: "💍", 
        count: "160",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "tiffany", label: "Tiffany & Co." },
              { value: "cartier", label: "Cartier" },
              { value: "bulgari", label: "Bulgari" },
              { value: "pandora", label: "Pandora" },
              { value: "swarovski", label: "Swarovski" },
              { value: "atasay", label: "Atasay" },
              { value: "altinbas", label: "Altınbaş" },
              { value: "zen-pirlanta", label: "Zen Pırlanta" },
              { value: "gumush", label: "Gümüş" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "jewelry-type",
            name: "Takı Türü",
            type: "select",
            required: true,
            label: "Takı Türü",
            options: [
              { value: "yuzuk", label: "Yüzük" },
              { value: "kolye", label: "Kolye" },
              { value: "kupe", label: "Küpe" },
              { value: "bilezik", label: "Bilezik" },
              { value: "saat", label: "Saat" },
              { value: "broş", label: "Broş" },
              { value: "halhal", label: "Halhal" },
              { value: "piercing", label: "Piercing" },
              { value: "takim", label: "Takım" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "material",
            name: "Malzeme",
            type: "select",
            required: true,
            label: "Malzeme",
            options: [
              { value: "altin", label: "Altın" },
              { value: "gumus", label: "Gümüş" },
              { value: "platin", label: "Platin" },
              { value: "pirlanta", label: "Pırlanta" },
              { value: "zumrut", label: "Zümrüt" },
              { value: "safir", label: "Safir" },
              { value: "yakut", label: "Yakut" },
              { value: "inci", label: "İnci" },
              { value: "kristal", label: "Kristal" },
              { value: "celik", label: "Çelik" },
              { value: "titanyum", label: "Titanyum" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "gender",
            name: "Cinsiyet",
            type: "select",
            required: false,
            label: "Cinsiyet",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "kadin", label: "Kadın" },
              { value: "erkek", label: "Erkek" },
              { value: "unisex", label: "Unisex" },
              { value: "cocuk", label: "Çocuk" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
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
      { 
        id: "cars", 
        name: "Otomobiller", 
        icon: "🚗", 
        count: "320",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "car-selector",
            required: true,
            label: "Marka",
            fieldType: "brand"
          },
          {
            id: "series",
            name: "Seri",
            type: "car-selector",
            required: true,
            label: "Seri",
            fieldType: "series",
            dependsOn: "brand"
          },
          {
            id: "model",
            name: "Model",
            type: "text",
            required: true,
            placeholder: "Örn: Focus 1.6 TDCi, Golf 1.4 TSI",
            label: "Model"
          },
          {
            id: "body-type",
            name: "Kasa Tipi",
            type: "select",
            required: true,
            label: "Kasa Tipi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "sedan", label: "Sedan" },
              { value: "hatchback", label: "Hatchback" },
              { value: "suv", label: "SUV" },
              { value: "coupe", label: "Coupe" },
              { value: "cabriolet", label: "Cabriolet" },
              { value: "station-wagon", label: "Station Wagon" },
              { value: "pickup", label: "Pickup" },
              { value: "minivan", label: "Minivan" }
            ]
          },
          {
            id: "year",
            name: "Model Yılı",
            type: "select",
            required: false,
            label: "Model Yılı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "2024-2025", label: "2024 - 2025" },
              { value: "2022-2023", label: "2022 - 2023" },
              { value: "2020-2021", label: "2020 - 2021" },
              { value: "2018-2019", label: "2018 - 2019" },
              { value: "2016-2017", label: "2016 - 2017" },
              { value: "2014-2015", label: "2014 - 2015" },
              { value: "2012-2013", label: "2012 - 2013" },
              { value: "2010-2011", label: "2010 - 2011" },
              { value: "2008-2009", label: "2008 - 2009" },
              { value: "2006-2007", label: "2006 - 2007" },
              { value: "2004-2005", label: "2004 - 2005" },
              { value: "2002-2003", label: "2002 - 2003" },
              { value: "2000-2001", label: "2000 - 2001" },
              { value: "1995-1999", label: "1995 - 1999" },
              { value: "1990-1994", label: "1990 - 1994" },
              { value: "1985-1989", label: "1985 - 1989" },
              { value: "1980-1984", label: "1980 - 1984" },
              { value: "1975-1979", label: "1975 - 1979" },
              { value: "1970-1974", label: "1970 - 1974" },
              { value: "1970-oncesi", label: "1970 öncesi" }
            ]
          },

          {
            id: "mileage",
            name: "Kilometre",
            type: "select",
            required: false,
            label: "Kilometre",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "0-5000", label: "0 - 5.000 km" },
              { value: "5000-10000", label: "5.000 - 10.000 km" },
              { value: "10000-20000", label: "10.000 - 20.000 km" },
              { value: "20000-30000", label: "20.000 - 30.000 km" },
              { value: "30000-50000", label: "30.000 - 50.000 km" },
              { value: "50000-75000", label: "50.000 - 75.000 km" },
              { value: "75000-100000", label: "75.000 - 100.000 km" },
              { value: "100000-150000", label: "100.000 - 150.000 km" },
              { value: "150000-200000", label: "150.000 - 200.000 km" },
              { value: "200000-300000", label: "200.000 - 300.000 km" },
              { value: "300000+", label: "300.000 km üzeri" }
            ]
          },
          {
            id: "fuel-type",
            name: "Yakıt Türü",
            type: "select",
            required: true,
            label: "Yakıt Türü",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "benzin", label: "Benzin" },
              { value: "dizel", label: "Dizel" },
              { value: "hybrid", label: "Hybrid" },
              { value: "elektrik", label: "Elektrik" },
              { value: "lpg", label: "LPG" },
              { value: "cng", label: "CNG" }
            ]
          },
          {
            id: "transmission",
            name: "Vites Türü",
            type: "select",
            required: true,
            label: "Vites Türü",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "manuel", label: "Manuel" },
              { value: "otomatik", label: "Otomatik" },
              { value: "yarimotomatik", label: "Yarı Otomatik" }
            ]
          },

          {
            id: "color",
            name: "Renk",
            type: "select",
            required: true,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "beyaz", label: "Beyaz" },
              { value: "siyah", label: "Siyah" },
              { value: "gri", label: "Gri" },
              { value: "gumus", label: "Gümüş" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "turuncu", label: "Turuncu" },
              { value: "mor", label: "Mor" },
              { value: "kahverengi", label: "Kahverengi" },
              { value: "diger", label: "Diğer" }
            ]
          },

          {
            id: "exchange",
            name: "Takas",
            type: "select",
            required: false,
            label: "Takas",
            options: [
              { value: "hayir", label: "Hayır" },
              { value: "evet", label: "Evet" }
            ]
          },


          {
            id: "features",
            name: "Özellikler",
            type: "textarea",
            required: false,
            placeholder: "Araçta bulunan özel özellikler, donanımlar vb. (Örn: Sunroof, Deri Döşeme, Navigasyon, Park Sensörü...)",
            label: "Özellikler"
          }
        ]
      },
      { 
        id: "motorcycles", 
        name: "Motosikletler", 
        icon: "🏍️", 
        count: "150",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "honda", label: "Honda" },
              { value: "yamaha", label: "Yamaha" },
              { value: "kawasaki", label: "Kawasaki" },
              { value: "suzuki", label: "Suzuki" },
              { value: "bmw", label: "BMW" },
              { value: "ducati", label: "Ducati" },
              { value: "ktm", label: "KTM" },
              { value: "harley-davidson", label: "Harley-Davidson" },
              { value: "aprilia", label: "Aprilia" },
              { value: "triumph", label: "Triumph" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "series",
            name: "Seri",
            type: "select",
            required: true,
            label: "Seri",
            options: [
              { value: "cbr", label: "CBR" },
              { value: "ninja", label: "Ninja" },
              { value: "r", label: "R Serisi" },
              { value: "gs", label: "GS" },
              { value: "mt", label: "MT" },
              { value: "z", label: "Z Serisi" },
              { value: "duke", label: "Duke" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "year",
            name: "Model Yılı",
            type: "number",
            required: true,
            label: "Model Yılı",
            placeholder: "Model yılını giriniz",
            min: 1900,
            max: 2025
          },
          {
            id: "engine-size",
            name: "Motor Hacmi",
            type: "select",
            required: true,
            label: "Motor Hacmi",
            options: [
              { value: "50cc", label: "50cc" },
              { value: "125cc", label: "125cc" },
              { value: "150cc", label: "150cc" },
              { value: "200cc", label: "200cc" },
              { value: "250cc", label: "250cc" },
              { value: "300cc", label: "300cc" },
              { value: "400cc", label: "400cc" },
              { value: "500cc", label: "500cc" },
              { value: "600cc", label: "600cc" },
              { value: "750cc", label: "750cc" },
              { value: "1000cc", label: "1000cc" },
              { value: "1200cc", label: "1200cc" },
              { value: "1300cc+", label: "1300cc+" }
            ]
          },
          {
            id: "mileage",
            name: "Kilometre",
            type: "number",
            required: true,
            label: "Kilometre",
            placeholder: "Kilometre değerini giriniz",
            min: 0,
            unit: "km"
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "mavi", label: "Mavi" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "turuncu", label: "Turuncu" },
              { value: "gri", label: "Gri" },
              { value: "mor", label: "Mor" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" },
              { value: "uzatilmis", label: "Uzatılmış Garanti" }
            ]
          },
          {
            id: "exchange",
            name: "Takas",
            type: "select",
            required: false,
            label: "Takas",
            options: [
              { value: "hayir", label: "Hayır" },
              { value: "evet", label: "Evet" }
            ]
          }
        ]
      },
      { 
        id: "trucks-vans", 
        name: "Kamyon ve Minibüsler", 
        icon: "🚚", 
        count: "80",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "ford", label: "Ford" },
              { value: "mercedes", label: "Mercedes" },
              { value: "volkswagen", label: "Volkswagen" },
              { value: "iveco", label: "Iveco" },
              { value: "man", label: "MAN" },
              { value: "scania", label: "Scania" },
              { value: "volvo", label: "Volvo" },
              { value: "daf", label: "DAF" },
              { value: "renault", label: "Renault" },
              { value: "isuzu", label: "Isuzu" },
              { value: "mitsubishi", label: "Mitsubishi" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "series",
            name: "Seri",
            type: "select",
            required: true,
            label: "Seri",
            options: [
              { value: "transit", label: "Transit" },
              { value: "sprinter", label: "Sprinter" },
              { value: "crafter", label: "Crafter" },
              { value: "daily", label: "Daily" },
              { value: "boxer", label: "Boxer" },
              { value: "ducato", label: "Ducato" },
              { value: "master", label: "Master" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "vehicle-type",
            name: "Araç Türü",
            type: "select",
            required: true,
            label: "Araç Türü",
            options: [
              { value: "kamyon", label: "Kamyon" },
              { value: "kamyonet", label: "Kamyonet" },
              { value: "minibus", label: "Minibüs" },
              { value: "panelvan", label: "Panel Van" },
              { value: "pickup", label: "Pickup" },
              { value: "cekici", label: "Çekici" },
              { value: "dorse", label: "Dorse" }
            ]
          },
          {
            id: "year",
            name: "Model Yılı",
            type: "number",
            required: true,
            label: "Model Yılı",
            placeholder: "Model yılını giriniz",
            min: 1900,
            max: 2025,
          },
          {
            id: "mileage",
            name: "Kilometre",
            type: "number",
            required: true,
            label: "Kilometre",
            placeholder: "Kilometre giriniz",
            min: 0,
            unit: "km"
          },
          {
            id: "fuel-type",
            name: "Yakıt Türü",
            type: "select",
            required: true,
            label: "Yakıt Türü",
            options: [
              { value: "dizel", label: "Dizel" },
              { value: "benzin", label: "Benzin" },
              { value: "lpg", label: "LPG" },
              { value: "elektrik", label: "Elektrik" },
              { value: "hybrid", label: "Hybrid" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { 
        id: "car-parts", 
        name: "Otomobil Yedek Parçaları", 
        icon: "🔧", 
        count: "180",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Araç Markası",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "toyota", label: "Toyota" },
              { value: "volkswagen", label: "Volkswagen" },
              { value: "ford", label: "Ford" },
              { value: "renault", label: "Renault" },
              { value: "fiat", label: "Fiat" },
              { value: "hyundai", label: "Hyundai" },
              { value: "opel", label: "Opel" },
              { value: "peugeot", label: "Peugeot" },
              { value: "bmw", label: "BMW" },
              { value: "mercedes", label: "Mercedes" },
              { value: "audi", label: "Audi" },
              { value: "honda", label: "Honda" },
              { value: "nissan", label: "Nissan" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "part-type",
            name: "Parça Türü",
            type: "select",
            required: true,
            label: "Parça Türü",
            options: [
              { value: "motor-parcalari", label: "Motor Parçaları" },
              { value: "fren-sistemi", label: "Fren Sistemi" },
              { value: "amortisör", label: "Amortisör" },
              { value: "elektrik-parcalari", label: "Elektrik Parçaları" },
              { value: "kaporta-parcalari", label: "Kaporta Parçaları" },
              { value: "ic-aksesuar", label: "İç Aksesuar" },
              { value: "dis-aksesuar", label: "Dış Aksesuar" },
              { value: "lastik-jant", label: "Lastik ve Jant" },
              { value: "egzoz-sistemi", label: "Egzoz Sistemi" },
              { value: "klima-sistemi", label: "Klima Sistemi" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "compatibility",
            name: "Uyumluluk",
            type: "textarea",
            required: false,
            placeholder: "Hangi araç modelleri ile uyumlu (Örn: Golf 7, Passat B8, Focus 3)",
            label: "Uyumlu Araç Modelleri"
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
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
      { 
        id: "fitness-equipment", 
        name: "Fitness Ekipmanları", 
        icon: "🏋️", 
        count: "180",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "life-fitness", label: "Life Fitness" },
              { value: "technogym", label: "Technogym" },
              { value: "precor", label: "Precor" },
              { value: "matrix", label: "Matrix" },
              { value: "cybex", label: "Cybex" },
              { value: "nautilus", label: "Nautilus" },
              { value: "bowflex", label: "Bowflex" },
              { value: "nordictrack", label: "NordicTrack" },
              { value: "proform", label: "ProForm" },
              { value: "sole", label: "Sole" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "equipment-type",
            name: "Ekipman Türü",
            type: "select",
            required: true,
            label: "Ekipman Türü",
            options: [
              { value: "treadmill", label: "Koşu Bandı" },
              { value: "elliptical", label: "Eliptik" },
              { value: "exercise-bike", label: "Egzersiz Bisikleti" },
              { value: "rowing-machine", label: "Kürek Makinesi" },
              { value: "multi-gym", label: "Çok Fonksiyonlu Spor Aleti" },
              { value: "weight-bench", label: "Ağırlık Sehpası" },
              { value: "dumbbells", label: "Dambıl" },
              { value: "barbell", label: "Halter" },
              { value: "kettlebell", label: "Kettlebell" },
              { value: "resistance-bands", label: "Direnç Bandı" },
              { value: "yoga-mat", label: "Yoga Matı" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "weight-capacity",
            name: "Ağırlık Kapasitesi",
            type: "select",
            required: false,
            label: "Ağırlık Kapasitesi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "50kg", label: "50 kg" },
              { value: "100kg", label: "100 kg" },
              { value: "150kg", label: "150 kg" },
              { value: "200kg", label: "200 kg" },
              { value: "250kg", label: "250 kg" },
              { value: "300kg+", label: "300 kg+" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { id: "gym-equipment", name: "Spor Salonu Aletleri", icon: "💪", count: "120" },
      { id: "cardio-equipment", name: "Kardiyovasküler Aletler", icon: "🏃", count: "80" },
      { id: "weight-training", name: "Ağırlık Antrenman Aletleri", icon: "🏋️", count: "90" },
      { id: "yoga-pilates", name: "Yoga ve Pilates", icon: "🧘", count: "70" },
      { 
        id: "team-sports", 
        name: "Takım Sporları", 
        icon: "⚽", 
        count: "150",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "nike", label: "Nike" },
              { value: "adidas", label: "Adidas" },
              { value: "puma", label: "Puma" },
              { value: "under-armour", label: "Under Armour" },
              { value: "wilson", label: "Wilson" },
              { value: "spalding", label: "Spalding" },
              { value: "molten", label: "Molten" },
              { value: "mikasa", label: "Mikasa" },
              { value: "select", label: "Select" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "sport-type",
            name: "Spor Türü",
            type: "select",
            required: true,
            label: "Spor Türü",
            options: [
              { value: "futbol", label: "Futbol" },
              { value: "basketbol", label: "Basketbol" },
              { value: "voleybol", label: "Voleybol" },
              { value: "hentbol", label: "Hentbol" },
              { value: "amerikan-futbolu", label: "Amerikan Futbolu" },
              { value: "rugby", label: "Rugby" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "product-type",
            name: "Ürün Türü",
            type: "select",
            required: true,
            label: "Ürün Türü",
            options: [
              { value: "top", label: "Top" },
              { value: "forma", label: "Forma" },
              { value: "ayakkabi", label: "Ayakkabı" },
              { value: "koruyucu", label: "Koruyucu Ekipman" },
              { value: "kale", label: "Kale" },
              { value: "file", label: "File" },
              { value: "antrenman", label: "Antrenman Malzemesi" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Beden/Boyut",
            type: "select",
            required: false,
            label: "Beden/Boyut",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "xs", label: "XS" },
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
              { value: "xxl", label: "XXL" },
              { value: "3xl", label: "3XL" },
              { value: "boyut-3", label: "Boyut 3" },
              { value: "boyut-4", label: "Boyut 4" },
              { value: "boyut-5", label: "Boyut 5" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { id: "football", name: "Futbol", icon: "⚽", count: "85" },
      { id: "basketball", name: "Basketbol", icon: "🏀", count: "60" },
      { id: "volleyball", name: "Voleybol", icon: "🏐", count: "40" },
      { id: "tennis", name: "Tenis", icon: "🎾", count: "55" },
      { id: "badminton", name: "Badminton", icon: "🏸", count: "35" },
      { id: "table-tennis", name: "Masa Tenisi", icon: "🏓", count: "30" },
      { 
        id: "outdoor-sports", 
        name: "Outdoor Sporlar", 
        icon: "🏔️", 
        count: "140",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "the-north-face", label: "The North Face" },
              { value: "patagonia", label: "Patagonia" },
              { value: "columbia", label: "Columbia" },
              { value: "salomon", label: "Salomon" },
              { value: "merrell", label: "Merrell" },
              { value: "mammut", label: "Mammut" },
              { value: "black-diamond", label: "Black Diamond" },
              { value: "osprey", label: "Osprey" },
              { value: "deuter", label: "Deuter" },
              { value: "msr", label: "MSR" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "activity-type",
            name: "Aktivite Türü",
            type: "select",
            required: true,
            label: "Aktivite Türü",
            options: [
              { value: "kamp", label: "Kamp" },
              { value: "trekking", label: "Trekking" },
              { value: "tirmanma", label: "Tırmanma" },
              { value: "bisiklet", label: "Bisiklet" },
              { value: "kosu", label: "Koşu" },
              { value: "yuzme", label: "Yüzme" },
              { value: "kis-sporlari", label: "Kış Sporları" },
              { value: "balikcilik", label: "Balıkçılık" },
              { value: "avcilik", label: "Avcılık" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "product-type",
            name: "Ürün Türü",
            type: "select",
            required: true,
            label: "Ürün Türü",
            options: [
              { value: "cadir", label: "Çadır" },
              { value: "uyku-tulumu", label: "Uyku Tulumu" },
              { value: "sirt-cantasi", label: "Sırt Çantası" },
              { value: "ayakkabi", label: "Outdoor Ayakkabı" },
              { value: "giyim", label: "Outdoor Giyim" },
              { value: "ekipman", label: "Teknik Ekipman" },
              { value: "navigasyon", label: "Navigasyon" },
              { value: "aydinlatma", label: "Aydınlatma" },
              { value: "pisirme", label: "Pişirme Ekipmanı" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Beden/Boyut",
            type: "select",
            required: false,
            label: "Beden/Boyut",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "xs", label: "XS" },
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
              { value: "xxl", label: "XXL" },
              { value: "1-kisi", label: "1 Kişilik" },
              { value: "2-kisi", label: "2 Kişilik" },
              { value: "3-kisi", label: "3 Kişilik" },
              { value: "4-kisi", label: "4+ Kişilik" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
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
      { 
        id: "sports-apparel", 
        name: "Spor Giyim", 
        icon: "👕", 
        count: "120",
        dynamicFields: [
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: true,
            label: "Marka",
            options: [
              { value: "nike", label: "Nike" },
              { value: "adidas", label: "Adidas" },
              { value: "puma", label: "Puma" },
              { value: "under-armour", label: "Under Armour" },
              { value: "reebok", label: "Reebok" },
              { value: "new-balance", label: "New Balance" },
              { value: "asics", label: "Asics" },
              { value: "fila", label: "Fila" },
              { value: "champion", label: "Champion" },
              { value: "kappa", label: "Kappa" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "clothing-type",
            name: "Giyim Türü",
            type: "select",
            required: true,
            label: "Giyim Türü",
            options: [
              { value: "tisort", label: "Tişört" },
              { value: "esofman", label: "Eşofman" },
              { value: "sort", label: "Şort" },
              { value: "tayt", label: "Tayt" },
              { value: "sweatshirt", label: "Sweatshirt" },
              { value: "hoodie", label: "Hoodie" },
              { value: "tank-top", label: "Tank Top" },
              { value: "spor-sutyen", label: "Spor Sütyeni" },
              { value: "mont", label: "Spor Mont" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Beden",
            type: "select",
            required: true,
            label: "Beden",
            options: [
              { value: "xs", label: "XS" },
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
              { value: "xxl", label: "XXL" },
              { value: "3xl", label: "3XL" }
            ]
          },
          {
            id: "gender",
            name: "Cinsiyet",
            type: "select",
            required: true,
            label: "Cinsiyet",
            options: [
              { value: "kadin", label: "Kadın" },
              { value: "erkek", label: "Erkek" },
              { value: "unisex", label: "Unisex" },
              { value: "cocuk", label: "Çocuk" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "beyaz", label: "Beyaz" },
              { value: "gri", label: "Gri" },
              { value: "lacivert", label: "Lacivert" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "mor", label: "Mor" },
              { value: "pembe", label: "Pembe" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          }
        ]
      },
      { id: "sports-shoes", name: "Spor Ayakkabı", icon: "👟", count: "100" }
    ]
  },
  {
    id: "books-hobbies",
    name: "Kitap & Hobi",
    icon: "📚",
    count: "680",
    subcategories: [
      { 
        id: "books", 
        name: "Kitaplar", 
        icon: "📖", 
        count: "280",
        dynamicFields: [
          {
            id: "category",
            name: "Kitap Kategorisi",
            type: "select",
            required: true,
            label: "Kitap Kategorisi",
            options: [
              { value: "roman", label: "Roman" },
              { value: "hikaye", label: "Hikaye" },
              { value: "siir", label: "Şiir" },
              { value: "deneme", label: "Deneme" },
              { value: "biyografi", label: "Biyografi" },
              { value: "tarih", label: "Tarih" },
              { value: "felsefe", label: "Felsefe" },
              { value: "bilim", label: "Bilim" },
              { value: "sanat", label: "Sanat" },
              { value: "din", label: "Din" },
              { value: "cocuk", label: "Çocuk" },
              { value: "egitim", label: "Eğitim" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "author",
            name: "Yazar",
            type: "text",
            required: true,
            placeholder: "Örn: Orhan Pamuk, Sabahattin Ali",
            label: "Yazar"
          },
          {
            id: "publisher",
            name: "Yayınevi",
            type: "text",
            required: false,
            placeholder: "Örn: İş Bankası Kültür Yayınları",
            label: "Yayınevi"
          },
          {
            id: "language",
            name: "Dil",
            type: "select",
            required: true,
            label: "Dil",
            options: [
              { value: "turkce", label: "Türkçe" },
              { value: "ingilizce", label: "İngilizce" },
              { value: "almanca", label: "Almanca" },
              { value: "fransizca", label: "Fransızca" },
              { value: "arapca", label: "Arapça" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "publication-year",
            name: "Basım Yılı",
            type: "select",
            required: false,
            label: "Basım Yılı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "2024", label: "2024" },
              { value: "2023", label: "2023" },
              { value: "2022", label: "2022" },
              { value: "2021", label: "2021" },
              { value: "2020", label: "2020" },
              { value: "2015-2019", label: "2015-2019" },
              { value: "2010-2014", label: "2010-2014" },
              { value: "2000-2009", label: "2000-2009" },
              { value: "1990-1999", label: "1990-1999" },
              { value: "1980-1989", label: "1980-1989" },
              { value: "1980-oncesi", label: "1980 Öncesi" }
            ]
          }
        ]
      },
      { id: "fiction-books", name: "Roman ve Hikaye", icon: "📚", count: "120" },
      { id: "non-fiction", name: "Kişisel Gelişim", icon: "📖", count: "80" },
      { id: "educational-books", name: "Eğitim Kitapları", icon: "📚", count: "90" },
      { id: "children-books", name: "Çocuk Kitapları", icon: "📚", count: "70" },
      { id: "textbooks", name: "Ders Kitapları", icon: "📖", count: "60" },
      { id: "magazines", name: "Dergi ve Gazete", icon: "📰", count: "40" },
      { id: "comics", name: "Çizgi Roman", icon: "📚", count: "35" },
      { 
        id: "art-crafts", 
        name: "Sanat ve El Sanatları", 
        icon: "🎨", 
        count: "110",
        dynamicFields: [
          {
            id: "craft-type",
            name: "Sanat Türü",
            type: "select",
            required: true,
            label: "Sanat Türü",
            options: [
              { value: "resim", label: "Resim" },
              { value: "cizim", label: "Çizim" },
              { value: "heykel", label: "Heykel" },
              { value: "seramik", label: "Seramik" },
              { value: "cam-sanati", label: "Cam Sanatı" },
              { value: "metal-sanati", label: "Metal Sanatı" },
              { value: "ahsap-sanati", label: "Ahşap Sanatı" },
              { value: "tekstil-sanati", label: "Tekstil Sanatı" },
              { value: "orgu", label: "Örgü" },
              { value: "dikis", label: "Dikiş" },
              { value: "nakis", label: "Nakış" },
              { value: "kaligrafi", label: "Kaligrafi" },
              { value: "ebru", label: "Ebru" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "material-type",
            name: "Malzeme Türü",
            type: "select",
            required: true,
            label: "Malzeme Türü",
            options: [
              { value: "boya", label: "Boya" },
              { value: "firca", label: "Fırça" },
              { value: "kalem", label: "Kalem" },
              { value: "kagit", label: "Kağıt" },
              { value: "tuval", label: "Tuval" },
              { value: "kil", label: "Kil" },
              { value: "iplik", label: "İplik" },
              { value: "kumas", label: "Kumaş" },
              { value: "ahsap", label: "Ahşap" },
              { value: "metal", label: "Metal" },
              { value: "cam", label: "Cam" },
              { value: "plastik", label: "Plastik" },
              { value: "set", label: "Set/Kit" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "faber-castell", label: "Faber-Castell" },
              { value: "staedtler", label: "Staedtler" },
              { value: "caran-dache", label: "Caran d'Ache" },
              { value: "winsor-newton", label: "Winsor & Newton" },
              { value: "daler-rowney", label: "Daler Rowney" },
              { value: "sakura", label: "Sakura" },
              { value: "tombow", label: "Tombow" },
              { value: "prismacolor", label: "Prismacolor" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "skill-level",
            name: "Seviye",
            type: "select",
            required: false,
            label: "Seviye",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "baslangic", label: "Başlangıç" },
              { value: "orta", label: "Orta" },
              { value: "ileri", label: "İleri" },
              { value: "profesyonel", label: "Profesyonel" }
            ]
          }
        ]
      },
      { id: "painting", name: "Resim Malzemeleri", icon: "🎨", count: "50" },
      { id: "drawing", name: "Çizim Malzemeleri", icon: "✏️", count: "40" },
      { id: "crafting", name: "El İşi Malzemeleri", icon: "✂️", count: "60" },
      { id: "sewing", name: "Dikiş Malzemeleri", icon: "🧵", count: "35" },
      { id: "knitting", name: "Örgü Malzemeleri", icon: "🧶", count: "30" },
      { 
        id: "collectibles", 
        name: "Koleksiyon Eşyaları", 
        icon: "🏆", 
        count: "90",
        dynamicFields: [
          {
            id: "collectible-type",
            name: "Koleksiyon Türü",
            type: "select",
            required: true,
            label: "Koleksiyon Türü",
            options: [
              { value: "para", label: "Para Koleksiyonu" },
              { value: "pul", label: "Pul Koleksiyonu" },
              { value: "antika", label: "Antika Eşyalar" },
              { value: "oyuncak", label: "Vintage Oyuncaklar" },
              { value: "kartpostal", label: "Kartpostal" },
              { value: "kitap", label: "Eski Kitaplar" },
              { value: "plak", label: "Plak" },
              { value: "sanat-eseri", label: "Sanat Eseri" },
              { value: "madalya", label: "Madalya" },
              { value: "rozet", label: "Rozet" },
              { value: "figur", label: "Figür" },
              { value: "kart", label: "Koleksiyon Kartları" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "era",
            name: "Dönem",
            type: "select",
            required: false,
            label: "Dönem",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "2020-sonrasi", label: "2020 Sonrası" },
              { value: "2010-2020", label: "2010-2020" },
              { value: "2000-2010", label: "2000-2010" },
              { value: "1990-2000", label: "1990-2000" },
              { value: "1980-1990", label: "1980-1990" },
              { value: "1970-1980", label: "1970-1980" },
              { value: "1960-1970", label: "1960-1970" },
              { value: "1950-1960", label: "1950-1960" },
              { value: "1940-1950", label: "1940-1950" },
              { value: "1940-oncesi", label: "1940 Öncesi" }
            ]
          },
          {
            id: "origin",
            name: "Menşei",
            type: "select",
            required: false,
            label: "Menşei",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "turkiye", label: "Türkiye" },
              { value: "osmanli", label: "Osmanlı" },
              { value: "avrupa", label: "Avrupa" },
              { value: "amerika", label: "Amerika" },
              { value: "asya", label: "Asya" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "rarity",
            name: "Nadir Seviyesi",
            type: "select",
            required: false,
            label: "Nadir Seviyesi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "cok-nadir", label: "Çok Nadir" },
              { value: "nadir", label: "Nadir" },
              { value: "orta", label: "Orta" },
              { value: "yaygin", label: "Yaygın" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "mukemmel", label: "Mükemmel" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "zayif", label: "Zayıf" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "authenticity",
            name: "Orijinallik",
            type: "select",
            required: true,
            label: "Orijinallik",
            options: [
              { value: "orijinal", label: "Orijinal" },
              { value: "sertifikali", label: "Sertifikalı" },
              { value: "tahmini", label: "Tahmini" },
              { value: "kopya", label: "Kopya" }
            ]
          }
        ]
      },
      { id: "coins", name: "Para Koleksiyonu", icon: "🪙", count: "25" },
      { id: "stamps", name: "Pul Koleksiyonu", icon: "📮", count: "20" },
      { id: "antiques", name: "Antika Eşyalar", icon: "🏺", count: "45" },
      { 
        id: "board-games", 
        name: "Masa Oyunları", 
        icon: "🎲", 
        count: "70",
        dynamicFields: [
          {
            id: "game-type",
            name: "Oyun Türü",
            type: "select",
            required: true,
            label: "Oyun Türü",
            options: [
              { value: "strateji", label: "Strateji" },
              { value: "aile", label: "Aile Oyunu" },
              { value: "parti", label: "Parti Oyunu" },
              { value: "kart", label: "Kart Oyunu" },
              { value: "zar", label: "Zar Oyunu" },
              { value: "kooperatif", label: "Kooperatif" },
              { value: "rol-yapma", label: "Rol Yapma" },
              { value: "deduksiyon", label: "Dedüksiyon" },
              { value: "ekonomi", label: "Ekonomi" },
              { value: "savas", label: "Savaş" },
              { value: "egitici", label: "Eğitici" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "player-count",
            name: "Oyuncu Sayısı",
            type: "select",
            required: true,
            label: "Oyuncu Sayısı",
            options: [
              { value: "1", label: "1 Oyuncu" },
              { value: "2", label: "2 Oyuncu" },
              { value: "2-3", label: "2-3 Oyuncu" },
              { value: "2-4", label: "2-4 Oyuncu" },
              { value: "2-5", label: "2-5 Oyuncu" },
              { value: "2-6", label: "2-6 Oyuncu" },
              { value: "3-4", label: "3-4 Oyuncu" },
              { value: "3-5", label: "3-5 Oyuncu" },
              { value: "3-6", label: "3-6 Oyuncu" },
              { value: "4-6", label: "4-6 Oyuncu" },
              { value: "4-8", label: "4-8 Oyuncu" },
              { value: "6+", label: "6+ Oyuncu" }
            ]
          },
          {
            id: "age-range",
            name: "Yaş Aralığı",
            type: "select",
            required: true,
            label: "Yaş Aralığı",
            options: [
              { value: "3+", label: "3+ Yaş" },
              { value: "6+", label: "6+ Yaş" },
              { value: "8+", label: "8+ Yaş" },
              { value: "10+", label: "10+ Yaş" },
              { value: "12+", label: "12+ Yaş" },
              { value: "14+", label: "14+ Yaş" },
              { value: "16+", label: "16+ Yaş" },
              { value: "18+", label: "18+ Yaş" }
            ]
          },
          {
            id: "play-time",
            name: "Oyun Süresi",
            type: "select",
            required: false,
            label: "Oyun Süresi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "15-dk", label: "15 Dakika" },
              { value: "15-30-dk", label: "15-30 Dakika" },
              { value: "30-45-dk", label: "30-45 Dakika" },
              { value: "45-60-dk", label: "45-60 Dakika" },
              { value: "60-90-dk", label: "60-90 Dakika" },
              { value: "90-120-dk", label: "90-120 Dakika" },
              { value: "120-dk+", label: "120+ Dakika" }
            ]
          },
          {
            id: "language",
            name: "Dil",
            type: "select",
            required: true,
            label: "Dil",
            options: [
              { value: "turkce", label: "Türkçe" },
              { value: "ingilizce", label: "İngilizce" },
              { value: "almanca", label: "Almanca" },
              { value: "fransizca", label: "Fransızca" },
              { value: "dil-bagimsiz", label: "Dil Bağımsız" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "eksik-parca", label: "Eksik Parça" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "completeness",
            name: "Tamlık",
            type: "select",
            required: true,
            label: "Tamlık",
            options: [
              { value: "tam", label: "Tam" },
              { value: "eksik-parca", label: "Eksik Parça Var" },
              { value: "sadece-oyun", label: "Sadece Oyun" },
              { value: "kutu-yok", label: "Kutu Yok" }
            ]
          }
        ]
      },
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
      { 
        id: "musical-instruments", 
        name: "Müzik Aletleri", 
        icon: "🎸", 
        count: "180",
        dynamicFields: [
          {
            id: "instrument-type",
            name: "Enstrüman Türü",
            type: "select",
            required: true,
            label: "Enstrüman Türü",
            options: [
              { value: "gitar", label: "Gitar" },
              { value: "bas-gitar", label: "Bas Gitar" },
              { value: "piyano", label: "Piyano" },
              { value: "klavye", label: "Klavye" },
              { value: "davul", label: "Davul" },
              { value: "keman", label: "Keman" },
              { value: "viyola", label: "Viyola" },
              { value: "cello", label: "Çello" },
              { value: "flut", label: "Flüt" },
              { value: "klarnet", label: "Klarnet" },
              { value: "saksafon", label: "Saksafon" },
              { value: "trompet", label: "Trompet" },
              { value: "trombon", label: "Trombon" },
              { value: "ney", label: "Ney" },
              { value: "baglama", label: "Bağlama" },
              { value: "ud", label: "Ud" },
              { value: "kanun", label: "Kanun" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "yamaha", label: "Yamaha" },
              { value: "fender", label: "Fender" },
              { value: "gibson", label: "Gibson" },
              { value: "ibanez", label: "Ibanez" },
              { value: "roland", label: "Roland" },
              { value: "casio", label: "Casio" },
              { value: "korg", label: "Korg" },
              { value: "steinway", label: "Steinway" },
              { value: "pearl", label: "Pearl" },
              { value: "tama", label: "Tama" },
              { value: "dw", label: "DW" },
              { value: "martin", label: "Martin" },
              { value: "taylor", label: "Taylor" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "skill-level",
            name: "Seviye",
            type: "select",
            required: false,
            label: "Seviye",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "baslangic", label: "Başlangıç" },
              { value: "orta", label: "Orta" },
              { value: "ileri", label: "İleri" },
              { value: "profesyonel", label: "Profesyonel" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "kilif", label: "Kılıf" },
              { value: "stand", label: "Stand" },
              { value: "amplifikator", label: "Amplifikatör" },
              { value: "kablo", label: "Kablo" },
              { value: "pena", label: "Pena" },
              { value: "yay", label: "Yay" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "guitars", 
        name: "Gitar", 
        icon: "🎸", 
        count: "70",
        dynamicFields: [
          {
            id: "guitar-type",
            name: "Gitar Türü",
            type: "select",
            required: true,
            label: "Gitar Türü",
            options: [
              { value: "elektro-gitar", label: "Elektro Gitar" },
              { value: "akustik-gitar", label: "Akustik Gitar" },
              { value: "klasik-gitar", label: "Klasik Gitar" },
              { value: "bas-gitar", label: "Bas Gitar" },
              { value: "elektro-akustik", label: "Elektro-Akustik" },
              { value: "12-telli", label: "12 Telli Gitar" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "fender", label: "Fender" },
              { value: "gibson", label: "Gibson" },
              { value: "yamaha", label: "Yamaha" },
              { value: "ibanez", label: "Ibanez" },
              { value: "epiphone", label: "Epiphone" },
              { value: "martin", label: "Martin" },
              { value: "taylor", label: "Taylor" },
              { value: "cort", label: "Cort" },
              { value: "schecter", label: "Schecter" },
              { value: "esp", label: "ESP" },
              { value: "jackson", label: "Jackson" },
              { value: "gretsch", label: "Gretsch" },
              { value: "rickenbacker", label: "Rickenbacker" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "string-count",
            name: "Tel Sayısı",
            type: "select",
            required: false,
            label: "Tel Sayısı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "4", label: "4 Tel" },
              { value: "6", label: "6 Tel" },
              { value: "7", label: "7 Tel" },
              { value: "8", label: "8 Tel" },
              { value: "12", label: "12 Tel" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "kilif", label: "Kılıf" },
              { value: "amplifikator", label: "Amplifikatör" },
              { value: "kablo", label: "Kablo" },
              { value: "pena", label: "Pena" },
              { value: "stand", label: "Stand" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "keyboards-pianos", 
        name: "Klavye ve Piyano", 
        icon: "🎹", 
        count: "50",
        dynamicFields: [
          {
            id: "instrument-type",
            name: "Enstrüman Türü",
            type: "select",
            required: true,
            label: "Enstrüman Türü",
            options: [
              { value: "dijital-piyano", label: "Dijital Piyano" },
              { value: "akustik-piyano", label: "Akustik Piyano" },
              { value: "elektronik-klavye", label: "Elektronik Klavye" },
              { value: "synthesizer", label: "Synthesizer" },
              { value: "midi-klavye", label: "MIDI Klavye" },
              { value: "org", label: "Org" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "yamaha", label: "Yamaha" },
              { value: "roland", label: "Roland" },
              { value: "casio", label: "Casio" },
              { value: "korg", label: "Korg" },
              { value: "steinway", label: "Steinway" },
              { value: "kawai", label: "Kawai" },
              { value: "nord", label: "Nord" },
              { value: "kurzweil", label: "Kurzweil" },
              { value: "moog", label: "Moog" },
              { value: "arturia", label: "Arturia" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "key-count",
            name: "Tuş Sayısı",
            type: "select",
            required: false,
            label: "Tuş Sayısı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "25", label: "25 Tuş" },
              { value: "37", label: "37 Tuş" },
              { value: "49", label: "49 Tuş" },
              { value: "61", label: "61 Tuş" },
              { value: "76", label: "76 Tuş" },
              { value: "88", label: "88 Tuş" }
            ]
          },
          {
            id: "weighted-keys",
            name: "Ağırlıklı Tuş",
            type: "select",
            required: false,
            label: "Ağırlıklı Tuş",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Var" },
              { value: "yok", label: "Yok" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "stand", label: "Stand" },
              { value: "pedal", label: "Pedal" },
              { value: "bench", label: "Tabure" },
              { value: "kablo", label: "Kablo" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "drums", 
        name: "Davul", 
        icon: "🥁", 
        count: "40",
        dynamicFields: [
          {
            id: "drum-type",
            name: "Davul Türü",
            type: "select",
            required: true,
            label: "Davul Türü",
            options: [
              { value: "akustik-set", label: "Akustik Davul Seti" },
              { value: "elektronik-set", label: "Elektronik Davul Seti" },
              { value: "cajon", label: "Cajon" },
              { value: "darbuka", label: "Darbuka" },
              { value: "bongo", label: "Bongo" },
              { value: "conga", label: "Conga" },
              { value: "timpani", label: "Timpani" },
              { value: "snare", label: "Snare Davul" },
              { value: "kick", label: "Kick Davul" },
              { value: "tom", label: "Tom" },
              { value: "cymbal", label: "Zil" },
              { value: "hihat", label: "Hi-Hat" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "pearl", label: "Pearl" },
              { value: "tama", label: "Tama" },
              { value: "dw", label: "DW" },
              { value: "gretsch", label: "Gretsch" },
              { value: "ludwig", label: "Ludwig" },
              { value: "yamaha", label: "Yamaha" },
              { value: "roland", label: "Roland" },
              { value: "alesis", label: "Alesis" },
              { value: "zildjian", label: "Zildjian" },
              { value: "sabian", label: "Sabian" },
              { value: "paiste", label: "Paiste" },
              { value: "meinl", label: "Meinl" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "piece-count",
            name: "Parça Sayısı",
            type: "select",
            required: false,
            label: "Parça Sayısı",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "3-parca", label: "3 Parça" },
              { value: "4-parca", label: "4 Parça" },
              { value: "5-parca", label: "5 Parça" },
              { value: "6-parca", label: "6 Parça" },
              { value: "7-parca", label: "7 Parça" },
              { value: "8-parca-ve-uzeri", label: "8+ Parça" },
              { value: "tek-parca", label: "Tek Parça" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "baget", label: "Baget" },
              { value: "stand", label: "Stand" },
              { value: "tabure", label: "Tabure" },
              { value: "pedal", label: "Pedal" },
              { value: "kilif", label: "Kılıf" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "wind-instruments", 
        name: "Nefesli Çalgılar", 
        icon: "🎺", 
        count: "30",
        dynamicFields: [
          {
            id: "instrument-type",
            name: "Enstrüman Türü",
            type: "select",
            required: true,
            label: "Enstrüman Türü",
            options: [
              { value: "flut", label: "Flüt" },
              { value: "klarnet", label: "Klarnet" },
              { value: "saksafon", label: "Saksafon" },
              { value: "trompet", label: "Trompet" },
              { value: "trombon", label: "Trombon" },
              { value: "korno", label: "Korno" },
              { value: "tuba", label: "Tuba" },
              { value: "obua", label: "Obua" },
              { value: "fagot", label: "Fagot" },
              { value: "piccolo", label: "Piccolo" },
              { value: "ney", label: "Ney" },
              { value: "zurna", label: "Zurna" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "yamaha", label: "Yamaha" },
              { value: "selmer", label: "Selmer" },
              { value: "bach", label: "Bach" },
              { value: "buffet", label: "Buffet" },
              { value: "pearl", label: "Pearl" },
              { value: "gemeinhardt", label: "Gemeinhardt" },
              { value: "jupiter", label: "Jupiter" },
              { value: "conn", label: "Conn" },
              { value: "king", label: "King" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "material",
            name: "Malzeme",
            type: "select",
            required: false,
            label: "Malzeme",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "pirinc", label: "Pirinç" },
              { value: "gumus", label: "Gümüş" },
              { value: "altin", label: "Altın" },
              { value: "nikel", label: "Nikel" },
              { value: "ahsap", label: "Ahşap" },
              { value: "plastik", label: "Plastik" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "kilif", label: "Kılıf" },
              { value: "stand", label: "Stand" },
              { value: "agizlik", label: "Ağızlık" },
              { value: "kamis", label: "Kamış" },
              { value: "temizlik-kiti", label: "Temizlik Kiti" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "string-instruments", 
        name: "Telli Çalgılar", 
        icon: "🎻", 
        count: "25",
        dynamicFields: [
          {
            id: "instrument-type",
            name: "Enstrüman Türü",
            type: "select",
            required: true,
            label: "Enstrüman Türü",
            options: [
              { value: "keman", label: "Keman" },
              { value: "viyola", label: "Viyola" },
              { value: "cello", label: "Çello" },
              { value: "kontrabas", label: "Kontrabas" },
              { value: "ud", label: "Ud" },
              { value: "baglama", label: "Bağlama" },
              { value: "kanun", label: "Kanun" },
              { value: "mandolin", label: "Mandolin" },
              { value: "banjo", label: "Banjo" },
              { value: "harp", label: "Harp" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "stradivarius", label: "Stradivarius" },
              { value: "yamaha", label: "Yamaha" },
              { value: "stentor", label: "Stentor" },
              { value: "cremona", label: "Cremona" },
              { value: "gewa", label: "Gewa" },
              { value: "antonio", label: "Antonio" },
              { value: "hofner", label: "Hofner" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Boyut",
            type: "select",
            required: false,
            label: "Boyut",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "1-16", label: "1/16" },
              { value: "1-8", label: "1/8" },
              { value: "1-4", label: "1/4" },
              { value: "1-2", label: "1/2" },
              { value: "3-4", label: "3/4" },
              { value: "4-4", label: "4/4 (Tam Boy)" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "kilif", label: "Kılıf" },
              { value: "yay", label: "Yay" },
              { value: "stand", label: "Stand" },
              { value: "tel", label: "Tel" },
              { value: "pena", label: "Pena" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "music-accessories", 
        name: "Müzik Aksesuarları", 
        icon: "🎵", 
        count: "60",
        dynamicFields: [
          {
            id: "accessory-type",
            name: "Aksesuar Türü",
            type: "select",
            required: true,
            label: "Aksesuar Türü",
            options: [
              { value: "kablo", label: "Kablo" },
              { value: "stand", label: "Stand" },
              { value: "kilif", label: "Kılıf" },
              { value: "pena", label: "Pena" },
              { value: "yay", label: "Yay" },
              { value: "tel", label: "Tel" },
              { value: "agizlik", label: "Ağızlık" },
              { value: "kamis", label: "Kamış" },
              { value: "baget", label: "Baget" },
              { value: "pedal", label: "Pedal" },
              { value: "tuner", label: "Akort Aleti" },
              { value: "metronom", label: "Metronom" },
              { value: "nota-sehpasi", label: "Nota Sehpası" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "boss", label: "Boss" },
              { value: "korg", label: "Korg" },
              { value: "yamaha", label: "Yamaha" },
              { value: "fender", label: "Fender" },
              { value: "dunlop", label: "Dunlop" },
              { value: "ernie-ball", label: "Ernie Ball" },
              { value: "daddario", label: "D'Addario" },
              { value: "planet-waves", label: "Planet Waves" },
              { value: "hercules", label: "Hercules" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "compatible-instruments",
            name: "Uyumlu Enstrümanlar",
            type: "select",
            required: false,
            label: "Uyumlu Enstrümanlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "gitar", label: "Gitar" },
              { value: "bas-gitar", label: "Bas Gitar" },
              { value: "piyano", label: "Piyano" },
              { value: "davul", label: "Davul" },
              { value: "keman", label: "Keman" },
              { value: "nefesli", label: "Nefesli Çalgılar" },
              { value: "tum-enstrumanlar", label: "Tüm Enstrümanlar" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
      { 
        id: "audio-equipment", 
        name: "Ses Ekipmanları", 
        icon: "🎧", 
        count: "80",
        dynamicFields: [
          {
            id: "equipment-type",
            name: "Ekipman Türü",
            type: "select",
            required: true,
            label: "Ekipman Türü",
            options: [
              { value: "amplifikator", label: "Amplifikatör" },
              { value: "hoparlor", label: "Hoparlör" },
              { value: "kulaklik", label: "Kulaklık" },
              { value: "ses-kartı", label: "Ses Kartı" },
              { value: "mixer", label: "Mixer" },
              { value: "equalizer", label: "Equalizer" },
              { value: "efekt-pedali", label: "Efekt Pedalı" },
              { value: "ses-kayit-cihazi", label: "Ses Kayıt Cihazı" },
              { value: "monitor", label: "Monitor" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "marshall", label: "Marshall" },
              { value: "fender", label: "Fender" },
              { value: "vox", label: "Vox" },
              { value: "orange", label: "Orange" },
              { value: "boss", label: "Boss" },
              { value: "yamaha", label: "Yamaha" },
              { value: "behringer", label: "Behringer" },
              { value: "mackie", label: "Mackie" },
              { value: "jbl", label: "JBL" },
              { value: "sennheiser", label: "Sennheiser" },
              { value: "audio-technica", label: "Audio-Technica" },
              { value: "sony", label: "Sony" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "power-rating",
            name: "Güç (Watt)",
            type: "select",
            required: false,
            label: "Güç (Watt)",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "0-50", label: "0-50W" },
              { value: "51-100", label: "51-100W" },
              { value: "101-200", label: "101-200W" },
              { value: "201-500", label: "201-500W" },
              { value: "500-uzeri", label: "500W+" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "accessories-included",
            name: "Dahil Aksesuarlar",
            type: "select",
            required: false,
            label: "Dahil Aksesuarlar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "kablo", label: "Kablo" },
              { value: "kilif", label: "Kılıf" },
              { value: "stand", label: "Stand" },
              { value: "kullanim-kilavuzu", label: "Kullanım Kılavuzu" },
              { value: "tamami", label: "Tamamı" },
              { value: "hicbiri", label: "Hiçbiri" }
            ]
          },
          {
            id: "warranty",
            name: "Garanti Durumu",
            type: "select",
            required: false,
            label: "Garanti Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Garanti Var" },
              { value: "yok", label: "Garanti Yok" }
            ]
          }
        ]
      },
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
      { 
        id: "services", 
        name: "Hizmetler", 
        icon: "🛠️", 
        count: "200",
        dynamicFields: [
          {
            id: "service-type",
            name: "Hizmet Türü",
            type: "select",
            required: true,
            label: "Hizmet Türü",
            options: [
              { value: "tamir", label: "Tamir" },
              { value: "temizlik", label: "Temizlik" },
              { value: "teslimat", label: "Teslimat" },
              { value: "egitim", label: "Eğitim" },
              { value: "danismanlik", label: "Danışmanlık" },
              { value: "teknik-destek", label: "Teknik Destek" },
              { value: "kurulum", label: "Kurulum" },
              { value: "bakim", label: "Bakım" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "service-area",
            name: "Hizmet Alanı",
            type: "select",
            required: true,
            label: "Hizmet Alanı",
            options: [
              { value: "ev", label: "Ev" },
              { value: "ofis", label: "Ofis" },
              { value: "isyeri", label: "İşyeri" },
              { value: "online", label: "Online" },
              { value: "mobil", label: "Mobil" },
              { value: "atölye", label: "Atölye" }
            ]
          },
          {
            id: "experience-level",
            name: "Deneyim Seviyesi",
            type: "select",
            required: false,
            label: "Deneyim Seviyesi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "baslangic", label: "Başlangıç" },
              { value: "orta", label: "Orta" },
              { value: "ileri", label: "İleri" },
              { value: "uzman", label: "Uzman" }
            ]
          },
          {
            id: "availability",
            name: "Müsaitlik",
            type: "select",
            required: false,
            label: "Müsaitlik",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "hemen", label: "Hemen" },
              { value: "1-hafta", label: "1 Hafta İçinde" },
              { value: "1-ay", label: "1 Ay İçinde" },
              { value: "esnek", label: "Esnek" }
            ]
          },
          {
            id: "certification",
            name: "Sertifika Durumu",
            type: "select",
            required: false,
            label: "Sertifika Durumu",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "var", label: "Sertifika Var" },
              { value: "yok", label: "Sertifika Yok" }
            ]
          }
        ]
      },
      { id: "repair-services", name: "Tamir Hizmetleri", icon: "🔧", count: "80" },
      { id: "cleaning-services", name: "Temizlik Hizmetleri", icon: "🧽", count: "60" },
      { id: "delivery-services", name: "Teslimat Hizmetleri", icon: "🚚", count: "40" },
      { id: "professional-services", name: "Profesyonel Hizmetler", icon: "💼", count: "70" },
      { id: "education-services", name: "Eğitim Hizmetleri", icon: "📚", count: "50" },
      { 
        id: "health-beauty", 
        name: "Sağlık ve Güzellik", 
        icon: "💄", 
        count: "150",
        dynamicFields: [
          {
            id: "product-type",
            name: "Ürün Türü",
            type: "select",
            required: true,
            label: "Ürün Türü",
            options: [
              { value: "kozmetik", label: "Kozmetik" },
              { value: "cilt-bakimi", label: "Cilt Bakımı" },
              { value: "sac-bakimi", label: "Saç Bakımı" },
              { value: "parfum", label: "Parfüm" },
              { value: "saglik-urunleri", label: "Sağlık Ürünleri" },
              { value: "vitamin", label: "Vitamin" },
              { value: "medikal", label: "Medikal" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "loreal", label: "L'Oréal" },
              { value: "nivea", label: "Nivea" },
              { value: "garnier", label: "Garnier" },
              { value: "maybelline", label: "Maybelline" },
              { value: "revlon", label: "Revlon" },
              { value: "vichy", label: "Vichy" },
              { value: "la-roche-posay", label: "La Roche-Posay" },
              { value: "eucerin", label: "Eucerin" },
              { value: "avene", label: "Avène" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "skin-type",
            name: "Cilt Tipi",
            type: "select",
            required: false,
            label: "Cilt Tipi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "normal", label: "Normal" },
              { value: "kuru", label: "Kuru" },
              { value: "yagili", label: "Yağlı" },
              { value: "karma", label: "Karma" },
              { value: "hassas", label: "Hassas" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "acilmamis", label: "Açılmamış" },
              { value: "az-kullanilmis", label: "Az Kullanılmış" },
              { value: "yarim", label: "Yarım" },
              { value: "bitmek-uzere", label: "Bitmek Üzere" }
            ]
          },
          {
            id: "expiry-status",
            name: "Son Kullanma Tarihi",
            type: "select",
            required: false,
            label: "Son Kullanma Tarihi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "yeni", label: "Yeni (1+ Yıl)" },
              { value: "orta", label: "Orta (6-12 Ay)" },
              { value: "yakin", label: "Yakın (3-6 Ay)" },
              { value: "cok-yakin", label: "Çok Yakın (0-3 Ay)" }
            ]
          }
        ]
      },
      { id: "cosmetics", name: "Kozmetik", icon: "💄", count: "80" },
      { id: "skincare", name: "Cilt Bakımı", icon: "🧴", count: "60" },
      { id: "haircare", name: "Saç Bakımı", icon: "💇", count: "40" },
      { id: "health-supplements", name: "Sağlık Ürünleri", icon: "💊", count: "50" },
      { id: "medical-equipment", name: "Medikal Ekipmanlar", icon: "🩺", count: "30" },
      { 
        id: "baby-kids", 
        name: "Bebek ve Çocuk", 
        icon: "👶", 
        count: "180",
        dynamicFields: [
          {
            id: "product-category",
            name: "Ürün Kategorisi",
            type: "select",
            required: true,
            label: "Ürün Kategorisi",
            options: [
              { value: "bebek-bakimi", label: "Bebek Bakımı" },
              { value: "bebek-mobilyasi", label: "Bebek Mobilyası" },
              { value: "oyuncak", label: "Oyuncak" },
              { value: "cocuk-giyim", label: "Çocuk Giyim" },
              { value: "bebek-giyim", label: "Bebek Giyim" },
              { value: "beslenme", label: "Beslenme" },
              { value: "egitici", label: "Eğitici" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "age-range",
            name: "Yaş Aralığı",
            type: "select",
            required: true,
            label: "Yaş Aralığı",
            options: [
              { value: "0-6-ay", label: "0-6 Ay" },
              { value: "6-12-ay", label: "6-12 Ay" },
              { value: "1-2-yas", label: "1-2 Yaş" },
              { value: "2-4-yas", label: "2-4 Yaş" },
              { value: "4-6-yas", label: "4-6 Yaş" },
              { value: "6-8-yas", label: "6-8 Yaş" },
              { value: "8-12-yas", label: "8-12 Yaş" },
              { value: "12-yas-uzeri", label: "12 Yaş Üzeri" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "chicco", label: "Chicco" },
              { value: "fisher-price", label: "Fisher-Price" },
              { value: "lego", label: "Lego" },
              { value: "playmobil", label: "Playmobil" },
              { value: "barbie", label: "Barbie" },
              { value: "hot-wheels", label: "Hot Wheels" },
              { value: "disney", label: "Disney" },
              { value: "ikea", label: "IKEA" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
              { value: "cok-iyi", label: "Çok İyi" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "safety-standards",
            name: "Güvenlik Standartları",
            type: "select",
            required: false,
            label: "Güvenlik Standartları",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "ce-belgeli", label: "CE Belgeli" },
              { value: "tse-belgeli", label: "TSE Belgeli" },
              { value: "iso-belgeli", label: "ISO Belgeli" },
              { value: "belgesiz", label: "Belgesiz" }
            ]
          },
          {
            id: "completeness",
            name: "Tamlık",
            type: "select",
            required: false,
            label: "Tamlık",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "tam", label: "Tam" },
              { value: "eksik-parcalar", label: "Eksik Parçalar" },
              { value: "sadece-ana-urun", label: "Sadece Ana Ürün" }
            ]
          }
        ]
      },
      { id: "baby-care", name: "Bebek Bakımı", icon: "🍼", count: "80" },
      { id: "baby-furniture", name: "Bebek Mobilyaları", icon: "🛏️", count: "60" },
      { id: "toys", name: "Oyuncaklar", icon: "🧸", count: "120" },
      { id: "educational-toys", name: "Eğitici Oyuncaklar", icon: "🎓", count: "50" },
      { id: "outdoor-toys", name: "Dış Mekan Oyuncakları", icon: "🏀", count: "40" },
      { 
        id: "pets", 
        name: "Evcil Hayvanlar", 
        icon: "🐕", 
        count: "120",
        dynamicFields: [
          {
            id: "pet-type",
            name: "Hayvan Türü",
            type: "select",
            required: true,
            label: "Hayvan Türü",
            options: [
              { value: "kopek", label: "Köpek" },
              { value: "kedi", label: "Kedi" },
              { value: "kus", label: "Kuş" },
              { value: "balik", label: "Balık" },
              { value: "hamster", label: "Hamster" },
              { value: "tavsan", label: "Tavşan" },
              { value: "kaplumbaga", label: "Kaplumbağa" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "product-type",
            name: "Ürün Türü",
            type: "select",
            required: true,
            label: "Ürün Türü",
            options: [
              { value: "mama", label: "Mama" },
              { value: "aksesuar", label: "Aksesuar" },
              { value: "oyuncak", label: "Oyuncak" },
              { value: "bakim", label: "Bakım" },
              { value: "saglik", label: "Sağlık" },
              { value: "barınak", label: "Barınak" },
              { value: "tasima", label: "Taşıma" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "royal-canin", label: "Royal Canin" },
              { value: "pedigree", label: "Pedigree" },
              { value: "whiskas", label: "Whiskas" },
              { value: "purina", label: "Purina" },
              { value: "hills", label: "Hill's" },
              { value: "eukanuba", label: "Eukanuba" },
              { value: "acana", label: "Acana" },
              { value: "orijen", label: "Orijen" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "size",
            name: "Boyut",
            type: "select",
            required: false,
            label: "Boyut",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "xs", label: "XS" },
              { value: "s", label: "S" },
              { value: "m", label: "M" },
              { value: "l", label: "L" },
              { value: "xl", label: "XL" },
              { value: "xxl", label: "XXL" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "acilmamis", label: "Açılmamış" },
              { value: "az-kullanilmis", label: "Az Kullanılmış" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "expiry-status",
            name: "Son Kullanma Tarihi",
            type: "select",
            required: false,
            label: "Son Kullanma Tarihi",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "yeni", label: "Yeni (1+ Yıl)" },
              { value: "orta", label: "Orta (6-12 Ay)" },
              { value: "yakin", label: "Yakın (3-6 Ay)" },
              { value: "cok-yakin", label: "Çok Yakın (0-3 Ay)" }
            ]
          }
        ]
      },
      { id: "pet-food", name: "Evcil Hayvan Maması", icon: "🥘", count: "60" },
      { id: "pet-accessories", name: "Evcil Hayvan Aksesuarları", icon: "🦴", count: "50" },
      { id: "pet-care", name: "Evcil Hayvan Bakımı", icon: "🐾", count: "40" },
      { 
        id: "office-supplies", 
        name: "Ofis Malzemeleri", 
        icon: "📎", 
        count: "100",
        dynamicFields: [
          {
            id: "product-type",
            name: "Ürün Türü",
            type: "select",
            required: true,
            label: "Ürün Türü",
            options: [
              { value: "kirtasiye", label: "Kırtasiye" },
              { value: "dosyalama", label: "Dosyalama" },
              { value: "yazici-malzemeleri", label: "Yazıcı Malzemeleri" },
              { value: "ofis-mobilyasi", label: "Ofis Mobilyası" },
              { value: "elektronik", label: "Elektronik" },
              { value: "temizlik", label: "Temizlik" },
              { value: "organizasyon", label: "Organizasyon" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "brand",
            name: "Marka",
            type: "select",
            required: false,
            label: "Marka",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "staedtler", label: "Staedtler" },
              { value: "faber-castell", label: "Faber-Castell" },
              { value: "pilot", label: "Pilot" },
              { value: "bic", label: "BIC" },
              { value: "stabilo", label: "Stabilo" },
              { value: "hp", label: "HP" },
              { value: "canon", label: "Canon" },
              { value: "epson", label: "Epson" },
              { value: "diger", label: "Diğer" }
            ]
          },
          {
            id: "quantity",
            name: "Miktar",
            type: "select",
            required: false,
            label: "Miktar",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "tekli", label: "Tekli" },
              { value: "paket", label: "Paket" },
              { value: "toplu", label: "Toplu" },
              { value: "koli", label: "Koli" }
            ]
          },
          {
            id: "condition",
            name: "Durum",
            type: "select",
            required: true,
            label: "Durum",
            options: [
              { value: "sifir", label: "Sıfır" },
              { value: "acilmamis", label: "Açılmamış" },
              { value: "az-kullanilmis", label: "Az Kullanılmış" },
              { value: "iyi", label: "İyi" },
              { value: "orta", label: "Orta" },
              { value: "hasarli", label: "Hasarlı" }
            ]
          },
          {
            id: "color",
            name: "Renk",
            type: "select",
            required: false,
            label: "Renk",
            options: [
              { value: "farketmez", label: "Farketmez" },
              { value: "siyah", label: "Siyah" },
              { value: "mavi", label: "Mavi" },
              { value: "kirmizi", label: "Kırmızı" },
              { value: "yesil", label: "Yeşil" },
              { value: "sari", label: "Sarı" },
              { value: "beyaz", label: "Beyaz" },
              { value: "renkli", label: "Renkli" },
              { value: "diger", label: "Diğer" }
            ]
          }
        ]
      },
      { id: "business-equipment", name: "İş Ekipmanları", icon: "💼", count: "80" },
      { id: "industrial", name: "Endüstriyel", icon: "🏭", count: "60" },
      { 
         id: "miscellaneous", 
         name: "Çeşitli", 
         icon: "📦", 
         count: "90",
         dynamicFields: [
           {
             id: "item-type",
             name: "Eşya Türü",
             type: "select",
             required: true,
             label: "Eşya Türü",
             options: [
               { value: "antika", label: "Antika" },
               { value: "koleksiyon", label: "Koleksiyon" },
               { value: "hediyelik", label: "Hediyelik" },
               { value: "dekoratif", label: "Dekoratif" },
               { value: "el-yapimi", label: "El Yapımı" },
               { value: "vintage", label: "Vintage" },
               { value: "nadir", label: "Nadir" },
               { value: "diger", label: "Diğer" }
             ]
           },
           {
             id: "material",
             name: "Malzeme",
             type: "select",
             required: false,
             label: "Malzeme",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "metal", label: "Metal" },
               { value: "ahsap", label: "Ahşap" },
               { value: "plastik", label: "Plastik" },
               { value: "cam", label: "Cam" },
               { value: "seramik", label: "Seramik" },
               { value: "kumas", label: "Kumaş" },
               { value: "deri", label: "Deri" },
               { value: "kagit", label: "Kağıt" },
               { value: "diger", label: "Diğer" }
             ]
           },
           {
             id: "age",
             name: "Yaş",
             type: "select",
             required: false,
             label: "Yaş",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "yeni", label: "Yeni (0-5 Yıl)" },
               { value: "orta", label: "Orta (5-20 Yıl)" },
               { value: "eski", label: "Eski (20-50 Yıl)" },
               { value: "antika", label: "Antika (50+ Yıl)" }
             ]
           },
           {
             id: "condition",
             name: "Durum",
             type: "select",
             required: true,
             label: "Durum",
             options: [
               { value: "sifir", label: "Sıfır" },
               { value: "sifir-ayarinda", label: "Sıfır Ayarında" },
               { value: "cok-iyi", label: "Çok İyi" },
               { value: "iyi", label: "İyi" },
               { value: "orta", label: "Orta" },
               { value: "hasarli", label: "Hasarlı" },
               { value: "restore-edilmis", label: "Restore Edilmiş" }
             ]
           },
           {
             id: "rarity",
             name: "Nadir Seviyesi",
             type: "select",
             required: false,
             label: "Nadir Seviyesi",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "yaygın", label: "Yaygın" },
               { value: "orta", label: "Orta" },
               { value: "nadir", label: "Nadir" },
               { value: "cok-nadir", label: "Çok Nadir" },
               { value: "tek", label: "Tek" }
             ]
           },
           {
             id: "origin",
             name: "Menşei",
             type: "select",
             required: false,
             label: "Menşei",
             options: [
               { value: "farketmez", label: "Farketmez" },
               { value: "turkiye", label: "Türkiye" },
               { value: "avrupa", label: "Avrupa" },
               { value: "amerika", label: "Amerika" },
               { value: "asya", label: "Asya" },
               { value: "diger", label: "Diğer" }
             ]
           }
         ]
       }
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