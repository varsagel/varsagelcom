'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Edit, Eye, EyeOff, LogOut, Mail, MapPin, Phone, User, RefreshCcw, Key, Lock, ShieldCheck, CheckCircle, AlertCircle, Upload, Image, Info, UserCircle, UserCog, FileText, MessageSquare, Heart, Calendar, Clock, Star, TrendingUp, Package, Settings, Check, X, MoreHorizontal } from 'lucide-react';
import { formatCity, formatDistrict } from '@/utils/locationUtils';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
  _count: {
    listings: number;
    offers: number;
    favorites: number;
    reviews: number;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  status: 'active' | 'expired' | 'closed';
  createdAt: string;
  offersCount: number;
  favoritesCount: number;
  mileage?: number;
  mileageMin?: number;
  mileageMax?: number;
  categorySpecificData?: {
    brand?: string;
    model?: string;
    [key: string]: any;
  };
}

interface Offer {
  id: string;
  listingId: string;
  listingTitle: string;
  price: number;
  description: string;
  deliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

interface Favorite {
  id: string;
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budgetMin: number;
    budgetMax: number;
    status: string;
    createdAt: string;
    mileage?: number;
    mileageMin?: number;
    mileageMax?: number;
    categorySpecificData?: {
      brand?: string;
      model?: string;
      [key: string]: any;
    };
    user: {
      name: string;
    };
  };
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Yeni state'ler
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    image: null as File | null,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Logout fonksiyonu
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
      
      // Ana sayfaya yönlendir
      router.push("/");
    } catch (error) {
      console.error('Çıkış yapılırken bir hata oluştu:', error);
    }
  };

  // Profil bilgilerini getir
  useEffect(() => {
    console.log('Profile useEffect triggered');
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Client-side check to prevent SSR issues
        if (typeof window === 'undefined') {
          return;
        }
        
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem('token');
        console.log('Profile page - Token from localStorage:', token);
        
        if (!token) {
          console.log('Profile page - No token found, redirecting to login');
          router.push('/auth/login');
          return;
        }
        
        // API çağrısı yap
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Profile API response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Yetkilendirme hatası, token geçersiz
            console.log('Profile page - 401 error, removing token and redirecting');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/auth/login');
            return;
          }
          throw new Error('Profil bilgileri alınamadı');
        }
        
        const data = await response.json();
        console.log('Profile data received successfully:', data.user);
        setProfile(data.user);
        setFormData(prev => ({
          ...prev,
          name: data.user.name || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
        }));
        setIsLoading(false);
      } catch (err) {
        setError('Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    };
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        setIsLoadingData(true);
        
        // Fetch listings
        const listingsResponse = await fetch('/api/listings/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setListings(listingsData.listings || []);
        }
        
        // Fetch offers
        const offersResponse = await fetch('/api/offers/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (offersResponse.ok) {
          const offersData = await offersResponse.json();
          console.log('Profil sayfası - Teklifler yüklendi:', offersData);
          setOffers(offersData.offers || []);
        } else {
          console.error('Profil sayfası - Teklifler yüklenemedi:', offersResponse.status);
        }
        
        // Fetch favorites
        const favoritesResponse = await fetch('/api/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          setFavorites(favoritesData.favorites || []);
        }
        
        setIsLoadingData(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setIsLoadingData(false);
      }
    };
    
    fetchProfile();
     fetchUserData();
   }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Başarı mesajını temizle
    if (successMessage) setSuccessMessage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Dosya boyutu kontrolü (maksimum 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Profil resmi en fazla 5MB olabilir.' }));
        return;
      }
      
      // Dosya türü kontrolü
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Sadece resim dosyaları yükleyebilirsiniz.' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      // Önizleme URL'sini oluştur
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Hata mesajını temizle
      if (errors.image) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
      
      // Başarı mesajını temizle
      if (successMessage) setSuccessMessage(null);
    }
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Ad Soyad gereklidir.';
    else if (formData.name.length < 3) newErrors.name = 'Ad Soyad en az 3 karakter olmalıdır.';
    else if (formData.name.length > 50) newErrors.name = 'Ad Soyad en fazla 50 karakter olabilir.';
    
    if (formData.phone && !/^\+?[0-9\s]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) newErrors.currentPassword = 'Mevcut şifre gereklidir.';
    
    if (!formData.newPassword) newErrors.newPassword = 'Yeni şifre gereklidir.';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Yeni şifre en az 8 karakter olmalıdır.';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Yeni şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.';
    }
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Şifre tekrarı gereklidir.';
    else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      
      // LocalStorage'dan token'ı al
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Token yoksa login sayfasına yönlendir
        router.push('/auth/login');
        return;
      }
      
      const updateData: any = {
        name: formData.name,
      };
      
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.location) updateData.location = formData.location;
      
      // Profil resmi yükleme işlemi şimdilik devre dışı
      // TODO: Profil resmi yükleme özelliği eklenecek
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Yetkilendirme hatası, token geçersiz
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profil güncellenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setProfile(data.user);
      setSuccessMessage('Profil bilgileriniz başarıyla güncellendi.');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setErrors(prev => ({ ...prev, submit: 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.' }));
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      
      // LocalStorage'dan token'ı al
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Token yoksa login sayfasına yönlendir
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Yetkilendirme hatası, token geçersiz
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Şifre güncellenirken bir hata oluştu');
      }
      
      setSuccessMessage('Şifreniz başarıyla güncellendi.');
      setIsSubmitting(false);
      
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      setErrors(prev => ({ ...prev, submit: 'Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.' }));
      setIsSubmitting(false);
    }
  };



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-gradient-to-b from-muted/10 to-muted/30 rounded-xl border border-destructive/20 shadow-lg">
          <div className="rounded-full bg-destructive/10 p-5 mb-6 animate-pulse">
            <User className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">Profil Bulunamadı</h2>
          <p className="text-muted-foreground mb-8 max-w-md">{error || 'Profil bilgileriniz yüklenemedi. Lütfen tekrar deneyin.'}</p>
          <Button onClick={() => window.location.reload()} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-md transition-all px-6 py-2.5">
            <RefreshCcw className="mr-2 h-5 w-5" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sol Kolon - Profil Özeti */}
        <div className="lg:col-span-1">
          <Card className="border border-primary/10 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
            <CardHeader className="text-center pt-28 pb-6 relative z-10">
              <div className="flex justify-center mb-4 absolute -top-12 left-1/2 transform -translate-x-1/2">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.profileImage} alt={profile.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary mt-2">
                <span className="font-medium">Üye: {new Date(profile.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="flex items-center p-3 rounded-lg bg-primary/5 transition-colors hover:bg-primary/10">
                <Mail className="mr-3 h-5 w-5 text-primary/70" />
                <span className="text-sm font-medium">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center p-3 rounded-lg bg-primary/5 transition-colors hover:bg-primary/10">
                  <Phone className="mr-3 h-5 w-5 text-primary/70" />
                  <span className="text-sm font-medium">{profile.phone}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center p-3 rounded-lg bg-primary/5 transition-colors hover:bg-primary/10">
                  <MapPin className="mr-3 h-5 w-5 text-primary/70" />
                  <span className="text-sm font-medium">{formatCity(profile.location)}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-border pt-6">
              <div className="grid grid-cols-3 w-full gap-3 text-center">
                <div className="rounded-xl bg-primary/5 p-3 transition-transform hover:scale-105 hover:bg-primary/10">
                  <div className="text-xl font-bold text-primary">{profile._count.listings}</div>
                  <div className="text-xs font-medium text-primary/70">İlan</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-3 transition-transform hover:scale-105 hover:bg-primary/10">
                  <div className="text-xl font-bold text-primary">{profile._count.offers}</div>
                  <div className="text-xs font-medium text-primary/70">Teklif</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-3 transition-transform hover:scale-105 hover:bg-primary/10">
                  <div className="text-xl font-bold text-primary">{profile._count.favorites}</div>
                  <div className="text-xs font-medium text-primary/70">Favori</div>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-full border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8 space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-2 px-2">Hesap Menüsü</div>
            <Link href="/profile/listings" className="block">
              <div className="group flex items-center p-3 rounded-xl border border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-md">
                <div className="mr-3 flex-shrink-0 rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">İlanlarım</div>
                  <div className="text-xs text-muted-foreground">İlanlarınızı yönetin</div>
                </div>
              </div>
            </Link>
            <Link href="/profile/offers" className="block">
              <div className="group flex items-center p-3 rounded-xl border border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-md">
                <div className="mr-3 flex-shrink-0 rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                    <path d="M7 7h.01" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Tekliflerim</div>
                  <div className="text-xs text-muted-foreground">Gönderdiğiniz teklifler</div>
                </div>
              </div>
            </Link>
            <Link href="/profile/favorites" className="block">
              <div className="group flex items-center p-3 rounded-xl border border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-md">
                <div className="mr-3 flex-shrink-0 rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Favorilerim</div>
                  <div className="text-xs text-muted-foreground">Kaydettiğiniz ilanlar</div>
                </div>
              </div>
            </Link>
            <Link href="/notifications" className="block">
              <div className="group flex items-center p-3 rounded-xl border border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-md">
                <div className="mr-3 flex-shrink-0 rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Bildirimlerim</div>
                  <div className="text-xs text-muted-foreground">Tüm bildirimleriniz</div>
                </div>
              </div>
            </Link>
            <Link href="/profile/settings" className="block">
              <div className="group flex items-center p-3 rounded-xl border border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-md">
                <div className="mr-3 flex-shrink-0 rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Ayarlar</div>
                  <div className="text-xs text-muted-foreground">Hesap ayarlarınız</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Sağ Kolon - Ana İçerik */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid grid-cols-5 p-1 bg-muted/30 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Genel Bakış
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="listings" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  İlanlarım
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="offers" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Tekliflerim
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorilerim
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Ayarlar
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-6">
                {/* İstatistikler */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{profile._count.listings}</p>
                          <p className="text-xs text-muted-foreground">Toplam İlan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{profile._count.offers}</p>
                          <p className="text-xs text-muted-foreground">Verilen Teklif</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="text-2xl font-bold">{profile._count.favorites}</p>
                          <p className="text-xs text-muted-foreground">Favori İlan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Star className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">{profile.rating.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Ortalama Puan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Son Aktiviteler */}
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Son Aktiviteler</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {listings.slice(0, 3).map((listing) => (
                        <div key={listing.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{listing.offersCount} teklif</p>
                            <p className="text-xs text-muted-foreground">{listing.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="listings">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>İlanlarım</span>
                  </CardTitle>
                  <CardDescription>
                    Oluşturduğunuz tüm ilanları buradan yönetebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="flex justify-center py-8">
                      <RefreshCcw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : listings.length > 0 ? (
                    <div className="space-y-4">
                      {listings.map((listing) => (
                        <div key={listing.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{listing.title}</h3>
                              <p className="text-muted-foreground text-sm mt-1">{listing.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{formatCity(listing.location)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
                                </span>
                                {(listing.category === 'Otomobil' || listing.category === 'Motosiklet' || listing.category === 'Ticari Araç' || listing.category === 'Deniz Araçları' || listing.category === 'Tarım Araçları' || listing.category === 'İş Makineleri' || listing.category === 'Hasarlı Araçlar' || listing.category === 'Klasik Araçlar' || listing.category === 'Elektrikli Araçlar') && (listing.mileage || listing.mileageMin || listing.mileageMax) && (
                                  <span className="flex items-center space-x-1">
                                    <span>🚗</span>
                                    <span>
                                      {listing.mileage 
                                        ? `${listing.mileage.toLocaleString()} km`
                                        : `${listing.mileageMin?.toLocaleString() || 0} - ${listing.mileageMax?.toLocaleString() || 0} km`
                                      }
                                    </span>
                                  </span>
                                )}
                                {(listing.category === 'Otomobil' || listing.category === 'Motosiklet' || listing.category === 'Ticari Araç' || listing.category === 'Deniz Araçları' || listing.category === 'Tarım Araçları' || listing.category === 'İş Makineleri' || listing.category === 'Hasarlı Araçlar' || listing.category === 'Klasik Araçlar' || listing.category === 'Elektrikli Araçlar') && listing.categorySpecificData && (listing.categorySpecificData.brand || listing.categorySpecificData.model) && (
                                  <span className="flex items-center space-x-1">
                                    <span>🏷️</span>
                                    <span>
                                      {listing.categorySpecificData.brand && listing.categorySpecificData.model 
                                        ? `${listing.categorySpecificData.brand} ${listing.categorySpecificData.model}`
                                        : listing.categorySpecificData.brand || listing.categorySpecificData.model
                                      }
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                ₺{listing.budgetMin} - ₺{listing.budgetMax}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-sm text-muted-foreground">
                                  {listing.offersCount} teklif
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {listing.favoritesCount} favori
                                </span>
                              </div>
                              <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                  listing.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {listing.status === 'active' ? 'Aktif' :
                                   listing.status === 'expired' ? 'Süresi Dolmuş' : 'Kapalı'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <div className="flex space-x-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/listings/${listing.id}`}>
                                  İlanı Görüntüle
                                </Link>
                              </Button>
                              {listing.offersCount > 0 && (
                                <Button asChild variant="default" size="sm">
                                  <Link href={`/profile/listings/${listing.id}/offers`}>
                                    Gelen Teklifleri Gör ({listing.offersCount})
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz hiç ilan oluşturmadınız.</p>
                      <Button asChild className="mt-4">
                        <Link href="/listings/create">İlk İlanınızı Oluşturun</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Tekliflerim</span>
                  </CardTitle>
                  <CardDescription>
                    Gönderdiğiniz ve aldığınız teklifleri görüntüleyin ve yönetin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OffersSection />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Favorilerim</span>
                  </CardTitle>
                  <CardDescription>
                    Beğendiğiniz ilanları buradan takip edebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="flex justify-center py-8">
                      <RefreshCcw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="space-y-4">
                      {favorites.map((favorite) => (
                        <div key={favorite.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{favorite.listing.title}</h3>
                              <p className="text-muted-foreground text-sm mt-1">{favorite.listing.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{favorite.listing.user.name}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{formatCity(favorite.listing.location)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(favorite.createdAt).toLocaleDateString('tr-TR')}</span>
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                ₺{favorite.listing.budgetMin} - ₺{favorite.listing.budgetMax}
                              </p>
                              <Button asChild size="sm" className="mt-2">
                                <Link href={`/listings/${favorite.listing.id}`}>İncele</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz hiç ilan favorilemediniz.</p>
                      <Button asChild className="mt-4">
                        <Link href="/listings">İlanları İnceleyin</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-primary/10 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
                  <CardTitle className="text-2xl font-bold text-primary">Profil Bilgileri</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Kişisel bilgilerinizi güncelleyin. Bu bilgiler diğer kullanıcılar tarafından görülebilir.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Profil Resmi */}
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-sm font-medium">Profil Resmi</Label>
                      <div className="flex items-center space-x-6 p-4 border border-dashed border-primary/20 rounded-lg bg-muted/20">
                        <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
                          <AvatarImage 
                            src={imagePreview || profile.profileImage} 
                            alt={profile.name} 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer rounded-lg border-primary/20 focus-visible:ring-primary/30"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            JPG, PNG veya GIF. Maksimum 5MB.
                          </p>
                          {errors.image && <p className="text-xs text-destructive mt-1">{errors.image}</p>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Ad Soyad */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center">
                        Ad Soyad <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ad Soyad"
                        className={errors.name ? 'border-destructive rounded-lg' : 'rounded-lg border-primary/20 focus-visible:ring-primary/30'}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    
                    {/* E-posta (Değiştirilemez) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">E-posta</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted/50 rounded-lg border-primary/20"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        E-posta adresinizi değiştirmek için lütfen destek ekibiyle iletişime geçin.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Telefon */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Telefon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+90 555 123 4567"
                          className={errors.phone ? 'border-destructive rounded-lg' : 'rounded-lg border-primary/20 focus-visible:ring-primary/30'}
                        />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                      </div>
                      
                      {/* Konum */}
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium">Konum</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="İstanbul"
                          className="rounded-lg border-primary/20 focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>
                    
                    {/* Hata Mesajı */}
                    {errors.submit && (
                      <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.submit}
                      </div>
                    )}
                    
                    {/* Başarı Mesajı */}
                    {successMessage && (
                      <div className="rounded-xl bg-green-50 p-4 text-sm text-green-600 border border-green-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 text-white font-medium py-5"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                          Güncelleniyor...
                        </>
                      ) : (
                        <>
                          <Edit className="mr-2 h-5 w-5" />
                          Profili Güncelle
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card className="border-primary/10 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
                  <CardTitle className="text-2xl font-bold text-primary">Şifre Değiştir</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirmenizi öneririz.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    {/* Mevcut Şifre */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center">
                        Mevcut Şifre <span className="text-destructive ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={errors.currentPassword ? 'border-destructive rounded-lg pr-10 pl-10' : 'rounded-lg border-primary/20 focus-visible:ring-primary/30 pr-10 pl-10'}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
                    </div>
                    
                    {/* Yeni Şifre */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium flex items-center">
                        Yeni Şifre <span className="text-destructive ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={errors.newPassword ? 'border-destructive rounded-lg pr-10 pl-10' : 'rounded-lg border-primary/20 focus-visible:ring-primary/30 pr-10 pl-10'}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                            <path d="M18 10a6 6 0 0 0-6-6v6h6Z" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
                      <p className="text-xs text-muted-foreground">
                        Şifreniz en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.
                      </p>
                    </div>
                    
                    {/* Şifre Tekrarı */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
                        Şifre Tekrarı <span className="text-destructive ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={errors.confirmPassword ? 'border-destructive rounded-lg pr-10 pl-10' : 'rounded-lg border-primary/20 focus-visible:ring-primary/30 pr-10 pl-10'}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border border-primary/10 mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 mr-2 text-primary"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Güvenli Şifre İpuçları
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                        <li>En az 8 karakter uzunluğunda olmalı</li>
                        <li>Büyük ve küçük harfler içermeli</li>
                        <li>En az bir rakam içermeli</li>
                        <li>En az bir özel karakter içermeli (!@#$%^&*)</li>
                        <li>Kişisel bilgilerinizi içermemeli</li>
                      </ul>
                    </div>
                    
                    {/* Hata Mesajı */}
                    {errors.submit && (
                      <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.submit}
                      </div>
                    )}
                    
                    {/* Başarı Mesajı */}
                    {successMessage && (
                      <div className="rounded-xl bg-green-50 p-4 text-sm text-green-600 border border-green-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 text-white font-medium py-5"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                          Güncelleniyor...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-5 w-5"
                          >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Şifreyi Güncelle
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// OffersSection bileşeni
function OffersSection() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerType, setOfferType] = useState<'sent' | 'received'>('sent');
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }
      
      const response = await fetch(`/api/profile/all-offers?type=${offerType}&status=${activeTab}&page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Teklifler yüklenirken bir hata oluştu.');
      }
      
      const data = await response.json();
      setOffers(data.offers || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Teklifler yüklenirken hata:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [offerType, activeTab, currentPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Kabul Edildi', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reddedildi', className: 'bg-red-100 text-red-800' },
      completed: { label: 'Tamamlandı', className: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Oturum Süresi Doldu',
          description: 'Lütfen tekrar giriş yapın.',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }
      
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast({
          title: 'Oturum Süresi Doldu',
          description: 'Lütfen tekrar giriş yapın.',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Teklif silinirken bir hata oluştu.');
      }

      toast({
        title: 'Başarılı! ✅',
        description: 'Teklif başarıyla silindi.',
        duration: 3000,
      });

      fetchOffers();
    } catch (error) {
      console.error('Teklif silme hatası:', error);
      toast({
        title: 'Hata! ❌',
        description: error instanceof Error ? error.message : 'Teklif silinirken bir hata oluştu.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCcw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <Info className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-xl font-bold mb-2">Teklifler Yüklenemedi</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchOffers}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const renderOffers = () => {
    if (offers.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Teklif Bulunamadı</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {offerType === 'sent' ? (
                <>
                  {activeTab === 'pending' && 'Henüz beklemede olan teklifiniz bulunmuyor.'}
                  {activeTab === 'accepted' && 'Henüz kabul edilen teklifiniz bulunmuyor.'}
                  {activeTab === 'rejected' && 'Henüz reddedilen teklifiniz bulunmuyor.'}
                  {activeTab === 'completed' && 'Henüz tamamlanan teklifiniz bulunmuyor.'}
                </>
              ) : (
                <>
                  {activeTab === 'pending' && 'İlanlarınıza henüz beklemede olan teklif gelmemiş.'}
                  {activeTab === 'accepted' && 'İlanlarınıza henüz kabul edilen teklif bulunmuyor.'}
                  {activeTab === 'rejected' && 'İlanlarınıza henüz reddedilen teklif bulunmuyor.'}
                  {activeTab === 'completed' && 'İlanlarınıza henüz tamamlanan teklif bulunmuyor.'}
                </>
              )}
            </p>
            <Link href="/listings">
              <Button>
                İlanlara Göz At
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">
                      <Link href={`/listings/${offer.listingId}`} className="hover:underline">
                        {offer.listingTitle}
                      </Link>
                    </CardTitle>
                    {getStatusBadge(offer.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {offerType === 'received' && offer.offerUser && (
                      <span className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        Teklif Veren: {offer.offerUser.name}
                      </span>
                    )}
                    {offerType === 'sent' && offer.listingOwner && (
                      <span className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        İlan Sahibi: {offer.listingOwner.name}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Teslim Süresi: {offer.duration}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 h-3 w-3"
                      >
                        <path d="M12 6v6l4 2" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      {formatDate(offer.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {formatPrice(offer.price)}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/offers/${offer.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        Detay
                      </Link>
                    </Button>
                    {offer.conversationId && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/messages/${offer.conversationId}`}>
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Mesaj
                        </Link>
                      </Button>
                    )}
                    {offerType === 'sent' && offer.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Sil
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {offer.message && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Mesaj:</strong> {offer.message}
                  </p>
                </div>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Teklif Türü Seçimi */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setOfferType('sent');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              offerType === 'sent'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yaptığım Teklifler
          </button>
          <button
            onClick={() => {
              setOfferType('received');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              offerType === 'received'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Aldığım Teklifler
          </button>
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Beklemede</TabsTrigger>
          <TabsTrigger value="accepted">Kabul Edilenler</TabsTrigger>
          <TabsTrigger value="rejected">Reddedilenler</TabsTrigger>
          <TabsTrigger value="completed">Tamamlananlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderOffers()}
        </TabsContent>
        
        <TabsContent value="accepted">
          {renderOffers()}
        </TabsContent>
        
        <TabsContent value="rejected">
          {renderOffers()}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderOffers()}
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Önceki
            </Button>
            
            <span className="text-sm">
              Sayfa {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}