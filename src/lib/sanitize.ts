/**
 * Input sanitization utilities for XSS protection
 */

// HTML karakterlerini escape et
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'\/]/g, (s) => map[s]);
}

// SQL injection karakterlerini temizle
export function sanitizeForDb(text: string): string {
  if (typeof text !== 'string') return '';
  
  // Tehlikeli karakterleri kaldır
  return text
    .replace(/[\x00\x08\x09\x1a\n\r"'\\%]/g, '')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .trim();
}

// URL'leri validate et
export function validateUrl(url: string): boolean {
  if (!url) return true; // Boş URL kabul edilebilir
  
  try {
    const urlObj = new URL(url);
    // Sadece http ve https protokollerine izin ver
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Email formatını validate et
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Telefon numarasını validate et
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

// Genel input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return escapeHtml(sanitizeForDb(input));
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Dosya uzantısını validate et
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  if (!filename) return false;
  
  const extension = filename.toLowerCase().split('.').pop();
  return extension ? allowedExtensions.includes(extension) : false;
}

// Dosya boyutunu validate et (bytes)
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}