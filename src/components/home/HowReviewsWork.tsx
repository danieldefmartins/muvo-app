import { Hand, CheckCircle, Search, Zap, ThumbsUp, AlertTriangle, X, Check } from 'lucide-react';
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

        {/* The Tap System */}
        <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-6 mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            THE TAP SYSTEM
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Hand className="w-10 h-10 text-foreground" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            Tap, Don't Type
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            Instead of writing long reviews, you simply tap the signals that stood out. 
            Takes 10 seconds. No essays required.
          </p>
          
          {/* Signal Tags Preview - larger on mobile */}
          <div className="mt-6 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                Level Sites 👆
              </span>
              <span className="bg-yellow-500 text-black px-3 py-1.5 rounded-full text-sm font-medium">
                Rustic
              </span>
              <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                Spotty WiFi 👆
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                Clean Bathrooms
              </span>
              <span className="bg-yellow-500 text-black px-3 py-1.5 rounded-full text-sm font-medium">
                Family-Friendly
              </span>
              <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                Too Noisy 👆
              </span>
            </div>
          </div>
        </div>

        {/* Why This Doesn't Punish Businesses */}
        <div className="bg-muted/50 rounded-2xl p-6 mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            WHY THIS IS BETTER
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
            Why This Doesn't Punish Businesses
          </h3>

          {/* Stack vertically on mobile */}
          <div className="flex flex-col gap-4">
            {/* Star Rating Problem */}
            <div className="bg-card rounded-xl p-4 border border-destructive/30 relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                <X className="w-5 h-5 text-destructive-foreground" />
              </div>
              <div className="text-4xl mb-2">🏪</div>
              <p className="font-semibold text-base mb-1">Restaurant</p>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500">⭐</span>
                <span className="text-base font-bold">2.0 stars</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Amazing food + slow service = BAD RATING
              </p>
            </div>

            {/* Signal System Solution */}
            <div className="bg-card rounded-xl p-4 border border-primary/30 relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-4xl mb-2">🏪</div>
              <div className="space-y-1.5 mb-2">
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm inline-block font-medium">
                  👍 Delicious Food <span className="font-bold">×89</span>
                </div>
                <br />
                <div className="bg-red-600 text-white px-3 py-1 rounded text-sm inline-block font-medium">
                  ⚠️ Slow Service <span className="font-bold">×12</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                YOU decide if it's worth it
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Summary */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-foreground mb-1">Businesses Don't Get Penalized</h4>
              <p className="text-sm text-muted-foreground">
                One slow day doesn't tank their rating. Users see nuanced data, not a punishing number.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-foreground mb-1">You See What Actually Matters</h4>
              <p className="text-sm text-muted-foreground">
                Care about level sites? You'll see that signal. Don't care about WiFi? Skip that info.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-base text-foreground mb-1">Faster Decisions</h4>
              <p className="text-sm text-muted-foreground">
                Glance at 3 signal lines and know if this spot is right for you. No scrolling through essays.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/places">See It In Action</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
