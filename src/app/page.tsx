'use client';
import Link from "next/link";
import { ArrowRight, Search, Star, Clock, Heart, MessageSquare, Filter, MapPin, Zap, Mail, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCity, formatDistrict } from "@/utils/locationUtils";
import TrendingListings from "@/components/TrendingListings";

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [showCategories, setShowCategories] = useState(false);

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

  // Seçilen şehre göre ilçeleri getir
  const getDistricts = (city: string) => {
    return districtData[city as keyof typeof districtData] || [];
  };

  // Şehir değiştiğinde ilçeyi sıfırla
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setSelectedDistrict(''); // İlçeyi sıfırla
  };

  // İlanlar sayfası ile tamamen uyumlu kategoriler
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
      subcategories: [
        'Bilgisayar',
        'Ev Dekorasyon',
        'Giyim & Aksesuar',
        'Kişisel Bakım & Kozmetik',
        'Kitap, Dergi & Film',
        'Takı, Mücevher & Altın',
        'Bahçe & Yapı Market',
        'Yiyecek & İçecek',
        'Cep Telefonu & Aksesuar',
        'Ev Elektroniği',
        'Saat',
        'Hobi & Oyuncak'
      ]
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





  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      // Check if search term looks like a display number (starts with # or is numeric)
      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch.startsWith('#') || /^\d+$/.test(trimmedSearch)) {
        // Search by display number
        const displayNumber = trimmedSearch.startsWith('#') ? trimmedSearch.substring(1) : trimmedSearch;
        params.set('displayNumber', displayNumber);
      } else {
        // Regular text search
        params.set('q', trimmedSearch);
      }
    }
    if (selectedLocation) {
      params.set('location', selectedLocation);
    }
    if (selectedDistrict) {
      params.set('district', selectedDistrict);
    }
    
    router.push(`/listings/search?${params.toString()}`);
  };



  return (
    <div className="flex min-h-screen relative">
      {/* Sol Panel - En Çok Teklif Alan */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <TrendingListings type="most-offers" position="left" />
      </div>
      
      {/* Ana İçerik */}
      <div className="flex-1 min-w-0">
      {/* Hero Section - Varsagel.com Style */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden pt-4 sm:pt-8 lg:pt-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative mx-auto max-w-7xl container-responsive py-8 sm:py-12 lg:py-16">
          {/* Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs sm:text-sm font-medium shadow-lg">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Yeni Nesil E-Ticaret Deneyimi</span>
              <span className="sm:hidden">Yeni Nesil Platform</span>
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
              İhtiyacınızı
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Paylaşın</span>,
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Teklifleri <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Alın</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Geleneksel alışverişi tersine çeviren platform. Siz ihtiyacınızı belirtin, satıcılar size teklif getirsin.
            </p>
          </div>
          
          {/* Search Form */}
          <div className="mx-auto max-w-4xl px-4">
            <form onSubmit={handleSearch} className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ne arıyorsunuz? (örn: web tasarım, temizlik, emlak...) veya ilan/teklif numarası girin"
                    className="input-mobile w-full pl-10 sm:pl-14 pr-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl text-base sm:text-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <select 
                      value={selectedLocation}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="input-mobile pl-10 sm:pl-12 pr-8 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer w-full sm:w-auto min-w-[200px]">
                      <option value="">Tüm Şehirler</option>
                      <option value="adana">Adana</option>
                      <option value="adiyaman">Adıyaman</option>
                      <option value="afyonkarahisar">Afyonkarahisar</option>
                      <option value="agri">Ağrı</option>
                      <option value="aksaray">Aksaray</option>
                      <option value="amasya">Amasya</option>
                      <option value="ankara">Ankara</option>
                      <option value="antalya">Antalya</option>
                      <option value="ardahan">Ardahan</option>
                      <option value="artvin">Artvin</option>
                      <option value="aydin">Aydın</option>
                      <option value="balikesir">Balıkesir</option>
                      <option value="bartin">Bartın</option>
                      <option value="batman">Batman</option>
                      <option value="bayburt">Bayburt</option>
                      <option value="bilecik">Bilecik</option>
                      <option value="bingol">Bingöl</option>
                      <option value="bitlis">Bitlis</option>
                      <option value="bolu">Bolu</option>
                      <option value="burdur">Burdur</option>
                      <option value="bursa">Bursa</option>
                      <option value="canakkale">Çanakkale</option>
                      <option value="cankiri">Çankırı</option>
                      <option value="corum">Çorum</option>
                      <option value="denizli">Denizli</option>
                      <option value="diyarbakir">Diyarbakır</option>
                      <option value="duzce">Düzce</option>
                      <option value="edirne">Edirne</option>
                      <option value="elazig">Elazığ</option>
                      <option value="erzincan">Erzincan</option>
                      <option value="erzurum">Erzurum</option>
                      <option value="eskisehir">Eskişehir</option>
                      <option value="gaziantep">Gaziantep</option>
                      <option value="giresun">Giresun</option>
                      <option value="gumushane">Gümüşhane</option>
                      <option value="hakkari">Hakkâri</option>
                      <option value="hatay">Hatay</option>
                      <option value="igdir">Iğdır</option>
                      <option value="isparta">Isparta</option>
                      <option value="istanbul">İstanbul</option>
                      <option value="izmir">İzmir</option>
                      <option value="kahramanmaras">Kahramanmaraş</option>
                      <option value="karabuk">Karabük</option>
                      <option value="karaman">Karaman</option>
                      <option value="kars">Kars</option>
                      <option value="kastamonu">Kastamonu</option>
                      <option value="kayseri">Kayseri</option>
                      <option value="kilis">Kilis</option>
                      <option value="kirikkale">Kırıkkale</option>
                      <option value="kirklareli">Kırklareli</option>
                      <option value="kirsehir">Kırşehir</option>
                      <option value="kocaeli">Kocaeli</option>
                      <option value="konya">Konya</option>
                      <option value="kutahya">Kütahya</option>
                      <option value="malatya">Malatya</option>
                      <option value="manisa">Manisa</option>
                      <option value="mardin">Mardin</option>
                      <option value="mersin">Mersin</option>
                      <option value="mugla">Muğla</option>
                      <option value="mus">Muş</option>
                      <option value="nevsehir">Nevşehir</option>
                      <option value="nigde">Niğde</option>
                      <option value="ordu">Ordu</option>
                      <option value="osmaniye">Osmaniye</option>
                      <option value="rize">Rize</option>
                      <option value="sakarya">Sakarya</option>
                      <option value="samsun">Samsun</option>
                      <option value="sanliurfa">Şanlıurfa</option>
                      <option value="siirt">Siirt</option>
                      <option value="sinop">Sinop</option>
                      <option value="sirnak">Şırnak</option>
                      <option value="sivas">Sivas</option>
                      <option value="tekirdag">Tekirdağ</option>
                      <option value="tokat">Tokat</option>
                      <option value="trabzon">Trabzon</option>
                      <option value="tunceli">Tunceli</option>
                      <option value="usak">Uşak</option>
                      <option value="van">Van</option>
                      <option value="yalova">Yalova</option>
                      <option value="yozgat">Yozgat</option>
                      <option value="zonguldak">Zonguldak</option>
                    </select>
                  </div>
                  {/* İlçe Seçimi */}
                  {selectedLocation && getDistricts(selectedLocation).length > 0 && (
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <select 
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="input-mobile pl-10 sm:pl-12 pr-8 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer w-full sm:w-auto min-w-[200px]">
                        <option value="">Tüm İlçeler</option>
                        {getDistricts(selectedLocation).map((district) => (
                          <option key={district} value={district.toLowerCase().replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')}>
                            {formatDistrict(district)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button type="submit" className="btn-touch inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-auto sm:min-w-[120px]">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Ara
                  </button>
                </div>
              </div>
              
            </form>
          </div>
        </div>
      </section>

      {/* Modern Categories Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container-responsive mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Category Header */}
          <div className="flex items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-6 sm:h-6">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Kategoriler</h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">İhtiyacınıza uygun kategoriyi seçin</p>
              </div>
            </div>
          </div>

          {/* Main Categories - Simple Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {categories.filter(cat => cat.id !== 'all').map((category) => {
              const categoryIcons: { [key: string]: string } = {
                'emlak': '🏠',
                'vasita': '🚗',
                'yedek-parca': '🔧',
                'ikinci-el-alisveris': '🛍️',
                'is-makineleri-sanayi': '🏭',
                'ustalar-hizmetler': '🔨',
                'ozel-ders': '📚',
                'is-ilanlari': '💼',
                'yardimci-arayanlar': '👥',
                'hayvanlar-alemi': '🐾'
              };
              
              const categoryColors: { [key: string]: string } = {
                'emlak': 'from-blue-500 to-blue-600',
                'vasita': 'from-red-500 to-red-600',
                'yedek-parca': 'from-orange-500 to-orange-600',
                'ikinci-el-alisveris': 'from-green-500 to-green-600',
                'is-makineleri-sanayi': 'from-gray-500 to-gray-600',
                'ustalar-hizmetler': 'from-purple-500 to-purple-600',
                'ozel-ders': 'from-indigo-500 to-indigo-600',
                'is-ilanlari': 'from-yellow-500 to-yellow-600',
                'yardimci-arayanlar': 'from-pink-500 to-pink-600',
                'hayvanlar-alemi': 'from-emerald-500 to-emerald-600'
              };
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('category', category.id);
                    router.push(`/listings/search?${params.toString()}`);
                  }}
                  className="btn-touch group relative overflow-hidden bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 hover:border-gray-300"
                >
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br ${categoryColors[category.id] || 'from-blue-500 to-blue-600'} rounded-xl sm:rounded-2xl mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-lg sm:text-xl lg:text-2xl">{categoryIcons[category.id] || '📦'}</span>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm lg:text-lg text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>





      {/* Trending Categories */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-br from-muted/20 via-background to-primary/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-primary/5" />
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="container-responsive relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="mb-4 sm:mb-6 inline-flex items-center rounded-full border border-primary/30 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-primary shadow-lg">
              <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              🔥 Trend Kategoriler
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
              En Çok{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Aranan
              </span>
              {' '}Kategoriler
            </h2>
            <p className="text-sm sm:text-base lg:text-xl leading-6 sm:leading-8 text-muted-foreground max-w-2xl mx-auto px-4">
              Bu kategorilerde en çok ihtiyaç paylaşılıyor. Siz de ihtiyacınızı ilan edin, en iyi teklifleri alın.
            </p>
          </div>
          
          {/* Trending Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center p-3 sm:p-4 lg:p-6 bg-background/80 backdrop-blur-sm border border-primary/10 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">2.5K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Aktif İlan</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6 bg-background/80 backdrop-blur-sm border border-secondary/10 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-1 sm:mb-2">850+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Günlük Teklif</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6 bg-background/80 backdrop-blur-sm border border-accent/10 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Başarı Oranı</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-6 bg-background/80 backdrop-blur-sm border border-primary/10 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Destek</div>
            </div>
          </div>
          
          {/* Dynamic Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                id: 'vasita',
                name: 'Vasıta',
                description: 'Otomobil, motosiklet, deniz araçları',
                icon: '🚗',
                color: 'from-red-500/10 to-red-600/10 border-red-500/20',
                textColor: 'text-red-600',
                hoverColor: 'hover:from-red-500 hover:to-red-600',
                stats: '450+ ilan',
                trend: '+12%'
              },
              {
                id: 'ustalar-ve-hizmetler',
                name: 'Hizmetler',
                description: 'Temizlik, tamir, bakım, danışmanlık',
                icon: '🔨',
                color: 'from-purple-500/10 to-purple-600/10 border-purple-500/20',
                textColor: 'text-purple-600',
                hoverColor: 'hover:from-purple-500 hover:to-purple-600',
                stats: '380+ ilan',
                trend: '+18%'
              },
              {
                id: 'emlak',
                name: 'Emlak',
                description: 'Konut, işyeri, arsa, gayrimenkul',
                icon: '🏠',
                color: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
                textColor: 'text-blue-600',
                hoverColor: 'hover:from-blue-500 hover:to-blue-600',
                stats: '320+ ilan',
                trend: '+8%'
              },
              {
                id: 'ikinci-el-ve-sifir-alisveris',
                name: 'Alışveriş',
                description: 'Elektronik, giyim, ev eşyaları',
                icon: '🛍️',
                color: 'from-green-500/10 to-green-600/10 border-green-500/20',
                textColor: 'text-green-600',
                hoverColor: 'hover:from-green-500 hover:to-green-600',
                stats: '290+ ilan',
                trend: '+15%'
              }
            ].map((category, index) => (
              <div key={category.id} className={`btn-touch group relative overflow-hidden rounded-2xl sm:rounded-3xl border ${category.color} bg-background/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-3 hover:border-opacity-40 animate-in slide-in-from-bottom-4 duration-700`} style={{animationDelay: `${index * 150}ms`}}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {category.trend}
                </div>
                <div className="relative z-10">
                  <div className="mb-4 sm:mb-6 inline-flex h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-background to-muted/20 border border-primary/10 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">{category.icon}</span>
                  </div>
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 transition-colors group-hover:${category.textColor}`}>{category.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      {category.stats}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-foreground">4.8</span>
                    </div>
                  </div>
                  <Link
                    href={`/listings/search?category=${encodeURIComponent(category.id)}`}
                    className={`group/btn w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r ${category.color} px-6 py-3 text-sm font-semibold ${category.textColor} transition-all ${category.hoverColor} hover:text-white hover:shadow-xl hover:scale-105 border`}
                  >
                    <span>Keşfet</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/listings"
                className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-10 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:shadow-primary/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span>Tüm Kategorileri Keşfet</span>
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/listings/create"
                className="group inline-flex items-center justify-center rounded-full border-2 border-primary/30 bg-background/80 backdrop-blur-sm px-10 py-4 text-lg font-semibold text-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span>İlan Oluştur</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-secondary/5" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="mb-6 inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
              ⚡ Son İlanlar
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Güncel{' '}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                İhtiyaçlar
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Alıcıların paylaştığı en güncel ihtiyaçları görün ve teklif verin.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl border border-secondary/10 bg-background/80 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-secondary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-secondary/10 border border-secondary/20 px-3 py-1 text-xs font-semibold text-secondary">
                      Teknoloji
                    </span>
                    <span className="text-xs text-muted-foreground">2 saat önce</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-primary/70 bg-primary/5 rounded-full px-2 py-1">
                      <Heart className="h-3 w-3" /> 12
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-secondary/70 bg-secondary/5 rounded-full px-2 py-1">
                      <MessageSquare className="h-3 w-3" /> 5
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">
                  E-ticaret sitesi tasarımı
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Modern ve kullanıcı dostu bir e-ticaret sitesi tasarımına ihtiyacım var. Responsive olmalı.
                </p>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-secondary/10 to-accent/10 px-4 py-2 text-sm font-medium">
                    <span className="text-secondary">₺5.000 - ₺15.000</span>
                  </div>
                  <Link
                    href="/listings/1"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-secondary/10 to-secondary/5 px-4 py-2 text-sm font-medium text-secondary transition-all hover:from-secondary hover:to-secondary/80 hover:text-primary-foreground hover:shadow-lg"
                  >
                    Detaylar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-accent/10 bg-background/80 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-accent/20">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                      Hizmet
                    </span>
                    <span className="text-xs text-muted-foreground">4 saat önce</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-primary/70 bg-primary/5 rounded-full px-2 py-1">
                      <Heart className="h-3 w-3" /> 8
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-secondary/70 bg-secondary/5 rounded-full px-2 py-1">
                      <MessageSquare className="h-3 w-3" /> 3
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                  Ev temizliği hizmeti
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Haftalık düzenli ev temizliği için güvenilir temizlik firması arıyorum.
                </p>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent/10 to-primary/10 px-4 py-2 text-sm font-medium">
                    <span className="text-accent">₺200 - ₺400</span>
                  </div>
                  <Link
                    href="/listings/2"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-2 text-sm font-medium text-accent transition-all hover:from-accent hover:to-accent/80 hover:text-primary-foreground hover:shadow-lg"
                  >
                    Detaylar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-background/80 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                      Emlak
                    </span>
                    <span className="text-xs text-muted-foreground">6 saat önce</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-primary/70 bg-primary/5 rounded-full px-2 py-1">
                      <Heart className="h-3 w-3" /> 15
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-secondary/70 bg-secondary/5 rounded-full px-2 py-1">
                      <MessageSquare className="h-3 w-3" /> 7
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  2+1 kiralık daire
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Şehir merkezine yakın, ulaşımı kolay 2+1 kiralık daire arıyorum.
                </p>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 text-sm font-medium">
                    <span className="text-primary">₺3.000 - ₺5.000</span>
                  </div>
                  <Link
                    href="/listings/3"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:from-primary hover:to-primary/80 hover:text-primary-foreground hover:shadow-lg"
                  >
                    Detaylar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 text-center">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20 px-8 py-4 text-lg font-medium text-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:bg-gradient-to-r hover:from-secondary hover:to-accent hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              Tüm İlanları Görüntüle
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>





      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white shadow-lg">
              <span className="mr-2 h-2 w-2 rounded-full bg-white animate-pulse"></span>
              🎉 Varsagel Ailesine Katılın
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
              İhtiyacınızı{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Paylaşın
              </span>
            </h2>
            <p className="text-xl leading-8 text-blue-100 max-w-3xl mx-auto mb-12">
              İhtiyacınızı ilan olarak paylaşın, satıcılardan en iyi teklifleri alın ve ihtiyacınızı karşılayın. 
              Güvenli ödeme sistemi ve 7/24 destek ile yanınızdayız.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <Link
                href="/listings/create"
                className="group relative inline-flex items-center justify-center rounded-xl bg-white text-blue-600 hover:bg-gray-50 px-10 py-5 text-xl font-semibold shadow-xl transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                <span className="mr-3 text-2xl">+</span>
                <span className="relative z-10">İlan Oluştur</span>
              </Link>
              <Link
                href="/listings/search"
                className="group inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-10 py-5 text-xl font-semibold text-white shadow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                <Search className="mr-3 h-6 w-6" />
                İlanları Keşfet
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-background/80 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Güvenli Ödeme</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    SSL sertifikası ile korunan güvenli ödeme sistemi ve escrow hizmeti
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl border border-accent/10 bg-background/80 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">7/24 Destek</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Her zaman yanınızda olan profesyonel müşteri destek ekibi
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl border border-secondary/10 bg-background/80 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">Geniş Topluluk</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Binlerce aktif kullanıcı ve uzman ile güvenli bağlantı kurun
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
      
      {/* Sağ Panel - En Çok Görüntülenen */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <TrendingListings type="most-viewed" position="right" />
      </div>
    </div>
  );
}
