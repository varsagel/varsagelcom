"use client";

import { useParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Filter, SortAsc, Grid, List, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById, getSubCategoryById } from "@/data/categories";
import { useState } from "react";

// Mock data for listings
const mockListings = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB",
    price: "45,000",
    location: "İstanbul, Kadıköy",
    time: "2 saat önce",
    image: "📱",
    type: "sale",
    urgent: false
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra Aranıyor",
    price: "Fiyat Teklifi Bekleniyor",
    location: "Ankara, Çankaya",
    time: "4 saat önce",
    image: "📱",
    type: "request",
    urgent: true
  },
  {
    id: 3,
    title: "iPhone 14 Pro 128GB Temiz",
    price: "38,000",
    location: "İzmir, Bornova",
    time: "1 gün önce",
    image: "📱",
    type: "sale",
    urgent: false
  },
  {
    id: 4,
    title: "Xiaomi 13 Pro İhtiyacım Var",
    price: "Pazarlık Yapılır",
    location: "Bursa, Nilüfer",
    time: "2 gün önce",
    image: "📱",
    type: "request",
    urgent: false
  }
];

export default function SubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "sale" | "request">("all");

  const category = getCategoryById(categoryId);
  const subcategory = getSubCategoryById(categoryId, subcategoryId);

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız kategori veya alt kategori mevcut değil.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || listing.type === filterType;
    return matchesSearch && matchesFilter;
  });

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
                <div className="text-2xl">{subcategory.icon || "📦"}</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{subcategory.name}</h1>
                  <p className="text-sm text-gray-500">{subcategory.count || "0"} ilan</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="İlanlarda ara..."
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
          <Link href={`/categories/${categoryId}`} className="hover:text-gray-700">{category.name}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{subcategory.name}</span>
        </nav>

        {/* Category Info & Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{subcategory.icon || "📦"}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{subcategory.name}</h2>
                <p className="text-gray-600">{category.name} kategorisinde • {subcategory.count || "0"} ilan</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favorilere Ekle
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                İlan Ver
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filtrele:</span>
              <div className="flex space-x-1">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  Tümü
                </Button>
                <Button
                  variant={filterType === "sale" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("sale")}
                >
                  Satış
                </Button>
                <Button
                  variant={filterType === "request" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("request")}
                >
                  İhtiyaç
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Daha Fazla Filtre
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{filteredListings.length} sonuç</span>
            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-2" />
              Sırala
            </Button>
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                  viewMode === "list" ? "flex items-center" : ""
                }`}>
                  <CardContent className={`p-6 ${
                    viewMode === "list" ? "flex items-center space-x-4 w-full" : ""
                  }`}>
                    <div className={`group-hover:scale-110 transition-transform ${
                      viewMode === "list" ? "text-3xl" : "text-4xl mb-4 text-center"
                    }`}>
                      {listing.image}
                    </div>
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant={listing.type === "sale" ? "default" : "secondary"}
                          className={listing.type === "sale" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                        >
                          {listing.type === "sale" ? "Satış" : "İhtiyaç"}
                        </Badge>
                        {listing.urgent && (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Acil
                          </Badge>
                        )}
                      </div>
                      <h3 className={`font-semibold text-gray-900 mb-2 ${
                        viewMode === "list" ? "text-lg" : ""
                      }`}>
                        {listing.title}
                      </h3>
                      <p className={`font-bold text-blue-600 mb-2 ${
                        viewMode === "list" ? "text-lg" : ""
                      }`}>
                        {listing.price === "Fiyat Teklifi Bekleniyor" || listing.price === "Pazarlık Yapılır" 
                          ? listing.price 
                          : `₺${listing.price}`
                        }
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{listing.location}</span>
                        <span>{listing.time}</span>
                      </div>
                    </div>
                    {viewMode === "list" && (
                      <div className="text-gray-400">
                        <ArrowLeft className="h-5 w-5 rotate-180" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz İlan Yok</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `"${searchTerm}" için sonuç bulunamadı.` : "Bu kategoride henüz ilan bulunmuyor."}
            </p>
            <div className="flex items-center justify-center space-x-4">
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                >
                  Aramayı Temizle
                </Button>
              )}
              <Button className="bg-blue-600 hover:bg-blue-700">
                İlk İlanı Sen Ver
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Kategoride</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">İhtiyaç İlanı Ver</div>
                <div className="text-sm text-gray-500">{subcategory.name} aradığınızı belirtin</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Satış İlanı Ver</div>
                <div className="text-sm text-gray-500">{subcategory.name} satışa çıkarın</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Bildirim Kur</div>
                <div className="text-sm text-gray-500">Yeni ilanlardan haberdar olun</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}