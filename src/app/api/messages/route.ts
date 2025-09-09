import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMessageSchema = z.object({
  receiverId: z.string().min(1, 'Alıcı ID gereklidir'),
  content: z.string().min(1, 'Mesaj içeriği gereklidir'),
  offerId: z.string().optional()
})

// GET - Kullanıcının mesajlarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (conversationId) {
      // Belirli bir konuşmanın mesajlarını getir
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (!conversation) {
        return NextResponse.json(
          { error: 'Konuşma bulunamadı' },
          { status: 404 }
        )
      }

      // Kullanıcının bu konuşmaya katılımcı olup olmadığını kontrol et
      const isParticipant = conversation.participants.some(
        participant => participant.id === session.user.id
      )

      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Bu konuşmaya erişim yetkiniz yok' },
          { status: 403 }
        )
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.message.count({ where: { conversationId } })
      ])

      // Mesajları okundu olarak işaretle
      await prisma.message.updateMany({
        where: {
          conversationId,
          userId: { not: session.user.id },
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        conversation,
        messages: messages.reverse(), // Eski mesajlar önce gelsin
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } else {
      // Kullanıcının tüm konuşmalarını getir
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: session.user.id
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          offer: {
            select: {
              id: true,
              price: true,
              status: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              messages: {
                where: {
                  userId: { not: session.user.id },
                  isRead: false
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Mesajlar getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Mesajlar getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni mesaj gönder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Alıcı kontrolü
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId },
      select: { id: true, name: true, email: true }
    })

    if (!receiver) {
      return NextResponse.json(
        { error: 'Alıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Kendine mesaj gönderme kontrolü
    if (validatedData.receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendinize mesaj gönderemezsiniz' },
        { status: 400 }
      )
    }

    // Teklif kontrolü (eğer varsa)
    let offer = null
    if (validatedData.offerId) {
      offer = await prisma.offer.findUnique({
        where: { id: validatedData.offerId },
        select: { id: true, price: true, userId: true, status: true }
      })

      if (!offer) {
        return NextResponse.json(
          { error: 'Teklif bulunamadı' },
          { status: 404 }
        )
      }
    }

    // Mevcut konuşmayı bul veya yeni oluştur
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { id: session.user.id }
            }
          },
          {
            participants: {
              some: { id: validatedData.receiverId }
            }
          },
          validatedData.offerId ? {
          offerId: validatedData.offerId
        } : {}
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!conversation && validatedData.offerId) {
      // Yeni konuşma oluştur
      conversation = await prisma.conversation.create({
        data: {
          offerId: validatedData.offerId,
          participants: {
            connect: [
              { id: session.user.id },
              { id: validatedData.receiverId }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
    }

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        userId: session.user.id,
        conversationId: conversation.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            offer: {
              select: {
                id: true,
                price: true
              }
            }
          }
        }
      }
    })

    // Konuşmanın son güncelleme zamanını güncelle
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Mesaj gönderilirken hata:', error)
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}