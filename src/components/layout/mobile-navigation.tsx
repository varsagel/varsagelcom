'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Home,
  Search,
  Plus,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'

interface MobileNavigationProps {
  notificationCount?: number
  messageCount?: number
}

export default function MobileNavigation({ 
  notificationCount = 0, 
  messageCount = 0 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Menü açık olduğunda body scroll'unu engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Route değiştiğinde menüyü kapat
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navigationItems = [
    {
      name: 'Ana Sayfa',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      name: 'İlan Ara',
      href: '/arama',
      icon: Search,
      active: pathname?.startsWith('/arama') || false
    },
    {
      name: 'İlan Ver',
      href: '/ilan-ver',
      icon: Plus,
      active: pathname === '/ilan-ver'
    }
  ]

  const userItems = session ? [
    {
      name: 'Mesajlar',
      href: '/mesajlar',
      icon: MessageCircle,
      active: pathname?.startsWith('/mesajlar') || false,
      badge: messageCount
    },
    {
      name: 'Bildirimler',
      href: '/bildirimler',
      icon: Bell,
      active: pathname?.startsWith('/bildirimler') || false,
      badge: notificationCount
    },
    {
      name: 'Profilim',
      href: '/profil',
      icon: User,
      active: pathname?.startsWith('/profil') || false
    },
    {
      name: 'Ayarlar',
      href: '/ayarlar',
      icon: Settings,
      active: pathname?.startsWith('/ayarlar') || false
    }
  ] : []

  const adminItems = session?.user?.isAdmin ? [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      active: pathname?.startsWith('/admin') || false
    }
  ] : []

  const handleSignOut = () => {
    router.push('/auth/signout')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
        aria-label="Menüyü aç/kapat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 mobile-only"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out mobile-only
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Menü</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {session && (
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {/* Ana navigasyon */}
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                        ${item.active 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {/* Kullanıcı menüsü */}
              {session && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <div className="space-y-1">
                    {userItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`
                            flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                            ${item.active 
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Admin menüsü */}
              {adminItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <div className="space-y-1">
                    {adminItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`
                            flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                            ${item.active 
                              ? 'bg-red-50 text-red-700 border-r-2 border-red-600' 
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            {session ? (
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Çıkış Yap
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Alternative mobile navigation) */}
      <div className="mobile-only fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 h-16">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 transition-colors duration-200
                  ${item.active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}