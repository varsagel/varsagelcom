"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon, Menu, X, Bell, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useNotificationStream } from "@/hooks/useNotificationStream";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, unreadCount: streamUnreadCount } = useNotificationStream();

  // Tema değişikliği için hydration tamamlandığında
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSE'den gelen unread count'u kullan
  useEffect(() => {
    if (isLoggedIn) {
      setUnreadCount(streamUnreadCount);
    } else {
      setUnreadCount(0);
    }
  }, [isLoggedIn, streamUnreadCount]);
  
  // Custom event listener for unread count updates
  useEffect(() => {
    const handleUnreadCountUpdate = (event: CustomEvent) => {
      setUnreadCount(event.detail);
    };
    
    window.addEventListener('unreadCountUpdate', handleUnreadCountUpdate as EventListener);
    
    return () => {
      window.removeEventListener('unreadCountUpdate', handleUnreadCountUpdate as EventListener);
    };
  }, []);

  // Mesaj okunmamış sayısını getir
  const fetchMessageUnreadCount = async () => {
    if (!isLoggedIn) {
      setMessageUnreadCount(0);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessageUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Mesaj okunmamış sayısı alınırken hata:', error);
    }
  };
  
  // Kullanıcı giriş durumunu kontrol et
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    
    // İlk yüklemede kontrol et
    checkAuthStatus();
    
    // Storage değişikliklerini dinle (farklı sekmeler arası)
    window.addEventListener('storage', checkAuthStatus);
    
    // Auth durumu değişikliklerini dinle (aynı sekme içi)
    window.addEventListener('authStatusChanged', checkAuthStatus);
    
    // Component unmount olduğunda event listener'ları temizle
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authStatusChanged', checkAuthStatus);
    };
  }, []);

  // Mesaj okunmamış sayısını kontrol et
  useEffect(() => {
    if (isLoggedIn) {
      fetchMessageUnreadCount();
    }
  }, [isLoggedIn]);

  // Mesaj okunmamış sayısını periyodik olarak kontrol et (daha az sıklıkta)
  useEffect(() => {
    if (isLoggedIn) {
      fetchMessageUnreadCount();
      
      // Her 2 dakikada bir kontrol et
      const interval = setInterval(fetchMessageUnreadCount, 120000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);
  
  // Mesaj okundu event'ini dinle
  useEffect(() => {
    const handleMessageRead = () => {
      fetchMessageUnreadCount();
    };
    
    window.addEventListener('messageRead', handleMessageRead);
    
    return () => {
      window.removeEventListener('messageRead', handleMessageRead);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      // API çağrısı yap
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // LocalStorage'dan token ve kullanıcı bilgilerini temizle
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Auth durumu değişikliği için custom event dispatch et
      window.dispatchEvent(new Event('authStatusChanged'));
      
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error('Çıkış yapılırken bir hata oluştu:', error);
    }
  };

  const navLinks = [
    { name: "Ana Sayfa", href: "/" },
    { name: "İlanlar", href: "/listings" },
    ...(isLoggedIn ? [
      { name: "Mesajlarım", href: "/messages", badge: messageUnreadCount },
      { name: "Bildirimler", href: "/notifications", badge: unreadCount }
    ] : []),
    { name: "Hakkımızda", href: "/about" },
    { name: "İletişim", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Varsagel</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-foreground" : "text-foreground/60"} relative`}
            >
              {link.name}
              {link.badge && link.badge > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                  {link.badge > 99 ? '99+' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* User Menu */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/notifications" className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User size={16} />
                  </div>
                </Link>
              </div>
              <div className="hidden md:block">
                <Link
                  href="/listings/create"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  İlan Ekle
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Kayıt Ol
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border py-4">
          <nav className="container flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-foreground" : "text-foreground/60"} relative flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
                {link.badge && link.badge > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link
                  href="/listings/create"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  İlan Ekle
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;