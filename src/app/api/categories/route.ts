import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Kategorileri getir
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        fields: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        children: {
          where: {
            isActive: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Kategori getirme hatası:', error)
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      { status: 500 }
    )
  }
}

// Yeni kategori oluştur (Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, description, icon, parentId, fields } = body

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        parentId,
        fields: {
          create: fields?.map((field: any, index: number) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            isRequired: field.isRequired || false,
            options: field.options,
            placeholder: field.placeholder,
            validation: field.validation,
            sortOrder: index
          })) || []
        }
      },
      include: {
        fields: true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulamadı' },
      { status: 500 }
    )
  }
}