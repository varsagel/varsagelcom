"use client";

import { useParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "@/data/categories";
import { useState } from "react";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const category = getCategoryById(categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız kategori mevcut değil.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const filteredSubcategories = category.subcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Geri</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
                  <p className="text-sm text-gray-500">{category.subcategories.length} alt kategori</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Alt kategorilerde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">{category.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              <p className="text-gray-600">Toplam {category.count} ilan • {category.subcategories.length} alt kategori</p>
            </div>
          </div>
          <p className="text-gray-700">
            {category.name} kategorisinde aradığınız ürünleri bulabilir, ihtiyaç ilanı verebilir ve satış yapabilirsiniz.
            Alt kategorilerden size en uygun olanını seçerek daha spesifik aramalar yapabilirsiniz.
          </p>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-gray-600">
              <span className="font-medium">"{searchTerm}"</span> için {filteredSubcategories.length} sonuç bulundu
            </p>
          </div>
        )}

        {/* Subcategories Grid/List */}
        {filteredSubcategories.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {filteredSubcategories.map((subcategory, index) => (
              <motion.div
                key={subcategory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/categories/${categoryId}/${subcategory.id}`}>
                  <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    viewMode === "list" ? "flex items-center" : ""
                  }`}>
                    <CardContent className={`p-6 ${
                      viewMode === "list" ? "flex items-center space-x-4 w-full" : "text-center"
                    }`}>
                      <div className={`group-hover:scale-110 transition-transform ${
                        viewMode === "list" ? "text-2xl" : "text-3xl mb-3"
                      }`}>
                        {subcategory.icon || "📦"}
                      </div>
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <h3 className={`font-semibold text-gray-900 ${
                          viewMode === "list" ? "text-lg" : "mb-1"
                        }`}>
                          {subcategory.name}
                        </h3>
                        {subcategory.count && (
                          <p className={`text-gray-500 ${
                            viewMode === "list" ? "text-base" : "text-sm"
                          }`}>
                            {subcategory.count} ilan
                          </p>
                        )}
                      </div>
                      {viewMode === "list" && (
                        <div className="text-gray-400">
                          <ArrowLeft className="h-5 w-5 rotate-180" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `"${searchTerm}" için sonuç bulunamadı.` : "Bu kategoride alt kategori bulunmuyor."}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="mr-4"
              >
                Aramayı Temizle
              </Button>
            )}
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
              Ana Sayfaya Dön
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">İhtiyaç İlanı Ver</div>
                <div className="text-sm text-gray-500">Bu kategoride aradığınızı ilan edin</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Satış İlanı Ver</div>
                <div className="text-sm text-gray-500">Bu kategoride ürün satın</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Favori Kategoriler</div>
                <div className="text-sm text-gray-500">Bu kategoriyi favorilere ekle</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}