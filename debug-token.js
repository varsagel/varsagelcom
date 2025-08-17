const jwt = require('jsonwebtoken');

// Token'ı decode et
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMjMyYzhkMS04NjZiLTQ0MGItYmE3OC0xMzNhMzllNzBiZWMiLCJlbWFpbCI6ImFsaS5tZXJtaTA1NUBnbWFpbC5jb20iLCJpYXQiOjE3NTM3ODM0NTIsImV4cCI6MTc1NDM4ODI1Mn0.O3NVg5PgdL3RNBJ4Chtfh_7-d8nJTfZdZwTmuA_TD0I';
const secret = 'your-super-secure-jwt-secret-key-here-change-this-in-production';

console.log('Token decode edilmeye çalışılıyor...');

try {
  // Token'ı decode et (doğrulama olmadan)
  const decoded = jwt.decode(token);
  console.log('Decoded token (doğrulama olmadan):', decoded);
  
  // Şu anki zaman
  const now = Math.floor(Date.now() / 1000);
  console.log('Şu anki zaman (unix):', now);
  console.log('Token exp zamanı:', decoded.exp);
  console.log('Token süresi dolmuş mu?', now > decoded.exp);
  
  // Token'ı doğrula
  const verified = jwt.verify(token, secret);
  console.log('Token doğrulandı:', verified);
} catch (error) {
  console.error('Token doğrulama hatası:', error.message);
}