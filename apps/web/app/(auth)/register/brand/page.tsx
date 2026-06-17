'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../../../../lib/api/auth';
import { brandsApi } from '../../../../lib/api/brands';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
    } catch (err: any) {
      toast.error(err?.message ?? 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100">Brand registration</CardTitle>
        <CardDescription className="text-zinc-400">
          Set up your brand account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Password</Label>
              <Input
                type="password"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Company name</Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register('companyName')}
              />
              {errors.companyName && <p className="text-xs text-red-400">{errors.companyName.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Website</Label>
              <Input
                placeholder="https://"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register('website')}
              />
              {errors.website && <p className="text-xs text-red-400">{errors.website.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Industry</Label>
              <Input
                placeholder="e.g. Fashion, Tech"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register('industry')}
              />
              {errors.industry && <p className="text-xs text-red-400">{errors.industry.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Country</Label>
              <Input
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                {...register('country')}
              />
              {errors.country && <p className="text-xs text-red-400">{errors.country.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create brand account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
