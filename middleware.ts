import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthApiError } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  console.log('Middleware executing for path:', req.nextUrl.pathname);
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('Session:', session ? 'Session found' : 'No session');

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        console.log('No session found, redirecting to signin');
        return NextResponse.redirect(new URL('/(auth)/signin', req.url));
      }

      const user = session.user;
      console.log('User ID:', user.id);

      console.log('Checking if user is admin...');
      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Admin data:', adminData);
      console.log('Admin error:', adminError);

      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }

      if (!adminData) {
        console.log('User is not an admin, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }

      console.log('User is an admin, allowing access');
      return res;
    }

    console.log('Middleware allowing access');
    return res;
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 400) {
      console.log('Invalid or expired session, redirecting to signin');
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    console.error('Unexpected error in middleware:', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};