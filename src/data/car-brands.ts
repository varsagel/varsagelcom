export interface CarModel {
  id: string;
  name: string;
  year_start: number;
  year_end?: number;
  body_types: string[];
  fuel_types: string[];
  engine_sizes: string[];
}

export interface CarSeries {
  id: string;
  name: string;
}

export interface CarBrand {
  id: string;
  name: string;
  country: string;
  logo?: string;
  series: CarSeries[];
  models: CarModel[];
}

export const carBrands: CarBrand[] = [
  {
    id: "toyota",
    name: "Toyota",
    country: "Japonya",
    series: [
      { id: "corolla", name: "Corolla" },
      { id: "corolla-hybrid", name: "Corolla Hybrid" },
      { id: "c-hr", name: "C-HR" },
      { id: "camry", name: "Camry" },
      { id: "rav4", name: "RAV4" },
      { id: "rav4-hybrid", name: "RAV4 Hybrid" },
      { id: "yaris", name: "Yaris" },
      { id: "prius", name: "Prius" },
      { id: "highlander", name: "Highlander" },
      { id: "land-cruiser", name: "Land Cruiser" },
      { id: "4runner", name: "4Runner" },
      { id: "tacoma", name: "Tacoma" },
      { id: "sienna", name: "Sienna" },
      { id: "avalon", name: "Avalon" },
      { id: "venza", name: "Venza" },
      { id: "gr86", name: "GR86" },
      { id: "supra", name: "Supra" }
    ],
    models: []
  },
  {
    id: "volkswagen",
    name: "Volkswagen",
    country: "Almanya",
    series: [
      { id: "polo", name: "Polo" },
      { id: "golf", name: "Golf" },
      { id: "golf-gti", name: "Golf GTI" },
      { id: "golf-r", name: "Golf R" },
      { id: "passat", name: "Passat" },
      { id: "t-cross", name: "T-Cross" },
      { id: "t-roc", name: "T-Roc" },
      { id: "taigo", name: "Taigo" },
      { id: "tiguan", name: "Tiguan" },
      { id: "tayron", name: "Tayron" },
      { id: "touareg", name: "Touareg" },
      { id: "id3", name: "ID.3" },
      { id: "id4", name: "ID.4" },
      { id: "id7", name: "ID.7" },
      { id: "arteon", name: "Arteon" },
      { id: "atlas", name: "Atlas" }
    ],
    models: []
  },
  {
    id: "bmw",
    name: "BMW",
    country: "Almanya",
    series: [
      { id: "1-series", name: "1 Serisi" },
      { id: "2-series", name: "2 Serisi" },
      { id: "2-series-gran-coupe", name: "2 Serisi Gran Coupe" },
      { id: "3-series", name: "3 Serisi" },
      { id: "4-series", name: "4 Serisi" },
      { id: "5-series", name: "5 Serisi" },
      { id: "6-series", name: "6 Serisi" },
      { id: "7-series", name: "7 Serisi" },
      { id: "8-series", name: "8 Serisi" },
      { id: "x1", name: "X1" },
      { id: "x2", name: "X2" },
      { id: "x3", name: "X3" },
      { id: "x4", name: "X4" },
      { id: "x5", name: "X5" },
      { id: "x6", name: "X6" },
      { id: "x7", name: "X7" },
      { id: "z4", name: "Z4" },
      { id: "i3", name: "i3" },
      { id: "i4", name: "i4" },
      { id: "i7", name: "i7" },
      { id: "ix", name: "iX" },
      { id: "ix3", name: "iX3" },
      { id: "m2", name: "M2" },
      { id: "m3", name: "M3" },
      { id: "m4", name: "M4" },
      { id: "m5", name: "M5" },
      { id: "m8", name: "M8" }
    ],
    models: []
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    country: "Almanya",
    series: [
      { id: "a-class", name: "A-Sınıfı" },
      { id: "b-class", name: "B-Sınıfı" },
      { id: "c-class", name: "C-Sınıfı" },
      { id: "cla", name: "CLA" },
      { id: "cls", name: "CLS" },
      { id: "e-class", name: "E-Sınıfı" },
      { id: "s-class", name: "S-Sınıfı" },
      { id: "gla", name: "GLA" },
      { id: "glb", name: "GLB" },
      { id: "glc", name: "GLC" },
      { id: "gle", name: "GLE" },
      { id: "gls", name: "GLS" },
      { id: "g-class", name: "G-Sınıfı" },
      { id: "slc", name: "SLC" },
      { id: "sl", name: "SL" },
      { id: "amg-gt", name: "AMG GT" },
      { id: "eqa", name: "EQA" },
      { id: "eqb", name: "EQB" },
      { id: "eqc", name: "EQC" },
      { id: "eqe", name: "EQE" },
      { id: "eqs", name: "EQS" },
      { id: "eqv", name: "EQV" },
      { id: "maybach-s", name: "Maybach S-Sınıfı" },
      { id: "maybach-gls", name: "Maybach GLS" }
    ],
    models: []
  },
  {
    id: "audi",
    name: "Audi",
    country: "Almanya",
    series: [
      { id: "a1", name: "A1" },
      { id: "a3", name: "A3" },
      { id: "a3-sportback", name: "A3 Sportback" },
      { id: "a3-allstreet", name: "A3 Allstreet" },
      { id: "a3-sedan", name: "A3 Sedan" },
      { id: "a4", name: "A4" },
      { id: "a5", name: "A5" },
      { id: "a5-sportback", name: "A5 Sportback" },
      { id: "a5-cabriolet", name: "A5 Cabriolet" },
      { id: "a5-coupe", name: "A5 Coupe" },
      { id: "a5-avant", name: "A5 Avant" },
      { id: "a6", name: "A6" },
      { id: "a6-sportback-etron", name: "A6 Sportback e-tron" },
      { id: "a6-avant-etron", name: "A6 Avant e-tron" },
      { id: "a6-allroad", name: "A6 Allroad" },
      { id: "a7", name: "A7" },
      { id: "a7-sportback", name: "A7 Sportback" },
      { id: "a8", name: "A8" },
      { id: "a8-l", name: "A8 L" },
      { id: "q2", name: "Q2" },
      { id: "q3", name: "Q3" },
      { id: "q3-sportback", name: "Q3 Sportback" },
      { id: "q4-etron", name: "Q4 e-tron" },
      { id: "q4-sportback-etron", name: "Q4 Sportback e-tron" },
      { id: "q5", name: "Q5" },
      { id: "q5-sportback", name: "Q5 Sportback" },
      { id: "q6-etron", name: "Q6 e-tron" },
      { id: "q6-sportback-etron", name: "Q6 Sportback e-tron" },
      { id: "q7", name: "Q7" },
      { id: "q8", name: "Q8" },
      { id: "etron-gt", name: "e-tron GT" },
      { id: "rs3", name: "RS3" },
      { id: "rs4", name: "RS4" },
      { id: "rs5", name: "RS5" },
      { id: "rs6", name: "RS6" },
      { id: "rs7", name: "RS7" },
      { id: "rsq3", name: "RSQ3" },
      { id: "rsq8", name: "RSQ8" },
      { id: "s3", name: "S3" },
      { id: "s4", name: "S4" },
      { id: "s5", name: "S5" },
      { id: "s6", name: "S6" },
      { id: "s7", name: "S7" },
      { id: "s8", name: "S8" },
      { id: "sq2", name: "SQ2" },
      { id: "sq3", name: "SQ3" },
      { id: "sq5", name: "SQ5" },
      { id: "sq7", name: "SQ7" },
      { id: "sq8", name: "SQ8" },
      { id: "tt", name: "TT" },
      { id: "tts", name: "TTS" },
      { id: "ttrs", name: "TT RS" }
    ],
    models: []
  },
  {
    id: "ford",
    name: "Ford",
    country: "ABD",
    series: [
      { id: "fiesta", name: "Fiesta" },
      { id: "focus", name: "Focus" },
      { id: "puma", name: "Puma" },
      { id: "kuga", name: "Kuga" },
      { id: "mustang", name: "Mustang" },
      { id: "mustang-mach-e", name: "Mustang Mach-E" },
      { id: "explorer", name: "Explorer" },
      { id: "expedition", name: "Expedition" },
      { id: "f-150", name: "F-150" },
      { id: "f-150-lightning", name: "F-150 Lightning" },
      { id: "ranger", name: "Ranger" },
      { id: "bronco", name: "Bronco" },
      { id: "bronco-sport", name: "Bronco Sport" },
      { id: "escape", name: "Escape" },
      { id: "edge", name: "Edge" },
      { id: "ecosport", name: "EcoSport" },
      { id: "transit", name: "Transit" },
      { id: "transit-connect", name: "Transit Connect" },
      { id: "maverick", name: "Maverick" },
      { id: "mondeo", name: "Mondeo" }
    ],
    models: []
  },
  {
    id: "honda",
    name: "Honda",
    country: "Japonya",
    series: [
      { id: "civic", name: "Civic" },
      { id: "civic-type-r", name: "Civic Type R" },
      { id: "accord", name: "Accord" },
      { id: "cr-v", name: "CR-V" },
      { id: "cr-v-hybrid", name: "CR-V Hybrid" },
      { id: "hr-v", name: "HR-V" },
      { id: "jazz", name: "Jazz" },
      { id: "pilot", name: "Pilot" },
      { id: "passport", name: "Passport" },
      { id: "ridgeline", name: "Ridgeline" },
      { id: "odyssey", name: "Odyssey" },
      { id: "insight", name: "Insight" },
      { id: "fit", name: "Fit" },
      { id: "clarity", name: "Clarity" },
      { id: "cr-z", name: "CR-Z" },
      { id: "s2000", name: "S2000" },
      { id: "nsx", name: "NSX" },
      { id: "city", name: "City" }
    ],
    models: []
  },
  {
    id: "nissan",
    name: "Nissan",
    country: "Japonya",
    series: [
      { id: "micra", name: "Micra" },
      { id: "note", name: "Note" },
      { id: "sentra", name: "Sentra" },
      { id: "altima", name: "Altima" },
      { id: "maxima", name: "Maxima" },
      { id: "versa", name: "Versa" },
      { id: "juke", name: "Juke" },
      { id: "kicks", name: "Kicks" },
      { id: "qashqai", name: "Qashqai" },
      { id: "x-trail", name: "X-Trail" },
      { id: "murano", name: "Murano" },
      { id: "pathfinder", name: "Pathfinder" },
      { id: "armada", name: "Armada" },
      { id: "rogue", name: "Rogue" },
      { id: "frontier", name: "Frontier" },
      { id: "titan", name: "Titan" },
      { id: "370z", name: "370Z" },
      { id: "400z", name: "400Z" },
      { id: "gt-r", name: "GT-R" },
      { id: "leaf", name: "Leaf" },
      { id: "ariya", name: "Ariya" }
    ],
    models: []
  },
  {
    id: "hyundai",
    name: "Hyundai",
    country: "Güney Kore",
    series: [
      { id: "i10", name: "i10" },
      { id: "i20", name: "i20" },
      { id: "i30", name: "i30" },
      { id: "i30-n", name: "i30 N" },
      { id: "elantra", name: "Elantra" },
      { id: "elantra-n", name: "Elantra N" },
      { id: "sonata", name: "Sonata" },
      { id: "azera", name: "Azera" },
      { id: "accent", name: "Accent" },
      { id: "venue", name: "Venue" },
      { id: "kona", name: "Kona" },
      { id: "kona-electric", name: "Kona Electric" },
      { id: "tucson", name: "Tucson" },
      { id: "santa-fe", name: "Santa Fe" },
      { id: "palisade", name: "Palisade" },
      { id: "ioniq", name: "IONIQ" },
      { id: "ioniq-5", name: "IONIQ 5" },
      { id: "ioniq-6", name: "IONIQ 6" },
      { id: "veloster", name: "Veloster" },
      { id: "veloster-n", name: "Veloster N" },
      { id: "genesis-g70", name: "Genesis G70" },
      { id: "genesis-g80", name: "Genesis G80" },
      { id: "genesis-g90", name: "Genesis G90" },
      { id: "genesis-gv70", name: "Genesis GV70" },
      { id: "genesis-gv80", name: "Genesis GV80" }
    ],
    models: []
  },
  {
    id: "kia",
    name: "Kia",
    country: "Güney Kore",
    series: [
      { id: "picanto", name: "Picanto" },
      { id: "rio", name: "Rio" },
      { id: "ceed", name: "Ceed" },
      { id: "ceed-gt", name: "Ceed GT" },
      { id: "forte", name: "Forte" },
      { id: "k5", name: "K5" },
      { id: "optima", name: "Optima" },
      { id: "cadenza", name: "Cadenza" },
      { id: "stonic", name: "Stonic" },
      { id: "seltos", name: "Seltos" },
      { id: "sportage", name: "Sportage" },
      { id: "sorento", name: "Sorento" },
      { id: "telluride", name: "Telluride" },
      { id: "carnival", name: "Carnival" },
      { id: "soul", name: "Soul" },
      { id: "niro", name: "Niro" },
      { id: "niro-ev", name: "Niro EV" },
      { id: "ev6", name: "EV6" },
      { id: "ev9", name: "EV9" },
      { id: "stinger", name: "Stinger" }
    ],
    models: []
  },
  {
    id: "abarth",
    name: "Abarth",
    country: "İtalya",
    series: [
      { id: "595", name: "595" },
      { id: "695", name: "695" },
      { id: "124-spider", name: "124 Spider" }
    ],
    models: []
  },
  {
    id: "acura",
    name: "Acura",
    country: "Japonya",
    series: [
      { id: "mdx", name: "MDX" },
      { id: "rdx", name: "RDX" },
      { id: "tlx", name: "TLX" }
    ],
    models: []
  },
  {
    id: "aion",
    name: "Aion",
    country: "Çin",
    series: [
      { id: "aion-s", name: "Aion S" },
      { id: "aion-v", name: "Aion V" },
      { id: "aion-y", name: "Aion Y" }
    ],
    models: []
  },
  {
    id: "alfa-romeo",
    name: "Alfa Romeo",
    country: "İtalya",
    series: [
      { id: "mito", name: "MiTo" },
      { id: "giulietta", name: "Giulietta" },
      { id: "giulia", name: "Giulia" },
      { id: "giulia-quadrifoglio", name: "Giulia Quadrifoglio" },
      { id: "stelvio", name: "Stelvio" },
      { id: "stelvio-quadrifoglio", name: "Stelvio Quadrifoglio" },
      { id: "4c", name: "4C" },
      { id: "4c-spider", name: "4C Spider" },
      { id: "tonale", name: "Tonale" },
      { id: "brennero", name: "Brennero" }
    ],
    models: []
  },
  {
    id: "anadol",
    name: "Anadol",
    country: "Türkiye",
    series: [
      { id: "a1", name: "A1" },
      { id: "a2", name: "A2" },
      { id: "fte", name: "FTE" }
    ],
    models: []
  },
  {
    id: "arora",
    name: "Arora",
    country: "Türkiye",
    series: [
      { id: "ar1", name: "AR1" },
      { id: "ar2", name: "AR2" }
    ],
    models: []
  },
  {
    id: "aston-martin",
    name: "Aston Martin",
    country: "İngiltere",
    series: [
      { id: "db11", name: "DB11" },
      { id: "vantage", name: "Vantage" },
      { id: "dbx", name: "DBX" }
    ],
    models: []
  },
  {
    id: "bentley",
    name: "Bentley",
    country: "İngiltere",
    series: [
      { id: "continental", name: "Continental" },
      { id: "bentayga", name: "Bentayga" },
      { id: "flying-spur", name: "Flying Spur" }
    ],
    models: []
  },
  {
    id: "buick",
    name: "Buick",
    country: "ABD",
    series: [
      { id: "envision", name: "Envision" },
      { id: "encore", name: "Encore" },
      { id: "enclave", name: "Enclave" }
    ],
    models: []
  },
  {
    id: "byd",
    name: "BYD",
    country: "Çin",
    series: [
      { id: "atto-3", name: "Atto 3" },
      { id: "seal", name: "Seal" },
      { id: "dolphin", name: "Dolphin" },
      { id: "han", name: "Han" }
    ],
    models: []
  },
  {
    id: "cadillac",
    name: "Cadillac",
    country: "ABD",
    series: [
      { id: "ct4", name: "CT4" },
      { id: "ct5", name: "CT5" },
      { id: "ct6", name: "CT6" },
      { id: "xt4", name: "XT4" },
      { id: "xt5", name: "XT5" },
      { id: "xt6", name: "XT6" },
      { id: "escalade", name: "Escalade" },
      { id: "escalade-esv", name: "Escalade ESV" },
      { id: "lyriq", name: "Lyriq" },
      { id: "celestiq", name: "Celestiq" }
    ],
    models: []
  },
  {
    id: "chery",
    name: "Chery",
    country: "Çin",
    series: [
      { id: "tiggo-7", name: "Tiggo 7" },
      { id: "tiggo-8", name: "Tiggo 8" },
      { id: "arrizo-6", name: "Arrizo 6" }
    ],
    models: []
  },
  {
    id: "chevrolet",
    name: "Chevrolet",
    country: "ABD",
    series: [
      { id: "spark", name: "Spark" },
      { id: "sonic", name: "Sonic" },
      { id: "cruze", name: "Cruze" },
      { id: "malibu", name: "Malibu" },
      { id: "impala", name: "Impala" },
      { id: "camaro", name: "Camaro" },
      { id: "camaro-zl1", name: "Camaro ZL1" },
      { id: "corvette", name: "Corvette" },
      { id: "corvette-z06", name: "Corvette Z06" },
      { id: "trax", name: "Trax" },
      { id: "trailblazer", name: "Trailblazer" },
      { id: "equinox", name: "Equinox" },
      { id: "blazer", name: "Blazer" },
      { id: "traverse", name: "Traverse" },
      { id: "tahoe", name: "Tahoe" },
      { id: "suburban", name: "Suburban" },
      { id: "silverado", name: "Silverado" },
      { id: "colorado", name: "Colorado" },
      { id: "bolt-ev", name: "Bolt EV" },
      { id: "bolt-euv", name: "Bolt EUV" }
    ],
    models: []
  },
  {
    id: "chrysler",
    name: "Chrysler",
    country: "ABD",
    series: [
      { id: "300", name: "300" },
      { id: "pacifica", name: "Pacifica" }
    ],
    models: []
  },
  {
    id: "citroen",
    name: "Citroen",
    country: "Fransa",
    series: [
      { id: "c1", name: "C1" },
      { id: "c3", name: "C3" },
      { id: "c3-aircross", name: "C3 Aircross" },
      { id: "c4", name: "C4" },
      { id: "e-c4", name: "ë-C4" },
      { id: "c4-x", name: "C4 X" },
      { id: "c5", name: "C5" },
      { id: "c5-aircross", name: "C5 Aircross" },
      { id: "c5-x", name: "C5 X" },
      { id: "berlingo", name: "Berlingo" },
      { id: "spacetourer", name: "SpaceTourer" },
      { id: "jumpy", name: "Jumpy" },
      { id: "jumper", name: "Jumper" },
      { id: "ami", name: "Ami" }
    ],
    models: []
  },
  {
    id: "cupra",
    name: "Cupra",
    country: "İspanya",
    series: [
      { id: "leon", name: "Leon" },
      { id: "formentor", name: "Formentor" },
      { id: "ateca", name: "Ateca" }
    ],
    models: []
  },
  {
    id: "dacia",
    name: "Dacia",
    country: "Romanya",
    series: [
      { id: "sandero", name: "Sandero" },
      { id: "duster", name: "Duster" },
      { id: "jogger", name: "Jogger" },
      { id: "spring", name: "Spring" }
    ],
    models: []
  },
  {
    id: "daewoo",
    name: "Daewoo",
    country: "Güney Kore",
    series: [
      { id: "matiz", name: "Matiz" },
      { id: "lanos", name: "Lanos" },
      { id: "nubira", name: "Nubira" }
    ],
    models: []
  },
  {
    id: "daihatsu",
    name: "Daihatsu",
    country: "Japonya",
    series: [
      { id: "terios", name: "Terios" },
      { id: "sirion", name: "Sirion" },
      { id: "charade", name: "Charade" }
    ],
    models: []
  },
  {
    id: "dodge",
    name: "Dodge",
    country: "ABD",
    series: [
      { id: "challenger", name: "Challenger" },
      { id: "charger", name: "Charger" },
      { id: "durango", name: "Durango" }
    ],
    models: []
  },
  {
    id: "ds-automobiles",
    name: "DS Automobiles",
    country: "Fransa",
    series: [
      { id: "ds3", name: "DS 3" },
      { id: "ds4", name: "DS 4" },
      { id: "ds7", name: "DS 7" },
      { id: "ds9", name: "DS 9" }
    ],
    models: []
  },
  {
    id: "ferrari",
    name: "Ferrari",
    country: "İtalya",
    series: [
      { id: "488", name: "488" },
      { id: "f8", name: "F8" },
      { id: "roma", name: "Roma" },
      { id: "sf90", name: "SF90" }
    ],
    models: []
  },
  {
    id: "fiat",
    name: "Fiat",
    country: "İtalya",
    series: [
      { id: "500", name: "500" },
      { id: "500e", name: "500e" },
      { id: "500x", name: "500X" },
      { id: "500l", name: "500L" },
      { id: "panda", name: "Panda" },
      { id: "tipo", name: "Tipo" },
      { id: "egea", name: "Egea" },
      { id: "punto", name: "Punto" },
      { id: "doblo", name: "Doblo" },
      { id: "fiorino", name: "Fiorino" },
      { id: "ducato", name: "Ducato" },
      { id: "fullback", name: "Fullback" },
      { id: "talento", name: "Talento" }
    ],
    models: []
  },
  {
    id: "geely",
    name: "Geely",
    country: "Çin",
    series: [
      { id: "coolray", name: "Coolray" },
      { id: "emgrand", name: "Emgrand" },
      { id: "atlas", name: "Atlas" }
    ],
    models: []
  },
  {
    id: "infiniti",
    name: "Infiniti",
    country: "Japonya",
    series: [
      { id: "q50", name: "Q50" },
      { id: "q60", name: "Q60" },
      { id: "qx50", name: "QX50" },
      { id: "qx60", name: "QX60" }
    ],
    models: []
  },
  {
    id: "jaguar",
    name: "Jaguar",
    country: "İngiltere",
    series: [
      { id: "xe", name: "XE" },
      { id: "xf", name: "XF" },
      { id: "f-pace", name: "F-PACE" },
      { id: "e-pace", name: "E-PACE" }
    ],
    models: []
  },
  {
    id: "lada",
    name: "Lada",
    country: "Rusya",
    series: [
      { id: "vesta", name: "Vesta" },
      { id: "granta", name: "Granta" },
      { id: "niva", name: "Niva" }
    ],
    models: []
  },
  {
    id: "lamborghini",
    name: "Lamborghini",
    country: "İtalya",
    series: [
      { id: "huracan", name: "Huracan" },
      { id: "aventador", name: "Aventador" },
      { id: "urus", name: "Urus" }
    ],
    models: []
  },
  {
    id: "lancia",
    name: "Lancia",
    country: "İtalya",
    series: [
      { id: "ypsilon", name: "Ypsilon" },
      { id: "delta", name: "Delta" }
    ],
    models: []
  },
  {
    id: "lexus",
    name: "Lexus",
    country: "Japonya",
    series: [
      { id: "is", name: "IS" },
      { id: "es", name: "ES" },
      { id: "ls", name: "LS" },
      { id: "gs", name: "GS" },
      { id: "rc", name: "RC" },
      { id: "lc", name: "LC" },
      { id: "ux", name: "UX" },
      { id: "nx", name: "NX" },
      { id: "rx", name: "RX" },
      { id: "gx", name: "GX" },
      { id: "lx", name: "LX" },
      { id: "ct", name: "CT" },
      { id: "lfa", name: "LFA" },
      { id: "rz", name: "RZ" }
    ],
    models: []
  },
  {
    id: "lincoln",
    name: "Lincoln",
    country: "ABD",
    series: [
      { id: "navigator", name: "Navigator" },
      { id: "aviator", name: "Aviator" },
      { id: "corsair", name: "Corsair" }
    ],
    models: []
  },
  {
    id: "lotus",
    name: "Lotus",
    country: "İngiltere",
    series: [
      { id: "evora", name: "Evora" },
      { id: "elise", name: "Elise" },
      { id: "emira", name: "Emira" }
    ],
    models: []
  },
  {
    id: "maserati",
    name: "Maserati",
    country: "İtalya",
    series: [
      { id: "ghibli", name: "Ghibli" },
      { id: "quattroporte", name: "Quattroporte" },
      { id: "levante", name: "Levante" }
    ],
    models: []
  },
  {
    id: "mazda",
    name: "Mazda",
    country: "Japonya",
    series: [
      { id: "mazda2", name: "Mazda2" },
      { id: "mazda3", name: "Mazda3" },
      { id: "mazda6", name: "Mazda6" },
      { id: "cx-3", name: "CX-3" },
      { id: "cx-30", name: "CX-30" },
      { id: "cx-5", name: "CX-5" },
      { id: "cx-50", name: "CX-50" },
      { id: "cx-60", name: "CX-60" },
      { id: "cx-70", name: "CX-70" },
      { id: "cx-90", name: "CX-90" },
      { id: "mx-5", name: "MX-5" },
      { id: "mx-30", name: "MX-30" },
      { id: "bt-50", name: "BT-50" }
    ],
    models: []
  },
  {
    id: "mclaren",
    name: "McLaren",
    country: "İngiltere",
    series: [
      { id: "720s", name: "720S" },
      { id: "570s", name: "570S" },
      { id: "gt", name: "GT" }
    ],
    models: []
  },
  {
    id: "mg",
    name: "MG",
    country: "İngiltere",
    series: [
      { id: "zs", name: "ZS" },
      { id: "hs", name: "HS" },
      { id: "marvel-r", name: "Marvel R" }
    ],
    models: []
  },
  {
    id: "mini",
    name: "Mini",
    country: "İngiltere",
    series: [
      { id: "cooper", name: "Cooper" },
      { id: "countryman", name: "Countryman" },
      { id: "clubman", name: "Clubman" }
    ],
    models: []
  },
  {
    id: "mitsubishi",
    name: "Mitsubishi",
    country: "Japonya",
    series: [
      { id: "mirage", name: "Mirage" },
      { id: "attrage", name: "Attrage" },
      { id: "lancer", name: "Lancer" },
      { id: "asx", name: "ASX" },
      { id: "outlander", name: "Outlander" },
      { id: "outlander-phev", name: "Outlander PHEV" },
      { id: "eclipse-cross", name: "Eclipse Cross" },
      { id: "pajero", name: "Pajero" },
      { id: "pajero-sport", name: "Pajero Sport" },
      { id: "l200", name: "L200" },
      { id: "xpander", name: "Xpander" },
      { id: "delica", name: "Delica" }
    ],
    models: []
  },
  {
    id: "opel",
    name: "Opel",
    country: "Almanya",
    series: [
      { id: "corsa", name: "Corsa" },
      { id: "astra", name: "Astra" },
      { id: "insignia", name: "Insignia" },
      { id: "crossland", name: "Crossland" },
      { id: "grandland", name: "Grandland" }
    ],
    models: []
  },
  {
    id: "peugeot",
    name: "Peugeot",
    country: "Fransa",
    series: [
      { id: "108", name: "108" },
      { id: "208", name: "208" },
      { id: "e-208", name: "e-208" },
      { id: "308", name: "308" },
      { id: "308-sw", name: "308 SW" },
      { id: "408", name: "408" },
      { id: "508", name: "508" },
      { id: "508-sw", name: "508 SW" },
      { id: "2008", name: "2008" },
      { id: "e-2008", name: "e-2008" },
      { id: "3008", name: "3008" },
      { id: "5008", name: "5008" },
      { id: "rifter", name: "Rifter" },
      { id: "partner", name: "Partner" },
      { id: "boxer", name: "Boxer" },
      { id: "expert", name: "Expert" }
    ],
    models: []
  },
  {
    id: "polestar",
    name: "Polestar",
    country: "İsveç",
    series: [
      { id: "polestar-2", name: "Polestar 2" },
      { id: "polestar-3", name: "Polestar 3" }
    ],
    models: []
  },
  {
    id: "porsche",
    name: "Porsche",
    country: "Almanya",
    series: [
      { id: "718-boxster", name: "718 Boxster" },
      { id: "718-cayman", name: "718 Cayman" },
      { id: "911", name: "911" },
      { id: "911-turbo", name: "911 Turbo" },
      { id: "911-gt3", name: "911 GT3" },
      { id: "911-gt3-rs", name: "911 GT3 RS" },
      { id: "panamera", name: "Panamera" },
      { id: "panamera-turbo", name: "Panamera Turbo" },
      { id: "macan", name: "Macan" },
      { id: "macan-turbo", name: "Macan Turbo" },
      { id: "cayenne", name: "Cayenne" },
      { id: "cayenne-turbo", name: "Cayenne Turbo" },
      { id: "taycan", name: "Taycan" },
      { id: "taycan-turbo", name: "Taycan Turbo" },
      { id: "taycan-cross-turismo", name: "Taycan Cross Turismo" }
    ],
    models: []
  },
  {
    id: "proton",
    name: "Proton",
    country: "Malezya",
    series: [
      { id: "saga", name: "Saga" },
      { id: "persona", name: "Persona" },
      { id: "x50", name: "X50" }
    ],
    models: []
  },
  {
    id: "renault",
    name: "Renault",
    country: "Fransa",
    series: [
      { id: "twingo", name: "Twingo" },
      { id: "clio", name: "Clio" },
      { id: "clio-rs", name: "Clio RS" },
      { id: "megane", name: "Megane" },
      { id: "megane-rs", name: "Megane RS" },
      { id: "megane-e-tech", name: "Megane E-Tech" },
      { id: "talisman", name: "Talisman" },
      { id: "captur", name: "Captur" },
      { id: "arkana", name: "Arkana" },
      { id: "kadjar", name: "Kadjar" },
      { id: "koleos", name: "Koleos" },
      { id: "austral", name: "Austral" },
      { id: "espace", name: "Espace" },
      { id: "scenic", name: "Scenic" },
      { id: "kangoo", name: "Kangoo" },
      { id: "master", name: "Master" },
      { id: "zoe", name: "Zoe" }
    ],
    models: []
  },
  {
    id: "rolls-royce",
    name: "Rolls-Royce",
    country: "İngiltere",
    series: [
      { id: "phantom", name: "Phantom" },
      { id: "ghost", name: "Ghost" },
      { id: "wraith", name: "Wraith" },
      { id: "cullinan", name: "Cullinan" }
    ],
    models: []
  },
  {
    id: "rover",
    name: "Rover",
    country: "İngiltere",
    series: [
      { id: "75", name: "75" },
      { id: "25", name: "25" },
      { id: "45", name: "45" }
    ],
    models: []
  },
  {
    id: "saab",
    name: "Saab",
    country: "İsveç",
    series: [
      { id: "9-3", name: "9-3" },
      { id: "9-5", name: "9-5" }
    ],
    models: []
  },
  {
    id: "seat",
    name: "Seat",
    country: "İspanya",
    series: [
      { id: "mii", name: "Mii" },
      { id: "ibiza", name: "Ibiza" },
      { id: "leon", name: "Leon" },
      { id: "leon-cupra", name: "Leon Cupra" },
      { id: "toledo", name: "Toledo" },
      { id: "arona", name: "Arona" },
      { id: "ateca", name: "Ateca" },
      { id: "ateca-cupra", name: "Ateca Cupra" },
      { id: "tarraco", name: "Tarraco" },
      { id: "alhambra", name: "Alhambra" },
      { id: "born", name: "Born" },
      { id: "formentor", name: "Formentor" }
    ],
    models: []
  },
  {
    id: "skoda",
    name: "Skoda",
    country: "Çekya",
    series: [
      { id: "citigo", name: "Citigo" },
      { id: "fabia", name: "Fabia" },
      { id: "scala", name: "Scala" },
      { id: "octavia", name: "Octavia" },
      { id: "octavia-rs", name: "Octavia RS" },
      { id: "superb", name: "Superb" },
      { id: "kamiq", name: "Kamiq" },
      { id: "karoq", name: "Karoq" },
      { id: "kodiaq", name: "Kodiaq" },
      { id: "enyaq", name: "Enyaq" },
      { id: "enyaq-coupe", name: "Enyaq Coupe" },
      { id: "roomster", name: "Roomster" },
      { id: "rapid", name: "Rapid" }
    ],
    models: []
  },
  {
    id: "smart",
    name: "Smart",
    country: "Almanya",
    series: [
      { id: "fortwo", name: "Fortwo" },
      { id: "forfour", name: "Forfour" }
    ],
    models: []
  },
  {
    id: "subaru",
    name: "Subaru",
    country: "Japonya",
    series: [
      { id: "impreza", name: "Impreza" },
      { id: "legacy", name: "Legacy" },
      { id: "outback", name: "Outback" },
      { id: "forester", name: "Forester" },
      { id: "crosstrek", name: "Crosstrek" },
      { id: "xv", name: "XV" },
      { id: "ascent", name: "Ascent" },
      { id: "wrx", name: "WRX" },
      { id: "wrx-sti", name: "WRX STI" },
      { id: "brz", name: "BRZ" },
      { id: "solterra", name: "Solterra" }
    ],
    models: []
  },
  {
    id: "suzuki",
    name: "Suzuki",
    country: "Japonya",
    series: [
      { id: "alto", name: "Alto" },
      { id: "celerio", name: "Celerio" },
      { id: "swift", name: "Swift" },
      { id: "swift-sport", name: "Swift Sport" },
      { id: "dzire", name: "Dzire" },
      { id: "baleno", name: "Baleno" },
      { id: "ciaz", name: "Ciaz" },
      { id: "ignis", name: "Ignis" },
      { id: "vitara", name: "Vitara" },
      { id: "s-cross", name: "S-Cross" },
      { id: "xl7", name: "XL7" },
      { id: "jimny", name: "Jimny" },
      { id: "ertiga", name: "Ertiga" }
    ],
    models: []
  },
  {
    id: "tata",
    name: "Tata",
    country: "Hindistan",
    series: [
      { id: "nexon", name: "Nexon" },
      { id: "harrier", name: "Harrier" },
      { id: "safari", name: "Safari" }
    ],
    models: []
  },
  {
    id: "tesla",
    name: "Tesla",
    country: "ABD",
    series: [
      { id: "model-s", name: "Model S" },
      { id: "model-s-plaid", name: "Model S Plaid" },
      { id: "model-3", name: "Model 3" },
      { id: "model-3-performance", name: "Model 3 Performance" },
      { id: "model-x", name: "Model X" },
      { id: "model-x-plaid", name: "Model X Plaid" },
      { id: "model-y", name: "Model Y" },
      { id: "model-y-performance", name: "Model Y Performance" },
      { id: "cybertruck", name: "Cybertruck" },
      { id: "roadster", name: "Roadster" },
      { id: "semi", name: "Semi" }
    ],
    models: []
  },
  {
    id: "tofas",
    name: "Tofaş",
    country: "Türkiye",
    series: [
      { id: "sahin", name: "Şahin" },
      { id: "kartal", name: "Kartal" },
      { id: "dogan", name: "Doğan" },
      { id: "serçe", name: "Serçe" }
    ],
    models: []
  },
  {
    id: "volvo",
    name: "Volvo",
    country: "İsveç",
    series: [
      { id: "s60", name: "S60" },
      { id: "s90", name: "S90" },
      { id: "v60", name: "V60" },
      { id: "v90", name: "V90" },
      { id: "xc40", name: "XC40" },
      { id: "xc40-recharge", name: "XC40 Recharge" },
      { id: "xc60", name: "XC60" },
      { id: "xc60-recharge", name: "XC60 Recharge" },
      { id: "xc90", name: "XC90" },
      { id: "xc90-recharge", name: "XC90 Recharge" },
      { id: "c40", name: "C40" },
      { id: "ex30", name: "EX30" },
      { id: "ex90", name: "EX90" }
    ],
    models: []
  },
  {
    id: "i-go",
    name: "I-GO",
    country: "Türkiye",
    series: [
      { id: "i-go-1", name: "I-GO 1" }
    ],
    models: []
  },
  {
    id: "ikco",
    name: "Ikco",
    country: "İran",
    series: [
      { id: "samand", name: "Samand" },
      { id: "dena", name: "Dena" }
    ],
    models: []
  },
  {
    id: "jiayuan",
    name: "Jiayuan",
    country: "Çin",
    series: [
      { id: "a5", name: "A5" }
    ],
    models: []
  },
  {
    id: "jinpeng",
    name: "Jinpeng",
    country: "Çin",
    series: [
      { id: "jp1", name: "JP1" }
    ],
    models: []
  },
  {
    id: "joyce",
    name: "Joyce",
    country: "Türkiye",
    series: [
      { id: "j1", name: "J1" }
    ],
    models: []
  },
  {
    id: "kuba",
    name: "Kuba",
    country: "Türkiye",
    series: [
      { id: "kuba-1", name: "Kuba 1" }
    ],
    models: []
  },
  {
    id: "leapmotor",
    name: "Leapmotor",
    country: "Çin",
    series: [
      { id: "t03", name: "T03" },
      { id: "c11", name: "C11" }
    ],
    models: []
  },
  {
    id: "luqi",
    name: "Luqi",
    country: "Çin",
    series: [
      { id: "l1", name: "L1" }
    ],
    models: []
  },
  {
    id: "marcos",
    name: "Marcos",
    country: "İngiltere",
    series: [
      { id: "mantis", name: "Mantis" }
    ],
    models: []
  },
  {
    id: "micro",
    name: "Micro",
    country: "Çin",
    series: [
      { id: "m1", name: "M1" }
    ],
    models: []
  },
  {
    id: "nieve",
    name: "Nieve",
    country: "Türkiye",
    series: [
      { id: "n1", name: "N1" }
    ],
    models: []
  },
  {
    id: "nigmer",
    name: "Niğmer",
    country: "Türkiye",
    series: [
      { id: "n1", name: "N1" }
    ],
    models: []
  },
  {
    id: "plymouth",
    name: "Plymouth",
    country: "ABD",
    series: [
      { id: "barracuda", name: "Barracuda" }
    ],
    models: []
  },
  {
    id: "pontiac",
    name: "Pontiac",
    country: "ABD",
    series: [
      { id: "firebird", name: "Firebird" },
      { id: "grand-am", name: "Grand Am" }
    ],
    models: []
  },
  {
    id: "rainwoll",
    name: "Rainwoll",
    country: "Türkiye",
    series: [
      { id: "r1", name: "R1" }
    ],
    models: []
  },
  {
    id: "reeder",
    name: "Reeder",
    country: "Türkiye",
    series: [
      { id: "r1", name: "R1" }
    ],
    models: []
  },
  {
    id: "regal-raptor",
    name: "Regal Raptor",
    country: "Çin",
    series: [
      { id: "rr1", name: "RR1" }
    ],
    models: []
  },
  {
    id: "relive",
    name: "Relive",
    country: "Türkiye",
    series: [
      { id: "r1", name: "R1" }
    ],
    models: []
  },
  {
    id: "rks",
    name: "RKS",
    country: "Türkiye",
    series: [
      { id: "rks1", name: "RKS1" }
    ],
    models: []
  },
  {
    id: "the-london-taxi",
    name: "The London Taxi",
    country: "İngiltere",
    series: [
      { id: "tx4", name: "TX4" },
      { id: "tx5", name: "TX5" }
    ],
    models: []
  },
  {
    id: "vanderhall",
    name: "Vanderhall",
    country: "ABD",
    series: [
      { id: "venice", name: "Venice" },
      { id: "carmel", name: "Carmel" }
    ],
    models: []
  },
  {
    id: "volta",
    name: "Volta",
    country: "Türkiye",
    series: [
      { id: "v1", name: "V1" }
    ],
    models: []
  },
  {
    id: "xev",
    name: "XEV",
    country: "İtalya",
    series: [
      { id: "yoyo", name: "Yoyo" }
    ],
    models: []
  },
  {
    id: "yuki",
    name: "Yuki",
    country: "Türkiye",
    series: [
      { id: "y1", name: "Y1" }
    ],
    models: []
  },
  {
    id: "zhidou",
    name: "ZhiDou",
    country: "Çin",
    series: [
      { id: "d2", name: "D2" }
    ],
    models: []
  }
];

export const getBrandById = (id: string): CarBrand | undefined => {
  return carBrands.find(brand => brand.id === id);
};

export const getSeriesByBrandAndId = (brandId: string, seriesId: string): CarSeries | undefined => {
  const brand = getBrandById(brandId);
  return brand?.series.find(series => series.id === seriesId);
};

export const getModelByIds = (brandId: string, seriesId: string, modelId: string): CarModel | undefined => {
  const brand = getBrandById(brandId);
  return brand?.models.find(model => model.id === modelId);
};

export const getAllBrands = (): CarBrand[] => {
  return carBrands;
};

export const getSeriesByBrand = (brandId: string): CarSeries[] => {
  const brand = getBrandById(brandId);
  return brand?.series || [];
};

export const getModelsBySeries = (brandId: string): CarModel[] => {
  const brand = getBrandById(brandId);
  return brand?.models || [];
};

export const getYearRange = (model: CarModel): string => {
  if (model.year_end) {
    return `${model.year_start}-${model.year_end}`;
  }
  return `${model.year_start}+`;
};

export const getBodyTypes = (): string[] => {
  return [
    "Sedan",
    "Hatchback",
    "SUV",
    "Coupe",
    "Convertible",
    "Wagon",
    "Pickup",
    "Van",
    "Minivan",
    "Crossover"
  ];
};

export const getFuelTypes = (): string[] => {
  return [
    "Benzin",
    "Dizel",
    "Hybrid",
    "Elektrik",
    "LPG",
    "CNG",
    "Hydrogen"
  ];
};

export const getEngineSizes = (): string[] => {
  return [
    "1.0L",
    "1.2L",
    "1.3L",
    "1.4L",
    "1.5L",
    "1.6L",
    "1.8L",
    "2.0L",
    "2.5L",
    "3.0L",
    "Electric"
  ];
};