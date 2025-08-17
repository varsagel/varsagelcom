'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Anlık doğrulama için hataları temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Ad Soyad gereklidir.';
    else if (formData.name.length < 3) newErrors.name = 'Ad Soyad en az 3 karakter olmalıdır.';
    
    if (!formData.email.trim()) newErrors.email = 'E-posta gereklidir.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz.';
    }
    
    if (!formData.password) newErrors.password = 'Şifre gereklidir.';
    else if (formData.password.length < 8) newErrors.password = 'Şifre en az 8 karakter olmalıdır.';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.';
    }
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Şifre tekrarı gereklidir.';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      // Kayıt başarılı, giriş sayfasına yönlendir
      router.push('/auth/login?registered=true');
    },
    onError: (error) => {
      setError(error.message || 'Kayıt olurken bir hata oluştu');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...registerData } = formData;
    
    registerMutation.mutate(registerData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-accent/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60" />
      
      <div className="relative w-full max-w-md">
        <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-3xl blur-xl opacity-30" />
        
        <Card className="relative border-0 shadow-2xl bg-background/95 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-secondary to-primary" />
          
          <CardHeader className="text-center py-8 px-8">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20">
              <UserPlus className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Varsagel'e Katılın
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-base">
              Hesap oluşturun ve Türkiye'nin en büyük hizmet platformuna katılın
            </CardDescription>
          </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start mb-6">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center">
                Ad Soyad <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  className={errors.name ? 'h-12 rounded-xl border-destructive bg-background/50 pl-12 text-base transition-all' : 'h-12 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 pl-12 text-base transition-all'}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center">
                E-posta <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className={errors.email ? 'h-12 rounded-xl border-destructive bg-background/50 pl-12 text-base transition-all' : 'h-12 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 pl-12 text-base transition-all'}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center">
                Şifre <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.password ? 'h-12 rounded-xl border-destructive bg-background/50 pl-12 pr-12 text-base transition-all' : 'h-12 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 pl-12 pr-12 text-base transition-all'}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            
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
                  className={errors.confirmPassword ? 'h-12 rounded-xl border-destructive bg-background/50 pl-12 pr-12 text-base transition-all' : 'h-12 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 pl-12 pr-12 text-base transition-all'}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
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
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <div className="p-5 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl border border-accent/20">
              <h4 className="text-sm font-semibold mb-3 flex items-center text-accent">
                <CheckCircle className="h-5 w-5 mr-2" />
                Şifre Gereksinimleri
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-accent/60 mr-3"></div>
                  En az 8 karakter uzunluğunda
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-accent/60 mr-3"></div>
                  En az bir büyük harf içermeli
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-accent/60 mr-3"></div>
                  En az bir küçük harf içermeli
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-accent/60 mr-3"></div>
                  En az bir rakam içermeli
                </li>
              </ul>
            </div>
            
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-accent via-secondary to-primary hover:from-accent/90 hover:via-secondary/90 hover:to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold text-lg group"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  Kayıt Yapılıyor...
                </>
              ) : (
                <>
                  <UserPlus className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                  Üye Ol
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="px-8 pb-8 pt-4">
          <div className="w-full text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">veya</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Zaten hesabınız var mı?
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-xl border-2 border-accent/30 bg-accent/5 hover:bg-accent/10 px-6 py-3 text-sm font-semibold text-accent transition-all hover:border-accent/50 hover:scale-105"
              >
                Giriş Yapın
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}