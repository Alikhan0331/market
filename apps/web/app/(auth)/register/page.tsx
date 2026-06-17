'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
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
        <button
          onClick={() => router.push('/register/brand')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-left hover:border-brand-500 hover:bg-zinc-800/80 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-500/10 p-2 group-hover:bg-brand-500/20">
              <Building2 className="h-5 w-5 text-brand-400" />
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
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-left hover:border-brand-500 hover:bg-zinc-800/80 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-500/10 p-2 group-hover:bg-brand-500/20">
              <User className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">Creator / Influencer</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Get discovered by brands and manage collaboration deals
              </p>
            </div>
          </div>
        </button>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
