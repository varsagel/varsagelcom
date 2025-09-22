#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 VarsaGel E-Commerce Platform - Hızlı Kurulum');
console.log('================================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 .env dosyası oluşturuluyor...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env dosyası .env.example\'dan kopyalandı');
    console.log('⚠️  UYARI: .env dosyasındaki değerleri düzenlemeyi unutmayın!\n');
  } else {
    // Create basic .env file
    const envContent = `# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-secure-random-string-${Math.random().toString(36).substring(2)}"

# Development Environment
NODE_ENV="development"
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Temel .env dosyası oluşturuldu\n');
  }
} else {
  console.log('✅ .env dosyası zaten mevcut\n');
}

try {
  console.log('📦 Bağımlılıklar yükleniyor...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Bağımlılıklar başarıyla yüklendi\n');

  console.log('🗄️ Veritabanı kuruluyor...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client oluşturuldu');
  
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Veritabanı migrasyonları tamamlandı\n');

  console.log('🎉 Kurulum tamamlandı!');
  console.log('');
  console.log('Projeyi başlatmak için:');
  console.log('  npm run dev');
  console.log('');
  console.log('Tarayıcınızda şu adresi açın:');
  console.log('  http://localhost:3000');
  console.log('');
  console.log('📚 Daha fazla bilgi için SETUP.md dosyasını okuyun.');

} catch (error) {
  console.error('❌ Kurulum sırasında hata oluştu:', error.message);
  console.log('\n📚 Manuel kurulum için SETUP.md dosyasını kontrol edin.');
  process.exit(1);
}