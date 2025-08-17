'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Save, Shield, User } from 'lucide-react';
import { formatCity } from '@/utils/locationUtils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  image?: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Profil bilgileri
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  
  // Şifre değiştirme
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Şifre değiştirme hataları
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profil bilgilerini getir
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Profil bilgileri alınamadı');
        }
        
        const data = await response.json();
        const userProfile = data.user;
        
        setProfile({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone || '',
          location: userProfile.location || '',
          bio: '', // API'de bio field yok, boş bırakıyoruz
          image: userProfile.profileImage || ''
        });
        
        setFormData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          location: userProfile.location || '',
          bio: '' // API'de bio field yok
        });
        
        setIsLoading(false);
      } catch (err) {
        setError('Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSuccessMessage(null);
    setError(null);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Hata mesajlarını temizle
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Mevcut şifrenizi girmelisiniz';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Yeni şifrenizi girmelisiniz';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Şifre en az 8 karakter olmalıdır';
      isValid = false;
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Şifrenizi tekrar girmelisiniz';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profil güncellenemedi');
      }
      
      const data = await response.json();
      const updatedUser = data.user;
      
      setProfile(prev => prev ? {
        ...prev,
        name: updatedUser.name,
        phone: updatedUser.phone || '',
        location: updatedUser.location || ''
      } : null);
      
      setSuccessMessage('Profil bilgileriniz başarıyla güncellendi.');
      setIsSaving(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setError('Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
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
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Şifre değiştirilemedi');
      }
      
      setPasswordData({
         currentPassword: '',
         newPassword: '',
         confirmPassword: ''
       });
       setSuccessMessage('Şifreniz başarıyla değiştirildi.');
       setIsSaving(false);
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      setError(error.message || 'Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <Info className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Profil Yüklenemedi</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hesap Ayarları</h1>
        <p className="text-muted-foreground">
          Profil bilgilerinizi ve hesap ayarlarınızı yönetin.
        </p>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil Bilgileri
          </TabsTrigger>
          <TabsTrigger value="password">
            <Shield className="mr-2 h-4 w-4" />
            Şifre Değiştir
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin. Bu bilgiler profilinizde görünecektir.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {successMessage && activeTab === 'profile' && (
                  <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-3 rounded-md text-sm mb-4">
                    {successMessage}
                  </div>
                )}
                
                {error && activeTab === 'profile' && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      placeholder="Ad Soyad"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta Adresi</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      placeholder="E-posta Adresi"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon Numarası</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="Telefon Numarası"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Konum</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleProfileChange}
                      placeholder="Konum"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Hakkımda</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleProfileChange}
                    placeholder="Kendiniz hakkında kısa bir bilgi"
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <form onSubmit={handleChangePassword}>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirmenizi öneririz.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {successMessage && activeTab === 'password' && (
                  <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-3 rounded-md text-sm mb-4">
                    {successMessage}
                  </div>
                )}
                
                {error && activeTab === 'password' && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Mevcut şifrenizi girin"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Yeni şifrenizi girin"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Şifreyi Değiştir
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}