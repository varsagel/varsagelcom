import { NextRequest, NextResponse } from 'next/server'

// Geçici olarak NextAuth devre dışı - veritabanı bağlantısı olmadığı için
export async function GET(request: NextRequest) {
  return NextResponse.json({ user: null }, { status: 200 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ user: null }, { status: 200 })
}