import { ThumbsUp, Star, AlertTriangle, ArrowLeft } from 'lucide-react';

export function HowMuvoDifferent() {
  return (
    <section className="bg-muted/30 py-8 sm:py-10 px-4">
      <div className="max-w-lg mx-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center mb-2">
          HOW MUVO IS DIFFERENT SECTION
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
          How MUVO is Different
        </h2>
        <p className="text-base text-muted-foreground text-center mb-8">
          Real signals, not confusing star ratings
        </p>

        {/* Example Card with Explanation */}
        <div className="flex gap-4 items-start">
          {/* Card */}
          <div className="flex-1 bg-card rounded-xl overflow-hidden shadow-card border border-border">
            <img
              src="/demo/rv-park-scenic.jpg"
              alt="RV Park example"
              className="w-full h-40 object-cover"
            />
            <div className="p-4 space-y-2">
              {/* Best for - Blue */}
              <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-full text-sm">
                <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Best for:</span>
                <span className="flex-1">Level Sites</span>
                <span className="font-bold">×62</span>
              </div>
              
              {/* Vibe - Gray */}
              <div className="flex items-center gap-2 bg-muted text-foreground px-3 py-2 rounded-full text-sm">
                <Star className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Vibe:</span>
                <span className="flex-1">Family-Friendly</span>
                <span className="font-bold">×28</span>
              </div>
              
              {/* Heads up - Red */}
              <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Heads up:</span>
                <span className="flex-1">Spotty WiFi</span>
                <span className="font-bold">×18</span>
              </div>
            </div>
          </div>

          {/* Explanation Labels */}
          <div className="flex flex-col justify-end pb-4 space-y-2 flex-shrink-0" style={{ marginTop: '160px' }}>
            <div className="flex items-center gap-1 h-[36px]">
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">What&apos;s great here?</span>
            </div>
            <div className="flex items-center gap-1 h-[36px]">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">What&apos;s it like?</span>
            </div>
            <div className="flex items-center gap-1 h-[36px]">
              <ArrowLeft className="w-4 h-4 text-red-600" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">What are the problems?</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
