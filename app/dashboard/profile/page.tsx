'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { checkUserSession, updateUser, UserSessionResult } from '@/app/_lib/auth';
import { Mail, Clock, Edit2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from '@/app/_lib/supabase';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ExtendedUser extends User {
  profile?: {
    avatar_url?: string;
    full_name?: string;
  };
}

export default function UserProfile() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [signedAvatarUrl, setSignedAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const result: UserSessionResult = await checkUserSession();
      console.log('Fetched user data:', result);
      if (result.user) {
        setUser(result.user);
        setNewName(result.user.user_metadata?.full_name || '');
        
        if (result.user.user_metadata?.avatar_url) {
          const { data } = await supabase.storage
            .from('avatars')
            .createSignedUrl(result.user.user_metadata.avatar_url.split('/').pop()!, 3600);
          setSignedAvatarUrl(data?.signedUrl || null);
        }
      }
    };
    fetchUser();
  }, []);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Uploaded avatar URL:', publicUrl);

      // Update auth.users metadata
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateUserError) {
        throw updateUserError;
      }

      // Update user_profiles table
      const { error: updateProfileError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateProfileError) {
        throw updateProfileError;
      }

      // Refresh user data
      const result = await checkUserSession();
      if (result.user) {
        setUser(result.user);
        if (result.user.user_metadata?.avatar_url) {
          setSignedAvatarUrl(result.user.user_metadata.avatar_url);
        }
      }
    } catch (error) {
      alert('Error uploading avatar!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { success, user: updatedUser } = await updateUser(newName, user.profile?.avatar_url || null);
      
      if (success && updatedUser) {
        setUser(updatedUser as ExtendedUser);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile!');
    }
  };

  if (!user) return <LoadingSpinner />;

  const fullName = user.user_metadata?.full_name || 'User';
  
  // Format the created_at date with date and time
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })
    : 'Date unavailable';

  // Format the last_sign_in_at date with date and time
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })
    : 'No sign-in recorded';

  console.log('User data:', user); // Keep this line to check the user object

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4 font-sans" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <Card className="w-full max-w-2xl shadow-xl bg-white/80 backdrop-blur-md">
        <CardHeader className="pb-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={signedAvatarUrl || "/placeholder.svg?height=100&width=100"} alt={fullName} />
                <AvatarFallback>{fullName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <label htmlFor="single" className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer">
                <Edit2 className="w-4 h-4" />
              </label>
              <input
                style={{
                  visibility: 'hidden',
                  position: 'absolute'
                }}
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
              />
            </div>
            <div>
              {isEditing ? (
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-2xl font-bold text-gray-800"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
              )}
              <p className="text-sm text-gray-500">Member since: {createdAt}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 mt-6">
          <div className="grid grid-cols-[24px_1fr] items-center gap-4">
            <Mail className="text-blue-500" />
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="grid grid-cols-[24px_1fr] items-center gap-4">
            <Clock className="text-blue-500" />
            <p className="text-gray-600">Last sign in: {lastSignIn}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 mt-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">User ID</h2>
            <p className="text-xs text-gray-600 break-all">{user.id}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          {isEditing ? (
            <Button onClick={handleSaveProfile} className="bg-teal-600 hover:bg-teal-700 text-white">
              Save Profile
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="text-teal-600 hover:text-teal-700 border-teal-200">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
          <Button variant="ghost" className="text-teal-600 hover:text-teal-700" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}