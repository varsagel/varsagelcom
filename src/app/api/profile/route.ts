import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Kullanıcı profilini getir
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    console.log('Profile API - Retrieved userId:', userId);
    
    // Kullanıcıyı getir
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        phone: true,
        location: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            offers: true,
            favorites: true,
            reviews: true,
          },
        },
      },
    });
    
    console.log('Profile API - User found:', !!user);
    
    if (!user) {
      console.log('Profile API - User not found in database for userId:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

// Kullanıcı profilini güncelle
export async function PUT(request: NextRequest) {
  try {
    // Kullanıcı ID'sini al
    const userId = await getUserIdFromToken(request.headers);
    
    // Request body'den verileri al
    const body = await request.json();
    const { name, profileImage, phone, location, currentPassword, newPassword } = body;
    
    // Güncellenecek verileri hazırla
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (profileImage) {
      updateData.profileImage = profileImage;
    }
    
    if (phone !== undefined) {
      updateData.phone = phone;
    }
    
    if (location !== undefined) {
      updateData.location = location;
    }
    
    // Şifre değişikliği varsa
    if (currentPassword && newPassword) {
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
      updateData.password = hashedPassword;
    }
    
    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        phone: true,
        location: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}