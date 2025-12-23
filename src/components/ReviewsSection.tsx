import React, { useState, useEffect } from 'react';
import { MessageSquareText, MapPin, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewHelper } from './ReviewHelper';
import { PlaceSignalSummary } from './PlaceSignalSummary';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { ReviewFooterMessage } from './ReviewFooterMessage';
import { useReviews, useMyReview, usePlaceReviewCount } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type PlaceCategory = Database['public']['Enums']['place_category'];

interface ReviewsSectionProps {
  placeId: string;
  placeName: string;
  placeCategory?: PlaceCategory;
  // Optional location info - will show GPS if not provided
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

const FIRST_REVIEW_CELEBRATION_KEY = 'first-review-celebrated';

export function ReviewsSection({
  placeId,
  placeName,
  placeCategory,
  city,
  state,
  latitude,
  longitude,
}: ReviewsSectionProps) {
  const { user, isVerified } = useAuth();
  const { data: reviews, isLoading } = useReviews(placeId);
  const { data: myReview } = useMyReview(placeId);
  const { data: reviewCount } = usePlaceReviewCount(placeId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showFirstReviewCelebration, setShowFirstReviewCelebration] = useState(false);
  const [justSubmittedFirst, setJustSubmittedFirst] = useState(false);

  const hasReviews = reviews && reviews.length > 0;
  const isFirstReview = !hasReviews && !isLoading;

  // Check if we just submitted the first review
  useEffect(() => {
    if (hasReviews && reviews.length === 1) {
      const celebratedKey = `${FIRST_REVIEW_CELEBRATION_KEY}-${placeId}`;
      const alreadyCelebrated = sessionStorage.getItem(celebratedKey);
      if (!alreadyCelebrated) {
        setShowFirstReviewCelebration(true);
        sessionStorage.setItem(celebratedKey, 'true');
      }
    }
  }, [hasReviews, reviews?.length, placeId]);

  // Format location string
  const getLocationString = () => {
    if (city && state) {
      return `${city}, ${state}`;
    }
    if (state) {
      return state;
    }
    if (latitude && longitude) {
      return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
    }
    return null;
  };

  const locationString = getLocationString();

  const handleReviewSuccess = () => {
    if (isFirstReview) {
      setJustSubmittedFirst(true);
    }
    setShowReviewForm(false);
  };

  return (
    <section className="mb-6 animate-fade-in" style={{ animationDelay: '275ms' }}>
      {/* Section Header with Location */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-primary" />
            Reviews
          </h2>
          {reviewCount !== undefined && reviewCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </div>
        {locationString && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {placeName} – {locationString}
            </span>
          </div>
        )}
      </div>

      {/* Review Helper Banner - Always visible */}
      <ReviewHelper className="mb-4" />

      {/* First Review Celebration */}
      {(showFirstReviewCelebration || justSubmittedFirst) && hasReviews && (
        <div className="animate-fade-in flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg mb-4">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">First review added!</p>
            <p className="text-sm text-muted-foreground">
              This place now has real community feedback
            </p>
          </div>
        </div>
      )}

      {/* Signal Summary - Known for / Common issues (hide review count since we show it in header) */}
      {hasReviews && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <PlaceSignalSummary placeId={placeId} showReviewCount={false} />
        </div>
      )}

      {/* Empty State or Review Button */}
      {isFirstReview && !showReviewForm && user && isVerified && (
        <div className="text-center py-8 px-4 bg-secondary/30 border border-dashed border-border rounded-lg mb-4">
          <Heart className="w-10 h-10 mx-auto mb-3 text-primary/60" />
          <h3 className="font-medium text-foreground mb-1">
            Be the first to help other travelers
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share an honest review of this place
          </p>
          <Button onClick={() => setShowReviewForm(true)} className="min-w-[180px]">
            Leave the first review
          </Button>
        </div>
      )}

      {/* Empty state for non-verified or logged out users */}
      {isFirstReview && !showReviewForm && (!user || !isVerified) && (
        <div className="text-center py-8 px-4 bg-secondary/30 border border-dashed border-border rounded-lg mb-4">
          <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
          <h3 className="font-medium text-foreground mb-1">
            No reviews yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share your real experience
          </p>
        </div>
      )}

      {/* Write/Edit Review Button (when reviews exist) */}
      {hasReviews && user && isVerified && !showReviewForm && (
        <Button
          onClick={() => setShowReviewForm(true)}
          variant="outline"
          className="w-full mb-4"
        >
          {myReview ? 'Edit Your Review' : 'Write a Review'}
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          {/* First review encouragement */}
          {isFirstReview && (
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mb-4">
              <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                There's no perfect place — share what stood out for you
              </p>
            </div>
          )}
          <ReviewForm
            placeId={placeId}
            placeCategory={placeCategory}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Review List */}
      {hasReviews && (
        <ReviewList
          placeId={placeId}
          onEditReview={() => setShowReviewForm(true)}
        />
      )}

      {/* Footer Message */}
      <ReviewFooterMessage />
    </section>
  );
}
