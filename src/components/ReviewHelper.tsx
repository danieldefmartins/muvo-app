import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { ReviewHowItWorksModal } from './ReviewHowItWorksModal';

const STORAGE_KEY = 'review-tutorial-seen';

interface ReviewHelperProps {
  className?: string;
  autoShowOnFirstTime?: boolean;
  onStartReview?: () => void;
  onSkip?: () => void;
}

export function ReviewHelper({ 
  className, 
  autoShowOnFirstTime = false,
  onStartReview,
  onSkip 
}: ReviewHelperProps) {
  const [showModal, setShowModal] = useState(false);

  // Show modal when autoShowOnFirstTime becomes true
  useEffect(() => {
    if (autoShowOnFirstTime) {
      setShowModal(true);
    }
  }, [autoShowOnFirstTime]);

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      // Mark as seen when modal closes
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const handleStartReview = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onStartReview?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onSkip?.();
  };

  return (
    <ReviewHowItWorksModal
      open={showModal}
      onOpenChange={handleModalClose}
      onStartReview={handleStartReview}
      onSkip={handleSkip}
    />
  );
}

// Small help button to reopen the modal
export function ReviewHelpButton({ className }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors ${className}`}
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