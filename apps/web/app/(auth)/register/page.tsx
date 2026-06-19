'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Building2, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-zinc-100">Create account</CardTitle>
        <CardDescription className="text-zinc-400">
          Choose your account type to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role selection */}
        <button
          onClick={() => router.push('/register/brand')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-left hover:border-[#4F6EF7] hover:bg-zinc-800/80 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-[#4F6EF7]/10 p-2 group-hover:bg-[#4F6EF7]/20 transition-colors">
              <Building2 className="h-5 w-5 text-[#4F6EF7]" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">Brand</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Find and collaborate with influencers for your campaigns
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/register/influencer')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-left hover:border-[#4F6EF7] hover:bg-zinc-800/80 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-[#4F6EF7]/10 p-2 group-hover:bg-[#4F6EF7]/20 transition-colors">
              <User className="h-5 w-5 text-[#4F6EF7]" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">Creator / Influencer</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Get discovered by brands and manage collaboration deals
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Separator className="flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-500">or sign up quick</span>
          <Separator className="flex-1 bg-zinc-800" />
        </div>

        {/* Google quick signup — role set via Google callback */}
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/search' })}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4F6EF7] hover:text-[#7B93FA] underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
