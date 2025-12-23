import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, ArrowRight, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StampDefinition } from '@/hooks/useStamps';

// Step definitions
type ReviewStep = 'intro' | 'good' | 'improvement' | 'notes' | 'confirm';

interface ReviewPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positiveStamps: StampDefinition[];
  improvementStamps: StampDefinition[];
  initialPositive?: Map<string, number>;
  initialImprovement?: Map<string, number>;
  initialNotePublic?: string;
  initialNotePrivate?: string;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: {
    positiveSignals: Map<string, number>;
    improvementSignals: Map<string, number>;
    notePublic: string;
    notePrivate: string;
  }) => void;
}

const LEVEL_LABELS = ['', 'Good', 'Great', 'Excellent'];
const IMPROVEMENT_LABELS = ['', 'Needs Work', 'Needs More', 'Major Issue'];

export function ReviewPopup({
  open,
  onOpenChange,
  positiveStamps,
  improvementStamps,
  initialPositive,
  initialImprovement,
  initialNotePublic = '',
  initialNotePrivate = '',
  isEditing = false,
  isSubmitting = false,
  onSubmit,
}: ReviewPopupProps) {
  const [step, setStep] = useState<ReviewStep>('intro');
  const [positiveSignals, setPositiveSignals] = useState<Map<string, number>>(new Map());
  const [improvementSignals, setImprovementSignals] = useState<Map<string, number>>(new Map());
  const [notePublic, setNotePublic] = useState('');
  const [notePrivate, setNotePrivate] = useState('');
  const [activeStamp, setActiveStamp] = useState<StampDefinition | null>(null);

  const [flashLevel, setFlashLevel] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  // Scroll indicators
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const updateScrollIndicators = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollIndicators();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollIndicators);
      return () => container.removeEventListener('scroll', updateScrollIndicators);
    }
  }, [step, positiveStamps, improvementStamps]);

  // Initialize state when popup opens
  useEffect(() => {
    if (open) {
      setPositiveSignals(initialPositive || new Map());
      setImprovementSignals(initialImprovement || new Map());
      setNotePublic(initialNotePublic);
      setNotePrivate(initialNotePrivate);
      setStep(isEditing ? 'good' : 'intro');
      setActiveStamp(null);
      setFlashLevel(null);
      setShowFlash(false);
    }
  }, [open, initialPositive, initialImprovement, initialNotePublic, initialNotePrivate, isEditing]);

  // Set initial active stamp when step changes
  useEffect(() => {
    if (step === 'good' && positiveStamps.length > 0) {
      const unselected = positiveStamps.find((s) => !positiveSignals.has(s.id));
      setActiveStamp(unselected || positiveStamps[0]);
    } else if (step === 'improvement' && improvementStamps.length > 0) {
      const unselected = improvementStamps.find((s) => !improvementSignals.has(s.id));
      setActiveStamp(unselected || improvementStamps[0]);
    } else {
      setActiveStamp(null);
    }
    // Reset scroll position
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    setTimeout(updateScrollIndicators, 100);
  }, [step, positiveStamps, improvementStamps]);

  // Vote calculations
  const totalPositiveVotes = Array.from(positiveSignals.values()).reduce((sum, l) => sum + l, 0);
  const totalImprovementVotes = Array.from(improvementSignals.values()).reduce((sum, l) => sum + l, 0);
  const remainingPositive = 5 - totalPositiveVotes;
  const remainingImprovement = 2 - totalImprovementVotes;

  // Handle tapping on a stamp in the carousel - this is the KEY fix
  const handleCarouselStampTap = (stamp: StampDefinition) => {
    const isPositive = step === 'good';
    const signals = isPositive ? positiveSignals : improvementSignals;
    const setSignals = isPositive ? setPositiveSignals : setImprovementSignals;
    const remaining = isPositive ? remainingPositive : remainingImprovement;

    const current = signals.get(stamp.id) || 0;
    let newLevel: number;

    if (current === 0) {
      // First tap: select with level 1
      if (remaining < 1) return;
      newLevel = 1;
    } else if (current < 3) {
      // Already selected, increase intensity
      if (remaining < 1) return;
      newLevel = current + 1;
    } else {
      // At max, deselect
      newLevel = 0;
    }

    const newMap = new Map(signals);
    if (newLevel === 0) {
      newMap.delete(stamp.id);
    } else {
      newMap.set(stamp.id, newLevel);
    }
    setSignals(newMap);

    // Always keep this stamp active while tapping
    setActiveStamp(stamp);

    // Visual feedback
    if (newLevel > 0) {
      setFlashLevel(newLevel);
      setShowFlash(true);
      window.setTimeout(() => setShowFlash(false), 400);
      window.setTimeout(() => setFlashLevel(null), 450);
    }
  };

  // Handle tapping the main active stamp icon
  const handleMainStampTap = () => {
    if (!activeStamp) return;
    handleCarouselStampTap(activeStamp);
  };

  const handleRemoveStamp = (stampId: string, isPositive: boolean) => {
    if (isPositive) {
      const newMap = new Map(positiveSignals);
      newMap.delete(stampId);
      setPositiveSignals(newMap);
    } else {
      const newMap = new Map(improvementSignals);
      newMap.delete(stampId);
      setImprovementSignals(newMap);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'intro': return 'A Better Way to Review';
      case 'good': return 'What Stood Out?';
      case 'improvement': return 'What Needs Work?';
      case 'notes': return 'Add a Note (Optional)';
      case 'confirm': return 'Ready to Submit';
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 'intro': return true;
      case 'good': return true;
      case 'improvement': return true;
      case 'notes': return true;
      case 'confirm': return positiveSignals.size + improvementSignals.size > 0;
    }
  };

  const goNext = () => {
    switch (step) {
      case 'intro': setStep('good'); break;
      case 'good': setStep('improvement'); break;
      case 'improvement': setStep('notes'); break;
      case 'notes': setStep('confirm'); break;
      case 'confirm':
        onSubmit({ positiveSignals, improvementSignals, notePublic, notePrivate });
        break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'good': setStep('intro'); break;
      case 'improvement': setStep('good'); break;
      case 'notes': setStep('improvement'); break;
      case 'confirm': setStep('notes'); break;
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const getActiveIcon = () => {
    if (!activeStamp?.icon) return LucideIcons.Circle;
    return (LucideIcons as any)[activeStamp.icon] || LucideIcons.Circle;
  };

  const ActiveIcon = getActiveIcon();

  const isPositive = step === 'good';
  const stamps = isPositive ? positiveStamps : improvementStamps;
  const signals = isPositive ? positiveSignals : improvementSignals;
  const remaining = isPositive ? remainingPositive : remainingImprovement;
  const maxVotes = isPositive ? 5 : 2;
  const labels = isPositive ? LEVEL_LABELS : IMPROVEMENT_LABELS;
  const currentLevel = activeStamp ? (signals.get(activeStamp.id) || 0) : 0;

  const getActiveStyles = () => {
    if (currentLevel === 0) {
      return isPositive
        ? 'bg-primary/10 text-primary border-primary/40'
        : 'bg-amber-500/10 text-amber-500 border-amber-500/40';
    }
    if (isPositive) {
      switch (currentLevel) {
        case 1: return 'bg-primary/20 text-primary border-primary/60 shadow-lg shadow-primary/20';
        case 2: return 'bg-primary/40 text-primary border-primary ring-4 ring-primary/30 shadow-xl shadow-primary/30';
        case 3: return 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/50 shadow-2xl shadow-primary/40';
        default: return 'bg-primary/10 text-primary border-primary/40';
      }
    } else {
      switch (currentLevel) {
        case 1: return 'bg-amber-500/20 text-amber-500 border-amber-500/60 shadow-lg shadow-amber-500/20';
        case 2: return 'bg-amber-500/40 text-amber-600 border-amber-500 ring-4 ring-amber-500/30 shadow-xl shadow-amber-500/30';
        case 3: return 'bg-destructive text-destructive-foreground border-destructive ring-4 ring-destructive/40 shadow-2xl shadow-destructive/40';
        default: return 'bg-amber-500/10 text-amber-500 border-amber-500/40';
      }
    }
  };

  const renderDots = (level: number, polarity: 'positive' | 'improvement') => (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={cn(
            'w-3 h-3 rounded-full transition-all duration-200',
            dot <= level
              ? polarity === 'positive'
                ? 'bg-primary scale-110'
                : level === 3 ? 'bg-destructive scale-110' : 'bg-amber-500 scale-110'
              : 'bg-muted-foreground/25'
          )}
        />
      ))}
    </div>
  );

  const renderSelectedStamps = (
    stampMap: Map<string, number>,
    stampList: StampDefinition[],
    polarity: 'positive' | 'improvement'
  ) => {
    if (stampMap.size === 0) return null;
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {Array.from(stampMap.entries()).map(([id, level]) => {
          const stamp = stampList.find((s) => s.id === id);
          if (!stamp) return null;
          const Icon = stamp.icon
            ? (LucideIcons as any)[stamp.icon] || LucideIcons.Circle
            : LucideIcons.Circle;

          return (
            <div key={id} className="flex flex-col items-center gap-1.5 w-20">
              <div
                className={cn(
                  'w-14 h-14 rounded-full border-2 flex items-center justify-center',
                  polarity === 'positive'
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                )}
              >
                <Icon size={24} />
              </div>
              <span className="text-sm text-center leading-tight">
                {stamp.label}
              </span>
              {renderDots(level, polarity)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden gap-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="w-10">
            {step !== 'intro' && (
              <button onClick={goBack} className="p-2 -m-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <h2 className="text-lg font-semibold text-center flex-1">
            {getStepTitle()}
          </h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6">
            {/* INTRO STEP */}
            {step === 'intro' && (
              <div className="text-center space-y-5 py-4">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Instead of stars, we focus on what actually stood out — the good and what needs work.
                </p>
                <div className="space-y-3 text-left bg-muted/50 rounded-xl p-5">
                  <p className="text-sm"><span className="font-semibold">Step 1:</span> Pick up to 5 Good stamps</p>
                  <p className="text-sm"><span className="font-semibold">Step 2:</span> Pick up to 2 Needs Work stamps</p>
                  <p className="text-sm"><span className="font-semibold">Step 3:</span> Add a note (optional)</p>
                  <p className="text-sm text-primary font-medium">💡 Tap a stamp multiple times to rate it higher!</p>
                </div>
              </div>
            )}

            {/* STAMP SELECTION STEPS */}
            {(step === 'good' || step === 'improvement') && (
              <div className="space-y-6">
                {/* Active stamp preview - larger and more prominent */}
                <div className="flex flex-col items-center gap-4 text-center">
                  <button
                    onClick={handleMainStampTap}
                    disabled={!activeStamp || (currentLevel === 0 && remaining < 1)}
                    className={cn(
                      'w-28 h-28 rounded-full border-[3px] flex items-center justify-center transition-all duration-300',
                      'active:scale-90',
                      getActiveStyles(),
                      showFlash && 'scale-110',
                      (!activeStamp || (currentLevel === 0 && remaining < 1)) && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <ActiveIcon size={48} strokeWidth={1.5} />
                  </button>

                  <div className="space-y-2 w-full max-w-[280px]">
                    {/* Stamp label - larger font */}
                    <p className="text-xl font-bold leading-tight">
                      {activeStamp?.label || 'Select a stamp'}
                    </p>

                    {/* Intensity label and counter */}
                    <div className="flex flex-col items-center gap-2">
                      <p
                        className={cn(
                          'text-lg font-semibold transition-all',
                          currentLevel > 0
                            ? isPositive
                              ? 'text-primary'
                              : currentLevel === 3
                              ? 'text-destructive'
                              : 'text-amber-500'
                            : 'text-muted-foreground'
                        )}
                      >
                        {showFlash && flashLevel !== null && flashLevel > 0
                          ? labels[flashLevel]
                          : currentLevel > 0
                          ? labels[currentLevel]
                          : 'Tap to add'}
                      </p>

                      {/* Progress indicator - very clear */}
                      <div className="flex items-center gap-2 bg-muted/60 rounded-full px-4 py-1.5">
                        {renderDots(currentLevel, isPositive ? 'positive' : 'improvement')}
                        <span className="text-sm font-medium text-muted-foreground ml-1">
                          {currentLevel} of 3
                        </span>
                      </div>
                    </div>

                    {/* Instructions - larger text */}
                    <p className="text-sm text-muted-foreground pt-1">
                      {currentLevel === 0 
                        ? 'Tap to select this stamp' 
                        : currentLevel < 3 
                        ? 'Tap again to increase strength'
                        : 'Tap again to deselect'}
                    </p>
                  </div>
                </div>

                {/* Limit warning */}
                {remaining < 1 && currentLevel === 0 && (
                  <p className="text-base text-amber-600 text-center bg-amber-500/10 py-3 px-4 rounded-xl font-medium">
                    You've used all {maxVotes} votes for this step.
                  </p>
                )}

                {/* Stamp carousel with scroll indicators */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Choose a stamp below
                  </p>
                  
                  <div className="relative">
                    {/* Left scroll indicator */}
                    {canScrollLeft && (
                      <button
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                      </button>
                    )}

                    {/* Right scroll indicator */}
                    {canScrollRight && (
                      <button
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-foreground" />
                      </button>
                    )}

                    {/* Left fade */}
                    {canScrollLeft && (
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5]" />
                    )}

                    {/* Right fade */}
                    {canScrollRight && (
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5]" />
                    )}

                    <div 
                      ref={scrollContainerRef}
                      className="w-full overflow-x-auto overscroll-contain scrollbar-hide px-2"
                    >
                      <div className="flex gap-3 py-3">
                        {stamps.map((stamp) => {
                          const Icon = stamp.icon
                            ? (LucideIcons as any)[stamp.icon] || LucideIcons.Circle
                            : LucideIcons.Circle;
                          const level = signals.get(stamp.id) || 0;
                          const isActive = activeStamp?.id === stamp.id;
                          const isSelected = level > 0;

                          return (
                            <button
                              key={stamp.id}
                              onClick={() => handleCarouselStampTap(stamp)}
                              className={cn(
                                'flex flex-col items-center text-center flex-shrink-0 rounded-2xl transition-all duration-200 p-3',
                                isActive
                                  ? 'bg-muted ring-2 ring-primary scale-105'
                                  : isSelected
                                  ? 'bg-muted/50 ring-1 ring-border'
                                  : 'bg-transparent opacity-50 hover:opacity-80 hover:bg-muted/30'
                              )}
                              style={{ minWidth: '90px', maxWidth: '90px' }}
                            >
                              <div
                                className={cn(
                                  'rounded-full border-2 flex items-center justify-center transition-all',
                                  isActive ? 'w-14 h-14' : 'w-11 h-11',
                                  level > 0
                                    ? isPositive
                                      ? 'bg-primary/20 text-primary border-primary/60'
                                      : 'bg-amber-500/20 text-amber-500 border-amber-500/60'
                                    : 'bg-muted text-muted-foreground border-border'
                                )}
                              >
                                <Icon size={isActive ? 24 : 20} />
                              </div>

                              <span className="mt-2 text-sm leading-tight text-foreground font-medium">
                                {stamp.label}
                              </span>

                              <div className="mt-1.5 h-4 flex items-center">
                                {level > 0 ? (
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3].map((d) => (
                                      <div
                                        key={d}
                                        className={cn(
                                          'w-2 h-2 rounded-full transition-all',
                                          d <= level
                                            ? isPositive
                                              ? 'bg-primary'
                                              : 'bg-amber-500'
                                            : 'bg-muted-foreground/30'
                                        )}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Tap to add</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counter */}
                <p className="text-sm text-muted-foreground text-center font-medium">
                  {maxVotes - remaining} of {maxVotes} votes used
                </p>
              </div>
            )}

            {/* NOTES STEP */}
            {step === 'notes' && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground">Note for visitors</label>
                  <Textarea
                    value={notePublic}
                    onChange={(e) => setNotePublic(e.target.value.slice(0, 250))}
                    placeholder="Tips or experiences to share..."
                    className="mt-2 resize-none text-base"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{notePublic.length}/250</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Private note (owner only)</label>
                  <Textarea
                    value={notePrivate}
                    onChange={(e) => setNotePrivate(e.target.value.slice(0, 250))}
                    placeholder="Feedback for the owner..."
                    className="mt-2 resize-none text-base"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{notePrivate.length}/250</p>
                </div>
              </div>
            )}

            {/* CONFIRM STEP */}
            {step === 'confirm' && (
              <div className="space-y-5">
                {positiveSignals.size > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Highlights</p>
                    {renderSelectedStamps(positiveSignals, positiveStamps, 'positive')}
                  </div>
                )}
                {improvementSignals.size > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Needs Improvement</p>
                    {renderSelectedStamps(improvementSignals, improvementStamps, 'improvement')}
                  </div>
                )}
                {positiveSignals.size === 0 && improvementSignals.size === 0 && (
                  <p className="text-base text-muted-foreground text-center py-6">Add at least one stamp to submit.</p>
                )}
                {(notePublic || notePrivate) && (
                  <div className="text-sm text-muted-foreground border-t border-border pt-4 space-y-2">
                    {notePublic && <p className="break-words"><span className="font-medium">Public note:</span> {notePublic}</p>}
                    {notePrivate && <p className="break-words text-amber-600"><span className="font-medium">Private note:</span> {notePrivate}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border bg-background">
          {step === 'confirm' ? (
            <Button onClick={goNext} disabled={!canGoNext() || isSubmitting} className="w-full h-12 text-base">
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canGoNext()} className="w-full h-12 text-base">
              {step === 'intro' ? "Let's Go" : 'Continue'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
