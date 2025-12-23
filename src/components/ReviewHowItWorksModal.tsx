import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface ReviewHowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissForever?: () => void;
}

export function ReviewHowItWorksModal({
  open,
  onOpenChange,
  onDismissForever,
}: ReviewHowItWorksModalProps) {
  const handleGotIt = () => {
    onDismissForever?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">How Reviews Work</DialogTitle>
          <DialogDescription>
            A simpler way to share what matters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Tap an icon</h4>
              <p className="text-sm text-muted-foreground">
                Each tap increases intensity:
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-muted-foreground">Good</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">Great</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary font-semibold">Excellent</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Pick what matters</h4>
              <p className="text-sm text-muted-foreground">
                Select up to <span className="text-primary font-medium">5 strengths</span> and{' '}
                <span className="text-amber-500 font-medium">2 improvements</span>
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">What was great</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ThumbsDown className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">What needs work</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Comments are optional</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Add a note if you want — or just tap Submit
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleGotIt} className="w-full">
            Got it!
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You can always reopen this from the "?" icon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
