'use client';

import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Search, Filter, MapPin, Calendar, DollarSign, Eye, Heart, Share2, 
  Star, Clock, Tag, Grid, List, SlidersHorizontal, ChevronDown,
  Home, Car, Wrench, Package, Users, ArrowUpDown, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCity, formatDistrict } from '@/utils/locationUtils';
import DynamicFilters from '@/components/filters/DynamicFilters';
import { getCategoryFilters } from '@/config/dynamicFilters';


const categories = [
  { id: 'emlak', name: 'Emlak', icon: Home, color: 'from-orange-500 to-red-500' },
  { id: 'vasita', name: 'Vasıta', icon: Car, color: 'from-purple-500 to-pink-500' },
  { id: 'ikinci-el-ve-sifir-alisveris', name: 'İkinci El ve Sıfır Alışveriş', icon: Package, color: 'from-blue-500 to-cyan-500' },
  { id: 'yedek-parca-aksesuar-donanım-tuning', name: 'Yedek Parça, Aksesuar, Donanım & Tuning', icon: Wrench, color: 'from-gray-600 to-gray-800' },
  { id: 'is-makineleri-sanayi', name: 'İş Makineleri & Sanayi', icon: Wrench, color: 'from-gray-600 to-gray-800' },
  { id: 'ustalar-ve-hizmetler', name: 'Ustalar ve Hizmetler', icon: Wrench, color: 'from-teal-500 to-green-500' },
  { id: 'ozel-ders-verenler', name: 'Özel Ders Verenler', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'is-ilanlari', name: 'İş İlanları', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'yardimci-arayanlar', name: 'Yardımcı Arayanlar', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'hayvanlar-alemi', name: 'Hayvanlar Alemi', icon: Users, color: 'from-green-500 to-emerald-500' }
];

// Arabam.com'dan alınan kapsamlı araç marka ve model verileri
const carMakes = {
  'alfa-romeo': 'Alfa Romeo',
  'audi': 'Audi',
  'bmw': 'BMW',
  'byd': 'BYD',
  'cadillac': 'Cadillac',
  'chery': 'Chery',
  'chevrolet': 'Chevrolet',
  'citroen': 'Citroën',
  'cupra': 'Cupra',
  'dacia': 'Dacia',
  'fiat': 'Fiat',
  'ford': 'Ford',
  'honda': 'Honda',
  'hyundai': 'Hyundai',
  'infiniti': 'Infiniti',
  'isuzu': 'Isuzu',
  'jaguar': 'Jaguar',
  'jeep': 'Jeep',
  'kia': 'Kia',
  'lada': 'Lada',
  'land-rover': 'Land Rover',
  'lexus': 'Lexus',
  'mazda': 'Mazda',
  'mercedes-benz': 'Mercedes-Benz',
  'mini': 'Mini',
  'mitsubishi': 'Mitsubishi',
  'nissan': 'Nissan',
  'opel': 'Opel',
  'peugeot': 'Peugeot',
  'porsche': 'Porsche',
  'renault': 'Renault',
  'seat': 'Seat',
  'skoda': 'Škoda',
  'subaru': 'Subaru',
  'suzuki': 'Suzuki',
  'tesla': 'Tesla',
  'toyota': 'Toyota',
  'volkswagen': 'Volkswagen',
  'volvo': 'Volvo'
};

const carModels = {
  'alfa-romeo': ['Giulia', 'Giulietta', 'Stelvio', 'Tonale', 'Junior'],
  'audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron GT'],
  'bmw': ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', '6 Serisi', '7 Serisi', '8 Serisi', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX', 'iX1', 'iX2', 'iX3'],
  'byd': ['Atto 3', 'Han', 'Tang', 'Song Plus', 'Dolphin', 'Seal'],
  'cadillac': ['Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5'],
  'chery': ['Tiggo 7 Pro', 'Tiggo 8 Pro', 'Tiggo 7 Pro Max', 'Tiggo 8 Pro Max', 'Omoda 5', 'Omoda 5 Pro', 'Arrizo 6'],
  'chevrolet': ['Aveo', 'Cruze', 'Malibu', 'Camaro', 'Corvette', 'Tahoe', 'Suburban', 'Silverado', 'Blazer', 'Trax', 'Captiva'],
  'citroen': ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C4 Cactus', 'C4 SUV', 'C5 Aircross', 'Berlingo', 'Jumpy'],
  'cupra': ['Formentor', 'Leon', 'Ateca', 'Terramar', 'Born'],
  'dacia': ['Sandero', 'Logan', 'Duster', 'Lodgy', 'Dokker', 'Spring', 'Jogger'],
  'fiat': ['500', '500X', '500L', 'Panda', 'Tipo', 'Egea', 'Doblo', 'Ducato', 'Fiorino'],
  'ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'EcoSport', 'Kuga', 'Edge', 'Explorer', 'Ranger', 'Transit', 'Tourneo'],
  'honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'Pilot', 'Ridgeline', 'Passport', 'Insight'],
  'hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq', 'Ioniq 5', 'Ioniq 6'],
  'infiniti': ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX70', 'QX80'],
  'isuzu': ['D-Max', 'MU-X', 'NPR', 'NQR'],
  'jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
  'jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Avenger'],
  'kia': ['Picanto', 'Rio', 'Ceed', 'Cerato', 'Optima', 'Stinger', 'Sportage', 'Sorento', 'Niro', 'EV6', 'EV9'],
  'lada': ['Vesta', 'Granta', 'Largus', 'XRAY', 'Niva'],
  'land-rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'],
  'lexus': ['IS', 'ES', 'GS', 'LS', 'RC', 'LC', 'UX', 'NX', 'RX', 'GX', 'LX'],
  'mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-90', 'MX-5'],
  'mercedes-benz': ['A Serisi', 'B Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G Serisi', 'AMG GT', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS'],
  'mini': ['Cooper', 'Clubman', 'Countryman', 'Convertible', 'Electric'],
  'mitsubishi': ['Mirage', 'Lancer', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200', 'ASX'],
  'nissan': ['Micra', 'Note', 'Sentra', 'Altima', 'Maxima', 'Juke', 'Qashqai', 'X-Trail', 'Murano', 'Pathfinder', 'Navara', 'Leaf', 'Ariya'],
  'opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka', 'Combo', 'Vivaro'],
  'peugeot': ['108', '208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Boxer'],
  'porsche': ['911', 'Boxster', 'Cayman', 'Panamera', 'Cayenne', 'Macan', 'Taycan'],
  'renault': ['Clio', 'Megane', 'Talisman', 'Captur', 'Kadjar', 'Koleos', 'Scenic', 'Espace', 'Kangoo', 'Trafic', 'Master'],
  'seat': ['Ibiza', 'Leon', 'Toledo', 'Arona', 'Ateca', 'Tarraco', 'Alhambra'],
  'skoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  'subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'WRX', 'BRZ'],
  'suzuki': ['Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'Ignis', 'SX4'],
  'tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'toyota': ['Yaris', 'Corolla', 'Camry', 'Avalon', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Prius', 'Hilux', 'Proace'],
  'volkswagen': ['Polo', 'Golf', 'Jetta', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'Caddy', 'Transporter'],
  'volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'C40', 'EX30', 'EX90']
};

const subcategories = {
  'emlak': ['Konut', 'İş Yeri', 'Arsa', 'Devremülk', 'Turistik Tesis'],
  'vasita': ['Otomobil', 'Arazi, SUV & Pickup', 'Motosiklet', 'Minivan & Panelvan', 'Ticari Araçlar', 'Kiralık Araçlar', 'Deniz Araçları', 'Hasarlı Araçlar', 'Klasik Araçlar', 'Elektrikli Araçlar'],
  'ikinci-el-ve-sifir-alisveris': ['Bilgisayar', 'Ev Dekorasyon', 'Giyim & Aksesuar', 'Kişisel Bakım & Kozmetik', 'Kitap, Dergi & Film', 'Takı, Mücevher & Altın', 'Bahçe & Yapı Market', 'Yiyecek & İçecek', 'Cep Telefonu & Aksesuar', 'Ev Elektroniği', 'Elektronik', 'Saat', 'Hobi & Oyuncak'],
  'yedek-parca-aksesuar-donanım-tuning': ['Otomotiv Ekipmanları', 'Motosiklet Ekipmanları', 'Deniz Aracı Ekipmanları', 'Araç / Dorse', 'Lastik & Jant', 'Ses & Görüntü Sistemleri', 'Oto Teyp', 'Oto Hoparlör', 'Navigasyon', 'Yedek Parça', 'Tuning & Modifiye', 'Oto Aksesuar'],
  'is-makineleri-sanayi': ['İş Makineleri', 'Tarım Makineleri', 'Sanayi', 'Elektrik & Enerji'],
  'ustalar-ve-hizmetler': ['Ev Tadilat & Dekorasyon', 'Nakliye', 'Araç Servis & Bakım', 'Özel Ders', 'Sağlık & Güzellik', 'Etkinlik & Organizasyon', 'İşletme & Reklam', 'Temizlik', 'Yazılım & Tasarım', 'Danışmanlık', 'Fotoğraf & Video', 'Düğün', 'Müzik & Sanat', 'Diğer Hizmetler'],
  'ozel-ders-verenler': ['Lise & Üniversite Hazırlık', 'Yabancı Dil', 'Bilgisayar', 'Direksiyon', 'Spor', 'Müzik', 'Güzel Sanatlar', 'Mesleki Dersler', 'Kişisel Gelişim'],
  'is-ilanlari': ['Avukatlık & Hukuki Danışmanlık', 'Eğitim', 'Güzellik & Bakım', 'Sağlık', 'Turizm', 'Restoran & Konaklama', 'Güvenlik', 'Temizlik', 'Üretim & İmalathaneler', 'Muhasebe & Finans', 'Pazarlama & Reklam', 'Mühendislik', 'Yönetim', 'Mağaza & Market', 'Şoför & Kurye', 'Part Time & Ek İş', 'Stajyer', 'Diğer İş İlanları'],
  'yardimci-arayanlar': ['Bebek & Çocuk Bakıcısı', 'Yaşlı Bakıcısı', 'Temizlikçi', 'Hasta Bakıcısı', 'Ev İşi Yardımı', 'Hayvan Bakıcısı', 'Diğer'],
  'hayvanlar-alemi': ['Evcil Hayvanlar', 'Akvaryum Balıkları', 'Kuşlar', 'Küçükbaş Hayvanlar', 'Büyükbaş Hayvanlar', 'Sürüngenler', 'Yem & Mama', 'Aksesuarlar']
};

// İkinci el kategorisi için marka ve model verileri
const secondHandBrands = {
  'Cep Telefonu & Aksesuar': {
    'Apple': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X', 'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7', 'iPhone SE'],
    'Samsung': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22', 'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy Note 20 Ultra', 'Galaxy Note 20', 'Galaxy A54', 'Galaxy A34', 'Galaxy A24', 'Galaxy A14', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy Z Fold 4', 'Galaxy Z Flip 4'],
    'Xiaomi': ['Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12 Pro', 'Redmi Note 12', 'Redmi Note 11 Pro', 'Redmi Note 11', 'Mi 13 Ultra', 'Mi 13 Pro', 'Mi 13', 'Mi 12 Pro', 'Mi 12', 'Mi 11 Ultra', 'Mi 11 Pro', 'Mi 11', 'POCO X5 Pro', 'POCO X5', 'POCO F5 Pro', 'POCO F5'],
    'Huawei': ['P60 Pro', 'P60', 'P50 Pro', 'P50', 'Mate 50 Pro', 'Mate 50', 'Nova 11 Pro', 'Nova 11', 'Nova 10 Pro', 'Nova 10', 'Y90', 'Y70', 'P40 Pro', 'P40', 'P30 Pro', 'P30'],
    'Oppo': ['Find X6 Pro', 'Find X6', 'Find X5 Pro', 'Find X5', 'Reno 10 Pro', 'Reno 10', 'Reno 8 Pro', 'Reno 8', 'A98', 'A78', 'A58', 'A38'],
    'Vivo': ['X90 Pro', 'X90', 'V29 Pro', 'V29', 'V27 Pro', 'V27', 'Y36', 'Y27', 'Y17', 'Y02'],
    'OnePlus': ['11 Pro', '11', '10 Pro', '10T', '10', '9 Pro', '9', 'Nord 3', 'Nord CE 3', 'Nord 2T'],
    'Google': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6 Pro', 'Pixel 6', 'Pixel 5'],
    'Realme': ['GT 3', 'GT 2 Pro', 'GT 2', '11 Pro', '11', '10 Pro', '10', 'C55', 'C53', 'C35'],
    'Honor': ['Magic 5 Pro', 'Magic 5', 'Magic 4 Pro', 'Magic 4', '90 Pro', '90', '70 Pro', '70', 'X9a', 'X8a'],
    'Nothing': ['Phone (2)', 'Phone (1)', 'Phone (2a)'],
    'Motorola': ['Edge 40 Pro', 'Edge 40', 'Edge 30 Pro', 'Edge 30', 'Moto G73', 'Moto G53', 'Moto G23'],
    'Nokia': ['G60', 'G50', 'G21', 'G11', 'X30', 'X20', 'X10'],
    'Asus': ['ROG Phone 7', 'ROG Phone 6', 'Zenfone 10', 'Zenfone 9']
  },
  'Bilgisayar': {
    'Apple': ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Air 15"', 'MacBook Air 13"', 'iMac 24"', 'Mac Studio', 'Mac Pro', 'Mac mini'],
    'Dell': ['XPS 13', 'XPS 15', 'XPS 17', 'Inspiron 15', 'Inspiron 14', 'Latitude 7000', 'Latitude 5000', 'Precision 7000', 'Alienware m15', 'Alienware m17'],
    'HP': ['Spectre x360', 'Envy 13', 'Envy 15', 'Pavilion 15', 'Pavilion 14', 'EliteBook 850', 'EliteBook 840', 'ProBook 450', 'Omen 15', 'Omen 17'],
    'Lenovo': ['ThinkPad X1 Carbon', 'ThinkPad T14', 'ThinkPad E15', 'IdeaPad 5', 'IdeaPad 3', 'Yoga 9i', 'Yoga 7i', 'Legion 5', 'Legion 7'],
    'Asus': ['ZenBook 14', 'ZenBook 13', 'VivoBook 15', 'VivoBook 14', 'ROG Strix G15', 'ROG Zephyrus G14', 'TUF Gaming A15', 'ProArt StudioBook'],
    'Acer': ['Swift 3', 'Swift 5', 'Aspire 5', 'Aspire 7', 'Predator Helios 300', 'Nitro 5', 'ConceptD 7'],
    'MSI': ['GS66 Stealth', 'GE76 Raider', 'GP66 Leopard', 'Modern 14', 'Prestige 14', 'Creator 15'],
    'Samsung': ['Galaxy Book3 Pro', 'Galaxy Book3', 'Galaxy Book2 Pro', 'Galaxy Book2'],
    'Toshiba': ['Satellite Pro', 'Portégé', 'Tecra'],
    'Huawei': ['MateBook X Pro', 'MateBook 14', 'MateBook D15', 'MateBook D14'],
    'Microsoft': ['Surface Laptop 5', 'Surface Pro 9', 'Surface Studio 2+', 'Surface Book 3'],
    'Razer': ['Blade 15', 'Blade 14', 'Blade 17', 'Book 13'],
    'Gigabyte': ['Aero 15', 'Aero 17', 'Aorus 15G', 'Aorus 17G']
  },
  'Ev Elektroniği': {
    'Samsung': ['QLED TV', 'Crystal UHD TV', 'Neo QLED TV', 'The Frame TV', 'Soundbar', 'Buzdolabı', 'Çamaşır Makinesi'],
    'LG': ['OLED TV', 'NanoCell TV', 'UltraGear Monitor', 'Soundbar', 'Buzdolabı', 'Çamaşır Makinesi'],
    'Sony': ['Bravia XR TV', 'Bravia TV', 'PlayStation 5', 'PlayStation 4', 'Soundbar', 'Kulaklık'],
    'TCL': ['QLED TV', 'Android TV', 'Smart TV'],
    'Xiaomi': ['Mi TV', 'Redmi TV', 'Mi Box', 'Mi Band'],
    'Philips': ['Ambilight TV', 'Smart TV', 'Soundbar'],
    'Beko': ['Buzdolabı', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Fırın'],
    'Arçelik': ['Buzdolabı', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Televizyon'],
    'Vestel': ['Smart TV', 'LED TV', 'Buzdolabı', 'Çamaşır Makinesi'],
    'Bosch': ['Buzdolabı', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Fırın'],
    'Siemens': ['Buzdolabı', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Fırın'],
    'Panasonic': ['TV', 'Mikrodalga', 'Klima', 'Ses Sistemi'],
    'Toshiba': ['TV', 'Klima', 'Buzdolabı'],
    'Sharp': ['TV', 'Klima', 'Mikrodalga'],
    'Hisense': ['Smart TV', 'ULED TV', 'Laser TV'],
    'JBL': ['Hoparlör', 'Soundbar', 'Kulaklık'],
    'Harman Kardon': ['Hoparlör', 'Soundbar', 'Ses Sistemi'],
    'Bose': ['Hoparlör', 'Kulaklık', 'Soundbar'],
    'Marshall': ['Hoparlör', 'Kulaklık', 'Amfi']
  },
  'Elektronik': {
    'Apple': ['iPhone', 'iPad', 'MacBook', 'iMac', 'Apple Watch', 'AirPods', 'Apple TV'],
    'Samsung': ['Galaxy S', 'Galaxy Note', 'Galaxy Tab', 'Galaxy Watch', 'Galaxy Buds', 'Smart TV'],
    'Sony': ['PlayStation', 'Xperia', 'Bravia TV', 'WH-1000XM', 'Alpha Kamera', 'Walkman'],
    'LG': ['OLED TV', 'NanoCell TV', 'Gram Laptop', 'Wing Phone', 'Tone Kulaklık'],
    'Huawei': ['P Series', 'Mate Series', 'Nova Series', 'MateBook', 'FreeBuds', 'Watch GT'],
    'Xiaomi': ['Mi Phone', 'Redmi', 'Mi Laptop', 'Mi Band', 'Mi TV', 'Mi Earbuds'],
    'Canon': ['EOS Kamera', 'PowerShot', 'PIXMA Yazıcı', 'SELPHY', 'Lens'],
    'Nikon': ['D Series', 'Z Series', 'Coolpix', 'Lens', 'Speedlight'],
    'Panasonic': ['Lumix Kamera', 'Viera TV', 'Toughbook', 'Eneloop'],
    'JBL': ['Charge', 'Flip', 'Clip', 'Tune', 'Live', 'Reflect'],
    'Bose': ['QuietComfort', 'SoundLink', 'SoundSport', 'Wave', 'Lifestyle'],
    'Beats': ['Studio', 'Solo', 'Powerbeats', 'AirPods', 'Pill'],
    'Sennheiser': ['HD Series', 'Momentum', 'CX Series', 'PXC Series'],
    'Audio-Technica': ['ATH-M50x', 'ATH-WS1100', 'ATH-CKR', 'ATH-MSR7'],
    'Marshall': ['Acton', 'Stanmore', 'Woburn', 'Monitor', 'Major'],
    'Harman Kardon': ['Onyx', 'Aura', 'Esquire', 'Citation', 'SoundSticks'],
    'Bang & Olufsen': ['Beoplay', 'BeoSound', 'BeoVision', 'Beocom'],
    'Philips': ['Hue', 'Sonicare', 'Norelco', 'Ambilight TV', 'SpeechAir'],
    'Pioneer': ['DJ Controller', 'Car Audio', 'Home Audio', 'Headphones'],
    'Yamaha': ['Receiver', 'Soundbar', 'Piano', 'Guitar', 'Mixer'],
    'Denon': ['Receiver', 'Turntable', 'Headphones', 'Speakers'],
    'Marantz': ['Receiver', 'CD Player', 'Turntable', 'Amplifier'],
    'Onkyo': ['Receiver', 'Speakers', 'Headphones', 'CD Player'],
    'KEF': ['LS50', 'Q Series', 'R Series', 'Reference'],
    'Klipsch': ['Reference', 'Heritage', 'The Sixes', 'ProMedia'],
    'Polk Audio': ['Signature', 'Reserve', 'MagniFi', 'Command Bar'],
    'Focal': ['Utopia', 'Clear', 'Elegia', 'Listen'],
    'B&W': ['800 Series', '700 Series', 'Formation', 'PX Series'],
    'Monitor Audio': ['Silver', 'Bronze', 'Gold', 'Platinum'],
    'Wharfedale': ['Diamond', 'EVO', 'Linton', 'Denton'],
    'Mission': ['LX Series', 'QX Series', 'VX Series'],
    'Tannoy': ['Revolution', 'Legacy', 'Gold Reference'],
    'Dynaudio': ['Evoke', 'Confidence', 'Special Forty'],
    'Elac': ['Debut', 'Uni-Fi', 'Adante', 'Concentro'],
    'Paradigm': ['Premier', 'Founder', 'Monitor SE'],
    'PSB': ['Alpha', 'Imagine', 'Synchrony'],
    'Definitive Technology': ['BP Series', 'SM Series', 'Studio Monitor'],
    'SVS': ['Prime', 'Ultra', 'SB Series', 'PB Series'],
    'REL': ['T Series', 'S Series', 'Carbon Limited'],
    'Velodyne': ['Impact', 'Deep Blue', 'Optimum'],
    'Sunfire': ['True Subwoofer', 'XTEQ', 'Atmos'],
    'MartinLogan': ['Motion', 'ElectroMotion', 'Masterpiece'],
    'Magnepan': ['LRS', '.7 Series', '1.7i', '3.7i'],
    'Wilson Audio': ['Watt/Puppy', 'Sasha', 'Alexia', 'MAXX'],
    'Sonus Faber': ['Sonetto', 'Olympica', 'Amati'],
    'Revel': ['Performa3', 'Ultima2', 'Concerta2'],
    'Thiel': ['CS Series', 'SCS4', 'PowerPoint'],
    'Vandersteen': ['1Ci', '2Ce', '3A', 'Quattro'],
    'ProAc': ['Response', 'Studio', 'Tablette'],
    'Spendor': ['Classic', 'A-Line', 'D-Line'],
    'Harbeth': ['P3ESR', 'C7ES-3', 'M30.2'],
    'ATC': ['SCM Series', 'Entry Series'],
    'PMC': ['Twenty5', 'Fact', 'Result6'],
    'Genelec': ['8000 Series', '8300 Series', 'S360'],
    'Adam Audio': ['A Series', 'T Series', 'S Series'],
    'Focal Professional': ['Alpha', 'Shape', 'Twin6'],
    'KRK': ['Rokit', 'Classic', 'V Series'],
    'Yamaha Pro': ['HS Series', 'MSP Series', 'NS Series'],
    'JBL Professional': ['LSR Series', '4000 Series', 'Control'],
    'QSC': ['K Series', 'KW Series', 'CP Series'],
    'Crown': ['XTi Series', 'XLS Series', 'CDi Series'],
    'Mackie': ['Thump', 'SRM', 'CR Series'],
    'Behringer': ['Eurolive', 'Truth', 'Studio'],
    'PreSonus': ['Eris', 'Sceptre', 'R Series'],
    'Focusrite': ['Scarlett', 'Clarett', 'Red'],
    'RME': ['Babyface', 'Fireface', 'ADI'],
    'Universal Audio': ['Apollo', 'Arrow', 'Volt'],
    'Antelope Audio': ['Zen', 'Discrete', 'Orion'],
    'Apogee': ['Duet', 'Quartet', 'Symphony'],
    'MOTU': ['M Series', 'UltraLite', 'Traveler'],
    'Zoom': ['PodTrak', 'LiveTrak', 'H Series'],
    'Tascam': ['DR Series', 'Model Series', 'US Series'],
    'Roland': ['Jupiter', 'Juno', 'System'],
    'Korg': ['Minilogue', 'Prologue', 'Volca'],
    'Casio': ['Privia', 'Celviano', 'CT Series'],
    'Kawai': ['ES Series', 'MP Series', 'CA Series'],
    'Kurzweil': ['PC4', 'Forte', 'SP Series'],
    'Nord': ['Stage', 'Piano', 'Lead'],
    'Moog': ['Subsequent', 'Mother', 'Grandmother'],
    'Sequential': ['Prophet', 'OB-6', 'Pro 3'],
    'Arturia': ['MiniLab', 'KeyLab', 'BeatStep'],
    'Novation': ['Launchkey', 'Launchpad', 'Circuit'],
    'Akai': ['MPK', 'MPC', 'LPK'],
    'Native Instruments': ['Komplete', 'Maschine', 'Traktor'],
    'M-Audio': ['Keystation', 'Oxygen', 'Code'],
    'Nektar': ['Impact', 'Panorama', 'SE25'],
    'Studiologic': ['SL88', 'Numa', 'VMK'],
    'CME': ['Xkey', 'UF Series', 'VX Series'],
    'Doepfer': ['A-100', 'Dark Energy', 'MAQ'],
    'Teenage Engineering': ['OP-1', 'OP-Z', 'PO Series'],
    'Elektron': ['Digitakt', 'Analog', 'Octatrack'],
    'Dave Smith': ['Prophet', 'Tempest', 'Mopho'],
    'Access': ['Virus', 'TI2', 'Snow'],
    'Waldorf': ['Blofeld', 'Quantum', 'Streichfett'],
    'Clavia': ['Nord Lead', 'Nord Drum', 'Nord Wave'],
    'Oberheim': ['OB-6', 'Matrix', 'Xpander'],
    'Prophet': ['Prophet-5', 'Prophet-6', 'Prophet X'],
    'Minimoog': ['Model D', 'Voyager', 'Sub 37'],
    'Sub 37': ['Subsequent 37', 'Sub Phatty', 'Little Phatty'],
    'Subsequent': ['Subsequent 25', 'Subsequent 37CV'],
    'Matriarch': ['Semi-Modular', 'Analog', 'Paraphonic'],
    'Grandmother': ['Semi-Modular', 'Analog', 'Monophonic'],
    'Mother-32': ['Semi-Modular', 'Analog', 'Sequencer'],
    'DFAM': ['Drummer', 'Analog', 'Semi-Modular'],
    'Subharmonicon': ['Semi-Modular', 'Polyrhythmic', 'Analog'],
    'Mavis': ['Semi-Modular', 'Analog', 'Synthesizer'],
    'Werkstatt': ['DIY', 'Analog', 'Synthesizer'],
    'Minitaur': ['Bass', 'Analog', 'Synthesizer'],
    'Slim Phatty': ['Analog', 'Monophonic', 'Synthesizer'],
    'Little Phatty': ['Analog', 'Monophonic', 'Synthesizer'],
    'Voyager': ['Analog', 'Monophonic', 'Performance'],
    'One': ['Analog', 'Monophonic', 'Synthesizer']
  },
  'Saat': {
    'Apple': ['Apple Watch Series 9', 'Apple Watch SE', 'Apple Watch Ultra 2'],
    'Samsung': ['Galaxy Watch6', 'Galaxy Watch5', 'Galaxy Watch4', 'Galaxy Watch Active2'],
    'Rolex': ['Submariner', 'Datejust', 'GMT-Master II', 'Daytona', 'Explorer', 'Sea-Dweller'],
    'Omega': ['Speedmaster', 'Seamaster', 'Constellation', 'De Ville'],
    'Casio': ['G-Shock', 'Pro Trek', 'Edifice', 'Baby-G'],
    'Seiko': ['Prospex', 'Presage', 'Premier', '5 Sports'],
    'Citizen': ['Eco-Drive', 'Promaster', 'Satellite Wave'],
    'Fossil': ['Gen 6', 'Sport', 'Hybrid HR'],
    'Tag Heuer': ['Formula 1', 'Carrera', 'Monaco', 'Aquaracer'],
    'Tissot': ['PRC 200', 'Seastar', 'T-Classic', 'T-Sport'],
    'Breitling': ['Navitimer', 'Superocean', 'Premier', 'Chronomat'],
    'Longines': ['HydroConquest', 'Master Collection', 'Conquest', 'Heritage'],
    'IWC': ['Pilot', 'Portugieser', 'Aquatimer', 'Ingenieur'],
    'Patek Philippe': ['Calatrava', 'Nautilus', 'Aquanaut', 'Complications'],
    'Audemars Piguet': ['Royal Oak', 'Royal Oak Offshore', 'Millenary', 'Jules Audemars'],
    'Cartier': ['Tank', 'Santos', 'Ballon Bleu', 'Panthère'],
    'Hublot': ['Big Bang', 'Classic Fusion', 'Spirit of Big Bang', 'MP Collection'],
    'Panerai': ['Luminor', 'Radiomir', 'Submersible', 'Due'],
    'Tudor': ['Black Bay', 'Pelagos', 'Royal', 'Ranger'],
    'Garmin': ['Fenix', 'Forerunner', 'Vivoactive', 'Instinct'],
    'Fitbit': ['Versa', 'Charge', 'Inspire', 'Sense'],
    'Huawei': ['Watch GT', 'Watch Fit', 'Watch D']
  },
  'Ev Dekorasyon': {
    'IKEA': ['Mobilya', 'Dekorasyon', 'Aydınlatma', 'Tekstil'],
    'Bellona': ['Koltuk Takımı', 'Yatak Odası', 'Yemek Odası', 'Genç Odası'],
    'Doğtaş': ['Koltuk Takımı', 'Yatak Odası', 'Yemek Odası'],
    'İstikbal': ['Koltuk Takımı', 'Yatak Odası', 'Yemek Odası', 'Yatak'],
    'Kelebek': ['Koltuk Takımı', 'Yatak Odası', 'Yemek Odası'],
    'Alfemo': ['Koltuk Takımı', 'Yatak Odası', 'Yemek Odası'],
    'Mondi': ['Yatak Odası', 'Yemek Odası', 'Genç Odası'],
    'Yataş': ['Yatak', 'Baza', 'Yatak Odası'],
    'Koçtaş': ['Mobilya', 'Dekorasyon', 'Bahçe', 'Yapı Market'],
    'Bauhaus': ['Mobilya', 'Dekorasyon', 'Bahçe', 'Yapı Market'],
    'English Home': ['Ev Tekstili', 'Dekorasyon', 'Mutfak', 'Banyo'],
    'Zara Home': ['Ev Tekstili', 'Dekorasyon', 'Mutfak', 'Banyo'],
    'H&M Home': ['Ev Tekstili', 'Dekorasyon', 'Mutfak', 'Banyo'],
    'LC Waikiki': ['Ev Tekstili', 'Dekorasyon', 'Mutfak', 'Banyo']
  },
  'Giyim & Aksesuar': {
    'Nike': ['Ayakkabı', 'Spor Giyim', 'Aksesuar'],
    'Adidas': ['Ayakkabı', 'Spor Giyim', 'Aksesuar'],
    'Zara': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim'],
    'H&M': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim'],
    'Mango': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim'],
    'LC Waikiki': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim'],
    'Koton': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim'],
    'DeFacto': ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim'],
    'Mavi': ['Jean', 'Kadın Giyim', 'Erkek Giyim'],
    'Levi\'s': ['Jean', 'Kadın Giyim', 'Erkek Giyim'],
    'Puma': ['Ayakkabı', 'Spor Giyim', 'Aksesuar'],
    'Converse': ['Ayakkabı', 'Giyim', 'Aksesuar'],
    'Vans': ['Ayakkabı', 'Giyim', 'Aksesuar'],
    'New Balance': ['Ayakkabı', 'Spor Giyim'],
    'Reebok': ['Ayakkabı', 'Spor Giyim'],
    'Under Armour': ['Spor Giyim', 'Ayakkabı', 'Aksesuar'],
    'Tommy Hilfiger': ['Kadın Giyim', 'Erkek Giyim', 'Aksesuar'],
    'Calvin Klein': ['Kadın Giyim', 'Erkek Giyim', 'İç Giyim'],
    'Lacoste': ['Polo', 'Spor Giyim', 'Ayakkabı'],
    'Ralph Lauren': ['Polo', 'Gömlek', 'Aksesuar']
  },
  'Kişisel Bakım & Kozmetik': {
    'L\'Oréal': ['Saç Bakımı', 'Makyaj', 'Cilt Bakımı'],
    'Nivea': ['Cilt Bakımı', 'Vücut Bakımı', 'Güneş Kremi'],
    'Garnier': ['Saç Bakımı', 'Cilt Bakımı', 'Makyaj'],
    'Maybelline': ['Makyaj', 'Ruj', 'Maskara'],
    'MAC': ['Makyaj', 'Ruj', 'Fondöten'],
    'Clinique': ['Cilt Bakımı', 'Makyaj', 'Parfüm'],
    'Estée Lauder': ['Makyaj', 'Cilt Bakımı', 'Parfüm'],
    'Lancôme': ['Makyaj', 'Cilt Bakımı', 'Parfüm'],
    'Chanel': ['Makyaj', 'Parfüm', 'Cilt Bakımı'],
    'Dior': ['Makyaj', 'Parfüm', 'Cilt Bakımı'],
    'YSL': ['Makyaj', 'Parfüm', 'Cilt Bakımı'],
    'Tom Ford': ['Makyaj', 'Parfüm'],
    'Giorgio Armani': ['Makyaj', 'Parfüm'],
    'Versace': ['Parfüm', 'Makyaj'],
    'Hugo Boss': ['Parfüm', 'Erkek Bakımı'],
    'Calvin Klein': ['Parfüm', 'Vücut Bakımı'],
    'Dolce & Gabbana': ['Parfüm', 'Makyaj'],
    'Prada': ['Parfüm', 'Makyaj'],
    'Burberry': ['Parfüm', 'Makyaj'],
    'Hermès': ['Parfüm', 'Cilt Bakımı']
  },
  'Kitap, Dergi & Film': {
    'Penguin': ['Edebiyat', 'Klasikler', 'Çocuk Kitapları'],
    'İş Bankası Kültür': ['Edebiyat', 'Tarih', 'Sanat'],
    'Yapı Kredi': ['Edebiyat', 'Felsefe', 'Tarih'],
    'Can Yayınları': ['Edebiyat', 'Çeviri', 'Deneme'],
    'Doğan Kitap': ['Roman', 'Biyografi', 'Çocuk Kitapları'],
    'Everest': ['Çocuk Kitapları', 'Eğitim', 'Sözlük'],
    'Tudem': ['Çocuk Kitapları', 'Gençlik Romanları'],
    'Epsilon': ['Bilim', 'Teknoloji', 'Matematik'],
    'Palme': ['Eğitim', 'Test Kitapları', 'Sözlük'],
    'Karekök': ['Matematik', 'Fen Bilimleri', 'Test'],
    'Marvel': ['Çizgi Roman', 'Süper Kahraman'],
    'DC Comics': ['Çizgi Roman', 'Süper Kahraman'],
    'Disney': ['Çocuk Kitapları', 'Film', 'Çizgi Film'],
    'National Geographic': ['Belgesel', 'Doğa', 'Bilim'],
    'Time': ['Dergi', 'Haber', 'Politika']
  },
  'Takı, Mücevher & Altın': {
    'Atasay': ['Altın', 'Pırlanta', 'Gümüş'],
    'Pandora': ['Charm', 'Bileklik', 'Yüzük'],
    'Swarovski': ['Kristal', 'Kolye', 'Küpe'],
    'Tiffany & Co.': ['Pırlanta', 'Gümüş', 'Altın'],
    'Cartier': ['Altın', 'Pırlanta', 'Saat'],
    'Bulgari': ['Altın', 'Pırlanta', 'Mücevher'],
    'Van Cleef & Arpels': ['Altın', 'Pırlanta', 'Mücevher'],
    'Harry Winston': ['Pırlanta', 'Altın', 'Mücevher'],
    'Chopard': ['Altın', 'Pırlanta', 'Saat'],
    'Boucheron': ['Altın', 'Pırlanta', 'Mücevher'],
    'Piaget': ['Altın', 'Pırlanta', 'Saat'],
    'Graff': ['Pırlanta', 'Altın', 'Mücevher'],
    'Mikimoto': ['İnci', 'Altın', 'Mücevher'],
    'David Yurman': ['Gümüş', 'Altın', 'Mücevher'],
    'John Hardy': ['Gümüş', 'Altın', 'Mücevher']
  },
  'Bahçe & Yapı Market': {
    'Bosch': ['Elektrikli Aletler', 'Bahçe Aletleri', 'Ölçüm Aletleri'],
    'Makita': ['Elektrikli Aletler', 'Bahçe Aletleri', 'Şarjlı Aletler'],
    'DeWalt': ['Elektrikli Aletler', 'El Aletleri', 'Ölçüm Aletleri'],
    'Black & Decker': ['Elektrikli Aletler', 'Bahçe Aletleri', 'El Aletleri'],
    'Einhell': ['Elektrikli Aletler', 'Bahçe Aletleri', 'Kompresör'],
    'Ryobi': ['Elektrikli Aletler', 'Bahçe Aletleri', 'Şarjlı Aletler'],
    'Worx': ['Bahçe Aletleri', 'Elektrikli Aletler', 'Robot Çim Biçme'],
    'Gardena': ['Bahçe Aletleri', 'Sulama Sistemleri', 'El Aletleri'],
    'Fiskars': ['Bahçe Aletleri', 'El Aletleri', 'Makas'],
    'Husqvarna': ['Çim Biçme Makinesi', 'Motorlu Testere', 'Robot Çim Biçme'],
    'Stihl': ['Motorlu Testere', 'Çim Biçme', 'Bahçe Aletleri'],
    'Honda': ['Çim Biçme Makinesi', 'Jeneratör', 'Su Motoru'],
    'Yamaha': ['Jeneratör', 'Su Motoru', 'Motor'],
    'Karcher': ['Yüksek Basınçlı Yıkayıcı', 'Temizlik Makinesi', 'Elektrikli Süpürge'],
    'Nilfisk': ['Endüstriyel Temizlik', 'Yüksek Basınçlı Yıkayıcı', 'Elektrikli Süpürge']
  },
  'Yiyecek & İçecek': {
    'Ülker': ['Bisküvi', 'Çikolata', 'Gofret'],
    'Eti': ['Bisküvi', 'Çikolata', 'Kraker'],
    'Tadelle': ['Çikolata', 'Gofret', 'Bar'],
    'Godiva': ['Çikolata', 'Truffle', 'Pralin'],
    'Ferrero': ['Çikolata', 'Nutella', 'Rocher'],
    'Nestle': ['Çikolata', 'Kahve', 'Süt Ürünleri'],
    'Coca Cola': ['Kola', 'Gazlı İçecek', 'Meyve Suyu'],
    'Pepsi': ['Kola', 'Gazlı İçecek', 'Meyve Suyu'],
    'Fanta': ['Gazlı İçecek', 'Meyve Suyu', 'Portakal'],
    'Sprite': ['Gazlı İçecek', 'Limon', 'Şekersiz'],
    'Red Bull': ['Enerji İçeceği', 'Spor İçeceği'],
    'Monster': ['Enerji İçeceği', 'Spor İçeceği'],
    'Starbucks': ['Kahve', 'Frappuccino', 'Çay'],
    'Nescafe': ['Kahve', 'Cappuccino', 'Latte'],
    'Lipton': ['Çay', 'Ice Tea', 'Yeşil Çay']
  },
  'Hobi & Oyuncak': {
    'LEGO': ['Yapı Setleri', 'Technic', 'Creator', 'City'],
    'Barbie': ['Bebek', 'Aksesuar', 'Ev', 'Araba'],
    'Hot Wheels': ['Oyuncak Araba', 'Pist', 'Aksesuar'],
    'Playmobil': ['Figür', 'Ev', 'Araba', 'Şehir'],
    'Fisher-Price': ['Bebek Oyuncağı', 'Eğitici Oyuncak', 'Müzik'],
    'Hasbro': ['Transformers', 'My Little Pony', 'Monopoly'],
    'Mattel': ['Barbie', 'Hot Wheels', 'UNO'],
    'Ravensburger': ['Puzzle', 'Oyun', 'Eğitici'],
    'Clementoni': ['Puzzle', 'Bilim Seti', 'Eğitici'],
    'Educa': ['Puzzle', 'Oyun', 'Eğitici'],
    'Yamaha': ['Piyano', 'Gitar', 'Keman'],
    'Fender': ['Gitar', 'Bas Gitar', 'Amfi'],
    'Gibson': ['Gitar', 'Bas Gitar', 'Elektro Gitar'],
    'Roland': ['Piyano', 'Davul', 'Synthesizer'],
    'Casio': ['Piyano', 'Klavye', 'Hesap Makinesi']
  }
};

// Yedek parça kategorisi için marka ve modeller
const spareBrands = {
  'Bosch': {
    models: ['Fren Balata', 'Amortisör', 'Filtre', 'Buji', 'Sensör', 'Yakıt Pompası'],
    series: ['Professional', 'Original', 'Plus', 'Super']
  },
  'Sachs': {
    models: ['Amortisör', 'Debriyaj', 'Fren Diski', 'Salıncak'],
    series: ['Performance', 'Original', 'Race Engineering']
  },
  'Brembo': {
    models: ['Fren Balata', 'Fren Diski', 'Fren Kaliper', 'Fren Hortumu'],
    series: ['GT', 'Sport', 'Racing', 'Original']
  },
  'Mahle': {
    models: ['Filtre', 'Piston', 'Termostat', 'Turbo'],
    series: ['Original', 'OC', 'LX', 'KX']
  },
  'Febi': {
    models: ['Salıncak', 'Rotil', 'Amortisör Takozu', 'Motor Takozu'],
    series: ['Bilstein Group', 'Original']
  },
  'NGK': {
    models: ['Buji', 'Ateşleme Bobini', 'Lambda Sondası'],
    series: ['Iridium', 'Platinum', 'Standard']
  },
  'Mann Filter': {
    models: ['Hava Filtresi', 'Yağ Filtresi', 'Yakıt Filtresi', 'Polen Filtresi'],
    series: ['Original', 'FreciousPlus', 'CUK']
  },
  'Valeo': {
    models: ['Debriyaj', 'Alternatör', 'Marş Motoru', 'Klima Kompresörü'],
    series: ['Original', 'Service', 'Remanufactured']
  },
  'Continental': {
    models: ['Lastik', 'Fren Hortumu', 'Kayış', 'Amortisör'],
    series: ['ContiTech', 'VDO', 'ATE']
  },
  'Lemförder': {
    models: ['Rotil', 'Salıncak', 'Stabilizatör', 'Direksiyon Kutusu'],
    series: ['Original', 'Premium']
  },
  'Pierburg': {
    models: ['Su Pompası', 'Termostat', 'EGR Valfi', 'Yakıt Pompası'],
    series: ['Original', 'Premium']
  },
  'Bilstein': {
    models: ['Amortisör', 'Yay', 'Stabilizatör'],
    series: ['B4', 'B6', 'B8', 'B12', 'B14', 'B16']
  },
  'Eibach': {
    models: ['Yay', 'Stabilizatör', 'Spacer'],
    series: ['Pro-Kit', 'Sportline', 'Anti-Roll-Kit']
  },
  'H&R': {
    models: ['Yay', 'Spacer', 'Stabilizatör'],
    series: ['Sport Springs', 'Super Sport', 'Race Springs']
  },
  'KYB': {
    models: ['Amortisör', 'Yay', 'Salıncak'],
    series: ['Excel-G', 'Gas-A-Just', 'MonoMax']
  },
  'Monroe': {
    models: ['Amortisör', 'Yay', 'Stabilizatör'],
    series: ['Original', 'Reflex', 'Adventure']
  },
  'Castrol': {
    models: ['Motor Yağı', 'Şanzıman Yağı', 'Fren Yağı', 'Antifriz'],
    series: ['GTX', 'Magnatec', 'Edge', 'Vecton']
  },
  'Mobil': {
    models: ['Motor Yağı', 'Şanzıman Yağı', 'Diferansiyel Yağı'],
    series: ['1', 'Super', 'Delvac']
  },
  'Shell': {
    models: ['Motor Yağı', 'Şanzıman Yağı', 'Hidrolik Yağı'],
    series: ['Helix', 'Rimula', 'Spirax']
  },
  'Total': {
    models: ['Motor Yağı', 'Şanzıman Yağı', 'Fren Yağı'],
    series: ['Quartz', 'Rubia', 'Classic']
  }
};

// İkinci el alışveriş kategorileri için detaylı alt kategoriler
const secondHandSubcategories: { [key: string]: string[] } = {
  'Bilgisayar': [
    'Dizüstü (Notebook)',
    'Masaüstü',
    'Tablet',
    'Çevre Birimleri',
    'Aksesuarlar',
    'Monitör',
    'Sunucu (Server)',
    'Domain, Hosting & Yazılım'
  ],
  'Ev Dekorasyon': [
    'Mobilya',
    'Dekoratif Ürünler',
    'El İşi & Sanat',
    'Aydınlatma',
    'Ev Tekstili',
    'Mutfak Gereçleri',
    'Temizlik Malzemeleri',
    'Toplu Satış'
  ],
  'Giyim & Aksesuar': [
    'Kadın',
    'Erkek',
    'Üniseks',
    'Çocuk Giyim',
    'Evlilik & Düğün',
    'Kostüm',
    'Valiz & Bavul',
    'Toplu Satış'
  ],
  'Kişisel Bakım & Kozmetik': [
    'Parfüm',
    'Saç Bakımı',
    'Vücut Bakımı',
    'Yüz Bakımı',
    'Makyaj',
    'Tıraş',
    'Epilasyon',
    'Ağız & Diş',
    'El, Ayak & Tırnak',
    'Hijyenik Ürünler',
    'Zayıflama Ürünleri',
    'Profesyonel Ekipmanlar',
    'Toplu Satış'
  ],
  'Kitap, Dergi & Film': [
    'Film',
    'Dergi',
    'Kaynak & Bilgi Kitapları',
    'Eğitim & Sözlük',
    'Edebiyat',
    'Çizgi Roman',
    'Çocuk Kitapları',
    'Yabancı Dilde Kitaplar',
    'Kitap Elektroniği & Aksesuar',
    'Toplu Satış'
  ],
  'Takı, Mücevher & Altın': [
    'Külçe & Ziynet Altın',
    'Yüzük',
    'Kolye',
    'Küpe',
    'Bileklik & Bilezik',
    'Takı Seti',
    'Takı Malzemeleri',
    'Aksesuar',
    'Toplu Satış'
  ],
  'Bahçe & Yapı Market': [
    'Bahçe',
    'Yapı Malzemeleri',
    'El Aletleri',
    'Prefabrik Yapılar',
    'İş Güvenliği & Elbiseleri',
    'Toplu Satış'
  ],
  'Yiyecek & İçecek': [
    'Baharat',
    'Bakliyat',
    'Et & Balık',
    'Hazır Gıda',
    'İçecek',
    'Kuruyemiş',
    'Meyve & Sebze',
    'Pastane & Fırın',
    'Şarküteri',
    'Şekerli Besinler',
    'Gıda Paketi',
    'Toplu Satış'
  ],
  'Cep Telefonu & Aksesuar': [
    'Cep Telefonu',
    'Yenilenmiş Cep Telefonu',
    'Aksesuar',
    'Yedek Parça',
    'Numara',
    'Giyilebilir Teknoloji'
  ],
  'Ev Elektroniği': [
    'Televizyon',
    'Uydu & Ekipmanları',
    'Ev Sinema Sistemleri',
    'Ev Müzik Sistemleri',
    'Taşınabilir Ses Sistemleri',
    'Güvenlik Sistemleri',
    'Akıllı Ev Sistemleri',
    'Telefon',
    'Toplu Satış'
  ],
  'Elektronik': [
    'Bilgisayar & Laptop',
    'Tablet',
    'Akıllı Telefon',
    'Akıllı Saat & Giyilebilir Teknoloji',
    'Kulaklık & Hoparlör',
    'Ses Sistemleri',
    'Fotoğraf & Video Kamera',
    'Oyun Konsolu & Aksesuar',
    'Müzik Enstrümanları & Ekipmanları',
    'DJ & Stüdyo Ekipmanları',
    'Elektronik Aksesuar',
    'Toplu Satış'
  ],
  'Saat': [
    'Kol Saati',
    'Kum Saati',
    'Cep Saati',
    'Masa Saati',
    'Duvar Saati',
    'Takı Saat',
    'Parça & Aksesuar',
    'Toplu Satış'
  ],
  'Hobi & Oyuncak': [
    'Oyuncak',
    'Hobi',
    'Koleksiyon',
    'Sanat & El İşi',
    'Müzik Aletleri',
    'Spor & Outdoor',
    'Toplu Satış'
  ]
}

// İlçe verileri - Türkiye'nin tüm 81 ili
const districtData = {
  adana: ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
  adiyaman: ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'],
  afyonkarahisar: ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
  agri: ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'],
  aksaray: ['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi'],
  amasya: ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'],
  ankara: ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
  antalya: ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
  ardahan: ['Çıldır', 'Damal', 'Göle', 'Hanak', 'Merkez', 'Posof'],
  artvin: ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'],
  aydin: ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
  balikesir: ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
  bartin: ['Amasra', 'Kurucaşile', 'Merkez', 'Ulus'],
  batman: ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'],
  bayburt: ['Aydıntepe', 'Demirözü', 'Merkez'],
  bilecik: ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
  bingol: ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'],
  bitlis: ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'],
  bolu: ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'],
  burdur: ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'],
  bursa: ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
  canakkale: ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'],
  cankiri: ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'],
  corum: ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
  denizli: ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  diyarbakir: ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
  duzce: ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca'],
  edirne: ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'],
  elazig: ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'],
  erzincan: ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
  erzurum: ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'],
  eskisehir: ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
  gaziantep: ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
  giresun: ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
  gumushane: ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'],
  hakkari: ['Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'],
  hatay: ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
  igdir: ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'],
  isparta: ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
  istanbul: ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  izmir: ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  kahramanmaras: ['Afşin', 'Andırın', 'Çağlayancerit', 'Dulkadiroğlu', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Onikişubat', 'Pazarcık', 'Türkoğlu'],
  karabuk: ['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice'],
  karaman: ['Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Merkez', 'Sarıveliler'],
  kars: ['Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz'],
  kastamonu: ['Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
  kayseri: ['Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
  kilis: ['Elbeyli', 'Merkez', 'Musabeyli', 'Polateli'],
  kirikkale: ['Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Merkez', 'Sulakyurt', 'Yahşihan'],
  kirklareli: ['Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Merkez', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
  kirsehir: ['Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Merkez', 'Mucur'],
  kocaeli: ['Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'],
  konya: ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  kutahya: ['Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Merkez', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'],
  malatya: ['Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'],
  manisa: ['Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Turgutlu', 'Yunusemre'],
  mardin: ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'],
  mersin: ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
  mugla: ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'],
  mus: ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'],
  nevsehir: ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'],
  nigde: ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'],
  ordu: ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'],
  osmaniye: ['Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Merkez', 'Sumbas', 'Toprakkale'],
  rize: ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'],
  sakarya: ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
  samsun: ['19 Mayıs', 'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
  sanliurfa: ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'],
  siirt: ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan', 'Tillo'],
  sinop: ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'],
  sirnak: ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'],
  sivas: ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
  tekirdag: ['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'],
  tokat: ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
  trabzon: ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çaykara', 'Çarşıbaşı', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
  tunceli: ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
  usak: ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'],
  van: ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'],
  yalova: ['Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Merkez', 'Termal'],
  yozgat: ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'],
  zonguldak: ['Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez']
};

// Şehir listesi
const cities = Object.keys(districtData).map(key => {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2');
});

// Seçilen şehre göre ilçeleri getir
const getDistricts = (city: string) => {
  const cityKey = city.toLowerCase().replace(/\s+/g, '').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
  return districtData[cityKey as keyof typeof districtData] || [];
};

const sortOptions = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'price-low', label: 'Fiyat (Düşük → Yüksek)' },
  { value: 'price-high', label: 'Fiyat (Yüksek → Düşük)' },
  { value: 'popular', label: 'En Popüler' },
  { value: 'rating', label: 'En Yüksek Puan' }
];

interface SearchFilters {
  // Genel filtreler
  query: string;
  category: string;
  subcategory: string;
  location: string;
  district: string;
  priceRange: [number, number];
  condition: string[];
  hasImages: boolean;
  hasVideo: boolean;
  isNegotiable: boolean;
  
  // Emlak filtreleri
  roomCount?: string;
  propertyType?: string;
  buildingAge?: string;
  squareMeters?: [number, number];
  floor?: string;
  heating?: string;
  bathrooms?: string;
  balcony?: boolean;
  parking?: boolean;
  furnished?: string;
  
  // Vasıta filtreleri
  carMake?: string;
  carModel?: string;
  year?: [number, number];
  fuelType?: string;
  transmission?: string;
  mileage?: [number, number];
  engineSize?: [number, number];
  bodyType?: string;
  color?: string;
  warranty?: boolean;
  
  // İkinci el alışveriş filtreleri
  brand?: string;
  model?: string;
  warrantyStatus?: string;
  
  // Yedek parça filtreleri
  partBrand?: string;
  partCategory?: string;
  partCondition?: string;
  yearCompatibility?: [number, number];
  
  // Hizmet filtreleri
  experience?: string;
  workingHours?: string[];
  
  // İş ilanları filtreleri
  positionLevel?: string;
  workType?: string[];
  salaryRange?: [number, number];
  
  // Eski alanlar (geriye dönük uyumluluk için)
  detailedSubcategory?: string;
  priceMin?: number;
  priceMax?: number;
  urgency?: string[];
  businessType?: string[];
  rating?: number;
  dateRange?: string;
  secondHandBrand?: string;
  secondHandModel?: string;
  spareBrand?: string;
  spareModel?: string;
  spareSeries?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  price: number;
  images: string[];
  icon?: string;
  createdAt: string;
  urgency: string;
  condition: string;
  rating: number;
  reviewCount: number;
  isNegotiable: boolean;
  businessType: string;
  mileage?: number;
  mileageMin?: number;
  mileageMax?: number;
  categorySpecificData?: {
    brand?: string;
    model?: string;
    [key: string]: any;
  };
  seller: {
    name: string;
    avatar: string;
    verified: boolean;
  };
}

function SearchListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams?.get('q') || '',
    category: searchParams?.get('category') || '',
    subcategory: searchParams?.get('subcategory') || '',
    location: searchParams?.get('location') || '',
    district: searchParams?.get('district') || '',
    priceRange: [0, 10000000],
    condition: [],
    hasImages: false,
    hasVideo: false,
    isNegotiable: false,
    
    // Geriye dönük uyumluluk için eski alanlar
    detailedSubcategory: searchParams?.get('detailedSubcategory') || '',
    priceMin: 0,
    priceMax: 1000000,
    urgency: [],
    businessType: [],
    rating: 0,
    dateRange: 'all',
    secondHandBrand: '',
    secondHandModel: '',
    spareBrand: '',
    spareModel: '',
    spareSeries: ''
  });

  // URL parametrelerini dinle ve filtreleri güncelle
  useEffect(() => {
    const category = searchParams?.get('category') || '';
    const subcategory = searchParams?.get('subcategory') || '';
    const detailedSubcategory = searchParams?.get('detailedSubcategory') || '';
    const query = searchParams?.get('q') || '';
    const location = searchParams?.get('location') || '';
    const district = searchParams?.get('district') || '';
    
    setFilters(prev => ({
      ...prev,
      category,
      subcategory,
      detailedSubcategory,
      query,
      location,
      district,
      secondHandBrand: '',
      secondHandModel: ''
    }));
    
    // URL parametreleri değiştiğinde ilanları getir
    fetchListings();
  }, [searchParams]);

  // Gerçek zamanlı arama için debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters.query, filters.category, filters.subcategory, filters.location, filters.district, filters.priceMin, filters.priceMax]);

  // Sayfa değiştiğinde API çağrısı yap
  useEffect(() => {
    fetchListings();
  }, [currentPage, sortBy]);

  // Mock data for demonstration
  const mockListings: Listing[] = [
    {
      id: '1',
      title: 'Satılık 3+1 Daire - Merkez Konumda',
      description: 'Şehir merkezinde, ulaşım imkanları yüksek, ferah ve aydınlık daire.',
      category: 'emlak',
      location: 'İstanbul, Kadıköy',
      price: 850000,
      images: ['/api/placeholder/300/200'],
      createdAt: '2024-01-15',
      urgency: 'medium',
      condition: 'excellent',
      rating: 4.8,
      reviewCount: 12,
      isNegotiable: true,
      businessType: 'individual',
      seller: {
        name: 'Ahmet Yılmaz',
        avatar: '/api/placeholder/40/40',
        verified: true
      }
    },
    {
      id: '2',
      title: 'Satılık BMW 3.20i - Temiz Araç',
      description: '2018 model BMW 3.20i, otomatik vites, full+full.',
      category: 'vasita',
      location: 'Ankara, Çankaya',
      price: 450000,
      images: ['/api/placeholder/300/200'],
      createdAt: '2024-01-14',
      urgency: 'high',
      condition: 'very-good',
      rating: 4.6,
      reviewCount: 8,
      isNegotiable: true,
      businessType: 'individual',
      seller: {
        name: 'Mehmet Demir',
        avatar: '/api/placeholder/40/40',
        verified: false
      }
    },
    {
      id: '3',
      title: 'Kiralık Villa - Deniz Manzaralı',
      description: 'Antalya Kalkan\'da deniz manzaralı lüks villa.',
      category: 'emlak',
      location: 'Antalya, Kalkan',
      price: 15000,
      images: ['/api/placeholder/300/200'],
      createdAt: '2024-01-13',
      urgency: 'low',
      condition: 'excellent',
      rating: 4.9,
      reviewCount: 15,
      isNegotiable: false,
      businessType: 'business',
      seller: {
        name: 'Villa Rental Co.',
        avatar: '/api/placeholder/40/40',
        verified: true
      }
    },
    {
      id: '4',
      title: 'Satılık Mercedes C180 - Az Km',
      description: '2020 model Mercedes C180, sadece 25.000 km.',
      category: 'vasita',
      location: 'İzmir, Bornova',
      price: 650000,
      images: ['/api/placeholder/300/200'],
      createdAt: '2024-01-12',
      urgency: 'medium',
      condition: 'excellent',
      rating: 4.7,
      reviewCount: 6,
      isNegotiable: true,
      businessType: 'business',
      seller: {
        name: 'Ahmet Yılmaz',
        avatar: '/api/placeholder/40/40',
        verified: true
      }
    },
     {
       id: '5',
       title: 'Satılık iPhone 14 Pro - Sıfır Ayarında',
       description: 'Hiç kullanılmamış iPhone 14 Pro, tüm aksesuarları mevcut.',
       category: 'ikinci-el-alisveris',
       location: 'İstanbul, Beşiktaş',
       price: 35000,
       images: ['/api/placeholder/300/200'],
       createdAt: '2024-01-11',
       urgency: 'medium',
       condition: 'new',
       rating: 4.8,
       reviewCount: 3,
       isNegotiable: true,
       businessType: 'individual',
       seller: {
         name: 'Ayşe Kaya',
         avatar: '/api/placeholder/40/40',
         verified: true
       }
     },
     {
       id: '6',
       title: 'Usta Aranıyor - Elektrik İşleri',
       description: 'Ev elektrik tesisatı için deneyimli elektrikçi aranıyor.',
       category: 'ustalar-hizmetler',
       location: 'Bursa, Nilüfer',
       price: 2500,
       images: ['/api/placeholder/300/200'],
       createdAt: '2024-01-10',
       urgency: 'high',
       condition: 'good',
       rating: 4.5,
       reviewCount: 12,
       isNegotiable: true,
       businessType: 'individual',
       seller: {
         name: 'Elektrikçi Hasan',
         avatar: '/api/placeholder/40/40',
         verified: true
       }
     }
  ];

  // API'den ilanları getir
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Filtreleri URL parametrelerine ekle
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.location) params.set('location', filters.location);
      if (filters.priceMin > 0) params.set('minBudget', filters.priceMin.toString());
      if (filters.priceMax < 1000000) params.set('maxBudget', filters.priceMax.toString());
      params.set('sortBy', sortBy === 'newest' ? 'createdAt' : sortBy === 'price-low' ? 'budgetMin' : sortBy === 'price-high' ? 'budgetMax' : 'createdAt');
      params.set('sortOrder', sortBy === 'price-high' ? 'desc' : sortBy === 'oldest' ? 'asc' : 'desc');
      params.set('page', currentPage.toString());
      params.set('limit', '12');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('İlanlar getirilemedi');
      }
      
      const data = await response.json();
      
      // API'den gelen veriyi uygun formata dönüştür
      const formattedListings = data.listings.map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        location: formatCity(listing.location),
        price: listing.budgetMin || 0,
        images: listing.images || [],
        createdAt: new Date(listing.createdAt).toLocaleDateString('tr-TR'),
        urgency: 'medium',
        condition: 'good',
        rating: listing.user?.rating || 0,
        reviewCount: listing.user?.reviewCount || 0,
        isNegotiable: true,
        businessType: 'individual',
        seller: {
          name: listing.user?.name || 'Anonim',
          avatar: listing.user?.profileImage || '/api/placeholder/40/40',
          verified: true
        }
      }));
      
      setListings(formattedListings);
      setTotalResults(data.pagination.total);
      
    } catch (error) {
      console.error('İlanlar getirilemedi:', error);
      // Hata durumunda mock data kullan
      setListings(mockListings);
      setTotalResults(mockListings.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    await fetchListings();
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      subcategory: '',
      location: '',
      district: '',
      priceRange: [0, 1000000],
      condition: [],
      hasImages: false,
      hasVideo: false,
      isNegotiable: false,
      // Geriye dönük uyumluluk için eski alanlar
      detailedSubcategory: '',
      priceMin: 0,
      priceMax: 1000000,
      urgency: [],
      businessType: [],
      rating: 0,
      dateRange: 'all',
      carMake: '',
      carModel: '',
      secondHandBrand: '',
      secondHandModel: '',
      spareBrand: '',
      spareModel: '',
      spareSeries: ''
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-white text-gray-600 border-gray-300';
      case 'medium': return 'bg-white text-gray-700 border-gray-400';
      case 'high': return 'bg-white text-gray-800 border-gray-500';
      case 'urgent': return 'bg-white text-gray-900 border-gray-600';
      default: return 'bg-white text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                VarsaGel
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-gray-600">İlan Arama</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/listings/create">
                  <span className="text-lg font-bold mr-2">+</span>
                  İlan Ver
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filtreler</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Temizle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <div>
                  <Label htmlFor="search">Arama</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Ne arıyorsunuz?"
                      value={filters.query}
                      onChange={(e) => handleFilterChange('query', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label>Kategori</Label>
                  <select 
                    value={filters.category} 
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                {filters.category && subcategories[filters.category] && (
                  <div>
                    <Label>Alt Kategori</Label>
                    <select 
                      value={filters.subcategory} 
                      onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Alt Kategoriler</option>
                      {subcategories[filters.category].map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Detailed Subcategory for İkinci El ve Sıfır Alışveriş */}
                {filters.category === 'ikinci-el-ve-sifir-alisveris' && filters.subcategory && secondHandSubcategories[filters.subcategory] && (
                  <div>
                    <Label>Detaylı Alt Kategori</Label>
                    <select 
                      value={filters.detailedSubcategory} 
                      onChange={(e) => handleFilterChange('detailedSubcategory', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Detaylı Alt Kategoriler</option>
                      {secondHandSubcategories[filters.subcategory].map((detailedSubcat) => (
                        <option key={detailedSubcat} value={detailedSubcat}>
                          {detailedSubcat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Brand for İkinci El ve Sıfır Alışveriş */}
                {filters.category === 'ikinci-el-ve-sifir-alisveris' && filters.subcategory && secondHandBrands[filters.subcategory] && (
                  <div>
                    <Label>Marka</Label>
                    <select 
                      value={filters.secondHandBrand} 
                      onChange={(e) => {
                        handleFilterChange('secondHandBrand', e.target.value);
                        handleFilterChange('secondHandModel', ''); // Reset model when brand changes
                      }}
                      className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Markalar</option>
                      {Object.keys(secondHandBrands[filters.subcategory]).map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Model for İkinci El ve Sıfır Alışveriş */}
                {filters.category === 'ikinci-el-ve-sifir-alisveris' && filters.subcategory && filters.secondHandBrand && secondHandBrands[filters.subcategory] && secondHandBrands[filters.subcategory][filters.secondHandBrand] && (
                  <div>
                    <Label>Model</Label>
                    <select 
                      value={filters.secondHandModel} 
                      onChange={(e) => handleFilterChange('secondHandModel', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm Modeller</option>
                      {secondHandBrands[filters.subcategory][filters.secondHandBrand].map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Location */}
                <div>
                  <Label>Şehir</Label>
                  <select 
                    value={filters.location} 
                    onChange={(e) => {
                      handleFilterChange('location', e.target.value);
                      handleFilterChange('district', ''); // Reset district when city changes
                    }}
                    className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map((city, index) => (
                      <option key={`city-${index}-${city}`} value={city}>
                        {city.charAt(0).toUpperCase() + city.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                {filters.location && (
                  <div>
                    <Label>İlçe</Label>
                    <select 
                      value={filters.district} 
                      onChange={(e) => handleFilterChange('district', e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tüm İlçeler</option>
                      {getDistricts(filters.location).map((district, index) => (
                         <option key={`${filters.location}-${district}-${index}`} value={district}>
                           {district}
                         </option>
                       ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <Label>Fiyat Aralığı</Label>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="priceMin" className="text-xs text-gray-500">Min</Label>
                        <Input
                          id="priceMin"
                          type="number"
                          placeholder="0"
                          value={filters.priceMin}
                          onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priceMax" className="text-xs text-gray-500">Max</Label>
                        <Input
                          id="priceMax"
                          type="number"
                          placeholder="1000000"
                          value={filters.priceMax}
                          onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value) || 1000000)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Condition - Hidden */}
                {/* <div>
                  <Label>Durum</Label>
                  <select 
                    value={filters.condition[0] || ''} 
                    onChange={(e) => handleFilterChange('condition', e.target.value ? [e.target.value] : [])}
                    className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Durumlar</option>
                    <option value="new">Sıfır</option>
                    <option value="very-good">Çok İyi</option>
                    <option value="good">İyi</option>
                    <option value="fair">Orta</option>
                    <option value="poor">Kötü</option>
                  </select>
                </div> */}

                {/* Date Range - Hidden */}
                {/* <div>
                  <Label>Tarih Aralığı</Label>
                  <select 
                    value={filters.dateRange} 
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Zamanlar</option>
                    <option value="today">Bugün</option>
                    <option value="yesterday">Dün</option>
                    <option value="last-3-days">Son 3 Gün</option>
                    <option value="last-week">Son 1 Hafta</option>
                    <option value="last-month">Son 1 Ay</option>
                    <option value="last-3-months">Son 3 Ay</option>
                  </select>
                </div> */}

                {/* Urgency - Hidden */}
                {/* <div>
                  <Label>Aciliyet</Label>
                  <div className="mt-2 space-y-2">
                    {['urgent', 'normal', 'flexible'].map((urgencyType) => (
                      <label key={urgencyType} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.urgency.includes(urgencyType)}
                          onChange={(e) => {
                            const newUrgency = e.target.checked
                              ? [...filters.urgency, urgencyType]
                              : filters.urgency.filter(u => u !== urgencyType);
                            handleFilterChange('urgency', newUrgency);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {urgencyType === 'urgent' ? 'Acil' : 
                           urgencyType === 'normal' ? 'Normal' : 'Esnek'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Media Filters - Hidden */}
                {/* <div>
                  <Label>Medya</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.hasImages}
                        onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Fotoğraflı</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.hasVideo}
                        onChange={(e) => handleFilterChange('hasVideo', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Videolu</span>
                    </label>
                  </div>
                </div> */}

                {/* Negotiable - Hidden */}
                {/* <div>
                  <Label>Pazarlık</Label>
                  <div className="mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.isNegotiable}
                        onChange={(e) => handleFilterChange('isNegotiable', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Pazarlık Yapılabilir</span>
                    </label>
                  </div>
                </div> */}

                {/* Business Type - Hidden */}
                {/* <div>
                  <Label>İşletme Tipi</Label>
                  <div className="mt-2 space-y-2">
                    {['individual', 'business', 'dealer'].map((businessType) => (
                      <label key={businessType} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.businessType.includes(businessType)}
                          onChange={(e) => {
                            const newBusinessType = e.target.checked
                              ? [...filters.businessType, businessType]
                              : filters.businessType.filter(b => b !== businessType);
                            handleFilterChange('businessType', newBusinessType);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {businessType === 'individual' ? 'Bireysel' : 
                           businessType === 'business' ? 'İşletme' : 'Bayi'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Rating Filter - Hidden */}
                {/* <div>
                  <Label>Minimum Puan</Label>
                  <select 
                    value={filters.rating} 
                    onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">Tüm Puanlar</option>
                    <option value="1">1+ Yıldız</option>
                    <option value="2">2+ Yıldız</option>
                    <option value="3">3+ Yıldız</option>
                    <option value="4">4+ Yıldız</option>
                    <option value="4.5">4.5+ Yıldız</option>
                  </select>
                </div> */}

                {/* Dynamic Category Specific Filters */}
                {filters.category && (
                  <DynamicFilters
                    category={filters.category}
                    subcategory={filters.subcategory}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                )}


                


                <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                  {isLoading ? 'Aranıyor...' : 'Ara'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {totalResults} İlan Bulundu
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreler
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1); // Sıralama değiştiğinde sayfa 1'e dön
                    }}
                    className="w-48 px-3 py-2 bg-background border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.category || filters.location || filters.query) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.query && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    "{filters.query}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('query', '')} />
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {categories.find(c => c.id === filters.category)?.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('category', '')} />
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {filters.location}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('location', '')} />
                  </span>
                )}
              </div>
            )}

            {/* Listings Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded mb-4" />
                      <div className="h-6 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {listings.map((listing) => (
                  <Card key={listing.id} className={`group hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}>
                      <div className="relative h-48 overflow-hidden">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-200"

                          />
                        ) : (
                          listing.icon && (listing.category === 'vasita' || listing.category === 'Vasıta') && listing.subcategory === 'Otomobil' ? (
                            <img
                              src={`/api/icons?name=${listing.icon}`}
                              alt={listing.title}
                              className="w-full h-full object-cover transition-transform duration-200"
                            />
                          ) : (
                            <img
                               src="/images/defaults/varsagel.com.jpeg"
                               alt={listing.title}
                               className="w-full h-full object-cover transition-transform duration-200"
                             />
                          )
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${getUrgencyColor(listing.urgency)}`}>
                            {listing.urgency === 'low' ? 'Normal' :
                             listing.urgency === 'medium' ? 'Orta' :
                             listing.urgency === 'high' ? 'Acil' : 'Çok Acil'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80 hover:bg-white border border-gray-200">
                            <Heart className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/80 hover:bg-white border border-gray-200">
                            <Share2 className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 group-hover:text-gray-700 transition-colors">
                          {listing.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-400 mb-4 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {formatCity(listing.location)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        {listing.category === 'vasita' && (listing.mileage || listing.mileageMin || listing.mileageMax) && (
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-1" />
                            {listing.mileage 
                              ? `${listing.mileage.toLocaleString('tr-TR')} km`
                              : `${(listing.mileageMin || 0).toLocaleString('tr-TR')} - ${(listing.mileageMax || 0).toLocaleString('tr-TR')} km`
                            }
                          </div>
                        )}
                        {listing.category === 'vasita' && listing.categorySpecificData && (listing.categorySpecificData.brand || listing.categorySpecificData.model) && (
                          <div className="flex items-center">
                            <span className="mr-1">🏷️</span>
                            {listing.categorySpecificData.brand && listing.categorySpecificData.model 
                              ? `${listing.categorySpecificData.brand} ${listing.categorySpecificData.model}`
                              : listing.categorySpecificData.brand || listing.categorySpecificData.model
                            }
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(listing.price)}
                          </span>
                          {listing.isNegotiable && (
                            <span className="inline-flex items-center px-2 py-1 border border-gray-300 text-gray-600 text-xs font-medium">
                              Pazarlık
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
                          <span>{listing.rating}</span>
                          <span>({listing.reviewCount})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {listing.seller.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">{listing.seller.name}</span>
                          {listing.seller.verified && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200">
                              ✓
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-1" />
                            Görüntüle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && listings.length > 0 && totalResults > 12 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Önceki
                  </Button>
                  {Array.from({ length: Math.min(5, Math.ceil(totalResults / 12)) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button 
                    variant="outline" 
                    disabled={currentPage >= Math.ceil(totalResults / 12)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SearchListingsPage);