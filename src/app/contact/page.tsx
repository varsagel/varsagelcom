'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: "E-posta",
      content: "info@varsagel.com",
      description: "7/24 e-posta desteği"
    },
    {
      icon: <Phone className="h-6 w-6 text-green-600" />,
      title: "Telefon",
      content: "+90 (212) 555-0123",
      description: "Hafta içi 09:00 - 18:00"
    },
    {
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      title: "Adres",
      content: "Maslak Mahallesi, Teknoloji Caddesi No:1",
      description: "Sarıyer, İstanbul"
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      title: "Çalışma Saatleri",
      content: "Pazartesi - Cuma: 09:00 - 18:00",
      description: "Hafta sonu: 10:00 - 16:00"
    }
  ];

  const faqItems = [
    {
      question: "Nasıl hizmet verebilirim?",
      answer: "Kayıt olduktan sonra profilinizi tamamlayın ve hizmet verdiğiniz kategorileri seçin. Onay sürecinden sonra hizmet vermeye başlayabilirsiniz."
    },
    {
      question: "Ödeme nasıl yapılır?",
      answer: "Güvenli ödeme sistemimiz ile kredi kartı, banka kartı veya havale ile ödeme yapabilirsiniz. Tüm ödemeler SSL ile korunmaktadır."
    },
    {
      question: "Sorun yaşadığımda ne yapmalıyım?",
      answer: "7/24 müşteri hizmetlerimiz ile iletişime geçebilir, canlı destek hattımızı kullanabilir veya e-posta gönderebilirsiniz."
    },
    {
      question: "Hizmet kalitesi nasıl garanti edilir?",
      answer: "Tüm hizmet sağlayıcılarımız doğrulanmış kullanıcılardır. Ayrıca değerlendirme sistemi ile kaliteyi sürekli takip ediyoruz."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            İletişim
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin. 
            Size yardımcı olmaktan mutluluk duyarız.
          </p>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Bize Yazın</CardTitle>
                  <CardDescription>
                    Mesajınızı gönderin, en kısa sürede size dönüş yapalım.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Ad Soyad</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Adınızı ve soyadınızı girin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="E-posta adresinizi girin"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Konu</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Mesajınızın konusunu girin"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Mesaj</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Mesajınızı detaylı olarak yazın..."
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Mesajı Gönder
                        </>
                      )}
                    </Button>
                    
                    {submitStatus === 'success' && (
                      <div className="text-green-600 text-center">
                        Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
                      </div>
                    )}
                    
                    {submitStatus === 'error' && (
                      <div className="text-red-600 text-center">
                        Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  İletişim Bilgileri
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {info.title}
                            </h3>
                            <p className="text-gray-700 mb-1">
                              {info.content}
                            </p>
                            <p className="text-sm text-gray-500">
                              {info.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Sık Sorulan Sorular
                </h2>
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Ofisimizi Ziyaret Edin
          </h2>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Harita Yakında Eklenecek</p>
              <p>Maslak Mahallesi, Teknoloji Caddesi No:1</p>
              <p>Sarıyer, İstanbul</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}