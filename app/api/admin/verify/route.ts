import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const adminAuth = cookieStore.get('admin_auth');
    
    const isAuthenticated = adminAuth?.value === 'authenticated';
    
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
} 