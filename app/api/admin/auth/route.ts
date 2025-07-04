import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Server-side only - not exposed to browser
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      // Set secure HTTP-only cookie
      const cookieStore = cookies();

      cookieStore.set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout endpoint
  const cookieStore = cookies();

  cookieStore.delete('admin_auth');
  
  return NextResponse.json({ success: true });
} 