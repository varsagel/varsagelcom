"use client";

import { User, Menu, Heart, Bell, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

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
            <Link href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">İlanlar</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
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