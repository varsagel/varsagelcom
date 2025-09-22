export interface MotorcycleModel {
  id: string;
  name: string;
}

export interface MotorcycleBrand {
  id: string;
  name: string;
  models: MotorcycleModel[];
}

export const motorcycleBrands: MotorcycleBrand[] = [
  {
    id: "honda",
    name: "Honda",
    models: [
      { id: "cbr600rr", name: "CBR600RR" },
      { id: "cbr1000rr", name: "CBR1000RR" },
      { id: "cb650r", name: "CB650R" },
      { id: "cb1000r", name: "CB1000R" },
      { id: "africa-twin", name: "Africa Twin" },
      { id: "gold-wing", name: "Gold Wing" },
      { id: "cb500f", name: "CB500F" },
      { id: "cb500x", name: "CB500X" },
      { id: "cbr500r", name: "CBR500R" },
      { id: "rebel-500", name: "Rebel 500" },
      { id: "nc750x", name: "NC750X" },
      { id: "forza-750", name: "Forza 750" }
    ]
  },
  {
    id: "yamaha",
    name: "Yamaha",
    models: [
      { id: "r1", name: "R1" },
      { id: "r6", name: "R6" },
      { id: "mt-07", name: "MT-07" },
      { id: "mt-09", name: "MT-09" },
      { id: "mt-10", name: "MT-10" },
      { id: "yzf-r3", name: "YZF-R3" },
      { id: "yzf-r125", name: "YZF-R125" },
      { id: "mt-125", name: "MT-125" },
      { id: "xsr700", name: "XSR700" },
      { id: "xsr900", name: "XSR900" },
      { id: "tenere-700", name: "Ténéré 700" },
      { id: "tracer-9", name: "Tracer 9" }
    ]
  },
  {
    id: "kawasaki",
    name: "Kawasaki",
    models: [
      { id: "ninja-300", name: "Ninja 300" },
      { id: "ninja-400", name: "Ninja 400" },
      { id: "ninja-650", name: "Ninja 650" },
      { id: "ninja-1000", name: "Ninja 1000" },
      { id: "z650", name: "Z650" },
      { id: "z900", name: "Z900" },
      { id: "z1000", name: "Z1000" },
      { id: "versys-650", name: "Versys 650" },
      { id: "versys-1000", name: "Versys 1000" },
      { id: "ninja-zx-10r", name: "Ninja ZX-10R" },
      { id: "ninja-zx-6r", name: "Ninja ZX-6R" },
      { id: "vulcan-s", name: "Vulcan S" }
    ]
  },
  {
    id: "suzuki",
    name: "Suzuki",
    models: [
      { id: "gsx-r600", name: "GSX-R600" },
      { id: "gsx-r750", name: "GSX-R750" },
      { id: "gsx-r1000", name: "GSX-R1000" },
      { id: "sv650", name: "SV650" },
      { id: "v-strom-650", name: "V-Strom 650" },
      { id: "v-strom-1000", name: "V-Strom 1000" },
      { id: "hayabusa", name: "Hayabusa" },
      { id: "gsx-s750", name: "GSX-S750" },
      { id: "gsx-s1000", name: "GSX-S1000" },
      { id: "katana", name: "Katana" },
      { id: "burgman-400", name: "Burgman 400" },
      { id: "address-110", name: "Address 110" }
    ]
  },
  {
    id: "bmw",
    name: "BMW",
    models: [
      { id: "s1000rr", name: "S1000RR" },
      { id: "s1000r", name: "S1000R" },
      { id: "f850gs", name: "F850GS" },
      { id: "r1250gs", name: "R1250GS" },
      { id: "r1250rt", name: "R1250RT" },
      { id: "f900r", name: "F900R" },
      { id: "f900xr", name: "F900XR" },
      { id: "g310r", name: "G310R" },
      { id: "g310gs", name: "G310GS" },
      { id: "k1600gt", name: "K1600GT" },
      { id: "r18", name: "R18" },
      { id: "ce-04", name: "CE 04" }
    ]
  },
  {
    id: "ducati",
    name: "Ducati",
    models: [
      { id: "panigale-v2", name: "Panigale V2" },
      { id: "panigale-v4", name: "Panigale V4" },
      { id: "monster", name: "Monster" },
      { id: "multistrada", name: "Multistrada" },
      { id: "diavel", name: "Diavel" },
      { id: "streetfighter-v4", name: "Streetfighter V4" },
      { id: "supersport", name: "Supersport" },
      { id: "hypermotard", name: "Hypermotard" },
      { id: "scrambler", name: "Scrambler" },
      { id: "xdiavel", name: "XDiavel" },
      { id: "desert-x", name: "DesertX" },
      { id: "multistrada-v2", name: "Multistrada V2" }
    ]
  },
  {
    id: "ktm",
    name: "KTM",
    models: [
      { id: "duke-390", name: "Duke 390" },
      { id: "duke-790", name: "Duke 790" },
      { id: "duke-890", name: "Duke 890" },
      { id: "rc-390", name: "RC 390" },
      { id: "adventure-1290", name: "Adventure 1290" },
      { id: "super-duke-1290", name: "Super Duke 1290" },
      { id: "duke-125", name: "Duke 125" },
      { id: "rc-125", name: "RC 125" },
      { id: "adventure-390", name: "Adventure 390" },
      { id: "smcr-690", name: "SMC R 690" },
      { id: "enduro-690", name: "Enduro 690" },
      { id: "sx-f-450", name: "SX-F 450" }
    ]
  },
  {
    id: "harley-davidson",
    name: "Harley Davidson",
    models: [
      { id: "sportster", name: "Sportster" },
      { id: "street-750", name: "Street 750" },
      { id: "iron-883", name: "Iron 883" },
      { id: "forty-eight", name: "Forty-Eight" },
      { id: "road-king", name: "Road King" },
      { id: "street-glide", name: "Street Glide" },
      { id: "fat-boy", name: "Fat Boy" },
      { id: "heritage-classic", name: "Heritage Classic" },
      { id: "low-rider", name: "Low Rider" },
      { id: "pan-america", name: "Pan America" },
      { id: "livewire", name: "LiveWire" },
      { id: "breakout", name: "Breakout" }
    ]
  },
  {
    id: "aprilia",
    name: "Aprilia",
    models: [
      { id: "rsv4", name: "RSV4" },
      { id: "tuono-v4", name: "Tuono V4" },
      { id: "rs-660", name: "RS 660" },
      { id: "tuono-660", name: "Tuono 660" },
      { id: "rs4-125", name: "RS4 125" },
      { id: "tuono-125", name: "Tuono 125" },
      { id: "sx-125", name: "SX 125" },
      { id: "rx-125", name: "RX 125" },
      { id: "sr-motard-125", name: "SR Motard 125" },
      { id: "dorsoduro-900", name: "Dorsoduro 900" },
      { id: "shiver-900", name: "Shiver 900" },
      { id: "caponord-1200", name: "Caponord 1200" }
    ]
  },
  {
    id: "triumph",
    name: "Triumph",
    models: [
      { id: "bonneville", name: "Bonneville" },
      { id: "street-triple", name: "Street Triple" },
      { id: "speed-triple", name: "Speed Triple" },
      { id: "tiger-900", name: "Tiger 900" },
      { id: "tiger-1200", name: "Tiger 1200" },
      { id: "daytona-765", name: "Daytona 765" },
      { id: "trident-660", name: "Trident 660" },
      { id: "scrambler-1200", name: "Scrambler 1200" },
      { id: "thruxton", name: "Thruxton" },
      { id: "rocket-3", name: "Rocket 3" },
      { id: "speed-twin", name: "Speed Twin" },
      { id: "street-twin", name: "Street Twin" }
    ]
  },
  {
    id: "moto-guzzi",
    name: "Moto Guzzi",
    models: [
      { id: "v7", name: "V7" },
      { id: "v9", name: "V9" },
      { id: "v85-tt", name: "V85 TT" },
      { id: "v100-mandello", name: "V100 Mandello" },
      { id: "griso", name: "Griso" },
      { id: "california", name: "California" },
      { id: "audace", name: "Audace" },
      { id: "eldorado", name: "Eldorado" }
    ]
  },
  {
    id: "mv-agusta",
    name: "MV Agusta",
    models: [
      { id: "f3-800", name: "F3 800" },
      { id: "f4", name: "F4" },
      { id: "brutale-800", name: "Brutale 800" },
      { id: "brutale-1000", name: "Brutale 1000" },
      { id: "dragster-800", name: "Dragster 800" },
      { id: "turismo-veloce", name: "Turismo Veloce" },
      { id: "superveloce", name: "Superveloce" },
      { id: "rush-1000", name: "Rush 1000" }
    ]
  },
  {
    id: "benelli",
    name: "Benelli",
    models: [
      { id: "tnt-300", name: "TNT 300" },
      { id: "tnt-600", name: "TNT 600" },
      { id: "leoncino-500", name: "Leoncino 500" },
      { id: "trk-502", name: "TRK 502" },
      { id: "imperiale-400", name: "Imperiale 400" },
      { id: "bn-125", name: "BN 125" },
      { id: "bn-251", name: "BN 251" },
      { id: "bn-302s", name: "BN 302S" }
    ]
  },
  {
    id: "cfmoto",
    name: "CFMoto",
    models: [
      { id: "nk-400", name: "NK 400" },
      { id: "nk-650", name: "NK 650" },
      { id: "mt-650", name: "MT 650" },
      { id: "sr-650", name: "SR 650" },
      { id: "300nk", name: "300NK" },
      { id: "400gt", name: "400GT" },
      { id: "650gt", name: "650GT" },
      { id: "700cl-x", name: "700CL-X" }
    ]
  },
  {
    id: "kymco",
    name: "Kymco",
    models: [
      { id: "ak-550", name: "AK 550" },
      { id: "xciting-400", name: "Xciting 400" },
      { id: "downtown-350", name: "Downtown 350" },
      { id: "people-300", name: "People 300" },
      { id: "like-125", name: "Like 125" },
      { id: "agility-125", name: "Agility 125" },
      { id: "super-8-150", name: "Super 8 150" },
      { id: "vitality-50", name: "Vitality 50" }
    ]
  },
  {
    id: "sym",
    name: "SYM",
    models: [
      { id: "maxsym-400", name: "Maxsym 400" },
      { id: "cruisym-300", name: "Cruisym 300" },
      { id: "joymax-300", name: "Joymax 300" },
      { id: "citycom-300", name: "Citycom 300" },
      { id: "symphony-125", name: "Symphony 125" },
      { id: "orbit-125", name: "Orbit 125" },
      { id: "fiddle-125", name: "Fiddle 125" },
      { id: "jet-14-125", name: "Jet 14 125" }
    ]
  },
  {
    id: "piaggio",
    name: "Piaggio",
    models: [
      { id: "beverly-350", name: "Beverly 350" },
      { id: "mp3-500", name: "MP3 500" },
      { id: "x-evo-400", name: "X-Evo 400" },
      { id: "liberty-125", name: "Liberty 125" },
      { id: "zip-50", name: "Zip 50" },
      { id: "fly-125", name: "Fly 125" },
      { id: "medley-125", name: "Medley 125" },
      { id: "typhoon-125", name: "Typhoon 125" }
    ]
  },
  {
    id: "vespa",
    name: "Vespa",
    models: [
      { id: "gts-300", name: "GTS 300" },
      { id: "primavera-150", name: "Primavera 150" },
      { id: "sprint-150", name: "Sprint 150" },
      { id: "lx-125", name: "LX 125" },
      { id: "s-125", name: "S 125" },
      { id: "et2-50", name: "ET2 50" },
      { id: "elettrica", name: "Elettrica" },
      { id: "sei-giorni", name: "Sei Giorni" }
    ]
  },
  {
    id: "diger",
    name: "Diğer",
    models: [
      { id: "custom-model", name: "Özel Model" },
      { id: "unknown-model", name: "Bilinmeyen Model" }
    ]
  }
];

export const getMotorcycleModelsByBrand = (brandId: string): MotorcycleModel[] => {
  const brand = motorcycleBrands.find(b => b.id === brandId);
  return brand ? brand.models : [];
};

export const getMotorcycleBrandById = (brandId: string): MotorcycleBrand | undefined => {
  return motorcycleBrands.find(b => b.id === brandId);
};

export const getAllMotorcycleBrands = (): MotorcycleBrand[] => {
  return motorcycleBrands;
};