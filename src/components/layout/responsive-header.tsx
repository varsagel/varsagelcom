'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  MessageCircle,
  User,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import MobileNavigation from './mobile-navigation'

interface ResponsiveHeaderProps {
  notificationCount?: number
  messageCount?: number
}

export default function ResponsiveHeader({ 
  notificationCount = 0, 
  messageCount = 0 
}: ResponsiveHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session } = useSession()
  const router = useRouter()

  // Dışarı tıklandığında menüleri kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
      if (!target.closest('.search-container')) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleSignOut = () => {
    router.push('/auth/signout')
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-only sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Mobile Menu Button */}
          <MobileNavigation 
            notificationCount={notificationCount}
            messageCount={messageCount}
          />
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VarsaGel</span>
          </Link>
          
          {/* Mobile Actions */}
          <div className="flex items-center space-x-2">
            {session ? (
              <Link href="/profil" className="p-2">
                <User className="w-6 h-6 text-gray-600" />
              </Link>
            ) : (
              <Link href="/auth/signin" className="text-sm font-medium text-blue-600">
                Giriş
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Desktop/Tablet Header */}
      <header className="desktop-only sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VarsaGel</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/" 
                className="nav-link"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/arama" 
                className="nav-link"
              >
                İlan Ara
              </Link>
              <Link 
                href="/kategoriler" 
                className="nav-link"
              >
                Kategoriler
              </Link>
              <Link 
                href="/hakkimizda" 
                className="nav-link"
              >
                Hakkımızda
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="search-container hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İlan ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* İlan Ver Button */}
              <Link
                href="/ilan-ver"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">İlan Ver</span>
              </Link>

              {session ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/bildirimler"
                    className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </Link>

                  {/* Messages */}
                  <Link
                    href="/mesajlar"
                    className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {messageCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {messageCount > 99 ? '99+' : messageCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="user-menu-container relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden lg:inline font-medium">
                        {session.user?.name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="font-medium text-gray-900">{session.user?.name}</p>
                          <p className="text-sm text-gray-500">{session.user?.email}</p>
                        </div>
                        
                        <Link
                          href="/profil"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profilim
                        </Link>
                        
                        <Link
                          href="/ayarlar"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Ayarlar
                        </Link>
                        
                        {session.user?.isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="w-4 h-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        
                        <div className="border-t border-gray-200 my-2" />
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Çıkış Yap
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="btn-primary"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden border-t border-gray-200 p-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İlan ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Header Spacer */}
      <div className="mobile-only h-16" />
    </>
  )
}