'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import { Menu, X, Home, Search, User, ShoppingBag, Heart } from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ResponsiveNavigation({
  items,
  logo,
  actions,
  className,
}: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsive();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className={cn('fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200', className)}>
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMenu}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              {logo}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeMenu} />
        )}

        {/* Mobile Menu */}
        <nav
          className={cn(
            'fixed top-14 left-0 bottom-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="py-4">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center px-6 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  {item.icon && (
                    <span className="mr-3 text-xl">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="flex items-center justify-around py-2">
            {items.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 text-xs font-medium transition-colors',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  )}
                >
                  {item.icon && (
                    <span className={cn('mb-1', isActive ? 'text-blue-600' : 'text-gray-400')}>
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Spacer for fixed header */}
        <div className="h-14" />
        {/* Spacer for fixed bottom nav */}
        <div className="h-16" />
      </>
    );
  }

  // Desktop Navigation
  return (
    <header className={cn('bg-white border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            {logo}
            <nav className="hidden md:flex space-x-8">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium transition-colors relative',
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    )}
                  >
                    {item.icon && (
                      <span className="mr-2">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Default navigation items
export const defaultNavigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Ana Sayfa',
    icon: <Home size={20} />,
  },
  {
    href: '/search',
    label: 'Arama',
    icon: <Search size={20} />,
  },
  {
    href: '/favorites',
    label: 'Favoriler',
    icon: <Heart size={20} />,
  },
  {
    href: '/cart',
    label: 'Sepet',
    icon: <ShoppingBag size={20} />,
    badge: 0, // This would be dynamic
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: <User size={20} />,
  },
];

// Usage example component
export function AppNavigation() {
  return (
    <ResponsiveNavigation
      items={defaultNavigationItems}
      logo={
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VG</span>
          </div>
          <span className="font-bold text-xl text-gray-900">VarsaGel</span>
        </Link>
      }
      actions={
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 px-1 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full min-w-[16px] h-4 flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      }
    />
  );
}