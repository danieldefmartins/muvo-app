import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewHowItWorksModal } from './ReviewHowItWorksModal';

const STORAGE_KEY = 'review-tutorial-dismissed';

interface ReviewHelperProps {
  className?: string;
}

export function ReviewHelper({ className }: ReviewHelperProps) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismissForever = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <>
      <div className={`bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-3 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                A better way to review
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap icons to show what was great or needs improvement
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="text-xs text-primary hover:text-primary hover:bg-primary/10 h-auto py-1 px-2 flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </Button>
        </div>
      </div>

      <ReviewHowItWorksModal
        open={showModal}
        onOpenChange={setShowModal}
        onDismissForever={!dismissed ? handleDismissForever : undefined}
      />
    </>
  );
}

// Small help button to reopen the modal
export function ReviewHelpButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        aria-label="How reviews work"
      >
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
      </button>

      <ReviewHowItWorksModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}
