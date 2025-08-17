import { NextRequest, NextResponse } from 'next/server';

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
    const lowerWord = word.toLowerCase();
    
    // Kelime sınırlarını kontrol et - sadece tam kelime eşleşmelerini yakala
    const wordRegex = new RegExp(`\\b${lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    
    if (wordRegex.test(lowerText)) {
      foundBannedWords.push(word);
    }
  }
  
  return {
    hasBannedWords: foundBannedWords.length > 0,
    bannedWords: foundBannedWords
  };
}

// Yasaklı kelimeleri getir (admin için)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    bannedWords: BANNED_WORDS,
    count: BANNED_WORDS.length
  });
}

// Metin kontrolü yap
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir metin gönderilmedi' },
        { status: 400 }
      );
    }
    
    const result = checkBannedWords(text);
    
    return NextResponse.json({
      hasBannedWords: result.hasBannedWords,
      bannedWords: result.bannedWords,
      message: result.hasBannedWords 
        ? 'Metinde yasaklı kelimeler bulundu' 
        : 'Metin temiz'
    });
  } catch (error) {
    console.error('Yasaklı kelime kontrolü hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}