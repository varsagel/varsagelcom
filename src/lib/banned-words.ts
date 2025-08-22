// Yasaklı kelimeler listesi
const BANNED_WORDS = [
  // Küfür ve hakaret
  'amk', 'amq', 'orospu', 'piç', 'göt', 'yarrak', 'taşak',
  'salak', 'aptal', 'gerizekalı', 'ahmak', 'dangalak', 'embesil',
  'geri zekalı', 'beyinsiz', 'kafasız', 'budala', 'hıyar', 'pezevenk',
  
  // Dolandırıcılık ve şüpheli aktiviteler
  'dolandırıcı', 'dolandırıcılık', 'sahte', 'fake', 'çal', 'çalmak',
  'hırsızlık', 'kaçak', 'illegal', 'yasadışı', 'kara para', 'rüşvet',
  'komisyon', 'haraç', 'şantaj', 'tehdit', 'zorla', 'zorbalık',
  
  // Cinsel içerik
  'seks', 'sex', 'porno', 'porn', 'escort', 'masaj', 'özel hizmet',
  'gizli buluşma', 'randevu', 'özel randevu', 'yetişkin', 'adult',
  
  // Uyuşturucu ve zararlı maddeler
  'uyuşturucu', 'esrar', 'eroin', 'kokain', 'metamfetamin', 'ecstasy',
  'bonzai', 'sentetik', 'hap', 'ilaç satışı', 'reçetesiz',
  
  // Silah ve tehlikeli eşyalar
  'silah', 'tabanca', 'tüfek', 'bıçak', 'bomba', 'patlayıcı',
  'mermi', 'fişek', 'av tüfeği', 'ruhsatsız',
  
  // Finansal dolandırıcılık
  'kredi kartı', 'banka kartı', 'şifre', 'pin kod', 'hesap bilgisi',
  'para transferi', 'western union', 'havale', 'eft', 'bitcoin',
  'kripto para', 'yatırım fırsatı', 'hızlı para', 'kolay para',
  
  // Spam ve yanıltıcı içerik
  'garanti kazanç', 'risk yok', '%100 garanti', 'kesin kazanç',
  'mucize', 'sihirli', 'bedava', 'ücretsiz', 'hediye', 'çekiliş',
  'şanslı', 'kazandınız', 'tebrikler',
  
  // Kişisel bilgi toplama
  'tc kimlik', 'kimlik numarası', 'pasaport', 'ehliyet', 'adres bilgisi',
  'telefon numarası ver', 'whatsapp ver', 'instagram ver', 'facebook ver',
  
  // Platformdan çıkarma girişimleri
  'whatsapp', 'telegram', 'discord', 'skype', 'zoom', 'meet',
  'başka platform', 'dışarıda konuş', 'özel mesaj', 'direkt iletişim'
];

// Yasaklı kelime kontrolü fonksiyonu
export function checkBannedWords(text: string): { hasBannedWords: boolean; bannedWords: string[] } {
  const lowerText = text.toLowerCase();
  const foundBannedWords: string[] = [];
  
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      foundBannedWords.push(word);
    }
  }
  
  return {
    hasBannedWords: foundBannedWords.length > 0,
    bannedWords: foundBannedWords
  };
}

export { BANNED_WORDS };