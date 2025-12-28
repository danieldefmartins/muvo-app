import { Hand, CheckCircle, Search, Zap, ThumbsUp, AlertTriangle, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HowReviewsWork() {
  return (
    <section className="py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            How MUVO Reviews Work
          </h2>
          <p className="text-muted-foreground">
            No star ratings. No penalties. Just honest signals.
          </p>
        </div>

        {/* The Tap System */}
        <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            THE TAP SYSTEM
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Hand className="w-8 h-8 text-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Tap, Don't Type
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Instead of writing long reviews, you simply tap the signals that stood out. 
            Takes 10 seconds. No essays required.
          </p>
          
          {/* Signal Tags Preview */}
          <div className="mt-6 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                Level Sites 👆
              </span>
              <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                Rustic
              </span>
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                Spotty WiFi 👆
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                Clean Bathrooms
              </span>
              <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                Family-Friendly
              </span>
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                Too Noisy 👆
              </span>
            </div>
          </div>
        </div>

        {/* Why This Doesn't Punish Businesses */}
        <div className="bg-muted/50 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            WHY THIS IS BETTER
          </p>
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Why This Doesn't Punish Businesses
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Star Rating Problem */}
            <div className="bg-card rounded-xl p-4 border border-destructive/30 relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                <X className="w-5 h-5 text-destructive-foreground" />
              </div>
              <div className="text-4xl mb-2">🏪</div>
              <p className="font-semibold text-sm mb-1">Restaurant</p>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-bold">2.0 stars</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Amazing food + slow service = BAD RATING
              </p>
            </div>

            {/* Signal System Solution */}
            <div className="bg-card rounded-xl p-4 border border-primary/30 relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-4xl mb-2">🏪</div>
              <div className="space-y-1 mb-2">
                <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] inline-block">
                  👍 Delicious Food ×89
                </div>
                <div className="bg-yellow-500 text-white px-2 py-0.5 rounded text-[10px] inline-block">
                  ⚠️ Slow Service ×12
                </div>
              </div>
              <p className="text-xs font-semibold">You see both. You decide.</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Businesses Don't Get Penalized</h4>
              <p className="text-sm text-muted-foreground">
                A few complaints don't tank the whole rating. Good qualities still shine through.
              </p>
            </div>
          </div>

          <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">You See What Actually Matters</h4>
              <p className="text-sm text-muted-foreground">
                Spotty WiFi? Only matters if you need to work. Rustic vibe? Only matters if that's your style.
              </p>
            </div>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Faster Decisions</h4>
              <p className="text-sm text-muted-foreground">
                One glance tells you if a place matches your needs. No reading 50 reviews.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="rounded-full px-8 text-lg font-semibold">
            <Link to="/places">See It In Action</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Browse real places with real signals
          </p>
        </div>
      </div>
    </section>
  );
}
