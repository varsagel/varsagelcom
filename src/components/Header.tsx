"use client";

import { Search, ShoppingCart, User, Menu, Heart, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAllCategories } from "@/data/categories";

const categories = getAllCategories();

export default function Header() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              <Link href="/">VarsaGel</Link>
            </motion.div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Ana Sayfa</Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1">
                <span>Kategoriler</span>
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.id}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.subcategories.length} alt kategori</div>
                        </div>
                      </Link>
                    ))}
                    {categories.length > 6 && (
                      <Link
                        href="/categories"
                        className="text-center p-2 text-blue-600 hover:text-blue-700 font-medium text-sm border-t border-gray-100 mt-2 pt-3"
                      >
                        Tüm Kategoriler →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Link href="/create-listing" className="text-gray-700 hover:text-blue-600 transition-colors">İlan Ver</Link>
            <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Nasıl Çalışır</Link>
            <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Yardım</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                 <span className="text-sm text-gray-700">
                   Hoş geldin, {user?.firstName}
                 </span>
                 <Link href="/profile">
                   <Button variant="ghost" size="sm">
                     <User className="h-4 w-4 mr-2" />
                     Profil
                   </Button>
                 </Link>
                 <Button variant="outline" onClick={logout}>
                   <LogOut className="h-4 w-4 mr-2" />
                   Çıkış Yap
                 </Button>
               </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="default">
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}