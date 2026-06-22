'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, ShieldCheck, Users, Zap, Star, Eye, EyeOff } from 'lucide-react';

function Section({ icon: Icon, title, color, children }: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function Factor({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 h-2 w-2 rounded-full bg-zinc-600 shrink-0" />
      <div>
        <span className="font-medium text-zinc-200">{label}</span>
        <span className="text-zinc-500"> — {description}</span>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">How pricing works</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Our pricing engine estimates fair market rates for each collaboration.
          Here's what we look at — and what we don't reveal.
        </p>
      </div>

      <Section icon={TrendingUp} title="What raises your price" color="text-emerald-400">
        <Factor
          label="Engagement rate"
          description="A high ER signals an active, genuine audience. The more engaged your followers, the more valuable the collaboration."
        />
        <Factor
          label="Niche & industry"
          description="Some markets (luxury, fashion, beauty) command higher rates due to stronger ROI for brands. Your content category is factored into the base."
        />
        <Factor
          label="Reliability score"
          description="Influencers with a strong track record of on-time delivery and consistent work unlock a performance multiplier that increases their High price tier."
        />
        <Factor
          label="Demand signals"
          description="When multiple brands are actively running deals with you, the system detects elevated demand and adjusts pricing accordingly."
        />
        <Factor
          label="Partnership history"
          description="Returning, Trusted, and Exclusive partnership tiers with specific brands improve your match score and signal reliable long-term value."
        />
        <Factor
          label="Verified account"
          description="Verified influencers show up higher in recommendations and unlock additional pricing tiers."
        />
      </Section>

      <Section icon={TrendingDown} title="What holds pricing back" color="text-amber-400">
        <Factor
          label="Low or missing engagement rate"
          description="Without engagement data, or with a below-average ER, the system defaults to conservative estimates."
        />
        <Factor
          label="No deal history"
          description="Until 5+ deals are completed, your Reliability Score is shown as 'New'. This means the performance multiplier stays at neutral (1.0×)."
        />
        <Factor
          label="Verification warning"
          description="Accounts flagged for potential bot activity or anomalies receive a lower pricing tier and reduced visibility."
        />
        <Factor
          label="Niche with lower market demand"
          description="Not all niches carry the same brand ROI. Gaming and education categories typically have lower base rates than luxury or fashion."
        />
      </Section>

      <Section icon={ShieldCheck} title="Reliability score" color="text-[#7B93FA]">
        <p>
          Your Reliability Score is calculated from your deal history — whether you delivered on time,
          responded to offers, and completed deals without cancellations. It takes at least 5 events
          to generate a score.
        </p>
        <p>
          Older events gradually lose weight over time. A cancellation from 18 months ago matters
          much less than one from last week.
        </p>
        <p>
          If you believe an event was recorded incorrectly, you can open a dispute from the deal page.
          A moderator will review both sides.
        </p>
      </Section>

      <Section icon={Zap} title="Demand surge" color="text-amber-400">
        <p>
          If multiple brands have recently accepted or started active deals with you, the system
          recognises elevated demand and applies a temporary price adjustment. This reflects real
          market dynamics — when you're in demand, your time is worth more.
        </p>
        <p className="text-zinc-500 text-xs">
          Demand is measured from genuine accepted deals, not raw offer counts, to prevent gaming.
        </p>
      </Section>

      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <Eye className="h-4 w-4 text-emerald-400" />
          What we show
          <span className="mx-1 text-zinc-700">·</span>
          <EyeOff className="h-4 w-4 text-zinc-500" />
          What we protect
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <p className="text-zinc-400 font-medium">Visible to you</p>
            {[
              'Your follower count & ER',
              'Your niche category',
              'Your deal history (count)',
              'Your reliability score',
              'Your partnership tiers',
              'Market position (above / at / below)',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-zinc-400 font-medium">Protected (not shown)</p>
            {[
              'Exact formula weights',
              'Exact niche multipliers',
              'Fraud detection thresholds',
              'Score decay rate',
              'Competitor exact prices',
              'Demand surge threshold',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/search"
        className="block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
      >
        ← Back to discover
      </Link>
    </div>
  );
}
