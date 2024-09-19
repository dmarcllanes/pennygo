import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  console.log('Verifications API GET called');

  // Create authenticated Supabase Client
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.log('No active session found');
    return NextResponse.json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    }, { status: 401 });
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
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  console.log('Admin access confirmed for user:', session.user.id);

  console.log('Fetching verifications');
  const { data: verifications, error: verificationError } = await supabaseAdmin
    .from('organizer_verifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (verificationError) {
    console.error('Error fetching verifications:', verificationError);
    return NextResponse.json({ error: verificationError.message }, { status: 500 });
  }

  // Fetch user profiles
  const userIds = verifications.map(v => v.user_id);
  const { data: userProfiles, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, full_name')
    .in('user_id', userIds);

  if (profileError) {
    console.error('Error fetching user profiles:', profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Fetch user emails
  const { data: users, error: userError } = await supabaseAdmin
    .auth.admin.listUsers();

  if (userError) {
    console.error('Error fetching users:', userError);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Combine verification and user data
  const combinedData = await Promise.all(verifications.map(async v => {
    const userProfile = userProfiles.find(up => up.user_id === v.user_id);
    const user = users.users.find(u => u.id === v.user_id);

    // Generate signed URLs for the private bucket
    const { data: signedUrl1 } = await supabaseAdmin.storage
      .from('valid-ids')
      .createSignedUrl(v.valid_id_1, 60 * 60); // URL valid for 1 hour

    const { data: signedUrl2 } = await supabaseAdmin.storage
      .from('valid-ids')
      .createSignedUrl(v.valid_id_2, 60 * 60); // URL valid for 1 hour

    return {
      ...v,
      user: {
        id: v.user_id,
        email: user?.email,
        full_name: userProfile?.full_name
      },
      valid_id_1_url: signedUrl1?.signedUrl,
      valid_id_2_url: signedUrl2?.signedUrl,
    };
  }));

  console.log('Fetched verifications (API):', combinedData);
  return NextResponse.json(combinedData);
}

export async function POST(req: NextRequest) {
  const { verificationId, status } = await req.json();

  // Create authenticated Supabase Client
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    }, { status: 401 });
  }

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('organizer_verifications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', verificationId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (status === 'approved') {
    const { error: userUpdateError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: data.user_id, role: 'organizer' });

    if (userUpdateError) {
      return NextResponse.json({ error: userUpdateError.message }, { status: 500 });
    }
  }

  return NextResponse.json(data);
}