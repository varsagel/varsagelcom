'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const loginMutation = api.auth.login.useMutation({
    onSuccess: (data) => {
      // Token'ı localStorage'a kaydet
      console.log('Login success - Saving token:', data.token);
      localStorage.setItem('token', data.token);
      
      // Kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Login success - Token saved, redirecting to profile');
      
      // Header'ın auth durumunu güncellemesi için custom event dispatch et
      window.dispatchEvent(new Event('authStatusChanged'));
      
      // Ana sayfaya yönlendir
      console.log('Login success - Redirecting to home page');
      router.push('/');
    },
    onError: (error) => {
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-primary/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60" />
      
      <div className="relative w-full max-w-md">
        <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-30" />
        
        <Card className="relative border-0 shadow-2xl bg-background/95 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          
          <CardHeader className="text-center py-8 px-8">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hoş Geldiniz
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-base">
              Hesabınıza giriş yapın ve Varsagel dünyasına katılın
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
                  className="h-12 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 pl-12 text-base transition-all"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
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
                  className="h-12 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 pl-12 pr-12 text-base transition-all"
                  required
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
            </div>
            
            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                Şifremi Unuttum
              </Link>
            </div>
            
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold text-lg group"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  Giriş Yapılıyor...
                </>
              ) : (
                <>
                  <LogIn className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                  Giriş Yap
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
                Henüz hesabınız yok mu?
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:border-primary/50 hover:scale-105"
              >
                Hemen Üye Olun
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