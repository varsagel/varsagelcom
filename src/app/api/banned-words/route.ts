import { NextRequest, NextResponse } from 'next/server';
import { checkBannedWords, BANNED_WORDS } from '@/lib/banned-words';

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