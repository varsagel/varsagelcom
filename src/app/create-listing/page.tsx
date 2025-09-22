"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Upload, 
  MapPin, 
  DollarSign, 
  Tag, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Camera,
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Dumbbell,
  Star,
  Info,
  AlertCircle,
  Eye,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { categoriesData, type Category, type SubCategory, type DynamicFormField } from '@/data/categories';
import { carBrands } from '@/data/car-brands';
import { cities } from '@/data/cities';

interface FormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  district: string;
  images: File[];
  dynamicFields: { [key: string]: any };
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  minPrice?: string;
  maxPrice?: string;
  city?: string;
  district?: string;
  images?: string;
  dynamicFields?: { [key: string]: string };
}

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Authentication kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    district: '',
    images: [],
    dynamicFields: {}
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Kategori değiştiğinde alt kategoriyi ve dinamik alanları sıfırla
    if (field === 'category') {
      const category = categoriesData.find(cat => cat.id === value);
      setSelectedCategory(category || null);
      setSelectedSubcategory(null);
      setFormData(prev => ({ 
        ...prev, 
        subcategory: '',
        dynamicFields: {}
      }));
      setDynamicFieldsData({});
    }

    // Alt kategori değiştiğinde dinamik alanları sıfırla
    if (field === 'subcategory') {
      const subcategory = selectedCategory?.subcategories.find(sub => sub.id === value);
      setSelectedSubcategory(subcategory || null);
      setFormData(prev => ({ 
        ...prev,
        dynamicFields: {}
      }));
      setDynamicFieldsData({});
    }

    // Şehir değiştiğinde ilçeyi sıfırla
    if (field === 'city') {
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleDynamicFieldChange = (fieldId: string, value: any) => {
    setDynamicFieldsData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    setFormData(prev => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldId]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...formData.images, ...files].slice(0, 8); // Maksimum 8 resim
      
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));

      // Preview için URL'ler oluştur
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews].slice(0, 8));
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validasyon
    const finalErrors = validateStep(5);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // FormData oluştur
      const submitData = new FormData();
      
      // Temel bilgileri ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'dynamicFields') {
          submitData.append(key, value as string);
        }
      });

      // Dinamik alanları JSON olarak ekle
      submitData.append('dynamicFields', JSON.stringify(formData.dynamicFields));

      // Resimleri ekle
      formData.images.forEach((image, index) => {
        submitData.append(`image-${index}`, image);
      });

      const response = await fetch('/api/listings', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/listings/${result.id}`);
      } else {
        throw new Error('İlan oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step: number): FormErrors => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.category) {
          newErrors.category = 'Kategori seçimi zorunludur';
        }
        if (!formData.subcategory) {
          newErrors.subcategory = 'Alt kategori seçimi zorunludur';
        }
        break;

      case 2:
        if (!formData.title || formData.title.trim().length < 10) {
          newErrors.title = 'Başlık en az 10 karakter olmalıdır';
        }
        if (!formData.description || formData.description.trim().length < 20) {
          newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
        }
        break;

      case 3:
        if (selectedSubcategory?.dynamicFields) {
          const dynamicErrors: { [key: string]: string } = {};
          selectedSubcategory.dynamicFields.forEach(field => {
            const value = dynamicFieldsData[field.id];
            if (field.required && (!value || value === '')) {
              dynamicErrors[field.id] = `${field.label || field.name} alanı zorunludur`;
            }
            if (field.type === 'number' && value) {
              const numValue = parseFloat(value);
              if (field.min !== undefined && numValue < field.min) {
                dynamicErrors[field.id] = `Minimum değer: ${field.min}`;
              }
              if (field.max !== undefined && numValue > field.max) {
                dynamicErrors[field.id] = `Maksimum değer: ${field.max}`;
              }
            }
          });
          if (Object.keys(dynamicErrors).length > 0) {
            newErrors.dynamicFields = dynamicErrors;
          }
        }
        break;

      case 4:
        if (!formData.minPrice || parseFloat(formData.minPrice) <= 0) {
          newErrors.minPrice = 'Geçerli bir minimum fiyat giriniz';
        }
        if (!formData.maxPrice || parseFloat(formData.maxPrice) <= 0) {
          newErrors.maxPrice = 'Geçerli bir maksimum fiyat giriniz';
        }
        if (formData.minPrice && formData.maxPrice && parseFloat(formData.minPrice) > parseFloat(formData.maxPrice)) {
          newErrors.maxPrice = 'Maksimum fiyat minimum fiyattan büyük olmalıdır';
        }
        if (!formData.city) {
          newErrors.city = 'Şehir seçimi zorunludur';
        }
        if (!formData.district) {
          newErrors.district = 'İlçe seçimi zorunludur';
        }
        break;

      case 5:
        if (formData.images.length === 0) {
          newErrors.images = 'En az 1 resim yüklemeniz gerekiyor';
        }
        break;
    }

    return newErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length === 0;
  };

  const renderDynamicField = (field: DynamicFormField) => {
    const value = dynamicFieldsData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="h-12 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
          />
        );

      case 'number':
        return (
          <div className="relative">
            <Input
              type="number"
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              max={field.max}
              className="h-12 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
            />
            {field.unit && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors resize-none"
          />
        );

      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleDynamicFieldChange(field.id, val)}
          >
            <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
              <SelectValue placeholder={field.placeholder || `${field.label} seçiniz`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-base py-3">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup 
            value={value} 
            onValueChange={(val) => handleDynamicFieldChange(field.id, val)}
            className="grid grid-cols-2 gap-4"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="grid grid-cols-2 gap-4">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (checked) {
                      handleDynamicFieldChange(field.id, [...currentValues, option.value]);
                    } else {
                      handleDynamicFieldChange(field.id, currentValues.filter(v => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'car-selector':
        if (field.fieldType === 'brand') {
          return (
            <Select 
              value={value} 
              onValueChange={(val) => handleDynamicFieldChange(field.id, val)}
            >
              <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="Marka seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {carBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id} className="text-base py-3">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else if (field.fieldType === 'series' && field.dependsOn) {
          const selectedBrand = carBrands.find(brand => brand.id === dynamicFieldsData[field.dependsOn!]);
          return (
            <Select 
              value={value} 
              onValueChange={(val) => handleDynamicFieldChange(field.id, val)}
              disabled={!selectedBrand}
            >
              <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={selectedBrand ? "Seri seçiniz" : "Önce marka seçin"} />
              </SelectTrigger>
              <SelectContent>
                {selectedBrand?.series.map((series) => (
                  <SelectItem key={series.id} value={series.id} className="text-base py-3">
                    {series.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        break;

      default:
        return null;
    }
  };

  // Loading durumu
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa null döndür (useEffect redirect edecek)
  if (status === 'unauthenticated') {
    return null;
  }

  const stepTitles = [
    'Kategori Seçimi',
    'Temel Bilgiler',
    'Ürün Detayları',
    'Konum & Fiyat',
    'Resimler'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-6">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600 font-semibold">Yeni İlan Oluştur</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            İlanınızı Kolayca Oluşturun
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Gelişmiş form yapımız ile ilanınızı adım adım oluşturun ve binlerce kişiye ulaşın
          </p>
          
          {/* İstatistikler */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                <Eye className="h-5 w-5" />
                <span className="font-bold text-2xl">2.5M+</span>
              </div>
              <p className="text-gray-500 text-sm">Aylık Görüntülenme</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                <Users className="h-5 w-5" />
                <span className="font-bold text-2xl">150K+</span>
              </div>
              <p className="text-gray-500 text-sm">Aktif Kullanıcı</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold text-2xl">%95</span>
              </div>
              <p className="text-gray-500 text-sm">Satış Oranı</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-4 shadow-xl">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110' 
                    : currentStep === step - 1
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step
                  )}
                  {currentStep === step && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>
                {step < 5 && (
                  <div className={`w-8 h-1 mx-2 rounded-full transition-all duration-500 ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {stepTitles[currentStep - 1]}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Step 1: Kategori Seçimi */}
          {currentStep === 1 && (
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Tag className="h-7 w-7" />
                  Kategori Seçimi
                </CardTitle>
                <p className="text-blue-100 mt-2">İlanınızın kategorisini ve alt kategorisini seçin</p>
              </CardHeader>
              <CardContent className="p-8">
                {/* Ana Kategori */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold text-gray-700 mb-4 block">Ana Kategori</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {categoriesData.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => handleInputChange('category', category.id)}
                          className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                            formData.category === category.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-3">{category.icon}</div>
                            <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.count} ilan</p>
                          </div>
                          {formData.category === category.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alt Kategori */}
                  {selectedCategory && (
                    <div className="mt-8">
                      <Label className="text-lg font-semibold text-gray-700 mb-4 block">Alt Kategori</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedCategory.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            onClick={() => handleInputChange('subcategory', subcategory.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                              formData.subcategory === subcategory.id
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <div className="text-center">
                              {subcategory.icon && <div className="text-xl mb-2">{subcategory.icon}</div>}
                              <h4 className="font-medium text-gray-800 text-sm mb-1">{subcategory.name}</h4>
                              {subcategory.count && <p className="text-xs text-gray-500">{subcategory.count}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seçim Özeti */}
                  {selectedCategory && selectedSubcategory && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3 text-green-700 mb-2">
                        <CheckCircle className="h-6 w-6" />
                        <span className="font-semibold text-lg">Kategori Seçimi Tamamlandı</span>
                      </div>
                      <p className="text-green-600">
                        <span className="font-medium">{selectedCategory.name}</span> → <span className="font-medium">{selectedSubcategory.name}</span>
                      </p>
                      {selectedSubcategory.dynamicFields && selectedSubcategory.dynamicFields.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          Bu kategori için {selectedSubcategory.dynamicFields.length} özel alan bulunuyor.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Temel Bilgiler */}
          {currentStep === 2 && (
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Sparkles className="h-7 w-7" />
                  Temel Bilgiler
                </CardTitle>
                <p className="text-green-100 mt-2">İlanınızın başlığını ve açıklamasını yazın</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* İlan Başlığı */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    İlan Başlığı
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                     type="text"
                     value={formData.title}
                     onChange={(e) => handleInputChange('title', e.target.value)}
                     placeholder="Örn: Temiz kullanılmış iPhone 15 Pro Max 256GB"
                     required
                     className={`h-14 text-lg border-2 transition-colors ${
                       errors.title 
                         ? 'border-red-500 bg-red-50 focus:border-red-500' 
                         : 'border-gray-200 hover:border-green-300 focus:border-green-500'
                     }`}
                   />
                   {errors.title && (
                     <div className="flex items-center gap-2 text-red-600 text-sm">
                       <AlertCircle className="h-4 w-4" />
                       {errors.title}
                     </div>
                   )}
                   <p className="text-sm text-gray-500 flex items-center gap-2">
                     <Info className="h-4 w-4" />
                     Açıklayıcı ve dikkat çekici bir başlık yazın
                   </p>
                </div>

                {/* İlan Açıklaması */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    İlan Açıklaması
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="İlanınızın detaylı açıklamasını yazın. Ürünün durumu, özellikleri, kullanım süresi gibi önemli bilgileri ekleyin..."
                    required
                    rows={6}
                    className={`text-lg border-2 transition-colors resize-none ${
                      errors.description 
                        ? 'border-red-500 bg-red-50 focus:border-red-500' 
                        : 'border-gray-200 hover:border-green-300 focus:border-green-500'
                    }`}
                  />
                  {errors.description && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </div>
                  )}
                </div>

                {/* Kategori Bilgisi */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 text-blue-700 mb-2">
                    <Tag className="h-5 w-5" />
                    <span className="font-semibold">Seçilen Kategori</span>
                  </div>
                  <p className="text-blue-600">
                    {selectedCategory?.name} → {selectedSubcategory?.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Dinamik Alanlar */}
          {currentStep === 3 && selectedSubcategory?.dynamicFields && (
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Zap className="h-7 w-7" />
                  Ürün Detayları
                </CardTitle>
                <p className="text-purple-100 mt-2">
                  {selectedSubcategory.name} kategorisine özel bilgileri doldurun
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSubcategory.dynamicFields.map((field) => (
                    <div key={field.id} className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        {field.label || field.name}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {renderDynamicField(field)}
                      {errors.dynamicFields?.[field.id] && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.dynamicFields[field.id]}
                        </div>
                      )}
                      {field.description && (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Konum ve Fiyat */}
          {currentStep === 4 && (
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <MapPin className="h-7 w-7" />
                  Konum ve Fiyat
                </CardTitle>
                <p className="text-orange-100 mt-2">İlanınızın konumunu ve fiyatını belirleyin</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Konum */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Konum Bilgileri</h3>
                    
                    {/* Şehir */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        Şehir
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                        <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                          <SelectValue placeholder="Şehir seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id} className="text-base py-3">
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* İlçe */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        İlçe
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.district} 
                        onValueChange={(value) => handleInputChange('district', value)}
                        disabled={!formData.city}
                      >
                        <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                          <SelectValue placeholder={formData.city ? "İlçe seçiniz" : "Önce şehir seçin"} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.city && cities.find(c => c.id === formData.city)?.districts?.map((district) => (
                            <SelectItem key={district.id} value={district.id} className="text-base py-3">
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fiyat */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Fiyat Bilgileri</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Minimum Fiyat */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          En Az Fiyat (TL)
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                          <Input
                            type="number"
                            value={formData.minPrice}
                            onChange={(e) => handleInputChange('minPrice', e.target.value)}
                            placeholder="En az fiyat"
                            min="0"
                            step="0.01"
                            required
                            className="h-14 text-lg pl-14 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors"
                          />
                        </div>
                        {errors.minPrice && (
                          <p className="text-sm text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.minPrice}
                          </p>
                        )}
                      </div>

                      {/* Maksimum Fiyat */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          En Çok Fiyat (TL)
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                          <Input
                            type="number"
                            value={formData.maxPrice}
                            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                            placeholder="En çok fiyat"
                            min="0"
                            step="0.01"
                            required
                            className="h-14 text-lg pl-14 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors"
                          />
                        </div>
                        {errors.maxPrice && (
                          <p className="text-sm text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.maxPrice}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Fiyat aralığı belirleyerek daha esnek pazarlık imkanı sunun
                    </p>

                    {/* Fiyat Önerileri */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-700 mb-2">
                        <Star className="h-5 w-5" />
                        <span className="font-semibold">Fiyat İpuçları</span>
                      </div>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        <li>• Benzer ilanları araştırın</li>
                        <li>• Pazarlık payı bırakın</li>
                        <li>• Ürün durumunu dikkate alın</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Resim Yükleme */}
          {currentStep === 5 && (
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Camera className="h-7 w-7" />
                  Resim Yükleme
                </CardTitle>
                <p className="text-indigo-100 mt-2">İlanınız için resimler ekleyin (maksimum 8 adet)</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Resim Yükleme Alanı */}
                  <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors bg-gradient-to-br from-gray-50 to-indigo-50 ${
                    errors.images 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          <Plus className="h-10 w-10 text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-700 mb-2">Resim Yükle</p>
                          <p className="text-gray-500 mb-1">Sürükle bırak veya tıkla</p>
                          <p className="text-sm text-gray-400">Maksimum 8 resim • JPG, PNG, WEBP</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Resim İpuçları */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">Kaliteli Fotoğraf</span>
                      </div>
                      <p className="text-sm text-blue-600">Yüksek çözünürlüklü ve net fotoğraflar kullanın</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <Eye className="h-5 w-5" />
                        <span className="font-semibold">Farklı Açılar</span>
                      </div>
                      <p className="text-sm text-green-600">Ürünü farklı açılardan gösterin</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Star className="h-5 w-5" />
                        <span className="font-semibold">İyi Aydınlatma</span>
                      </div>
                      <p className="text-sm text-purple-600">Doğal ışık altında çekim yapın</p>
                    </div>
                  </div>

                  {/* Yüklenen Resimler */}
                  {previewImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Yüklenen Resimler</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-300 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <Badge className={`absolute bottom-2 left-2 ${index === 0 ? 'bg-green-500' : 'bg-black/50'} text-white`}>
                              {index === 0 ? 'Ana' : index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-8 py-3 text-lg border-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Geri
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {currentStep} / 5
              </span>
              
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 shadow-lg"
                >
                  İleri
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Yayınlanıyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      İlanı Yayınla
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}