"use client";

import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAllCategories } from "@/data/categories";

const categories = getAllCategories();

const recentRequests = [
  { title: "iPhone 15 Pro Max Aranıyor", location: "İstanbul", time: "2 saat önce", offers: 12 },
  { title: "MacBook Air M2 İhtiyacım Var", location: "Ankara", time: "4 saat önce", offers: 8 },
  { title: "PlayStation 5 Alınacak", location: "İzmir", time: "6 saat önce", offers: 15 },
];

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Aradığınız Ürünü
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Satıcılar Size Getirsin
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            İhtiyacınızı paylaşın, satıcılar size en iyi teklifleri sunun. 
            Alışverişin yeni yolu burada!
          </motion.p>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-16"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Ne arıyorsunuz? (örn: iPhone 15, MacBook Air...)"
                  className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
              <Link href="/create-listing">
                <Button size="lg" className="h-14 px-8 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  İlan Oluştur
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500">Popüler aramalar:</span>
              {["iPhone 15", "MacBook", "PlayStation 5", "AirPods", "Samsung TV"].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategoriler</h2>
            <p className="text-gray-600">Hangi kategoride ürün arıyorsunuz?</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/categories/${category.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{category.count} ilan</p>
                      <div className="space-y-1">
                        {category.subcategories.slice(0, 4).map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 transition-colors">
                            <span className="flex items-center space-x-1">
                              <span>{subcategory.icon}</span>
                              <span>{subcategory.name}</span>
                            </span>
                            <span className="text-gray-400">{subcategory.count || 0}</span>
                          </div>
                        ))}
                        {category.subcategories.length > 4 && (
                          <div className="text-xs text-blue-600 font-medium text-center pt-1">
                            +{category.subcategories.length - 4} daha fazla
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Requests */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Son İhtiyaç İlanları</h2>
            <p className="text-gray-600">Diğer alıcıların ne aradığını görün</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentRequests.map((request, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{request.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{request.location}</span>
                      <span>{request.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        {request.offers} teklif alındı
                      </span>
                      <Button variant="outline" size="sm">
                        Teklif Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">VarsaGel</h3>
              <p className="text-gray-400">
                Alışverişin yeni yolu. İhtiyacınızı paylaşın, 
                en iyi teklifleri alın.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Nasıl Çalışır</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İlan Ver</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kategoriler</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Güvenlik</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VarsaGel. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
