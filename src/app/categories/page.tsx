"use client";

import { Search, Grid, List, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAllCategories } from "@/data/categories";
import { useState } from "react";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const categories = getAllCategories();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VarsaGel
              </Link>
              <div className="text-gray-400">/</div>
              <h1 className="text-xl font-bold text-gray-900">Tüm Kategoriler</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Kategorilerde ara..."
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
        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-gray-600">Ana Kategori</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((total, cat) => total + cat.subcategories.length, 0)}
              </div>
              <div className="text-gray-600">Alt Kategori</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-purple-600">
                {categories.reduce((total, cat) => total + (parseInt(cat.count) || 0), 0)}
              </div>
              <div className="text-gray-600">Toplam İlan</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `"${searchTerm}" için sonuçlar` : "Tüm Kategoriler"}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{filteredCategories.length} kategori</span>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sırala
              </Button>
            </div>
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                  viewMode === "list" ? "flex items-center" : ""
                }`}>
                  <Link href={`/categories/${category.id}`}>
                    <CardContent className={`p-6 ${
                      viewMode === "list" ? "flex items-center space-x-6 w-full" : ""
                    }`}>
                      <div className={`group-hover:scale-110 transition-transform ${
                        viewMode === "list" ? "text-3xl" : "text-4xl mb-4 text-center"
                      }`}>
                        {category.icon}
                      </div>
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <h3 className={`font-semibold text-gray-900 mb-3 ${
                          viewMode === "list" ? "text-xl" : "text-center"
                        }`}>
                          {category.name}
                        </h3>
                        <div className={`space-y-2 ${
                          viewMode === "list" ? "" : "text-center"
                        }`}>
                          <p className="text-sm text-gray-600">
                            {category.subcategories.length} alt kategori • {category.count || 0} ilan
                          </p>
                          {viewMode === "grid" && (
                            <div className="space-y-1">
                              {category.subcategories.slice(0, 3).map((subcategory) => (
                                <div key={subcategory.id} className="flex items-center justify-between text-xs text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <span>{subcategory.icon}</span>
                                    <span>{subcategory.name}</span>
                                  </span>
                                  <span className="text-gray-400">{subcategory.count || 0}</span>
                                </div>
                              ))}
                              {category.subcategories.length > 3 && (
                                <div className="text-xs text-blue-600 font-medium text-center pt-1">
                                  +{category.subcategories.length - 3} daha fazla
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              "{searchTerm}" için kategori bulunamadı. Farklı bir arama terimi deneyin.
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aramayı Temizle
            </Button>
          </div>
        )}

        {/* Popular Categories */}
        {!searchTerm && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Popüler Kategoriler</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories
                .sort((a, b) => (parseInt(b.count) || 0) - (parseInt(a.count) || 0))
                .slice(0, 6)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.count || 0} ilan</div>
                  </Link>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}