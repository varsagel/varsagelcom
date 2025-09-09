'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from '@/components/providers/SessionProvider'
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Bell, 
  Heart,
  LogOut,
  Settings,
  Package,
  MessageCircle
} from 'lucide-react'

export default function Header() {
  const { user, signOut } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center hover-scale">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">VarsaGel</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ürün, kategori veya marka ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-20 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-lg hover-scale transition-all text-sm font-medium"
                >
                  Ara
                </button>
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover-glow">
              Kategoriler
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover-glow">
              Nasıl Çalışır?
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover-glow">
              İletişim
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {user && (
              <Link href="/bildirimler" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors hover-scale">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-custom">
                  3
                </span>
              </Link>
            )}

            {/* Favorites */}
            {user && (
              <Link href="/favorites" className="p-2 text-gray-600 hover:text-blue-600 transition-colors hover-scale">
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Messages */}
            {user && (
              <Link href="/mesajlar" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors hover-scale">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-custom">
                  2
                </span>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors hover-scale"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:block text-gray-700 font-medium">{user?.name}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 glass animate-fadeInDown">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link href="/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-5 h-5 mr-3" />
                      Profilim
                    </Link>
                    
                    <Link href="/my-listings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                      <Package className="w-5 h-5 mr-3" />
                      İlanlarım
                    </Link>
                    
                    <Link href="/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-5 h-5 mr-3" />
                      Ayarlar
                    </Link>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors hover-glow"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-primary text-white px-6 py-2 rounded-xl font-medium hover-scale transition-all glass"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all glass"
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 glass animate-slideInLeft">
          <div className="px-4 py-6 space-y-4">
            <Link href="/categories" className="block text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Kategoriler
            </Link>
            <Link href="/how-it-works" className="block text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Nasıl Çalışır?
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-blue-600 font-medium transition-colors">
              İletişim
            </Link>
            
            {!user && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center py-3 bg-gradient-primary text-white rounded-xl hover-scale transition-all"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}