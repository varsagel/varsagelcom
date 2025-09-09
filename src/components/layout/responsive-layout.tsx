'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ResponsiveHeader from './responsive-header'
import { useSocket } from '@/contexts/socket-context'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  containerClass?: string
}

export default function ResponsiveLayout({
  children,
  className = '',
  showHeader = true,
  showFooter = true,
  containerClass = 'container-responsive'
}: ResponsiveLayoutProps) {
  const { data: session } = useSession()
  const { notifications } = useSocket()
  const [notificationCount, setNotificationCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  // Bildirim ve mesaj sayılarını güncelle
  useEffect(() => {
    if (notifications) {
      const unreadCount = notifications.length
      setNotificationCount(unreadCount)
    }
  }, [notifications])

  useEffect(() => {
    // Message count will be handled by the messaging component
    setMessageCount(0)
  }, [session?.user?.id])

  return (
    <div className="flex flex-col">
      {/* Header */}
      {showHeader && (
        <ResponsiveHeader 
          notificationCount={notificationCount}
          messageCount={messageCount}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <ResponsiveFooter />}

      {/* Mobile Bottom Padding */}
      <div className="mobile-only h-16" />
    </div>
  )
}

// Footer bileşeni
function ResponsiveFooter() {
  return (
    <footer className="desktop-only bg-white border-t border-gray-200 mt-auto">
      <div className="container-responsive py-responsive">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VarsaGel</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Türkiye'nin en güvenilir alım-satım platformu. 
              Güvenli ödeme sistemi ve kaliteli hizmet anlayışı ile 
              binlerce kullanıcıya hizmet veriyoruz.
            </p>
            <div className="mt-4 flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Hızlı Linkler
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="/arama" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  İlan Ara
                </a>
              </li>
              <li>
                <a href="/ilan-ver" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  İlan Ver
                </a>
              </li>
              <li>
                <a href="/kategoriler" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Kategoriler
                </a>
              </li>
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Destek
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/yardim" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Yardım Merkezi
                </a>
              </li>
              <li>
                <a href="/iletisim" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  İletişim
                </a>
              </li>
              <li>
                <a href="/gizlilik" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="/kullanim-kosullari" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Kullanım Koşulları
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} VarsaGel. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-6">
              <a href="/gizlilik" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
                Gizlilik
              </a>
              <a href="/kullanim-kosullari" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
                Koşullar
              </a>
              <a href="/cerezler" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
                Çerezler
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}