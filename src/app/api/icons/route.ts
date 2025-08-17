import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iconName = searchParams.get('name');
    const iconDir = path.join(process.cwd(), 'public', 'logo');
    
    // Icon klasörünün var olup olmadığını kontrol et
    if (!fs.existsSync(iconDir)) {
      return NextResponse.json({ error: 'Icon klasörü bulunamadı' }, { status: 404 });
    }

    // Eğer belirli bir icon isteniyorsa, o dosyayı döndür
    if (iconName) {
      const iconPath = path.join(iconDir, iconName);
      
      if (!fs.existsSync(iconPath)) {
        return NextResponse.json({ error: 'Icon bulunamadı' }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(iconPath);
      const ext = path.extname(iconName).toLowerCase();
      
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.webp') contentType = 'image/webp';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }

    // Icon listesi istenmişse, tüm icon dosyalarını listele
    const files = fs.readdirSync(iconDir);
    
    // Sadece resim dosyalarını filtrele
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    const iconFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    return NextResponse.json(iconFiles);
  } catch (error) {
    console.error('Icon işlemi sırasında hata:', error);
    return NextResponse.json({ error: 'Icon işlemi başarısız' }, { status: 500 });
  }
}