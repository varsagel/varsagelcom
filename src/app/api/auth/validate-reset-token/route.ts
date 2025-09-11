import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token gereklidir'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = validateTokenSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 400 }
      )
    }

    const { token } = validationResult.data

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Token geçerli' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Validate token error:', error)
    return NextResponse.json(
      { error: 'Token doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}