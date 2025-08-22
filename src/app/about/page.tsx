'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Güvenilir Topluluk",
      description: "Binlerce doğrulanmış kullanıcı ile güvenli bir platform"
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Hedef Odaklı",
      description: "İhtiyaçlarınıza uygun hizmet sağlayıcıları bulun"
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      title: "Kaliteli Hizmet",
      description: "Yüksek puanlı ve deneyimli profesyoneller"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Müşteri Memnuniyeti",
      description: "%95 müşteri memnuniyet oranı ile hizmet veriyoruz"
    }
  ];

  const stats = [
    { label: "Aktif Kullanıcı", value: "10,000+" },
    { label: "Tamamlanan Proje", value: "25,000+" },
    { label: "Hizmet Kategorisi", value: "50+" },
    { label: "Şehir", value: "81" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Türkiye'nin en büyük hizmet platformu olarak, ihtiyaçlarınızı karşılayacak 
            en uygun profesyonelleri bulmanızı sağlıyoruz.
          </p>
          <Badge variant="secondary" className="text-lg px-6 py-2">
            2020'den beri hizmetinizdeyiz
          </Badge>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Misyonumuz
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              VarsaGel, hizmet arayan kişiler ile hizmet veren profesyonelleri bir araya getiren 
              güvenilir bir platform olmayı hedefler. Amacımız, kaliteli hizmet alımını kolaylaştırmak 
              ve her iki taraf için de kazançlı bir deneyim sunmaktır.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Neden VarsaGel?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Rakamlarla VarsaGel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Ekibimiz
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Deneyimli teknoloji ve müşteri hizmetleri ekibimiz, platformumuzun güvenli, 
              kullanıcı dostu ve sürekli gelişen bir hizmet sunmasını sağlamak için 
              7/24 çalışmaktadır.
            </p>
            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Bizimle İletişime Geçin
              </h3>
              <p className="text-gray-600">
                Sorularınız, önerileriniz veya geri bildirimleriniz için 
                <a href="/contact" className="text-blue-600 hover:underline ml-1">
                  iletişim sayfamızı
                </a> ziyaret edebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}