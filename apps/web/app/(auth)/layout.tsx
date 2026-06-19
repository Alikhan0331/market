import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Influencer Market">
            <rect width="28" height="28" rx="7" fill="#4F6EF7" />
            <circle cx="9" cy="14" r="3.5" fill="white" />
            <circle cx="19" cy="9" r="2.5" fill="white" opacity="0.8" />
            <circle cx="19" cy="19" r="2.5" fill="white" opacity="0.8" />
            <line x1="12" y1="12.5" x2="17" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="15.5" x2="17" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-zinc-100 font-semibold text-sm tracking-tight">InfluenceMarket</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">Already have an account?</span>
          <Link
            href="/login"
            className="text-zinc-200 hover:text-white font-medium border border-zinc-700 px-3 py-1.5 rounded-md hover:border-zinc-500 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
