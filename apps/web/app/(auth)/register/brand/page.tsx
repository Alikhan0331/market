'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { authApi } from '../../../../lib/api/auth';
import { brandsApi } from '../../../../lib/api/brands';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Separator } from '../../../../components/ui/separator';
import { ChevronLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  companyName: z.string().min(1, 'Company name required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry required'),
  country: z.string().min(1, 'Country required'),
  city: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function handleGoogle() {
    setGoogleLoading(true);
    // Pass role=BRAND via callbackUrl query so the backend Google callback knows the intent
    await signIn('google', { callbackUrl: '/search?registered=brand' });
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const tokens = await authApi.register({
        email: data.email,
        password: data.password,
        role: 'BRAND',
      });

      await brandsApi.createProfile(
        {
          companyName: data.companyName,
          website: data.website || undefined,
          industry: data.industry,
          country: data.country,
          city: data.city || undefined,
        },
        tokens.access_token,
      );

      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push('/search');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to account type
      </Link>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-lg bg-[#4F6EF7]/10 p-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl text-zinc-100">Brand registration</CardTitle>
              <CardDescription className="text-zinc-400 mt-0.5">Set up your brand account to find influencers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">or register with email</span>
            <Separator className="flex-1 bg-zinc-800" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300">Email</Label>
                <Input type="email" placeholder="you@company.com" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('email')} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300">Password</Label>
                <Input type="password" placeholder="Min 8 characters" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('password')} />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300">Company name</Label>
                <Input placeholder="Acme Corp" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('companyName')} />
                {errors.companyName && <p className="text-xs text-red-400">{errors.companyName.message}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300">Website <span className="text-zinc-500 font-normal">(optional)</span></Label>
                <Input placeholder="https://acme.com" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('website')} />
                {errors.website && <p className="text-xs text-red-400">{errors.website.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Industry</Label>
                <Input placeholder="e.g. Fashion, Tech" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('industry')} />
                {errors.industry && <p className="text-xs text-red-400">{errors.industry.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Country</Label>
                <Input placeholder="Kazakhstan" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('country')} />
                {errors.country && <p className="text-xs text-red-400">{errors.country.message}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300">City <span className="text-zinc-500 font-normal">(optional)</span></Label>
                <Input placeholder="Almaty" className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" {...register('city')} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create brand account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
