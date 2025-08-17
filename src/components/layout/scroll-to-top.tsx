'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Sayfa değiştiğinde en üste çık
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    // Sayfa yüklendiğinde en üste çık
    const handleLoad = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    // DOMContentLoaded event'i için
    const handleDOMContentLoaded = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    // Sayfa yenilendiğinde scroll pozisyonunu sıfırla
    const handleBeforeUnload = () => {
      // Scroll pozisyonunu sessionStorage'dan temizle
      sessionStorage.removeItem('scrollPosition');
      window.history.scrollRestoration = 'manual';
    };

    // Event listener'ları ekle
    window.addEventListener('load', handleLoad);
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Scroll restoration'ı manuel yap
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    // Component mount olduğunda da en üste çık
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    return () => {
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}