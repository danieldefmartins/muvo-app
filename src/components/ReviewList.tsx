import React from 'react';
import { useReviews, useDeleteReview, REVIEW_DIMENSIONS, Review } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { ReviewSignalIcon } from './ReviewSignalIcon';
import { TrustedContributorBadge } from './TrustedContributorBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Loader2, MessageSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ReviewListProps {
  placeId: string;
  onEditReview?: () => void;
}

export function ReviewList({ placeId, onEditReview }: ReviewListProps) {
  const { data: reviews, isLoading } = useReviews(placeId);
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const deleteReview = useDeleteReview();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state is now handled by ReviewsSection
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync({ reviewId, placeId });
      toast({
        title: "Review deleted",
        description: "The review has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const getDimensionLabel = (dimension: string) => {
    return REVIEW_DIMENSIONS.find((d) => d.id === dimension)?.label || dimension;
  };

  return (
    <div className="space-y-4">
      {reviews.map((review: Review) => {
        const isOwner = user?.id === review.user_id;
        const canDelete = isOwner || isAdmin;
        const positiveSignals = review.signals.filter((s) => s.polarity === 'positive');
        const improvementSignals = review.signals.filter((s) => s.polarity === 'improvement');

        return (
          <div key={review.id} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {review.user_display_name || 'Anonymous'}
                </span>
                {review.trusted_contributor && <TrustedContributorBadge />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
                {isOwner && (
                  <Button variant="ghost" size="sm" onClick={onEditReview}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(review.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Signals */}
            <div className="space-y-2">
              {positiveSignals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {positiveSignals.map((signal) => (
                    <div
                      key={signal.dimension}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      <ReviewSignalIcon
                        dimension={signal.dimension}
                        polarity="positive"
                        level={signal.level}
                        selected
                        size="sm"
                      />
                      <span>{getDimensionLabel(signal.dimension)}</span>
                    </div>
                  ))}
                </div>
              )}
              {improvementSignals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {improvementSignals.map((signal) => (
                    <div
                      key={signal.dimension}
                      className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full text-xs"
                    >
                      <ReviewSignalIcon
                        dimension={signal.dimension}
                        polarity="improvement"
                        level={signal.level}
                        selected
                        size="sm"
                      />
                      <span>{getDimensionLabel(signal.dimension)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Public Note */}
            {review.note_public && (
              <p className="text-sm text-foreground">{review.note_public}</p>
            )}

            {/* Private Note (only for admin) */}
            {isAdmin && review.note_private && (
              <div className="bg-muted/50 p-2 rounded text-sm">
                <span className="text-xs font-medium text-muted-foreground">Private note: </span>
                {review.note_private}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
