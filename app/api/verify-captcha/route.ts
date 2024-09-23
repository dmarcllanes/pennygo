import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token } = await req.json();
  const secret = process.env.TURNSTILE_SECRET_KEY;

  console.log("Received token:", token);
  console.log("Secret key exists:", !!secret);

  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return NextResponse.json({ success: false, error: 'Server configuration error: TURNSTILE_SECRET_KEY is not set' }, { status: 500 });
  }

  try {
    console.log("Verifying captcha with token:", token);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secret,
        response: token,
      }),
    });

    const data = await response.json();
    console.log("Captcha verification response:", data);

    if (!data.success) {
      console.error("Captcha verification failed:", data['error-codes']);
      return NextResponse.json({ success: false, error: 'Captcha verification failed', details: data['error-codes'] }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Captcha verification error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: 'Captcha verification failed', details: errorMessage }, { status: 500 });
  }
}