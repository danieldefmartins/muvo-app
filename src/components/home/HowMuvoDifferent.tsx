import { ThumbsUp, Star, AlertTriangle } from 'lucide-react';

export function HowMuvoDifferent() {
  return (
    <section className="bg-muted/30 py-10 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center mb-2">
          HOW MUVO IS DIFFERENT SECTION
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
          How MUVO is Different
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Real signals, not confusing star ratings
        </p>

        {/* Example Card */}
        <div className="bg-card rounded-xl overflow-hidden shadow-card border border-border">
          <img
            src="/demo/rv-park-scenic.jpg"
            alt="RV Park example"
            className="w-full h-40 object-cover"
          />
          <div className="p-4 space-y-2">
            {/* Best for - Blue */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-medium">Best for:</span>
                <span>Level Sites</span>
                <span className="font-bold">×62</span>
              </div>
              <span className="text-sm text-muted-foreground">← What's great here?</span>
            </div>
            
            {/* Vibe - Gray */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm">
                <Star className="w-3.5 h-3.5" />
                <span className="font-medium">Vibe:</span>
                <span>Family-Friendly</span>
                <span className="font-bold">×28</span>
              </div>
              <span className="text-sm text-muted-foreground">← What's it like?</span>
            </div>
            
            {/* Heads up - Red */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">Heads up:</span>
                <span>Spotty WiFi</span>
                <span className="font-bold">×18</span>
              </div>
              <span className="text-sm text-muted-foreground">← What are the problems?</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
