import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/layout/scroll-to-top";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Varsagel - Alıcı-Talep Platformu",
    template: "%s | Varsagel"
  },
  description: "Kullanıcıların satın almak istedikleri ürün veya hizmetleri ilan olarak ekleyip, diğer kullanıcıların bu ilanlara teklif verebildiği platform. Emlak, vasıta, ikinci el alışveriş ve daha fazlası.",
  keywords: ["ilan", "teklif", "alışveriş", "emlak", "vasıta", "ikinci el", "hizmet", "usta", "özel ders", "iş ilanları"],
  authors: [{ name: "Varsagel" }],
  creator: "Varsagel",
  publisher: "Varsagel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://varsagel.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://varsagel.com',
    title: 'Varsagel - Alıcı-Talep Platformu',
    description: 'Kullanıcıların satın almak istedikleri ürün veya hizmetleri ilan olarak ekleyip, diğer kullanıcıların bu ilanlara teklif verebildiği platform.',
    siteName: 'Varsagel',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Varsagel - Alıcı-Talep Platformu',
    description: 'Kullanıcıların satın almak istedikleri ürün veya hizmetleri ilan olarak ekleyip, diğer kullanıcıların bu ilanlara teklif verebildiği platform.',
    creator: '@varsagel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#dc2626" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ScrollToTop />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
