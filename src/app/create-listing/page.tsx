'use client';

import { useState, useEffect } from 'react';
import { categoriesData, Category, SubCategory } from '@/data/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, MapPin, DollarSign, Tag, Image as ImageIcon } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface CategoryFormConfig {
  [key: string]: FormField[];
}

// Her kategori için özel form alanları
const categoryFormConfigs: CategoryFormConfig = {
  electronics: [
    { id: 'brand', label: 'Marka', type: 'text', required: true, placeholder: 'Örn: Apple, Samsung, Sony' },
    { id: 'model', label: 'Model', type: 'text', required: true, placeholder: 'Ürün modeli' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'warranty', label: 'Garanti Durumu', type: 'select', options: ['Var', 'Yok', 'Süresi Dolmuş'] },
    { id: 'color', label: 'Renk', type: 'text', placeholder: 'Ürün rengi' },
    { id: 'storage', label: 'Depolama Kapasitesi', type: 'text', placeholder: 'Örn: 128GB, 256GB' }
  ],
  automotive: [
    { id: 'brand', label: 'Marka', type: 'text', required: true, placeholder: 'Örn: BMW, Mercedes, Toyota' },
    { id: 'model', label: 'Model', type: 'text', required: true, placeholder: 'Araç modeli' },
    { id: 'year', label: 'Model Yılı', type: 'number', required: true, placeholder: '2020' },
    { id: 'mileage', label: 'Kilometre', type: 'number', required: true, placeholder: 'Araç kilometresi' },
    { id: 'fuel_type', label: 'Yakıt Türü', type: 'select', required: true, options: ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'] },
    { id: 'transmission', label: 'Vites Türü', type: 'select', required: true, options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
    { id: 'engine_size', label: 'Motor Hacmi', type: 'text', placeholder: 'Örn: 1.6, 2.0' },
    { id: 'color', label: 'Renk', type: 'text', placeholder: 'Araç rengi' },
    { id: 'damage_status', label: 'Hasar Durumu', type: 'select', options: ['Hasarsız', 'Boyalı', 'Değişen', 'Hasarlı'] }
  ],
  'home-living': [
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Örn: Ahşap, Metal, Plastik' },
    { id: 'dimensions', label: 'Boyutlar', type: 'text', placeholder: 'Genişlik x Yükseklik x Derinlik' },
    { id: 'color', label: 'Renk', type: 'text', placeholder: 'Ürün rengi' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'room_type', label: 'Oda Türü', type: 'select', options: ['Yatak Odası', 'Oturma Odası', 'Mutfak', 'Banyo', 'Çocuk Odası', 'Ofis'] },
    { id: 'style', label: 'Stil', type: 'text', placeholder: 'Örn: Modern, Klasik, Vintage' }
  ],
  'fashion-clothing': [
    { id: 'brand', label: 'Marka', type: 'text', placeholder: 'Giyim markası' },
    { id: 'size', label: 'Beden', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
    { id: 'color', label: 'Renk', type: 'text', required: true, placeholder: 'Ürün rengi' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'material', label: 'Kumaş/Malzeme', type: 'text', placeholder: 'Örn: Pamuk, Polyester, Deri' },
    { id: 'season', label: 'Mevsim', type: 'select', options: ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış', 'Dört Mevsim'] },
    { id: 'gender', label: 'Cinsiyet', type: 'select', options: ['Kadın', 'Erkek', 'Çocuk', 'Bebek', 'Unisex'] }
  ],
  'sports-outdoor': [
    { id: 'brand', label: 'Marka', type: 'text', placeholder: 'Spor markası' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'size', label: 'Beden/Boyut', type: 'text', placeholder: 'Ürün bedeni veya boyutu' },
    { id: 'sport_type', label: 'Spor Türü', type: 'text', placeholder: 'Hangi spor için kullanılıyor' },
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Ürün malzemesi' },
    { id: 'weight', label: 'Ağırlık', type: 'text', placeholder: 'Ürün ağırlığı' }
  ],
  'books-hobbies': [
    { id: 'author', label: 'Yazar/Marka', type: 'text', placeholder: 'Kitap yazarı veya ürün markası' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'language', label: 'Dil', type: 'select', options: ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'Diğer'] },
    { id: 'publication_year', label: 'Yayın Yılı', type: 'number', placeholder: 'Kitap yayın yılı' },
    { id: 'isbn', label: 'ISBN', type: 'text', placeholder: 'Kitap ISBN numarası' },
    { id: 'pages', label: 'Sayfa Sayısı', type: 'number', placeholder: 'Kitap sayfa sayısı' }
  ],
  'music-art': [
    { id: 'brand', label: 'Marka', type: 'text', placeholder: 'Enstrüman veya ekipman markası' },
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'instrument_type', label: 'Enstrüman Türü', type: 'text', placeholder: 'Örn: Akustik Gitar, Elektro Gitar' },
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Enstrüman malzemesi' },
    { id: 'accessories', label: 'Aksesuarlar', type: 'textarea', placeholder: 'Dahil olan aksesuarları listeleyin' },
    { id: 'case_included', label: 'Kılıf Dahil mi?', type: 'select', options: ['Evet', 'Hayır'] }
  ],
  other: [
    { id: 'condition', label: 'Durum', type: 'select', required: true, options: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü'] },
    { id: 'material', label: 'Malzeme', type: 'text', placeholder: 'Ürün malzemesi' },
    { id: 'dimensions', label: 'Boyutlar', type: 'text', placeholder: 'Ürün boyutları' },
    { id: 'weight', label: 'Ağırlık', type: 'text', placeholder: 'Ürün ağırlığı' },
    { id: 'usage_area', label: 'Kullanım Alanı', type: 'text', placeholder: 'Nerelerde kullanılabilir' }
  ]
};

export default function CreateListingPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [formData, setFormData] = useState<{[key: string]: any}>({});
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form verilerini sıfırla
  const resetForm = () => {
    setFormData({});
    setImages([]);
  };

  // Kategori değiştiğinde form verilerini sıfırla
  useEffect(() => {
    resetForm();
    setSelectedSubCategory(null);
  }, [selectedCategory]);

  // Alt kategori değiştiğinde sadece kategori özel alanları sıfırla
  useEffect(() => {
    if (selectedCategory) {
      const categoryFields = categoryFormConfigs[selectedCategory.id] || [];
      const newFormData = { ...formData };
      categoryFields.forEach(field => {
        delete newFormData[field.id];
      });
      setFormData(newFormData);
    }
  }, [selectedSubCategory]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 10)); // Maksimum 10 fotoğraf
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form verilerini hazırla
      const formDataToSend = new FormData();
      
      // Temel bilgileri ekle
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', formData.price || '0');
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('categoryId', selectedCategory?.id || '');
      formDataToSend.append('subCategoryId', selectedSubCategory?.id || '');
      
      // Kategori özel verilerini ekle
      const categorySpecificData: {[key: string]: any} = {};
      if (selectedCategory) {
        const categoryFields = categoryFormConfigs[selectedCategory.id] || [];
        categoryFields.forEach(field => {
          if (formData[field.id]) {
            categorySpecificData[field.id] = formData[field.id];
          }
        });
      }
      formDataToSend.append('categorySpecificData', JSON.stringify(categorySpecificData));
      
      // Fotoğrafları ekle
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      // API'ye gönder
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('İlan başarıyla oluşturuldu!');
        resetForm();
        setSelectedCategory(null);
        setSelectedSubCategory(null);
      } else {
        throw new Error(result.message || 'İlan oluşturulamadı');
      }
      
    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      alert('İlan oluşturulurken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger>
                <SelectValue placeholder={`${field.label} seçin`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
      
      default: // text
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">İlan Oluştur</h1>
          <p className="text-gray-600">Ürününüzü satmak için detaylı bilgileri girin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kategori Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ana Kategori *</Label>
                <Select 
                  value={selectedCategory?.id || ''} 
                  onValueChange={(value) => {
                    const category = categoriesData.find(c => c.id === value);
                    setSelectedCategory(category || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <Badge variant="secondary">{category.count}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label>Alt Kategori *</Label>
                  <Select 
                    value={selectedSubCategory?.id || ''} 
                    onValueChange={(value) => {
                      const subCategory = selectedCategory.subcategories.find(s => s.id === value);
                      setSelectedSubCategory(subCategory || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alt kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map(subCategory => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          <div className="flex items-center gap-2">
                            <span>{subCategory.icon}</span>
                            <span>{subCategory.name}</span>
                            {subCategory.count && <Badge variant="outline">{subCategory.count}</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">İlan Başlığı *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ürününüzü kısa ve açıklayıcı şekilde tanımlayın"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ürününüz hakkında detaylı bilgi verin"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Fiyat (TL) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Konum *
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Şehir, İlçe"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kategori Özel Alanlar */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Ürün Detayları</CardTitle>
                <p className="text-sm text-gray-600">
                  {selectedCategory.name} kategorisi için özel bilgiler
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(categoryFormConfigs[selectedCategory.id] || []).map(renderFormField)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fotoğraf Yükleme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Fotoğraflar
              </CardTitle>
              <p className="text-sm text-gray-600">
                En fazla 10 fotoğraf yükleyebilirsiniz. İlk fotoğraf kapak fotoğrafı olacaktır.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Fotoğraf Yükle</p>
                    <p className="text-sm text-gray-600">PNG, JPG, JPEG formatlarında dosya seçin</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Yüklenen fotoğraf ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Kapak</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }}
            >
              Temizle
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedCategory || !selectedSubCategory || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'İlan Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}