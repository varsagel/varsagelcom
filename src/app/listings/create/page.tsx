'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCity, formatDistrict } from '@/lib/utils';
import { 
  ArrowLeft, Calendar, Clock, Image, MapPin, Plus, Trash2, Upload, X, 
  Eye, Star, Heart, Share2, MessageCircle, DollarSign, Tag, 
  CheckCircle, AlertCircle, Info, Zap, Camera, Video, FileText,
  Smartphone, Home, Car, Shirt, Wrench, Laptop, Package, Building,
  Users, Phone, Mail, Globe, Shield, Award, Clock3, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const categories = [
  { 
    id: 'emlak', 
    name: 'Emlak', 
    icon: Home, 
    color: 'from-orange-500 to-red-500',
    subcategories: ['Konut', 'İşyeri', 'Arsa', 'Bina', 'Devre Mülk', 'Turistik Tesis', 'Devren Satılık & Kiralık', 'Günlük Kiralık', 'Konut Projeleri', 'Ofis Projeleri', 'Diğer']
  },
  { 
    id: 'vasita', 
    name: 'Vasıta', 
    icon: Car, 
    color: 'from-purple-500 to-pink-500',
    subcategories: ['Otomobil', 'Arazi, SUV & Pickup', 'Motosiklet', 'Minivan & Panelvan', 'Kamyon & Kamyonet', 'Otobüs & Midibüs', 'Traktör', 'Deniz Araçları', 'Hava Araçları', 'ATV', 'UTV', 'Karavan', 'Treyler', 'Klasik Araçlar', 'Hasarlı Araçlar', 'Elektrikli Araçlar']
  },
  { 
    id: 'yedek-parca', 
    name: 'Yedek Parça, Aksesuar, Donanım & Tuning', 
    icon: Wrench, 
    color: 'from-gray-600 to-gray-800',
    subcategories: ['Otomotiv Ekipmanları', 'Motosiklet Ekipmanları', 'Deniz Aracı Ekipmanları', 'Hava Aracı Ekipmanları', 'ATV Ekipmanları', 'Karavan Ekipmanları', 'Diğer']
  },
  { 
    id: 'ikinci-el-alisveris', 
    name: 'İkinci El ve Sıfır Alışveriş', 
    icon: Package, 
    color: 'from-blue-500 to-cyan-500',
    subcategories: ['Bilgisayar', 'Cep Telefonu', 'Fotoğraf & Kamera', 'Ev Dekorasyon', 'Ev Elektroniği', 'Elektrikli Ev Aletleri', 'Giyim & Aksesuar', 'Saat', 'Anne & Bebek', 'Kişisel Bakım & Kozmetik', 'Hobi & Oyuncak', 'Oyun & Konsol', 'Kitap, Dergi & Film', 'Müzik', 'Spor', 'Takı, Mücevher & Altın', 'Koleksiyon', 'Antika', 'Bahçe & Yapı Market', 'Teknik Elektronik', 'Ofis & Kırtasiye', 'Yiyecek & İçecek', 'Diğer Her Şey']
  },
  { 
    id: 'is-makineleri-sanayi', 
    name: 'İş Makineleri & Sanayi', 
    icon: Wrench, 
    color: 'from-amber-500 to-orange-500',
    subcategories: ['Tarım Makineleri', 'İş Makinesi', 'Sanayi', 'Elektrik & Enerji', 'Diğer']
  },
  { 
    id: 'ustalar-hizmetler', 
    name: 'Ustalar ve Hizmetler', 
    icon: Wrench, 
    color: 'from-teal-500 to-green-500',
    subcategories: ['Tadilat & Dekorasyon', 'Nakliye', 'Temizlik', 'Güvenlik', 'Sağlık & Güzellik', 'Düğün & Organizasyon', 'Fotoğraf & Video', 'Bilgisayar & İnternet', 'Eğitim & Kurs', 'Diğer Hizmetler']
  },
  { 
    id: 'ozel-ders', 
    name: 'Özel Ders Verenler', 
    icon: Package, 
    color: 'from-indigo-500 to-purple-500',
    subcategories: ['Lise', 'Üniversite', 'İlkokul', 'Ortaokul', 'Dil Dersleri', 'Bilgisayar', 'Müzik', 'Spor', 'Sanat', 'Diğer']
  },
  { 
    id: 'is-ilanlari', 
    name: 'İş İlanları', 
    icon: Package, 
    color: 'from-green-500 to-emerald-500',
    subcategories: ['Satış', 'Pazarlama', 'Muhasebe & Finans', 'İnsan Kaynakları', 'Bilgi İşlem', 'Mühendislik', 'Sağlık', 'Eğitim', 'Turizm & Otelcilik', 'İnşaat', 'Üretim', 'Lojistik', 'Güvenlik', 'Temizlik', 'Diğer']
  },
  { 
    id: 'yardimci-arayanlar', 
    name: 'Yardımcı Arayanlar', 
    icon: Heart, 
    color: 'from-pink-500 to-rose-500',
    subcategories: ['Ev İşleri', 'Çocuk Bakımı', 'Yaşlı Bakımı', 'Hasta Bakımı', 'Evcil Hayvan Bakımı', 'Bahçıvanlık', 'Şoförlük', 'Diğer']
  },
  { 
    id: 'hayvanlar-alemi', 
    name: 'Hayvanlar Alemi', 
    icon: Heart, 
    color: 'from-yellow-500 to-orange-500',
    subcategories: ['Evcil Hayvanlar', 'Çiftlik Hayvanları', 'Aksesuarlar', 'Yem ve Mama', 'Sağlık Ürünleri', 'Diğer']
  }
];

// Kategori bazlı varsayılan resimler kaldırıldı

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

// Marka ve model verileri
const brandData = {
  otomobil: {
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
    'BMW': ['1 Serisi', '2 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', '6 Serisi', '7 Serisi', '8 Serisi', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4'],
    'Mercedes-Benz': ['A-Sınıfı', 'B-Sınıfı', 'C-Sınıfı', 'CLA', 'CLS', 'E-Sınıfı', 'G-Sınıfı', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Sınıfı', 'SL', 'SLK'],
    'Volkswagen': ['Polo', 'Golf', 'Jetta', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'Caddy', 'Transporter'],
    'Toyota': ['Yaris', 'Corolla', 'Camry', 'Avalon', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Prius', 'Hilux'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Ridgeline', 'Insight'],
    'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'EcoSport', 'Kuga', 'Edge', 'Explorer', 'F-150', 'Ranger'],
    'Renault': ['Clio', 'Megane', 'Fluence', 'Talisman', 'Captur', 'Kadjar', 'Koleos', 'Kangoo', 'Master'],
    'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Boxer'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka', 'Combo', 'Vivaro'],
    'Fiat': ['500', 'Panda', 'Tipo', 'Egea', '500X', '500L', 'Doblo', 'Ducato'],
    'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Kona', 'Tucson', 'Santa Fe', 'H-1'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Cerato', 'Optima', 'Stonic', 'Sportage', 'Sorento'],
    'Nissan': ['Micra', 'Note', 'Sentra', 'Altima', 'Juke', 'Qashqai', 'X-Trail', 'Pathfinder', 'Navara'],
    'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-9', 'MX-5'],
    'Skoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
    'Seat': ['Ibiza', 'Leon', 'Toledo', 'Arona', 'Ateca', 'Tarraco'],
    'Citroen': ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'Jumper'],
    'Dacia': ['Sandero', 'Logan', 'Duster', 'Lodgy', 'Dokker'],
    'Suzuki': ['Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny'],
    'Mitsubishi': ['Space Star', 'Lancer', 'Outlander', 'ASX', 'L200'],
    'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV'],
    'Volvo': ['V40', 'S60', 'V60', 'S90', 'V90', 'XC40', 'XC60', 'XC90'],
    'Alfa Romeo': ['Mito', 'Giulietta', 'Giulia', 'Stelvio'],
    'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
    'Land Rover': ['Evoque', 'Discovery Sport', 'Discovery', 'Defender', 'Range Rover'],
    'Mini': ['Cooper', 'Countryman', 'Clubman'],
    'Porsche': ['911', 'Boxster', 'Cayman', 'Panamera', 'Macan', 'Cayenne'],
    'Lexus': ['CT', 'IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'GX', 'LX'],
    'Infiniti': ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX70', 'QX80'],
    'Acura': ['ILX', 'TLX', 'RLX', 'RDX', 'MDX'],
    'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
    'Chery': ['QQ', 'Tiggo'],
    'Geely': ['Emgrand', 'Coolray'],
    'Tofaş': ['Şahin', 'Kartal', 'Doğan']
  },
  motosiklet: {
    'Honda': ['CBR', 'CB', 'CRF', 'PCX', 'Forza', 'SH', 'Vision'],
    'Yamaha': ['YZF', 'MT', 'XSR', 'Tenere', 'NMAX', 'X-MAX', 'Aerox'],
    'Kawasaki': ['Ninja', 'Z', 'Versys', 'KLX', 'W'],
    'Suzuki': ['GSX-R', 'GSX-S', 'V-Strom', 'Burgman', 'Address'],
    'BMW': ['S', 'R', 'F', 'G', 'K', 'C'],
    'Ducati': ['Panigale', 'Monster', 'Multistrada', 'Scrambler', 'Diavel'],
    'KTM': ['Duke', 'RC', 'Adventure', 'Supermoto', 'Enduro'],
    'Harley-Davidson': ['Sportster', 'Dyna', 'Softail', 'Touring', 'Street'],
    'Aprilia': ['RSV4', 'Tuono', 'Shiver', 'Dorsoduro', 'SR'],
    'Triumph': ['Speed Triple', 'Street Triple', 'Bonneville', 'Tiger', 'Rocket'],
    'Bajaj': ['Pulsar', 'Dominar', 'Avenger'],
    'Benelli': ['TNT', 'TRK', 'Leoncino', 'Imperiale'],
    'CF Moto': ['NK', 'MT', 'CL-X'],
    'SYM': ['Citycom', 'Maxsym', 'Jet', 'Orbit'],
    'Kymco': ['AK', 'Downtown', 'People', 'Xciting'],
    'Piaggio': ['Vespa', 'Beverly', 'X-Evo', 'MP3']
  },
  elektronik: {
    'Apple': ['iPhone', 'iPad', 'MacBook', 'iMac', 'Mac Mini', 'Apple Watch', 'AirPods'],
    'Samsung': ['Galaxy S', 'Galaxy Note', 'Galaxy A', 'Galaxy Tab', 'Galaxy Watch', 'Galaxy Buds'],
    'Huawei': ['P Series', 'Mate Series', 'Nova Series', 'Y Series', 'MatePad', 'Watch GT'],
    'Xiaomi': ['Mi', 'Redmi', 'POCO', 'Mi Pad', 'Mi Band', 'Mi Watch'],
    'Oppo': ['Find', 'Reno', 'A Series', 'F Series'],
    'Vivo': ['X Series', 'V Series', 'Y Series', 'S Series'],
    'OnePlus': ['OnePlus 9', 'OnePlus 8', 'OnePlus Nord', 'OnePlus 7'],
    'Sony': ['Xperia', 'PlayStation', 'Bravia TV', 'WH-1000XM', 'WF-1000XM'],
    'LG': ['G Series', 'V Series', 'K Series', 'OLED TV', 'NanoCell TV'],
    'HP': ['Pavilion', 'Envy', 'Spectre', 'EliteBook', 'ProBook', 'Omen'],
    'Dell': ['XPS', 'Inspiron', 'Latitude', 'Precision', 'Alienware'],
    'Lenovo': ['ThinkPad', 'IdeaPad', 'Legion', 'Yoga', 'Tab'],
    'Asus': ['ZenBook', 'VivoBook', 'ROG', 'TUF', 'ZenFone'],
    'Acer': ['Aspire', 'Swift', 'Predator', 'Nitro', 'Spin'],
    'MSI': ['Gaming', 'Creator', 'Business', 'Modern'],
    'Microsoft': ['Surface', 'Xbox', 'HoloLens']
  }
};

const districtData = {
  adana: ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
  adıyaman: ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'],
  afyonkarahisar: ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
  ağrı: ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'],
  aksaray: ['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi'],
  amasya: ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'],
  ankara: ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
  antalya: ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
  ardahan: ['Çıldır', 'Damal', 'Göle', 'Hanak', 'Merkez', 'Posof'],
  artvin: ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'],
  aydın: ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
  balıkesir: ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
  bartın: ['Amasra', 'Kurucaşile', 'Merkez', 'Ulus'],
  batman: ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'],
  bayburt: ['Aydıntepe', 'Demirözü', 'Merkez'],
  bilecik: ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
  bingöl: ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'],
  bitlis: ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'],
  bolu: ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'],
  burdur: ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'],
  bursa: ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
  çanakkale: ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'],
  çankırı: ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'],
  çorum: ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
  denizli: ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  diyarbakır: ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
  düzce: ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca'],
  edirne: ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'],
  elazığ: ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'],
  erzincan: ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
  erzurum: ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'],
  eskişehir: ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
  gaziantep: ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
  giresun: ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
  gümüşhane: ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'],
  hakkari: ['Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'],
  hatay: ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
  iğdır: ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'],
  isparta: ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
  istanbul: ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  izmir: ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  kahramanmaraş: ['Afşin', 'Andırın', 'Çağlayancerit', 'Dulkadiroğlu', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Onikişubat', 'Pazarcık', 'Türkoğlu'],
  karabük: ['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice'],
  karaman: ['Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Merkez', 'Sarıveliler'],
  kars: ['Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz'],
  kastamonu: ['Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
  kayseri: ['Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
  kırıkkale: ['Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Merkez', 'Sulakyurt', 'Yahşihan'],
  kırklareli: ['Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Merkez', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
  kırşehir: ['Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Merkez', 'Mucur'],
  kilis: ['Elbeyli', 'Merkez', 'Musabeyli', 'Polateli'],
  kocaeli: ['Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'],
  konya: ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  kütahya: ['Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Merkez', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'],
  malatya: ['Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'],
  manisa: ['Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Turgutlu', 'Yunusemre'],
  mardin: ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'],
  mersin: ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
  muğla: ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'],
  muş: ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'],
  nevşehir: ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'],
  niğde: ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'],
  ordu: ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'],
  osmaniye: ['Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Merkez', 'Sumbas', 'Toprakkale'],
  rize: ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'],
  sakarya: ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
  samsun: ['19 Mayıs', 'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
  siirt: ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan', 'Tillo'],
  sinop: ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'],
  sivas: ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
  şanlıurfa: ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'],
  şırnak: ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'],
  tekirdağ: ['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'],
  tokat: ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
  trabzon: ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çaykara', 'Çarşıbaşı', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
  tunceli: ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
  uşak: ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'],
  van: ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'],
  yalova: ['Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Merkez', 'Termal'],
  yozgat: ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'],
  zonguldak: ['Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez']
};

const cities = Object.keys(districtData).map(key => {
  return key.charAt(0).toUpperCase() + key.slice(1);
});

const getDistricts = (city: string) => {
  const cityKey = city.toLowerCase();
  return districtData[cityKey as keyof typeof districtData] || [];
};

interface FormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  location: string;
  district: string;
  priceMin: string;
  priceMax: string;
  images: File[];
  videoUrl: string;
  icon: string; // Seçilen icon dosya adı
  // Kategori bazlı özel alanlar
  propertyType: string;
  area: string;
  rooms: string;
  // Yeni emlak alanları
  buildingAge: string;
  floor: string;
  totalFloors: string;
  heating: string;
  balcony: string;
  furnished: string;
  parking: string;
  elevator: string;
  garden: string;
  terrace: string;
  pool: string;
  security: string;
  // Vasıta alanları
  vehicleYearMin: string;
  vehicleYearMax: string;
  fuelType: string;
  transmission: string;
  mileageMin: string;
  mileageMax: string;
  condition: string;
  warranty: string;
  brand: string;
  model: string;
  series: string;
  bodyType: string;
  color: string;
  serviceType: string;
  experience: string;
  urgency: string;
  spareBrand: string;
  spareModel: string;
  spareSeries: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    location: '',
    district: '',
    priceMin: '',
    priceMax: '',
    images: [],
    videoUrl: '',
    icon: '',
    propertyType: '',
    area: '',
    rooms: '',
    buildingAge: '',
    floor: '',
    totalFloors: '',
    heating: '',
    balcony: '',
    furnished: '',
    parking: '',
    elevator: '',
    garden: '',
    terrace: '',
    pool: '',
    security: '',
    vehicleYearMin: '',
    vehicleYearMax: '',
    fuelType: '',
    transmission: '',
    mileageMin: '',
    mileageMax: '',
    condition: '',
    warranty: '',
    brand: '',
    model: '',
    series: '',
    bodyType: '',
    color: '',
    serviceType: '',
    experience: '',
    urgency: '',
    spareBrand: '',
    spareModel: '',
    spareSeries: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [showIconSelector, setShowIconSelector] = useState(false);

  // Icon listesini yükle
  useEffect(() => {
    const loadIcons = async () => {
      try {
        const response = await fetch('/api/icons');
        if (response.ok) {
          const icons = await response.json();
          setAvailableIcons(icons);
        }
      } catch (error) {
        console.error('Icon listesi yüklenirken hata:', error);
      }
    };
    loadIcons();
  }, []);

  // Form progress hesaplama
  const calculateProgress = () => {
    const requiredFields = ['title', 'description', 'category', 'location', 'priceMin', 'priceMax', 'icon'];
    const filledFields = requiredFields.filter(field => formData[field as keyof FormData]);
    const imageProgress = formData.images.length > 0 ? 1 : 0;
    return ((filledFields.length + imageProgress) / (requiredFields.length + 1)) * 100;
  };

  const formProgress = calculateProgress();

  // Kategori seçimi
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    setSelectedCategory(category);
    setFormData(prev => ({ 
      ...prev, 
      category: categoryId, 
      subcategory: '' // Alt kategoriyi sıfırla
    }));
  };

  // Form değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Resim yükleme
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...files].slice(0, 10) // Maksimum 10 resim
      }));
    }
  };

  // Resim silme
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Icon seçimi
  const handleIconSelect = (iconName: string) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
    setShowIconSelector(false);
    // Hata temizle
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: '' }));
    }
  };

  // Kategori-spesifik alanları render etme
  const renderCategorySpecificFields = () => {
    if (!formData.category) return null;

    switch (formData.category) {
      case 'emlak':
        return (
          <div className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Emlak Tipi</Label>
                <select 
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="satilik">Satılık</option>
                  <option value="kiralik">Kiralık</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Alan (m²)</Label>
                <Input
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Örn: 120"
                />
              </div>
              <div className="space-y-2">
                <Label>Oda Sayısı</Label>
                <select 
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <option value="9+1">9+1</option>
                  <option value="10+1">10+1</option>
                </select>
              </div>
            </div>

            {/* Bina Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Bina Yaşı</Label>
                <select 
                  name="buildingAge"
                  value={formData.buildingAge}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="0">0 (Sıfır Bina)</option>
                  <option value="1-5">1-5 Yaş</option>
                  <option value="6-10">6-10 Yaş</option>
                  <option value="11-15">11-15 Yaş</option>
                  <option value="16-20">16-20 Yaş</option>
                  <option value="21-25">21-25 Yaş</option>
                  <option value="26-30">26-30 Yaş</option>
                  <option value="31+">31+ Yaş</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Bulunduğu Kat</Label>
                <Input
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="Örn: 3"
                />
              </div>
              <div className="space-y-2">
                <Label>Toplam Kat Sayısı</Label>
                <Input
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleChange}
                  placeholder="Örn: 5"
                />
              </div>
              <div className="space-y-2">
                <Label>Isıtma</Label>
                <select 
                  name="heating"
                  value={formData.heating}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="merkezi">Merkezi Sistem</option>
                  <option value="kombi">Kombi (Doğalgaz)</option>
                  <option value="soba">Soba</option>
                  <option value="klima">Klima</option>
                  <option value="elektrik">Elektrikli</option>
                  <option value="gunes">Güneş Enerjisi</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
            </div>

            {/* Özellikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Balkon</Label>
                <select 
                  name="balcony"
                  value={formData.balcony}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="var">Var</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Eşyalı</Label>
                <select 
                  name="furnished"
                  value={formData.furnished}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="esyali">Eşyalı</option>
                  <option value="esyasiz">Eşyasız</option>
                  <option value="yarim-esyali">Yarı Eşyalı</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Otopark</Label>
                <select 
                  name="parking"
                  value={formData.parking}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="kapali">Kapalı Otopark</option>
                  <option value="acik">Açık Otopark</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Asansör</Label>
                <select 
                  name="elevator"
                  value={formData.elevator}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="var">Var</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
            </div>

            {/* Ek Özellikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Bahçe</Label>
                <select 
                  name="garden"
                  value={formData.garden}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="var">Var</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Teras</Label>
                <select 
                  name="terrace"
                  value={formData.terrace}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="var">Var</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Havuz</Label>
                <select 
                  name="pool"
                  value={formData.pool}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="var">Var</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Güvenlik</Label>
                <select 
                  name="security"
                  value={formData.security}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="24-saat">24 Saat Güvenlik</option>
                  <option value="kamera">Güvenlik Kamerası</option>
                  <option value="kapici">Kapıcı</option>
                  <option value="yok">Yok</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'vasita':
        const vehicleCategory = formData.subcategory === 'Motosiklet' ? 'motosiklet' : 'otomobil';
        const availableBrands = brandData[vehicleCategory] || {};
        const availableModels = formData.brand && availableBrands[formData.brand as keyof typeof availableBrands] ? availableBrands[formData.brand as keyof typeof availableBrands] : [];
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Marka</Label>
              <select 
                name="brand"
                value={formData.brand}
                onChange={(e) => {
                  handleChange(e);
                  // Model seçimini sıfırla
                  setFormData(prev => ({ ...prev, model: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Marka Seçiniz</option>
                {Object.keys(availableBrands).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <select 
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={!formData.brand}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Model Seçiniz</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Seri</Label>
              <Input
                name="series"
                value={formData.series}
                onChange={handleChange}
                placeholder="Örn: 1.6 TDI"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>En Az Yıl</Label>
                <select 
                  name="vehicleYearMin"
                  value={formData.vehicleYearMin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Min Yıl</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>En Çok Yıl</Label>
                <select 
                  name="vehicleYearMax"
                  value={formData.vehicleYearMax}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Max Yıl</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>En Az Kilometre</Label>
                <Input
                  name="mileageMin"
                  value={formData.mileageMin}
                  onChange={handleChange}
                  placeholder="Örn: 50000"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label>En Çok Kilometre</Label>
                <Input
                  name="mileageMax"
                  value={formData.mileageMax}
                  onChange={handleChange}
                  placeholder="Örn: 100000"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Yakıt Tipi</Label>
              <select 
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="benzin">Benzin</option>
                <option value="dizel">Dizel</option>
                <option value="lpg">LPG</option>
                <option value="elektrik">Elektrik</option>
                <option value="hibrit">Hibrit</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Vites</Label>
              <select 
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="manuel">Manuel</option>
                <option value="otomatik">Otomatik</option>
                <option value="yarimotomatik">Yarı Otomatik</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Kasa Tipi</Label>
              <select 
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="space-y-2">
              <Label>Renk</Label>
              <select 
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
        );

      case 'ikinci-el-alisveris':
        // Elektronik kategorileri için marka-model seçimi
        const electronicCategories = ['Bilgisayar', 'Cep Telefonu', 'Fotoğraf & Kamera', 'Ev Elektroniği', 'Elektrikli Ev Aletleri', 'Teknik Elektronik'];
        const isElectronic = electronicCategories.includes(formData.subcategory);
        
        if (isElectronic) {
          const availableElectronicBrands = brandData.elektronik || {};
          const availableElectronicModels = formData.brand && formData.brand in availableElectronicBrands ? availableElectronicBrands[formData.brand as keyof typeof availableElectronicBrands] : [];
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Marka</Label>
                <select 
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => {
                    handleChange(e);
                    // Model seçimini sıfırla
                    setFormData(prev => ({ ...prev, model: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Marka Seçiniz</option>
                  {Object.keys(availableElectronicBrands).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <select 
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  disabled={!formData.brand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Model Seçiniz</option>
                  {availableElectronicModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <select 
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="sifir">Sıfır</option>
                  <option value="az-kullanilmis">Az Kullanılmış</option>
                  <option value="kullanilmis">Kullanılmış</option>
                </select>
              </div>
            </div>
          );
        }
        
        // Diğer ikinci el kategorileri için varsayılan alanlar
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marka</Label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Ürün markası"
              />
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="sifir">Sıfır</option>
                <option value="az-kullanilmis">Az Kullanılmış</option>
                <option value="kullanilmis">Kullanılmış</option>
              </select>
            </div>
          </div>
        );

      case 'ustalar-hizmetler':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hizmet Tipi</Label>
              <select 
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="evde">Evde Hizmet</option>
                <option value="atolyede">Atölyede Hizmet</option>
                <option value="online">Online Hizmet</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Deneyim (Yıl)</Label>
              <Input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Örn: 5"
              />
            </div>
          </div>
        );

      case 'yedek-parca':
        // Alt kategoriye göre farklı marka seçenekleri
        if (formData.subcategory === 'Otomotiv Ekipmanları') {
          // Otomotiv için otomobil markaları
          const availableCarBrands = brandData.otomobil || {};
          const availableCarModels = formData.brand && formData.brand in availableCarBrands ? availableCarBrands[formData.brand as keyof typeof availableCarBrands] : [];
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Otomobil Markası</Label>
                <select 
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => {
                    handleChange(e);
                    // Model ve seri seçimini sıfırla
                    setFormData(prev => ({ ...prev, model: '', series: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Marka Seçiniz</option>
                  {Object.keys(availableCarBrands).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Otomobil Modeli</Label>
                <select 
                  name="model"
                  value={formData.model}
                  onChange={(e) => {
                    handleChange(e);
                    // Seri seçimini sıfırla
                    setFormData(prev => ({ ...prev, series: '' }));
                  }}
                  disabled={!formData.brand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Model Seçiniz</option>
                  {availableCarModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Yedek Parça Türü</Label>
                <select 
                  name="series"
                  value={formData.series}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Parça Türü Seçiniz</option>
                  <option value="fren-sistemi">Fren Sistemi</option>
                  <option value="motor-parcalari">Motor Parçaları</option>
                  <option value="amortisör">Amortisör & Süspansiyon</option>
                  <option value="elektrik">Elektrik & Elektronik</option>
                  <option value="yakit-sistemi">Yakıt Sistemi</option>
                  <option value="sogutma">Soğutma Sistemi</option>
                  <option value="egzoz">Egzoz Sistemi</option>
                  <option value="klima">Klima & Isıtma</option>
                  <option value="lastik-jant">Lastik & Jant</option>
                  <option value="kaporta">Kaporta & Dış Aksesuar</option>
                  <option value="ic-aksesuar">İç Aksesuar</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>
            </div>
          );
        } else if (formData.subcategory === 'Motosiklet Ekipmanları') {
          // Motosiklet için motosiklet markaları
          const motorcycleBrands = {
            'Honda': ['CBR', 'CB', 'CRF', 'PCX', 'Forza', 'SH', 'NC'],
            'Yamaha': ['YZF', 'MT', 'FZ', 'XSR', 'NMAX', 'X-MAX', 'Crypton'],
            'Kawasaki': ['Ninja', 'Z', 'Versys', 'KLX', 'W'],
            'Suzuki': ['GSX', 'SV', 'V-Strom', 'Burgman', 'DR'],
            'BMW': ['S', 'R', 'F', 'G', 'K', 'C'],
            'Ducati': ['Panigale', 'Monster', 'Multistrada', 'Scrambler', 'Diavel'],
            'KTM': ['Duke', 'RC', 'Adventure', 'Supermoto', 'Enduro'],
            'Harley-Davidson': ['Sportster', 'Softail', 'Touring', 'Street'],
            'Aprilia': ['RSV', 'Tuono', 'Shiver', 'Dorsoduro', 'SR'],
            'Triumph': ['Speed', 'Street', 'Bonneville', 'Tiger', 'Rocket'],
            'Bajaj': ['Pulsar', 'Dominar', 'Avenger', 'Platina'],
            'TVS': ['Apache', 'Ntorq', 'Jupiter', 'Radeon']
          };
          
          const availableMotorcycleModels = formData.brand && formData.brand in motorcycleBrands ? motorcycleBrands[formData.brand as keyof typeof motorcycleBrands] : [];
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Motosiklet Markası</Label>
                <select 
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => {
                    handleChange(e);
                    // Model ve seri seçimini sıfırla
                    setFormData(prev => ({ ...prev, model: '', series: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Marka Seçiniz</option>
                  {Object.keys(motorcycleBrands).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Motosiklet Modeli</Label>
                <select 
                  name="model"
                  value={formData.model}
                  onChange={(e) => {
                    handleChange(e);
                    // Seri seçimini sıfırla
                    setFormData(prev => ({ ...prev, series: '' }));
                  }}
                  disabled={!formData.brand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Model Seçiniz</option>
                  {availableMotorcycleModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Yedek Parça Türü</Label>
                <select 
                  name="series"
                  value={formData.series}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Parça Türü Seçiniz</option>
                  <option value="fren-sistemi">Fren Sistemi</option>
                  <option value="motor-parcalari">Motor Parçaları</option>
                  <option value="amortisör">Amortisör & Süspansiyon</option>
                  <option value="elektrik">Elektrik & Elektronik</option>
                  <option value="yakit-sistemi">Yakıt Sistemi</option>
                  <option value="egzoz">Egzoz Sistemi</option>
                  <option value="lastik-jant">Lastik & Jant</option>
                  <option value="kaporta">Kaporta & Aksesuar</option>
                  <option value="koruyucu-ekipman">Koruyucu Ekipman</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>
            </div>
          );
        } else {
          // Diğer alt kategoriler için genel yedek parça markaları
          const availableSpareModels = formData.spareBrand && formData.spareBrand in spareBrands ? spareBrands[formData.spareBrand as keyof typeof spareBrands].models : [];
          const availableSpareSeries = formData.spareBrand && formData.spareBrand in spareBrands ? spareBrands[formData.spareBrand as keyof typeof spareBrands].series : [];
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Marka</Label>
                <select 
                  name="spareBrand"
                  value={formData.spareBrand}
                  onChange={(e) => {
                    handleChange(e);
                    // Model ve seri seçimini sıfırla
                    setFormData(prev => ({ ...prev, spareModel: '', spareSeries: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Marka Seçiniz</option>
                  {Object.keys(spareBrands).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <select 
                  name="spareModel"
                  value={formData.spareModel}
                  onChange={(e) => {
                    handleChange(e);
                    // Seri seçimini sıfırla
                    setFormData(prev => ({ ...prev, spareSeries: '' }));
                  }}
                  disabled={!formData.spareBrand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Model Seçiniz</option>
                  {availableSpareModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Seri</Label>
                <select 
                  name="spareSeries"
                  value={formData.spareSeries}
                  onChange={handleChange}
                  disabled={!formData.spareBrand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Seri Seçiniz</option>
                  {availableSpareSeries.map(series => (
                    <option key={series} value={series}>{series}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        }

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marka</Label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Ürün markası"
              />
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="sifir">Sıfır</option>
                <option value="az-kullanilmis">Az Kullanılmış</option>
                <option value="kullanilmis">Kullanılmış</option>
              </select>
            </div>
          </div>
        );
    }
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Form doğrulama
      const newErrors: Record<string, string> = {};
      
      if (!formData.title.trim()) {
        newErrors.title = 'Başlık zorunludur';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Açıklama zorunludur';
      }
      
      if (!formData.category) {
        newErrors.category = 'Kategori seçimi zorunludur';
      }
      
      if (!formData.location) {
        newErrors.location = 'Şehir seçimi zorunludur';
      }
      
      if (!formData.priceMin) {
        newErrors.priceMin = 'Minimum fiyat zorunludur';
      }
      
      if (!formData.priceMax) {
        newErrors.priceMax = 'Maksimum fiyat zorunludur';
      }
      
      // Icon seçimi artık zorunlu değil

      // Resim kontrolü - artık zorunlu değil, varsayılan resim kullanılacak

      // Fiyat aralığı doğrulaması
      const minPrice = parseFloat(formData.priceMin);
      const maxPrice = parseFloat(formData.priceMax);
      
      if (formData.priceMin && formData.priceMax && minPrice >= maxPrice) {
        newErrors.priceMax = 'Maksimum fiyat, minimum fiyattan büyük olmalıdır';
      }

      // Hata varsa formu gönderme
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Kategori-spesifik verileri hazırla
      const categorySpecificData: Record<string, any> = {};
      
      // Kategori-spesifik alanları ekle
      // Emlak alanları
      if (formData.propertyType) categorySpecificData.propertyType = formData.propertyType;
      if (formData.area) categorySpecificData.area = formData.area;
      if (formData.rooms) categorySpecificData.rooms = formData.rooms;
      if (formData.buildingAge) categorySpecificData.buildingAge = formData.buildingAge;
      if (formData.floor) categorySpecificData.floor = formData.floor;
      if (formData.totalFloors) categorySpecificData.totalFloors = formData.totalFloors;
      if (formData.heating) categorySpecificData.heating = formData.heating;
      if (formData.balcony) categorySpecificData.balcony = formData.balcony;
      if (formData.furnished) categorySpecificData.furnished = formData.furnished;
      if (formData.parking) categorySpecificData.parking = formData.parking;
      if (formData.elevator) categorySpecificData.elevator = formData.elevator;
      if (formData.garden) categorySpecificData.garden = formData.garden;
      if (formData.terrace) categorySpecificData.terrace = formData.terrace;
      if (formData.pool) categorySpecificData.pool = formData.pool;
      if (formData.security) categorySpecificData.security = formData.security;
      
      // Vasıta alanları
      if (formData.vehicleYearMin) categorySpecificData.vehicleYearMin = formData.vehicleYearMin;
      if (formData.vehicleYearMax) categorySpecificData.vehicleYearMax = formData.vehicleYearMax;
      if (formData.fuelType) categorySpecificData.fuelType = formData.fuelType;
      if (formData.transmission) categorySpecificData.transmission = formData.transmission;
      if (formData.mileageMin) categorySpecificData.mileageMin = formData.mileageMin;
      if (formData.mileageMax) categorySpecificData.mileageMax = formData.mileageMax;
      if (formData.condition) categorySpecificData.condition = formData.condition;
      if (formData.warranty) categorySpecificData.warranty = formData.warranty;
      if (formData.brand) categorySpecificData.brand = formData.brand;
      if (formData.model) categorySpecificData.model = formData.model;
      if (formData.series) categorySpecificData.series = formData.series;
      if (formData.bodyType) categorySpecificData.bodyType = formData.bodyType;
      if (formData.color) categorySpecificData.color = formData.color;
      
      // Hizmet alanları
      if (formData.serviceType) categorySpecificData.serviceType = formData.serviceType;
      if (formData.experience) categorySpecificData.experience = formData.experience;
      if (formData.urgency) categorySpecificData.urgency = formData.urgency;

      // Form verilerini hazırla
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        location: formData.location,
        district: formData.district,
        priceMin: minPrice,
        priceMax: maxPrice,
        images: formData.images.length > 0 ? formData.images.map(file => file.name) : [], // Resim yoksa boş array
        videoUrl: formData.videoUrl || null,
        icon: formData.icon || null, // Seçilen icon bilgisi
        categorySpecificData: Object.keys(categorySpecificData).length > 0 ? categorySpecificData : null
      };

      // API çağrısı yap
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'İlan oluşturulurken bir hata oluştu');
      }

      const result = await response.json();
      
      // Başarılı oluşturma sonrası yönlendirme
      router.push('/listings');
      
    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/listings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">İlan Oluştur</h1>
              <p className="text-gray-600 mt-1">Hizmet ihtiyacınızı paylaşın</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Profesyonel İlan Oluştur
            </CardTitle>
            <CardDescription>
              Detaylı bilgiler ekleyerek profesyonel ilanınızı oluşturun
            </CardDescription>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Form Tamamlanma</span>
                <span>{Math.round(formProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${formProgress}%`}}></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Kategori Seçimi */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Kategori Seçimi</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                          formData.category === category.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-center">{category.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Alt Kategori */}
              {selectedCategory && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Alt Kategori</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {selectedCategory.subcategories.map((sub: string) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subcategory: sub }))}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          formData.subcategory === sub
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">İlan Başlığı *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="İlan başlığınızı girin"
                      required
                    />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="İlanınızın detaylarını açıklayın"
                      rows={4}
                      required
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Kategori-spesifik alanlar */}
              {formData.category && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Detaylar</h3>
                  </div>
                  {renderCategorySpecificFields()}
                </div>
              )}

              {/* Konum */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Konum</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Şehir *</Label>
                    <select 
                      name="location"
                      value={formData.location} 
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Şehir seçin</option>
                      {cities.map(city => (
                        <option key={city} value={city.toLowerCase()}>{city}</option>
                      ))}
                    </select>
                    {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe</Label>
                    <select 
                      name="district"
                      value={formData.district} 
                      onChange={handleChange}
                      disabled={!formData.location}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">İlçe seçin</option>
                      {getDistricts(formData.location).map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Fiyat */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Fiyat Aralığı</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceMin">Minimum Fiyat (₺) *</Label>
                    <Input
                      id="priceMin"
                      name="priceMin"
                      type="number"
                      value={formData.priceMin}
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />
                    {errors.priceMin && <p className="text-sm text-red-600">{errors.priceMin}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceMax">Maksimum Fiyat (₺) *</Label>
                    <Input
                      id="priceMax"
                      name="priceMax"
                      type="number"
                      value={formData.priceMax}
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />
                    {errors.priceMax && <p className="text-sm text-red-600">{errors.priceMax}</p>}
                  </div>
                </div>
              </div>

              {/* Icon Seçimi - Sadece vasıta otomobil kategorisinde göster */}
              {formData.category === 'vasita' && formData.subcategory === 'Otomobil' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">İcon Seçimi</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>İcon *</Label>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowIconSelector(!showIconSelector)}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {formData.icon ? (
                            <>
                              <img 
                                src={`/logo/${formData.icon}`} 
                                alt="Seçilen icon" 
                                className="w-6 h-6 object-contain"
                              />
                              <span>{formData.icon}</span>
                            </>
                          ) : (
                            <span>İcon seçin</span>
                          )}
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${showIconSelector ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {showIconSelector && (
                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {availableIcons.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => handleIconSelect(icon)}
                                className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                                  formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                title={icon}
                              >
                                <img 
                                  src={`/logo/${icon}`} 
                                  alt={icon} 
                                  className="w-8 h-8 object-contain mx-auto"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.icon && <p className="text-sm text-red-600">{errors.icon}</p>}
                  </div>
                </div>
              )}

              {/* Medya */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Medya</h3>
                </div>
                
                {/* Resim Yükleme */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resimler (İsteğe Bağlı)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-600">Resimlerinizi buraya sürükleyin veya</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Dosya Seç
                        </Button>
                        <p className="text-xs text-gray-500">Maksimum 10 resim, her biri 5MB'dan küçük olmalı</p>
                      </div>
                    </div>
                    {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
                  </div>

                  {/* Yüklenen Resimler */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (Opsiyonel)</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Hata Mesajları */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-600">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      İlan Oluşturuluyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      İlanı Yayınla
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}