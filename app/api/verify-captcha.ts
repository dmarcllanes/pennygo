import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { captchaToken } = req.body;

    try {
      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: captchaToken,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false, message: 'CAPTCHA verification failed' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error verifying CAPTCHA' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}