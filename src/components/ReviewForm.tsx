import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { StampButton } from './StampButton';
import { ReviewHelpButton } from './ReviewHelper';
import {
  ReviewSignal,
  useCreateReview,
  useUpdateReview,
  useMyReview,
} from '@/hooks/useReviews';
import { useStamps, FALLBACK_STAMPS, type StampDefinition } from '@/hooks/useStamps';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PlaceCategory = Database['public']['Enums']['place_category'];

const HINTS_STORAGE_KEY = 'review-hints-understood';

interface ReviewFormProps {
  placeId: string;
  placeCategory?: PlaceCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ placeId, placeCategory, onSuccess, onCancel }: ReviewFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: existingReview, isLoading: loadingExisting } = useMyReview(placeId);
  const { data: stamps, isLoading: loadingStamps } = useStamps(placeCategory);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  // Selected stamps: Map<stampId, level (1-3)>
  const [positiveSignals, setPositiveSignals] = useState<Map<string, number>>(new Map());
  const [improvementSignals, setImprovementSignals] = useState<Map<string, number>>(new Map());
  const [notePublic, setNotePublic] = useState('');
  const [notePrivate, setNotePrivate] = useState('');
  
  // Inline hints state
  const [tapCount, setTapCount] = useState(0);
  const [hintsUnderstood, setHintsUnderstood] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [lastTapLevel, setLastTapLevel] = useState<number | null>(null);
  const [showTapHint, setShowTapHint] = useState(false);

  // Get stamps to display (fallback if none loaded)
  const positiveStamps = stamps?.positive || FALLBACK_STAMPS.positive.map(f => ({
    id: f.id,
    label: f.label,
    icon: f.icon,
    category: 'fallback',
    polarity: 'positive' as const,
    sort_order: 0,
  }));
  
  const improvementStamps = stamps?.improvement || FALLBACK_STAMPS.improvement.map(f => ({
    id: f.id,
    label: f.label,
    icon: f.icon,
    category: 'fallback',
    polarity: 'improvement' as const,
    sort_order: 0,
  }));

  // Check if hints have been dismissed before
  useEffect(() => {
    const understood = localStorage.getItem(HINTS_STORAGE_KEY) === 'true';
    setHintsUnderstood(understood);
  }, []);

  // Mark hints as understood after 3 taps
  useEffect(() => {
    if (tapCount >= 3 && !hintsUnderstood) {
      localStorage.setItem(HINTS_STORAGE_KEY, 'true');
      setHintsUnderstood(true);
    }
  }, [tapCount, hintsUnderstood]);

  // Show encouragement after 3 total stamps selected
  useEffect(() => {
    const totalSelected = positiveSignals.size + improvementSignals.size;
    if (totalSelected >= 3 && !showEncouragement) {
      setShowEncouragement(true);
    }
  }, [positiveSignals.size, improvementSignals.size, showEncouragement]);

  // Show tap hint after first tap
  useEffect(() => {
    if (lastTapLevel === 1 && !hintsUnderstood) {
      setShowTapHint(true);
      const timer = setTimeout(() => setShowTapHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastTapLevel, hintsUnderstood]);

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview && stamps) {
      setNotePublic(existingReview.note_public || '');
      setNotePrivate(existingReview.note_private || '');
      
      const posMap = new Map<string, number>();
      const impMap = new Map<string, number>();
      
      // Map existing signals to stamp IDs
      existingReview.signals.forEach((s: ReviewSignal) => {
        // Try to find matching stamp by dimension (legacy) or stamp_id
        const stampId = (s as any).stamp_id || s.dimension;
        if (s.polarity === 'positive') {
          posMap.set(stampId, s.level);
        } else {
          impMap.set(stampId, s.level);
        }
      });
      
      setPositiveSignals(posMap);
      setImprovementSignals(impMap);
    }
  }, [existingReview, stamps]);

  if (!profile?.is_verified) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">Only verified users can write reviews.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Verify your email to unlock this feature.
        </p>
      </div>
    );
  }

  if (loadingExisting || loadingStamps) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handlePositiveClick = (stamp: StampDefinition) => {
    // Can't select if already in improvement
    if (improvementSignals.has(stamp.id)) {
      toast({
        title: "Already marked for improvement",
        description: "Remove from improvements first",
        variant: "destructive",
      });
      return;
    }

    const current = positiveSignals.get(stamp.id);
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
      newMap.set(stamp.id, 1);
      setLastTapLevel(1);
    } else if (current < 3) {
      newMap.set(stamp.id, current + 1);
      setLastTapLevel(current + 1);
    } else {
      newMap.delete(stamp.id);
      setLastTapLevel(null);
    }

    setTapCount(prev => prev + 1);
    setPositiveSignals(newMap);
  };

  const handleImprovementClick = (stamp: StampDefinition) => {
    // Can't select if already in positive
    if (positiveSignals.has(stamp.id)) {
      toast({
        title: "Already marked as strength",
        description: "Remove from strengths first",
        variant: "destructive",
      });
      return;
    }

    const current = improvementSignals.get(stamp.id);
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
      newMap.set(stamp.id, 1);
      setLastTapLevel(1);
    } else if (current < 3) {
      newMap.set(stamp.id, current + 1);
      setLastTapLevel(current + 1);
    } else {
      newMap.delete(stamp.id);
      setLastTapLevel(null);
    }

    setTapCount(prev => prev + 1);
    setImprovementSignals(newMap);
  };

  const totalStamps = positiveSignals.size + improvementSignals.size;
  const hasStamps = totalStamps > 0;
  const showNudge = !hasStamps && tapCount === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: require at least one stamp
    if (!hasStamps) {
      toast({
        title: "Please add feedback",
        description: "Tap at least one thing that stood out — good or bad.",
        variant: "destructive",
      });
      return;
    }

    // Build signals array with stamp_id for new system
    const signals: ReviewSignal[] = [
      ...Array.from(positiveSignals.entries()).map(([stampId, level]) => ({
        dimension: 'quality' as const, // Legacy field, required by type
        polarity: 'positive' as const,
        level,
        stamp_id: stampId,
      })),
      ...Array.from(improvementSignals.entries()).map(([stampId, level]) => ({
        dimension: 'quality' as const, // Legacy field, required by type
        polarity: 'improvement' as const,
        level,
        stamp_id: stampId,
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
          title: "Thanks!",
          description: "Your review helps people make better decisions",
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

      {/* Tap Hint - shows after first tap */}
      {showTapHint && (
        <div className="animate-fade-in text-center py-2 px-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary">Tap again if it was even better</p>
        </div>
      )}

      {/* Encouragement Message */}
      {showEncouragement && !isEditing && (
        <div className="animate-fade-in flex items-center gap-2 py-2 px-3 bg-success/10 rounded-lg border border-success/20">
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-sm text-success">Nice! This already helps other travelers</p>
        </div>
      )}

      {/* Section A: Strengths */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold">
              What was GREAT here? (Pick up to 5)
            </Label>
            <ReviewHelpButton />
          </div>
          <span className="text-sm text-muted-foreground">
            {positiveSignals.size} / 5
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {positiveStamps.slice(0, 10).map((stamp) => (
            <StampButton
              key={stamp.id}
              stamp={stamp}
              polarity="positive"
              level={positiveSignals.get(stamp.id) || 0}
              onClick={() => handlePositiveClick(stamp)}
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
            {improvementSignals.size} / 2
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {improvementStamps.slice(0, 10).map((stamp) => (
            <StampButton
              key={stamp.id}
              stamp={stamp}
              polarity="improvement"
              level={improvementSignals.get(stamp.id) || 0}
              onClick={() => handleImprovementClick(stamp)}
            />
          ))}
        </div>
      </div>

      {/* Gentle Nudge */}
      {showNudge && (
        <div className="text-center py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            Tap at least one thing that stood out — good or bad.
          </p>
        </div>
      )}


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
