import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Callback route accessed', { code })

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session', error)
      return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
    }

    // Check if the user's email is verified
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error getting user', userError)
      return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
    }

    console.log('User data', user)
    
    if (user && user.email_confirmed_at) {
      console.log('Email confirmed, redirecting to login')
      return NextResponse.redirect(new URL('/signin?verified=true', requestUrl.origin))
    } else {
      console.log('Email not confirmed, redirecting to email confirmation')
      return NextResponse.redirect(new URL('/auth/email-confirmation', requestUrl.origin))
    }
  }

  console.log('No code provided, redirecting to home')
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}