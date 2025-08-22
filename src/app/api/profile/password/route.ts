import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/auth';
import bcrypt from 'bcrypt';


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
    const supabase = createSupabaseServerClient();

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userData;
    
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
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
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