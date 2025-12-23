import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MousePointerClick, Zap, MessageSquare, Send } from 'lucide-react';

interface ReviewHowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartReview?: () => void;
  onSkip?: () => void;
}

export function ReviewHowItWorksModal({
  open,
  onOpenChange,
  onStartReview,
  onSkip,
}: ReviewHowItWorksModalProps) {
  const handleStartReview = () => {
    onStartReview?.();
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">How Reviews Work</DialogTitle>
          <DialogDescription>
            Fast, simple, and more honest than stars
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-0.5">Pick what stood out</h4>
              <p className="text-sm text-muted-foreground">
                Choose up to <span className="text-primary font-medium">5 Good</span> stamps and up to{' '}
                <span className="text-amber-500 font-medium">2 Needs Work</span> stamps.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-0.5">Tap to set strength</h4>
              <p className="text-sm text-muted-foreground">
                Tap a stamp to rate it: <span className="text-muted-foreground">Good</span> →{' '}
                <span className="text-primary">Great</span> →{' '}
                <span className="text-primary font-semibold">Excellent</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (tap again to increase)
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-0.5">Optional comments</h4>
              <p className="text-sm text-muted-foreground">
                Add a quick note for other travelers (optional).
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-0.5">Submit</h4>
              <p className="text-sm text-muted-foreground">
                Tap Submit Review — we update the place instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleStartReview} className="w-full">
            Start Review
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
            Skip
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          You can reopen this anytime from the ? button.
        </p>
      </DialogContent>
    </Dialog>
  );
}