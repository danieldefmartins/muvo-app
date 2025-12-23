import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ReviewSignalIcon } from './ReviewSignalIcon';
import {
  REVIEW_DIMENSIONS,
  ReviewDimension,
  ReviewSignal,
  useCreateReview,
  useUpdateReview,
  useMyReview,
} from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ReviewFormProps {
  placeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ placeId, onSuccess, onCancel }: ReviewFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: existingReview, isLoading: loadingExisting } = useMyReview(placeId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const [positiveSignals, setPositiveSignals] = useState<Map<ReviewDimension, number>>(new Map());
  const [improvementSignals, setImprovementSignals] = useState<Map<ReviewDimension, number>>(new Map());
  const [notePublic, setNotePublic] = useState('');
  const [notePrivate, setNotePrivate] = useState('');

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      setNotePublic(existingReview.note_public || '');
      setNotePrivate(existingReview.note_private || '');
      
      const posMap = new Map<ReviewDimension, number>();
      const impMap = new Map<ReviewDimension, number>();
      
      existingReview.signals.forEach((s: ReviewSignal) => {
        if (s.polarity === 'positive') {
          posMap.set(s.dimension, s.level);
        } else {
          impMap.set(s.dimension, s.level);
        }
      });
      
      setPositiveSignals(posMap);
      setImprovementSignals(impMap);
    }
  }, [existingReview]);

  if (!profile?.is_verified) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">Only verified users can write reviews.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Verify your email and phone to unlock this feature.
        </p>
      </div>
    );
  }

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handlePositiveClick = (dimension: ReviewDimension) => {
    // Can't select if already in improvement
    if (improvementSignals.has(dimension)) {
      toast({
        title: "Already marked for improvement",
        description: "Remove from improvements first",
        variant: "destructive",
      });
      return;
    }

    const current = positiveSignals.get(dimension);
    const newMap = new Map(positiveSignals);

    if (!current) {
      // Check limit
      if (positiveSignals.size >= 5) {
        toast({
          title: "Limit reached",
          description: "You can select up to 5 strengths",
          variant: "destructive",
        });
        return;
      }
      newMap.set(dimension, 1);
    } else if (current < 3) {
      newMap.set(dimension, current + 1);
    } else {
      newMap.delete(dimension);
    }

    setPositiveSignals(newMap);
  };

  const handleImprovementClick = (dimension: ReviewDimension) => {
    // Can't select if already in positive
    if (positiveSignals.has(dimension)) {
      toast({
        title: "Already marked as strength",
        description: "Remove from strengths first",
        variant: "destructive",
      });
      return;
    }

    const current = improvementSignals.get(dimension);
    const newMap = new Map(improvementSignals);

    if (!current) {
      // Check limit
      if (improvementSignals.size >= 2) {
        toast({
          title: "Limit reached",
          description: "You can select up to 2 improvements",
          variant: "destructive",
        });
        return;
      }
      newMap.set(dimension, 1);
    } else if (current < 3) {
      newMap.set(dimension, current + 1);
    } else {
      newMap.delete(dimension);
    }

    setImprovementSignals(newMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const signals: ReviewSignal[] = [
      ...Array.from(positiveSignals.entries()).map(([dimension, level]) => ({
        dimension,
        polarity: 'positive' as const,
        level,
      })),
      ...Array.from(improvementSignals.entries()).map(([dimension, level]) => ({
        dimension,
        polarity: 'improvement' as const,
        level,
      })),
    ];

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          placeId,
          notePublic,
          notePrivate,
          signals,
        });
        toast({
          title: "Review updated",
          description: "Your review has been saved",
        });
      } else {
        await createReview.mutateAsync({
          placeId,
          notePublic,
          notePrivate,
          signals,
        });
        toast({
          title: "Review submitted",
          description: "Thanks for sharing your experience!",
        });
      }
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save review",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createReview.isPending || updateReview.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section A: Strengths */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            What was GREAT here? (Pick up to 5)
          </Label>
          <span className="text-sm text-muted-foreground">
            {positiveSignals.size} / 5 selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap to cycle: Good → Great → Excellent → Off
        </p>
        <div className="grid grid-cols-5 gap-2">
          {REVIEW_DIMENSIONS.map((dim) => (
            <ReviewSignalIcon
              key={dim.id}
              dimension={dim.id}
              polarity="positive"
              level={positiveSignals.get(dim.id) || 0}
              selected={positiveSignals.has(dim.id)}
              onClick={() => handlePositiveClick(dim.id)}
              size="md"
              showLabel
              label={dim.label}
            />
          ))}
        </div>
      </div>

      {/* Section B: Improvements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            What needs IMPROVEMENT? (Pick up to 2)
          </Label>
          <span className="text-sm text-muted-foreground">
            {improvementSignals.size} / 2 selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap to cycle: Needs work → Could be better → Major issue → Off
        </p>
        <div className="grid grid-cols-5 gap-2">
          {REVIEW_DIMENSIONS.map((dim) => (
            <ReviewSignalIcon
              key={dim.id}
              dimension={dim.id}
              polarity="improvement"
              level={improvementSignals.get(dim.id) || 0}
              selected={improvementSignals.has(dim.id)}
              onClick={() => handleImprovementClick(dim.id)}
              size="md"
              showLabel
              label={dim.label}
            />
          ))}
        </div>
      </div>

      {/* Optional Comments */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="note-public">Note for future visitors (optional)</Label>
          <Textarea
            id="note-public"
            value={notePublic}
            onChange={(e) => setNotePublic(e.target.value.slice(0, 250))}
            placeholder="Share tips or experiences for other travelers..."
            className="resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notePublic.length} / 250
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note-private">Private note for the owner (optional)</Label>
          <Textarea
            id="note-private"
            value={notePrivate}
            onChange={(e) => setNotePrivate(e.target.value.slice(0, 250))}
            placeholder="Feedback only visible to the owner or admin..."
            className="resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notePrivate.length} / 250
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
