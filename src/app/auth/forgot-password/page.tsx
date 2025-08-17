'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Gerçek API çağrısı burada yapılacak
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.error || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu');
      // }
      
      // Şimdilik başarılı olduğunu varsayalım
      setTimeout(() => {
        setIsSubmitted(true);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlama isteği gönderilirken bir hata oluştu');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <Card className="w-full max-w-md border-primary/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
          <CardTitle className="text-2xl font-bold text-primary">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-muted-foreground">
            E-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-8">
          {!isSubmitted ? (
            <>
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start mb-6">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
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
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="rounded-lg border-primary/20 focus-visible:ring-primary/30 pl-10"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 text-white font-medium py-5"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    'Şifre Sıfırlama Bağlantısı Gönder'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Şifre Sıfırlama Bağlantısı Gönderildi</h3>
              <p className="text-muted-foreground mb-6">
                <span className="font-medium">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik. Lütfen e-posta kutunuzu kontrol edin.
              </p>
              <p className="text-sm text-muted-foreground">
                E-postayı alamadınız mı? Spam klasörünü kontrol edin veya{' '}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:text-primary/80 hover:underline font-medium"
                >
                  tekrar deneyin
                </button>
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-primary hover:text-primary/80 hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Giriş sayfasına dön
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}