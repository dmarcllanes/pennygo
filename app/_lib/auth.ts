// app/_lib/auth.ts
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Define a custom user type that includes the profile
export interface ExtendedUser extends User {
  isAdmin?: boolean;
  profile?: {
    avatar_url?: string;
    full_name?: string;
  };
}

// Add this type definition at the top of the file
export type UserSessionResult = {
  user: ExtendedUser | null;
  isAdmin: boolean | null;
  error: string | null;
};

// Remove the supabaseAdmin client creation

export async function login(email: string, password: string, captchaToken: string) {
  try {
    // Verify the captcha token
    const captchaVerification = await verifyCaptcha(captchaToken);
    if (!captchaVerification.success) {
      throw new Error('Captcha verification failed');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // After successful login, fetch the extended user data
    const extendedUser = await checkUserSession();
    return extendedUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function signup(email: string, password: string, captchaToken: string) {
  console.log('Attempting signup with:', email);
  try {
    // Verify the captcha token
    const captchaVerification = await verifyCaptcha(captchaToken);
    if (!captchaVerification.success) {
      throw new Error('Captcha verification failed');
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }

    if (data.user) {
      // Create user role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'user' });

      if (roleError) {
        console.error('Error creating user role:', roleError);
      }

      console.log('Signup successful, user data:', data.user);
      
      return {
        user: data.user,
        message: "Signup successful. Please check your email for confirmation."
      };
    } else {
      console.error('Signup failed: No user data returned');
      throw new Error('Signup failed: No user data returned');
    }
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    throw error;
  }
}

async function verifyCaptcha(token: string) {
  const response = await fetch('/api/verify-captcha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return response.json();
}

// Modify the checkUserSession function to return UserSessionResult
export async function checkUserSession(): Promise<UserSessionResult> {
  try {
    console.log('Checking user session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { user: null, isAdmin: null, error: error.message };
    }

    if (!session) {
      console.log('No active session found');
      return { user: null, isAdmin: null, error: null };
    }

    const user = session.user;
    console.log('User from session:', user.id);

    // Log the structure of the admin_users table
    const { data: tableInfo, error: tableError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    console.log('admin_users table structure:', tableInfo);
    if (tableError) console.error('Error fetching admin_users table info:', tableError);

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id);

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return { user: null, isAdmin: null, error: null };
    }

    console.log('Admin data for current user:', adminData);

    const isAdmin = Array.isArray(adminData) && adminData.length > 0;
    console.log('Is admin:', isAdmin);

    // Construct and return the ExtendedUser object
    const extendedUser: ExtendedUser = {
      ...user,
      isAdmin,
      profile: {
        avatar_url: user.user_metadata?.avatar_url,
        full_name: user.user_metadata?.full_name,
      },
    };

    return { user: extendedUser, isAdmin, error: null };
  } catch (error) {
    console.error('Error checking user session:', error);
    return { user: null, isAdmin: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getPendingOrganizerVerifications() {
  const user = await checkUserSession();
  
  if (!user || !user.isAdmin) {
    console.error('Unauthorized access attempt');
    throw new Error('Unauthorized access');
  }

  try {
    console.log('Fetching verifications from API...');
    const response = await fetch('/api/admin/verifications');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch verifications:', response.status, errorText);
      throw new Error(`Failed to fetch verifications: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Fetched verifications from API:', data);

    return data || [];
  } catch (error) {
    console.error('Error in getPendingOrganizerVerifications:', error);
    throw error;
  }
}

export async function updateOrganizerVerification(verificationId: string, status: 'approved' | 'rejected') {
  const user = await checkUserSession();
  
  if (!user || !user.isAdmin) {
    throw new Error('Unauthorized access');
  }

  const response = await fetch('/api/admin/verifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ verificationId, status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update verification');
  }

  const data = await response.json();
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  // Optionally, you can redirect the user to the login page or home page after logout
  // window.location.href = '/login'; // or '/' for home page
}

export async function updateUser(fullName: string, avatar_url: string | null) {
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, avatar_url: avatar_url }
  });

  if (error) {
    console.error('Error updating user:', error.message);
    return { success: false, error: error.message };
  }

  // Fetch the updated user data
  const { data: { user }, error: fetchError } = await supabase.auth.getUser();

  if (fetchError) {
    console.error('Error fetching updated user:', fetchError.message);
    return { success: false, error: fetchError.message };
  }

  return { success: true, user };
}

export async function makeUserAdmin(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .insert({ user_id: userId });

  if (error) {
    console.error('Error making user admin:', error);
    throw error;
  }

  return data;
}