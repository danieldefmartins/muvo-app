import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SelectedStampsArea } from './SelectedStampsArea';
import { StampSelectorPopup } from './StampSelectorPopup';
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
  
  // Popup state
  const [showPositivePopup, setShowPositivePopup] = useState(false);
  const [showImprovementPopup, setShowImprovementPopup] = useState(false);
  
  // Encouragement state
  const [showEncouragement, setShowEncouragement] = useState(false);

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

  // Show encouragement after 3 total stamps selected
  useEffect(() => {
    const totalSelected = positiveSignals.size + improvementSignals.size;
    if (totalSelected >= 3 && !showEncouragement) {
      setShowEncouragement(true);
    }
  }, [positiveSignals.size, improvementSignals.size, showEncouragement]);

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview && stamps) {
      setNotePublic(existingReview.note_public || '');
      setNotePrivate(existingReview.note_private || '');
      
      const posMap = new Map<string, number>();
      const impMap = new Map<string, number>();
      
      // Map existing signals to stamp IDs
      existingReview.signals.forEach((s: ReviewSignal) => {
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

  // Calculate total votes used
  const totalPositiveVotes = Array.from(positiveSignals.values()).reduce((sum, level) => sum + level, 0);
  const totalImprovementVotes = Array.from(improvementSignals.values()).reduce((sum, level) => sum + level, 0);
  const remainingPositiveVotes = 5 - totalPositiveVotes;
  const remainingImprovementVotes = 2 - totalImprovementVotes;

  const handleSelectPositiveStamp = (stamp: StampDefinition, level: number) => {
    const newMap = new Map(positiveSignals);
    
    if (level === 0) {
      newMap.delete(stamp.id);
    } else {
      // Check if already in improvement
      if (improvementSignals.has(stamp.id)) {
        toast({
          title: "Already marked for improvement",
          description: "Remove from improvements first",
          variant: "destructive",
        });
        return;
      }
      newMap.set(stamp.id, level);
    }
    
    setPositiveSignals(newMap);
  };

  const handleSelectImprovementStamp = (stamp: StampDefinition, level: number) => {
    const newMap = new Map(improvementSignals);
    
    if (level === 0) {
      newMap.delete(stamp.id);
    } else {
      // Check if already in positive
      if (positiveSignals.has(stamp.id)) {
        toast({
          title: "Already marked as strength",
          description: "Remove from strengths first",
          variant: "destructive",
        });
        return;
      }
      newMap.set(stamp.id, level);
    }
    
    setImprovementSignals(newMap);
  };

  const handleTapPositive = (stamp: StampDefinition) => {
    const current = positiveSignals.get(stamp.id) || 0;
    const newMap = new Map(positiveSignals);

    if (current < 3) {
      // Check if we can add another vote
      if (remainingPositiveVotes < 1) {
        toast({
          title: "Vote limit reached",
          description: "Remove some votes first or tap again to remove this stamp",
          variant: "destructive",
        });
        return;
      }
      newMap.set(stamp.id, current + 1);
    } else {
      // At level 3, remove the stamp
      newMap.delete(stamp.id);
    }
    
    setPositiveSignals(newMap);
  };

  const handleTapImprovement = (stamp: StampDefinition) => {
    const current = improvementSignals.get(stamp.id) || 0;
    const newMap = new Map(improvementSignals);

    if (current < 3) {
      if (remainingImprovementVotes < 1) {
        toast({
          title: "Vote limit reached",
          description: "Remove some votes first or tap again to remove this stamp",
          variant: "destructive",
        });
        return;
      }
      newMap.set(stamp.id, current + 1);
    } else {
      newMap.delete(stamp.id);
    }
    
    setImprovementSignals(newMap);
  };

  const handleRemovePositive = (stampId: string) => {
    const newMap = new Map(positiveSignals);
    newMap.delete(stampId);
    setPositiveSignals(newMap);
  };

  const handleRemoveImprovement = (stampId: string) => {
    const newMap = new Map(improvementSignals);
    newMap.delete(stampId);
    setImprovementSignals(newMap);
  };

  const totalStamps = positiveSignals.size + improvementSignals.size;
  const hasStamps = totalStamps > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasStamps) {
      toast({
        title: "Something needs to stand out",
        description: "Add at least one thing that stood out to submit your review.",
        variant: "destructive",
      });
      return;
    }

    // Build signals array
    const signals: ReviewSignal[] = [
      ...Array.from(positiveSignals.entries()).map(([stampId, level]) => ({
        dimension: 'quality' as const,
        polarity: 'positive' as const,
        level,
        stamp_id: stampId,
      })),
      ...Array.from(improvementSignals.entries()).map(([stampId, level]) => ({
        dimension: 'quality' as const,
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

  // Filter out already selected stamps for the popup
  const availablePositiveStamps = positiveStamps.filter(s => !improvementSignals.has(s.id));
  const availableImprovementStamps = improvementStamps.filter(s => !positiveSignals.has(s.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with help button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Leave a Review</h3>
        <ReviewHelpButton />
      </div>

      {/* Encouragement Message */}
      {showEncouragement && !isEditing && (
        <div className="animate-fade-in flex items-center gap-2 py-2 px-3 bg-success/10 rounded-lg border border-success/20">
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-sm text-success">Nice! This already helps other travelers</p>
        </div>
      )}

      {/* Selected Stamps Area */}
      <SelectedStampsArea
        positiveStamps={positiveStamps}
        improvementStamps={improvementStamps}
        selectedPositive={positiveSignals}
        selectedImprovement={improvementSignals}
        onAddPositive={() => setShowPositivePopup(true)}
        onAddImprovement={() => setShowImprovementPopup(true)}
        onTapPositive={handleTapPositive}
        onTapImprovement={handleTapImprovement}
        onRemovePositive={handleRemovePositive}
        onRemoveImprovement={handleRemoveImprovement}
        totalPositiveVotes={totalPositiveVotes}
        totalImprovementVotes={totalImprovementVotes}
        maxPositiveVotes={5}
        maxImprovementVotes={2}
      />

      {/* Stamp Selector Popups */}
      <StampSelectorPopup
        open={showPositivePopup}
        onOpenChange={setShowPositivePopup}
        stamps={availablePositiveStamps}
        polarity="positive"
        selectedStamps={positiveSignals}
        onSelectStamp={handleSelectPositiveStamp}
        remainingVotes={remainingPositiveVotes}
        maxVotes={5}
      />

      <StampSelectorPopup
        open={showImprovementPopup}
        onOpenChange={setShowImprovementPopup}
        stamps={availableImprovementStamps}
        polarity="improvement"
        selectedStamps={improvementSignals}
        onSelectStamp={handleSelectImprovementStamp}
        remainingVotes={remainingImprovementVotes}
        maxVotes={2}
      />

      {/* Contextual Helper Message */}
      {hasStamps ? (
        <div className="text-center py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            Nice — you can add more, or submit when ready.
          </p>
        </div>
      ) : (
        <div className="text-center py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            Tap "Add" to select what stood out — good or bad.
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
