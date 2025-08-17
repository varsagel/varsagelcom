import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background py-6">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Varsagel</h3>
          <p className="text-sm text-muted-foreground">
            Kullanıcıların satın almak istedikleri ürün veya hizmetleri ilan olarak ekleyip, diğer kullanıcıların bu ilanlara teklif verebildiği platform.
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hızlı Bağlantılar</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link href="/listings" className="text-muted-foreground hover:text-foreground transition-colors">
                İlanlar
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                İletişim
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Kategoriler</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/listings?category=Emlak" className="text-muted-foreground hover:text-foreground transition-colors">
                Emlak
              </Link>
            </li>
            <li>
              <Link href="/listings?category=Vasıta" className="text-muted-foreground hover:text-foreground transition-colors">
                Vasıta
              </Link>
            </li>
            <li>
              <Link href="/listings?category=Yedek Parça, Aksesuar, Donanım & Tuning" className="text-muted-foreground hover:text-foreground transition-colors">
                Yedek Parça & Tuning
              </Link>
            </li>
            <li>
              <Link href="/listings?category=İkinci El ve Sıfır Alışveriş" className="text-muted-foreground hover:text-foreground transition-colors">
                İkinci El Alışveriş
              </Link>
            </li>
            <li>
              <Link href="/listings?category=İş Makineleri & Sanayi" className="text-muted-foreground hover:text-foreground transition-colors">
                İş Makineleri & Sanayi
              </Link>
            </li>
            <li>
              <Link href="/listings?category=Ustalar ve Hizmetler" className="text-muted-foreground hover:text-foreground transition-colors">
                Ustalar ve Hizmetler
              </Link>
            </li>
            <li>
              <Link href="/listings?category=Özel Ders Verenler" className="text-muted-foreground hover:text-foreground transition-colors">
                Özel Ders Verenler
              </Link>
            </li>
            <li>
              <Link href="/listings?category=İş İlanları" className="text-muted-foreground hover:text-foreground transition-colors">
                İş İlanları
              </Link>
            </li>
            <li>
              <Link href="/listings?category=Yardımcı Arayanlar" className="text-muted-foreground hover:text-foreground transition-colors">
                Yardımcı Arayanlar
              </Link>
            </li>
            <li>
              <Link href="/listings?category=Hayvanlar Alemi" className="text-muted-foreground hover:text-foreground transition-colors">
                Hayvanlar Alemi
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">İletişim</h3>
          <ul className="space-y-2 text-sm">
            <li className="text-muted-foreground">
              Email: info@varsagel.com
            </li>
            <li className="text-muted-foreground">
              Telefon: +90 (212) 123 45 67
            </li>
            <li className="text-muted-foreground">
              Adres: İstanbul, Türkiye
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mt-8 border-t border-border pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Varsagel. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;