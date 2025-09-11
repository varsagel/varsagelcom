"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Handle validation errors
          const newErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              newErrors[key] = messages[0];
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.error || 'Şifre sıfırlama isteği sırasında bir hata oluştu' });
        }
        return;
      }

      // Success
      setIsSubmitted(true);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }

    } catch (error) {
      setErrors({ general: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">E-posta Gönderildi!</h2>
              
              <p className="text-gray-600 mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. 
                E-posta kutunuzu kontrol edin ve spam klasörünü de kontrol etmeyi unutmayın.
              </p>
              
              {/* Development mode: Show reset link */}
              {resetLink && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm font-medium mb-2">
                    Geliştirme Modu - Şifre Sıfırlama Bağlantısı:
                  </p>
                  <a 
                    href={resetLink}
                    className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
              
              <div className="space-y-3">
                <Link href="/auth/login" className="block">
                  <Button className="w-full">
                    Giriş Sayfasına Dön
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Tekrar Gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back to Login */}
        <Link href="/auth/login" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Giriş Sayfasına Dön
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              VarsaGel
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">Şifremi Unuttum</CardTitle>
            <p className="text-gray-600 mt-2">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={handleInputChange}
                    className={`pl-10 h-12 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
                {errors.general && (
                  <p className="text-red-500 text-sm mt-1">{errors.general}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </div>
                ) : (
                  "Şifre Sıfırlama Bağlantısı Gönder"
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Not:</strong> E-posta gelmezse spam klasörünüzü kontrol edin. 
                Sorun devam ederse destek ekibimizle iletişime geçin.
              </p>
            </div>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Şifrenizi hatırladınız mı?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}