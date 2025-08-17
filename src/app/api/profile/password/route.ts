import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { getUserId } from '@/lib/auth';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Kullanıcı şifresini güncelle
export async function PUT(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = getUserId(request.headers);
    
    // Request body'den verileri al
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    // Gerekli alanları kontrol et
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }
    
    // Kullanıcıyı getir
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Mevcut şifreyi doğrula
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Kullanıcının şifresini güncelle
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
    
    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating password' },
      { status: 500 }
    );
  }
}