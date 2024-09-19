import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Verifications API called with method:', req.method);

  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log('No active session found');
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    });
  }

  console.log('Session found for user:', session.user.id);

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (adminError || !adminData) {
    console.log('User is not an admin:', session.user.id);
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  console.log('Admin access confirmed for user:', session.user.id);

  if (req.method === 'GET') {
    console.log('Fetching pending verifications');
    const { data, error } = await supabaseAdmin
      .from('organizer_verifications')
      .select(`
        *,
        users:user_id (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching verifications:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Fetched verifications (API):', data);
    return res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { verificationId, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('organizer_verifications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', verificationId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (status === 'approved') {
      const { error: userUpdateError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: data.user_id, role: 'organizer' });

      if (userUpdateError) {
        return res.status(500).json({ error: userUpdateError.message });
      }
    }

    return res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}