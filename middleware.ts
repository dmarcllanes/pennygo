import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware function called');
  const res = NextResponse.next();
  
  try {
    console.log('Creating Supabase client');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    console.log('Supabase client created successfully');

    console.log('Fetching session');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session fetched:', session ? 'Session exists' : 'No session');

    if (req.nextUrl.pathname.startsWith('/admin')) {
      console.log('Checking admin access');
      if (!session) {
        console.log('No session, redirecting to signin');
        return NextResponse.redirect(new URL('/(auth)/signin', req.url));
      }
      console.log('Session exists, allowing admin access');
    }

    return res;
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};