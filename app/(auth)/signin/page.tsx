'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/app/_lib/auth';  // Make sure this path is correct
import Turnstile from "react-turnstile";
import AuthLayout from '../auth_components/AuthLayout';

// Update the global declaration to match the expected type
declare global {
  interface Window {
    turnstile: {
      ready: (callback: () => void) => void;
      render: (selector: string, options: any) => void;
    };
  }
}

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!captchaToken) {
      setError('Please complete the captcha');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with captcha token:", captchaToken);
      const loginResult = await login(email, password, captchaToken);
      console.log("Login result:", loginResult);
      if (loginResult && loginResult.user) {
        console.log("Login successful, redirecting to dashboard");
        router.push('/dashboard');
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <Link href="/">
          <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-signin">Email</Label>
          <Input 
            id="email-signin" 
            placeholder="Enter your email" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signin">Password</Label>
          <div className="relative">
            <Input
              id="password-signin"
              placeholder="Enter your password"
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
          onVerify={(token) => {
            console.log("Captcha token received:", token);
            setCaptchaToken(token);
          }}
        />
        <Button className="w-full bg-black text-white hover:bg-gray-800" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
        <Button className="w-full bg-black text-white hover:bg-gray-800" type="button" variant="outline">
          Sign In with Google
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignInForm;