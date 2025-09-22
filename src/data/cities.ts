export interface District {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

export const cities: City[] = [
  {
    id: "istanbul",
    name: "İstanbul",
    districts: [
      { id: "adalar", name: "Adalar" },
      { id: "arnavutkoy", name: "Arnavutköy" },
      { id: "atasehir", name: "Ataşehir" },
      { id: "avcilar", name: "Avcılar" },
      { id: "bagcilar", name: "Bağcılar" },
      { id: "bahcelievler", name: "Bahçelievler" },
      { id: "bakirkoy", name: "Bakırköy" },
      { id: "basaksehir", name: "Başakşehir" },
      { id: "bayrampasa", name: "Bayrampaşa" },
      { id: "besiktas", name: "Beşiktaş" },
      { id: "beykoz", name: "Beykoz" },
      { id: "beylikduzu", name: "Beylikdüzü" },
      { id: "beyoglu", name: "Beyoğlu" },
      { id: "buyukcekmece", name: "Büyükçekmece" },
      { id: "catalca", name: "Çatalca" },
      { id: "cekmece", name: "Çekmeköy" },
      { id: "esenler", name: "Esenler" },
      { id: "esenyurt", name: "Esenyurt" },
      { id: "eyupsultan", name: "Eyüpsultan" },
      { id: "fatih", name: "Fatih" },
      { id: "gaziosmanpasa", name: "Gaziosmanpaşa" },
      { id: "gungoren", name: "Güngören" },
      { id: "kadikoy", name: "Kadıköy" },
      { id: "kagithane", name: "Kağıthane" },
      { id: "kartal", name: "Kartal" },
      { id: "kucukcekmece", name: "Küçükçekmece" },
      { id: "maltepe", name: "Maltepe" },
      { id: "pendik", name: "Pendik" },
      { id: "sancaktepe", name: "Sancaktepe" },
      { id: "sariyer", name: "Sarıyer" },
      { id: "silivri", name: "Silivri" },
      { id: "sisli", name: "Şişli" },
      { id: "sultanbeyli", name: "Sultanbeyli" },
      { id: "sultangazi", name: "Sultangazi" },
      { id: "tuzla", name: "Tuzla" },
      { id: "umraniye", name: "Ümraniye" },
      { id: "uskudar", name: "Üsküdar" },
      { id: "zeytinburnu", name: "Zeytinburnu" }
    ]
  },
  {
    id: "ankara",
    name: "Ankara",
    districts: [
      { id: "akyurt", name: "Akyurt" },
      { id: "altindag", name: "Altındağ" },
      { id: "ayaş", name: "Ayaş" },
      { id: "bala", name: "Bala" },
      { id: "beypazari", name: "Beypazarı" },
      { id: "camlidere", name: "Çamlıdere" },
      { id: "cankaya", name: "Çankaya" },
      { id: "cubuk", name: "Çubuk" },
      { id: "elmdag", name: "Elmadağ" },
      { id: "etimesgut", name: "Etimesgut" },
      { id: "evren", name: "Evren" },
      { id: "golbasi", name: "Gölbaşı" },
      { id: "gudul", name: "Güdül" },
      { id: "haymana", name: "Haymana" },
      { id: "kahramankazan", name: "Kahramankazan" },
      { id: "kalecik", name: "Kalecik" },
      { id: "kecioren", name: "Keçiören" },
      { id: "kizilcahamam", name: "Kızılcahamam" },
      { id: "mamak", name: "Mamak" },
      { id: "nallihan", name: "Nallıhan" },
      { id: "polatli", name: "Polatlı" },
      { id: "pursaklar", name: "Pursaklar" },
      { id: "sincan", name: "Sincan" },
      { id: "sereflikochisar", name: "Şereflikoçhisar" },
      { id: "yenimahalle", name: "Yenimahalle" }
    ]
  },
  {
    id: "izmir",
    name: "İzmir",
    districts: [
      { id: "aliaga", name: "Aliağa" },
      { id: "balcova", name: "Balçova" },
      { id: "bayindir", name: "Bayındır" },
      { id: "bayrakli", name: "Bayraklı" },
      { id: "bergama", name: "Bergama" },
      { id: "bornova", name: "Bornova" },
      { id: "buca", name: "Buca" },
      { id: "cesme", name: "Çeşme" },
      { id: "cigli", name: "Çiğli" },
      { id: "dikili", name: "Dikili" },
      { id: "foca", name: "Foça" },
      { id: "gaziemir", name: "Gaziemir" },
      { id: "guzelbahce", name: "Güzelbahçe" },
      { id: "karabaglar", name: "Karabağlar" },
      { id: "karaburun", name: "Karaburun" },
      { id: "karsiyaka", name: "Karşıyaka" },
      { id: "kemalpasa", name: "Kemalpaşa" },
      { id: "kinik", name: "Kınık" },
      { id: "kiraz", name: "Kiraz" },
      { id: "konak", name: "Konak" },
      { id: "menderes", name: "Menderes" },
      { id: "menemen", name: "Menemen" },
      { id: "narlidere", name: "Narlıdere" },
      { id: "odemis", name: "Ödemiş" },
      { id: "seferihisar", name: "Seferihisar" },
      { id: "selcuk", name: "Selçuk" },
      { id: "tire", name: "Tire" },
      { id: "torbali", name: "Torbalı" },
      { id: "urla", name: "Urla" }
    ]
  },
  {
    id: "bursa",
    name: "Bursa",
    districts: [
      { id: "buyukorhan", name: "Büyükorhan" },
      { id: "gemlik", name: "Gemlik" },
      { id: "gursu", name: "Gürsu" },
      { id: "harmancik", name: "Harmancık" },
      { id: "inegol", name: "İnegöl" },
      { id: "iznik", name: "İznik" },
      { id: "karacabey", name: "Karacabey" },
      { id: "keles", name: "Keles" },
      { id: "kestel", name: "Kestel" },
      { id: "mudanya", name: "Mudanya" },
      { id: "mustafakemalpasa", name: "Mustafakemalpaşa" },
      { id: "nilufer", name: "Nilüfer" },
      { id: "orhaneli", name: "Orhaneli" },
      { id: "orhangazi", name: "Orhangazi" },
      { id: "osmangazi", name: "Osmangazi" },
      { id: "yenisehir", name: "Yenişehir" },
      { id: "yildirim", name: "Yıldırım" }
    ]
  },
  {
    id: "antalya",
    name: "Antalya",
    districts: [
      { id: "akseki", name: "Akseki" },
      { id: "aksu", name: "Aksu" },
      { id: "alanya", name: "Alanya" },
      { id: "demre", name: "Demre" },
      { id: "dosemealti", name: "Döşemealtı" },
      { id: "elmali", name: "Elmalı" },
      { id: "finike", name: "Finike" },
      { id: "gazipaşa", name: "Gazipaşa" },
      { id: "gundogmus", name: "Gündoğmuş" },
      { id: "ibradi", name: "İbradi" },
      { id: "kas", name: "Kaş" },
      { id: "kemer", name: "Kemer" },
      { id: "kepez", name: "Kepez" },
      { id: "konyaalti", name: "Konyaaltı" },
      { id: "kumluca", name: "Kumluca" },
      { id: "manavgat", name: "Manavgat" },
      { id: "muratpasa", name: "Muratpaşa" },
      { id: "serik", name: "Serik" }
    ]
  }
];

export const getCityById = (id: string): City | undefined => {
  return cities.find(city => city.id === id);
};

export const getDistrictsByCityId = (cityId: string): District[] => {
  const city = getCityById(cityId);
  return city ? city.districts : [];
};

export const getAllCities = (): City[] => {
  return cities;
};