'use client'

import Link from 'next/link'
import { 
  ShoppingBag, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart,
  Shield,
  Zap,
  Users
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-gradient">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6 animate-fadeInUp">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center hover-scale">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient-primary">VarsaGel</span>
            </Link>
            
            <p className="text-gray-300 leading-relaxed text-shadow">
              Türkiye'nin en güvenilir alım-satım platformu. Binlerce ürün arasından en uygun fiyatları bulun.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover-scale glass">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover-scale glass">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover-scale glass">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover-scale glass">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-bold text-gradient-primary">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:animate-pulse-custom"></span>
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 group-hover:animate-pulse-custom"></span>
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:animate-pulse-custom"></span>
                  Güvenlik
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 group-hover:animate-pulse-custom"></span>
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 group-hover:animate-pulse-custom"></span>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xl font-bold text-gradient-primary">Yasal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <Shield className="w-4 h-4 mr-3 group-hover:text-blue-400" />
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <Shield className="w-4 h-4 mr-3 group-hover:text-green-400" />
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <Shield className="w-4 h-4 mr-3 group-hover:text-purple-400" />
                  Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="text-gray-300 hover:text-white transition-colors hover-glow flex items-center group">
                  <Shield className="w-4 h-4 mr-3 group-hover:text-yellow-400" />
                  KVKK
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <h3 className="text-xl font-bold text-gradient-primary">İletişim</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">E-posta</p>
                  <p className="hover-glow cursor-pointer">info@varsagel.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Telefon</p>
                  <p className="hover-glow cursor-pointer">0850 123 45 67</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Adres</p>
                  <p className="hover-glow">İstanbul, Türkiye</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2 hover-lift animate-scaleIn">
              <div className="text-3xl font-bold text-gradient-primary animate-pulse-custom">50K+</div>
              <div className="text-gray-400 text-sm flex items-center justify-center">
                <Users className="w-4 h-4 mr-2" />
                Mutlu Kullanıcı
              </div>
            </div>
            
            <div className="space-y-2 hover-lift animate-scaleIn" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl font-bold text-gradient-success animate-pulse-custom">100K+</div>
              <div className="text-gray-400 text-sm flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ürün Çeşidi
              </div>
            </div>
            
            <div className="space-y-2 hover-lift animate-scaleIn" style={{animationDelay: '0.4s'}}>
              <div className="text-3xl font-bold text-gradient-warning animate-pulse-custom">24/7</div>
              <div className="text-gray-400 text-sm flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Destek
              </div>
            </div>
            
            <div className="space-y-2 hover-lift animate-scaleIn" style={{animationDelay: '0.6s'}}>
              <div className="text-3xl font-bold text-gradient-secondary animate-pulse-custom">%99</div>
              <div className="text-gray-400 text-sm flex items-center justify-center">
                <Heart className="w-4 h-4 mr-2" />
                Memnuniyet
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm text-center md:text-left">
            © 2024 VarsaGel. Tüm hakları saklıdır.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span className="flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500 animate-pulse-custom" /> in Turkey
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}