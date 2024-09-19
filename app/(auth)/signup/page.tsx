// File: app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import { signup } from '@/app/_lib/auth';
import Turnstile from "react-turnstile";
import AuthLayout from '../auth_components/AuthLayout';
import { ArrowLeft } from 'lucide-react'; // Add this import

function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!captchaToken) {
      setError('Please complete the captcha');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting signup process...');
      const user = await signup(email, password, captchaToken);
      console.log('Signup successful, user:', user);
      setError('');
      setSignupSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Sign Up Successful</h1>
          <p className="mb-4">Please check your email to verify your account.</p>
          <Link href="/signin">
            <Button className="w-full bg-black text-white hover:bg-gray-800">Go to Login Page</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <Link href="/">
          <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-signup">Email</Label>
          <Input 
            id="email-signup" 
            placeholder="Enter your email" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signup">Password</Label>
          <div className="relative">
            <Input
              id="password-signup"
              placeholder="Create a password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        <Turnstile
          sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
          onVerify={(token) => setCaptchaToken(token)}
        />
        <Button className="w-full bg-black text-white hover:bg-gray-800" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </Button>
        <Button className="w-full bg-black text-white hover:bg-gray-800" type="button" variant="outline">
          Sign Up with Google
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        By signing up, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignUpForm;