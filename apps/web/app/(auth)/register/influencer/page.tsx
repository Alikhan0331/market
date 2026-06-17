'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../../../../lib/api/auth';
import { influencersApi } from '../../../../lib/api/influencers';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { X } from 'lucide-react';

const CATEGORIES = [
  'Fashion', 'Beauty', 'Tech', 'Gaming', 'Fitness', 'Food',
  'Travel', 'Lifestyle', 'Finance', 'Education', 'Music', 'Art',
];

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  displayName: z.string().min(1, 'Display name required'),
  country: z.string().min(1, 'Country required'),
  city: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterInfluencerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function onSubmit(data: FormData) {
    if (selectedCategories.length === 0) {
      toast.error('Select at least one category');
      return;
    }
    setLoading(true);
    try {
      const tokens = await authApi.register({
        email: data.email,
        password: data.password,
        role: 'INFLUENCER',
      });

      await influencersApi.createProfile(
        {
          displayName: data.displayName,
          country: data.country,
          city: data.city || undefined,
          categories: selectedCategories,
        },
        tokens.access_token,
      );

      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push('/profile');
    } catch (err: any) {
      toast.error(err?.message ?? 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-xl text-zinc-100">Creator registration</CardTitle>
        <CardDescription className="text-zinc-400">
          Set up your influencer profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input type="email" className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register('email')} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Password</Label>
              <Input type="password" className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register('password')} />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-300">Display name</Label>
              <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register('displayName')} />
              {errors.displayName && <p className="text-xs text-red-400">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Country</Label>
              <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register('country')} />
              {errors.country && <p className="text-xs text-red-400">{errors.country.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">City</Label>
              <Input className="border-zinc-700 bg-zinc-800 text-zinc-100" {...register('city')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-[#4F6EF7] text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create influencer account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
