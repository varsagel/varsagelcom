import { PrismaClient, FieldType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Kategorileri oluştur
  const categories = [
    {
      name: 'Vasıta',
      slug: 'vasita',
      description: 'Otomobil, motosiklet ve diğer araçlar',
      icon: '🚗',
      fields: [
        {
          name: 'marka',
          label: 'Marka',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Audi', 'BMW', 'Ford', 'Honda', 'Hyundai', 'Mercedes', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Volvo']
          }
        },
        {
          name: 'model',
          label: 'Model',
          type: FieldType.TEXT,
          isRequired: true,
          placeholder: 'Örn: A3, 3 Serisi, Focus'
        },
        {
          name: 'yil',
          label: 'Model Yılı',
          type: FieldType.NUMBER,
          isRequired: true,
          validation: {
            min: 1990,
            max: new Date().getFullYear() + 1
          }
        },
        {
          name: 'km',
          label: 'Kilometre',
          type: FieldType.NUMBER,
          isRequired: true,
          placeholder: 'Örn: 50000'
        },
        {
          name: 'yakit',
          label: 'Yakıt Türü',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Benzin', 'Dizel', 'LPG', 'Hybrid', 'Elektrik']
          }
        },
        {
          name: 'vites',
          label: 'Vites Türü',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Manuel', 'Otomatik', 'Yarı Otomatik']
          }
        },
        {
          name: 'motor_hacmi',
          label: 'Motor Hacmi',
          type: FieldType.TEXT,
          placeholder: 'Örn: 1.6, 2.0'
        },
        {
          name: 'renk',
          label: 'Renk',
          type: FieldType.SELECT,
          options: {
            values: ['Beyaz', 'Siyah', 'Gri', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Kahverengi']
          }
        }
      ]
    },
    {
      name: 'Emlak',
      slug: 'emlak',
      description: 'Ev, arsa, işyeri ve diğer gayrimenkuller',
      icon: '🏠',
      fields: [
        {
          name: 'emlak_tipi',
          label: 'Emlak Tipi',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Daire', 'Villa', 'Müstakil Ev', 'Arsa', 'Dükkan', 'Ofis', 'Depo', 'Fabrika']
          }
        },
        {
          name: 'oda_sayisi',
          label: 'Oda Sayısı',
          type: FieldType.SELECT,
          options: {
            values: ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', '7+1', '8+1', '9+1']
          }
        },
        {
          name: 'metrekare',
          label: 'Metrekare (Brüt)',
          type: FieldType.NUMBER,
          isRequired: true,
          placeholder: 'Örn: 120'
        },
        {
          name: 'bina_yasi',
          label: 'Bina Yaşı',
          type: FieldType.SELECT,
          options: {
            values: ['0', '1-5', '6-10', '11-15', '16-20', '21-25', '26-30', '31+']
          }
        },
        {
          name: 'kat',
          label: 'Bulunduğu Kat',
          type: FieldType.TEXT,
          placeholder: 'Örn: 3, Zemin, Çatı Katı'
        },
        {
          name: 'kat_sayisi',
          label: 'Kat Sayısı',
          type: FieldType.NUMBER,
          placeholder: 'Binanın toplam kat sayısı'
        },
        {
          name: 'isitma',
          label: 'Isıtma',
          type: FieldType.SELECT,
          options: {
            values: ['Merkezi', 'Kombi', 'Soba', 'Klima', 'Yerden Isıtma', 'Yok']
          }
        },
        {
          name: 'balkon',
          label: 'Balkon',
          type: FieldType.BOOLEAN
        },
        {
          name: 'esyali',
          label: 'Eşyalı',
          type: FieldType.BOOLEAN
        }
      ]
    },
    {
      name: 'Elektronik',
      slug: 'elektronik',
      description: 'Telefon, bilgisayar, TV ve diğer elektronik ürünler',
      icon: '📱',
      fields: [
        {
          name: 'kategori',
          label: 'Alt Kategori',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Cep Telefonu', 'Bilgisayar', 'Laptop', 'Tablet', 'TV', 'Ses Sistemi', 'Oyun Konsolu', 'Kamera', 'Saat', 'Diğer']
          }
        },
        {
          name: 'marka',
          label: 'Marka',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'LG', 'Sony', 'HP', 'Dell', 'Asus', 'Lenovo', 'MSI', 'Acer', 'Canon', 'Nikon', 'Diğer']
          }
        },
        {
          name: 'model',
          label: 'Model',
          type: FieldType.TEXT,
          isRequired: true,
          placeholder: 'Örn: iPhone 13, Galaxy S21'
        },
        {
          name: 'durum',
          label: 'Ürün Durumu',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü']
          }
        },
        {
          name: 'garanti',
          label: 'Garanti Durumu',
          type: FieldType.SELECT,
          options: {
            values: ['Var', 'Yok', 'Garantisi Bitti']
          }
        },
        {
          name: 'renk',
          label: 'Renk',
          type: FieldType.TEXT,
          placeholder: 'Örn: Siyah, Beyaz, Mavi'
        }
      ]
    },
    {
      name: 'Ev & Bahçe',
      slug: 'ev-bahce',
      description: 'Mobilya, ev eşyaları ve bahçe ürünleri',
      icon: '🪑',
      fields: [
        {
          name: 'kategori',
          label: 'Alt Kategori',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Mobilya', 'Beyaz Eşya', 'Ev Tekstili', 'Mutfak Eşyaları', 'Banyo', 'Aydınlatma', 'Dekorasyon', 'Bahçe', 'Diğer']
          }
        },
        {
          name: 'durum',
          label: 'Ürün Durumu',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü']
          }
        },
        {
          name: 'marka',
          label: 'Marka',
          type: FieldType.TEXT,
          placeholder: 'Ürün markası'
        },
        {
          name: 'renk',
          label: 'Renk',
          type: FieldType.TEXT,
          placeholder: 'Ürün rengi'
        },
        {
          name: 'malzeme',
          label: 'Malzeme',
          type: FieldType.TEXT,
          placeholder: 'Örn: Ahşap, Metal, Plastik'
        }
      ]
    },
    {
      name: 'Moda & Giyim',
      slug: 'moda-giyim',
      description: 'Giyim, ayakkabı, çanta ve aksesuar',
      icon: '👕',
      fields: [
        {
          name: 'kategori',
          label: 'Alt Kategori',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim', 'Ayakkabı', 'Çanta', 'Saat', 'Takı', 'Aksesuar', 'Diğer']
          }
        },
        {
          name: 'beden',
          label: 'Beden',
          type: FieldType.SELECT,
          options: {
            values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
          }
        },
        {
          name: 'marka',
          label: 'Marka',
          type: FieldType.TEXT,
          placeholder: 'Ürün markası'
        },
        {
          name: 'durum',
          label: 'Ürün Durumu',
          type: FieldType.SELECT,
          isRequired: true,
          options: {
            values: ['Sıfır', 'Sıfır Ayarında', 'İyi', 'Orta', 'Kötü']
          }
        },
        {
          name: 'renk',
          label: 'Renk',
          type: FieldType.TEXT,
          placeholder: 'Ürün rengi'
        }
      ]
    }
  ]

  for (const categoryData of categories) {
    const { fields, ...category } = categoryData
    
    const createdCategory = await prisma.category.create({
      data: category
    })

    // Kategori alanlarını oluştur
    for (let i = 0; i < fields.length; i++) {
      await prisma.categoryField.create({
        data: {
          ...fields[i],
          categoryId: createdCategory.id,
          sortOrder: i
        }
      })
    }
  }

  console.log('Seed verileri başarıyla oluşturuldu!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })