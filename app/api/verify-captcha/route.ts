import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token } = await req.json();
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  const verificationResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    }
  );

  const verificationResult = await verificationResponse.json();

  return NextResponse.json(verificationResult);
}