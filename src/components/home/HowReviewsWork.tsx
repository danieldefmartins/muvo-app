import { ShieldCheck, Search, Zap, X, Check, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HowReviewsWork() {
  return (
    <section className="py-8 sm:py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            How MUVO Reviews Work
          </h2>
          <p className="text-base text-muted-foreground">
            No star ratings. No penalties. Just honest signals.
          </p>
        </div>

        {/* Section 1 - The Tap System */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            THE TAP SYSTEM
          </p>
          <div className="flex items-center gap-2 mb-3">
            <MousePointerClick className="w-14 h-14 text-[#008fc0]" />
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-3">
            Tap, Don't Type
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            Instead of writing long reviews, you simply tap the signals that stood out. 
            Takes <span className="text-xl font-bold text-[#008fc0]">10 seconds</span>. <span className="font-semibold">No essays required.</span>
          </p>
          
          {/* Phone Mockup with Signal Badges */}
          <div className="max-w-xs mx-auto bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg border-4 border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 space-y-2">
              <span className="flex items-center justify-start min-w-[192px] w-48 mx-auto bg-[#008fc0] text-white px-4 py-2 rounded-full text-sm font-medium">
                👍 Level Sites
              </span>
              <span className="flex items-center justify-start min-w-[192px] w-48 mx-auto bg-[#008fc0] text-white px-4 py-2 rounded-full text-sm font-medium">
                👍 Clean Bathrooms
              </span>
              <span className="flex items-center justify-start min-w-[192px] w-48 mx-auto bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⭐ Rustic
              </span>
              <span className="flex items-center justify-start min-w-[192px] w-48 mx-auto bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⭐ Family-Friendly
              </span>
              <span className="flex items-center justify-start min-w-[192px] w-48 mx-auto bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⚠️ Spotty WiFi
              </span>
              <span className="flex items-center justify-start min-w-[192px] w-48 mx-auto bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⚠️ Too Noisy
              </span>
            </div>
          </div>
        </div>

        {/* Section 2 - Why This is Better */}
        <div className="mb-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6 text-center leading-tight">
            Why This Doesn't Punish Businesses
          </h3>

          <div className="space-y-4">
            {/* Problem Card */}
            <div className="bg-white dark:bg-card rounded-xl p-4 border-2 border-red-300 dark:border-red-500/50 relative">
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <X className="w-8 h-8 text-white stroke-[3]" />
              </div>
              <div className="text-4xl mb-2">🏪</div>
              <p className="font-semibold text-base mb-1">Restaurant</p>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500">⭐</span>
                <span className="text-base font-bold">2.0 stars</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Amazing food + slow service = BAD RATING
              </p>
              <p className="text-xs text-red-500 font-medium">
                You miss a great meal
              </p>
            </div>

            {/* Solution Card */}
            <div className="bg-white dark:bg-card rounded-xl p-4 border-2 border-green-300 dark:border-green-500/50 relative">
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-white stroke-[3]" />
              </div>
              <div className="text-4xl mb-2">🏪</div>
              <p className="font-semibold text-base mb-2">Restaurant</p>
              <div className="space-y-1.5 mb-3">
                <div className="bg-[#008fc0] text-white px-3 py-1 rounded-full text-sm inline-block font-medium">
                  👍 Delicious Food <span className="font-bold">×89</span>
                </div>
                <br />
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm inline-block font-medium">
                  ⚠️ Slow Service <span className="font-bold">×12</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                You see both. You decide.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Perfect if you're not in a hurry!
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 - Three Benefit Cards */}
        <div className="space-y-4 mb-8">
          {/* Green Card */}
          <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-foreground mb-1">Businesses Don't Get Penalized</h4>
                <p className="text-sm text-muted-foreground">
                  A few complaints don't tank the whole rating. Good qualities still shine through.
                </p>
              </div>
            </div>
          </div>

          {/* Blue Card */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-[#008fc0]" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-foreground mb-1">You See What Actually Matters</h4>
                <p className="text-sm text-muted-foreground">
                  Spotty WiFi? Only matters if you need to work. Rustic vibe? Only matters if that's your style.
                </p>
              </div>
            </div>
          </div>

          {/* Purple Card */}
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-foreground mb-1">Faster Decisions</h4>
                <p className="text-sm text-muted-foreground">
                  One glance tells you if a place matches your needs. No reading 50 reviews.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compelling Statement */}
        <div className="bg-gradient-to-br from-[#008fc0]/10 to-purple-500/10 rounded-2xl p-6 mb-8 border-2 border-[#008fc0]/20">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
              Reviews That Help Everyone
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Businesses get honest feedback without unfair penalties. 
              You get the real story to make better decisions. 
              <span className="block mt-2 font-semibold text-foreground">That's the MUVO difference.</span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button asChild size="lg" className="w-full sm:w-auto bg-[#008fc0] hover:bg-[#007aa8] text-white">
            <Link to="/places">See It In Action</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Browse real places with real signals
          </p>
        </div>
      </div>
    </section>
  );
}
