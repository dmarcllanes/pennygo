import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define a custom type for the admin user
interface AdminUser {
  id: string;
  role: string;
  // Add other properties as needed
}

// Custom type guard
function isAdminUser(user: any): user is AdminUser {
  return user && typeof user.role === 'string';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create a Supabase client authenticated with the user's session
  const supabase = createRouteHandlerClient({ cookies });

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if the user is an admin
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(session.user.id);
  
  if (!userData || !isAdminUser(userData.user) || userData.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Your existing logic for handling verifications
  // ...

  res.status(200).json({ message: 'Verifications processed' });
}