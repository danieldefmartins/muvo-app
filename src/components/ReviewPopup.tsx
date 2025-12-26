import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, ArrowRight, Check, Loader2, ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic, hapticLight, hapticMedium } from '@/lib/haptics';
import type { StampDefinition } from '@/hooks/useStamps';

// Step definitions
type ReviewStep = 'intro' | 'good' | 'improvement' | 'neutral' | 'notes' | 'confirm';

interface ReviewPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positiveStamps: StampDefinition[];
  improvementStamps: StampDefinition[];
  neutralStamps: StampDefinition[];
  placeName?: string;
  initialPositive?: Map<string, number>;
  initialImprovement?: Map<string, number>;
  initialNeutral?: Map<string, number>;
  initialNotePublic?: string;
  initialNotePrivate?: string;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: {
    positiveSignals: Map<string, number>;
    improvementSignals: Map<string, number>;
    neutralSignals: Map<string, number>;
    notePublic: string;
    notePrivate: string;
  }) => void;
}

const LEVEL_LABELS = ['', 'Good', 'Great', 'Excellent'];
const IMPROVEMENT_LABELS = ['', 'Needs Work', 'Needs More', 'Major Issue'];
const NEUTRAL_LABELS = ['', 'Selected']; // Single-tap only

// Onboarding key for localStorage
const ONBOARDING_KEY = 'review_onboarding_seen';

export function ReviewPopup({
  open,
  onOpenChange,
  positiveStamps,
  improvementStamps,
  neutralStamps,
  placeName,
  initialPositive,
  initialImprovement,
  initialNeutral,
  initialNotePublic = '',
  initialNotePrivate = '',
  isEditing = false,
  isSubmitting = false,
  onSubmit,
}: ReviewPopupProps) {
  const [step, setStep] = useState<ReviewStep>('intro');
  const [positiveSignals, setPositiveSignals] = useState<Map<string, number>>(new Map());
  const [improvementSignals, setImprovementSignals] = useState<Map<string, number>>(new Map());
  const [neutralSignals, setNeutralSignals] = useState<Map<string, number>>(new Map());
  const [notePublic, setNotePublic] = useState('');
  const [notePrivate, setNotePrivate] = useState('');
  const [activeStamp, setActiveStamp] = useState<StampDefinition | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Animation states
  const [flashLevel, setFlashLevel] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [popText, setPopText] = useState<string | null>(null);

  // Scroll indicators
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position - always show right indicator initially if content overflows
  const updateScrollIndicators = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    // Show right scroll indicator if there's more content to scroll
    setCanScrollRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    updateScrollIndicators();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollIndicators);
      return () => container.removeEventListener('scroll', updateScrollIndicators);
    }
  }, [step, positiveStamps, improvementStamps, neutralStamps]);

  // Check if onboarding was seen
  useEffect(() => {
    if (open) {
      const seen = localStorage.getItem(ONBOARDING_KEY);
      if (!seen && !isEditing) {
        setShowOnboarding(true);
      }
    }
  }, [open, isEditing]);

  // Initialize state when popup opens
  useEffect(() => {
    if (open) {
      setPositiveSignals(initialPositive || new Map());
      setImprovementSignals(initialImprovement || new Map());
      setNeutralSignals(initialNeutral || new Map());
      setNotePublic(initialNotePublic);
      setNotePrivate(initialNotePrivate);
      
      // Check onboarding
      const seen = localStorage.getItem(ONBOARDING_KEY);
      if (seen || isEditing) {
        setStep('good');
      } else {
        setStep('intro');
      }
      
      setActiveStamp(null);
      setFlashLevel(null);
      setShowFlash(false);
      setPopText(null);
    }
  }, [open, initialPositive, initialImprovement, initialNeutral, initialNotePublic, initialNotePrivate, isEditing]);

  // Set initial active stamp when step changes
  useEffect(() => {
    if (step === 'good' && positiveStamps.length > 0) {
      const firstSelected = positiveStamps.find((s) => positiveSignals.has(s.id));
      const unselected = positiveStamps.find((s) => !positiveSignals.has(s.id));
      setActiveStamp(firstSelected || unselected || positiveStamps[0]);
    } else if (step === 'improvement' && improvementStamps.length > 0) {
      const firstSelected = improvementStamps.find((s) => improvementSignals.has(s.id));
      const unselected = improvementStamps.find((s) => !improvementSignals.has(s.id));
      setActiveStamp(firstSelected || unselected || improvementStamps[0]);
    } else if (step === 'neutral' && neutralStamps.length > 0) {
      const firstSelected = neutralStamps.find((s) => neutralSignals.has(s.id));
      const unselected = neutralStamps.find((s) => !neutralSignals.has(s.id));
      setActiveStamp(firstSelected || unselected || neutralStamps[0]);
    } else {
      setActiveStamp(null);
    }
    // Reset scroll position
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    setTimeout(updateScrollIndicators, 100);
  }, [step, positiveStamps, improvementStamps, neutralStamps]);

  // *** CRITICAL FIX: Count DISTINCT stamps, NOT intensity ***
  const stampsSelectedPositive = positiveSignals.size;
  const stampsSelectedImprovement = improvementSignals.size;
  const remainingPositiveSlots = 5 - stampsSelectedPositive;
  const remainingImprovementSlots = 2 - stampsSelectedImprovement;

  // Handle tapping on a stamp in the carousel
  const handleCarouselStampTap = (stamp: StampDefinition) => {
    const isPositive = step === 'good';
    const isNeutral = step === 'neutral';
    
    if (isNeutral) {
      // Neutral stamps are SINGLE TAP ONLY - toggle on/off with level 1
      const current = neutralSignals.get(stamp.id) || 0;
      const newMap = new Map(neutralSignals);
      
      if (current === 0) {
        newMap.set(stamp.id, 1);
        hapticMedium();
        setShowFlash(true);
        setPopText('Selected');
        window.setTimeout(() => {
          setShowFlash(false);
          setPopText(null);
        }, 500);
      } else {
        newMap.delete(stamp.id);
        hapticLight();
      }
      setNeutralSignals(newMap);
      setActiveStamp(stamp);
      return;
    }
    
    const signals = isPositive ? positiveSignals : improvementSignals;
    const setSignals = isPositive ? setPositiveSignals : setImprovementSignals;
    const remainingSlots = isPositive ? remainingPositiveSlots : remainingImprovementSlots;
    const labels = isPositive ? LEVEL_LABELS : IMPROVEMENT_LABELS;

    const current = signals.get(stamp.id) || 0;
    let newLevel: number;

    if (current === 0) {
      // First tap: select with level 1 (uses 1 stamp slot)
      if (remainingSlots < 1) {
        haptic('heavy');
        return;
      }
      newLevel = 1;
    } else if (current < 3) {
      // Already selected, increase intensity (does NOT use another slot)
      newLevel = current + 1;
    } else {
      // At max (3), deselect completely
      newLevel = 0;
    }

    const newMap = new Map(signals);
    if (newLevel === 0) {
      newMap.delete(stamp.id);
    } else {
      newMap.set(stamp.id, newLevel);
    }
    setSignals(newMap);

    // Always keep this stamp active
    setActiveStamp(stamp);

    // Visual + haptic feedback
    if (newLevel > 0) {
      hapticMedium();
      setFlashLevel(newLevel);
      setShowFlash(true);
      setPopText(labels[newLevel]);
      
      window.setTimeout(() => {
        setShowFlash(false);
        setPopText(null);
      }, 500);
      window.setTimeout(() => setFlashLevel(null), 550);
    } else {
      hapticLight();
    }
  };

  // Handle tapping the main active stamp icon (increase intensity)
  const handleMainStampTap = () => {
    if (!activeStamp) return;
    handleCarouselStampTap(activeStamp);
  };

  // Handle removing a stamp (long press or X button)
  const handleRemoveStamp = (stampId: string, isPositive: boolean) => {
    hapticLight();
    if (isPositive) {
      const newMap = new Map(positiveSignals);
      newMap.delete(stampId);
      setPositiveSignals(newMap);
      // Update active stamp if needed
      if (activeStamp?.id === stampId && positiveStamps.length > 0) {
        const nextActive = positiveStamps.find(s => newMap.has(s.id)) || positiveStamps[0];
        setActiveStamp(nextActive);
      }
    } else {
      const newMap = new Map(improvementSignals);
      newMap.delete(stampId);
      setImprovementSignals(newMap);
      if (activeStamp?.id === stampId && improvementStamps.length > 0) {
        const nextActive = improvementStamps.find(s => newMap.has(s.id)) || improvementStamps[0];
        setActiveStamp(nextActive);
      }
    }
  };

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setStep('good');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'intro': return 'A Better Way to Review';
      case 'good': return 'What Stood Out?';
      case 'improvement': return 'What Needs Work?';
      case 'neutral': return 'How This Place Feels';
      case 'notes': return 'Add a Note';
      case 'confirm': return 'Ready to Submit';
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 'intro': return true;
      case 'good': return true;
      case 'improvement': return true;
      case 'neutral': return true;
      case 'notes': return true;
      case 'confirm': return positiveSignals.size + improvementSignals.size + neutralSignals.size > 0;
    }
  };

  const goNext = () => {
    switch (step) {
      case 'intro':
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setStep('good');
        break;
      case 'good': setStep('improvement'); break;
      case 'improvement': setStep('neutral'); break;
      case 'neutral': setStep('notes'); break;
      case 'notes': setStep('confirm'); break;
      case 'confirm':
        onSubmit({ positiveSignals, improvementSignals, neutralSignals, notePublic, notePrivate });
        break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'good': setStep('intro'); break;
      case 'improvement': setStep('good'); break;
      case 'neutral': setStep('improvement'); break;
      case 'notes': setStep('neutral'); break;
      case 'confirm': setStep('notes'); break;
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 180;
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
  const isNeutralStep = step === 'neutral';
  const stamps = isNeutralStep ? neutralStamps : isPositive ? positiveStamps : improvementStamps;
  const signals = isNeutralStep ? neutralSignals : isPositive ? positiveSignals : improvementSignals;
  const remainingSlots = isNeutralStep ? Infinity : isPositive ? remainingPositiveSlots : remainingImprovementSlots;
  const maxSlots = isNeutralStep ? stamps.length : isPositive ? 5 : 2;
  const labels = isNeutralStep ? NEUTRAL_LABELS : isPositive ? LEVEL_LABELS : IMPROVEMENT_LABELS;
  const currentLevel = activeStamp ? (signals.get(activeStamp.id) || 0) : 0;
  const stampCount = signals.size;

  const getActiveStyles = () => {
    if (currentLevel === 0) {
      if (isNeutralStep) {
        return 'bg-violet-500/10 text-violet-500 border-violet-500/30';
      }
      return isPositive
        ? 'bg-primary/10 text-primary border-primary/30'
        : 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    }
    if (isNeutralStep) {
      return 'bg-violet-500/30 text-violet-600 border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20';
    }
    if (isPositive) {
      switch (currentLevel) {
        case 1: return 'bg-primary/20 text-primary border-primary/50 shadow-lg shadow-primary/20';
        case 2: return 'bg-primary/40 text-primary border-primary ring-4 ring-primary/30 shadow-xl shadow-primary/30';
        case 3: return 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/50 shadow-2xl shadow-primary/40';
        default: return 'bg-primary/10 text-primary border-primary/30';
      }
    } else {
      switch (currentLevel) {
        case 1: return 'bg-amber-500/20 text-amber-500 border-amber-500/50 shadow-lg shadow-amber-500/20';
        case 2: return 'bg-amber-500/40 text-amber-600 border-amber-500 ring-4 ring-amber-500/30 shadow-xl shadow-amber-500/30';
        case 3: return 'bg-destructive text-destructive-foreground border-destructive ring-4 ring-destructive/40 shadow-2xl shadow-destructive/40';
        default: return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      }
    }
  };

  const renderDots = (level: number, polarity: 'positive' | 'improvement' | 'neutral') => {
    if (polarity === 'neutral') {
      // Single dot for neutral stamps
      return (
        <div className="flex gap-2 justify-center">
          <div className={cn('w-3 h-3 rounded-full transition-all duration-300', level > 0 ? 'bg-violet-500 scale-110' : 'bg-muted-foreground/25')} />
        </div>
      );
    }
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
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
  };

  const renderSelectedStamps = (
    stampMap: Map<string, number>,
    stampList: StampDefinition[],
    polarity: 'positive' | 'improvement' | 'neutral'
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
            <div key={id} className="flex flex-col items-center gap-1.5 w-24">
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
              <span className="text-sm text-center leading-tight font-medium">
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
      <style>{`
        @keyframes popScale {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 overflow-hidden gap-0 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="w-10 flex items-center">
            {step !== 'intro' && (
              <button onClick={goBack} className="p-2 -m-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">
              {getStepTitle()}
            </h2>
            {placeName && step !== 'intro' && (
              <p className="text-sm text-muted-foreground truncate max-w-[200px] mx-auto" title={placeName}>
                {placeName}
              </p>
            )}
          </div>
          <div className="w-10 flex items-center justify-end">
            {(step === 'good' || step === 'improvement') && (
              <button 
                onClick={() => setShowOnboarding(true)}
                className="p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5">
            {/* INTRO STEP */}
            {step === 'intro' && (
              <div className="text-center space-y-6 py-4">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Instead of stars, we focus on what actually matters — the good stuff and what needs work.
                </p>
                <div className="space-y-5 text-left bg-muted/50 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">Pick what stood out</p>
                      <p className="text-base text-muted-foreground">Up to 5 good stamps, 2 needs work</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">Tap to set strength</p>
                      <p className="text-base text-muted-foreground">Good → Great → Excellent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">Submit</p>
                      <p className="text-base text-muted-foreground">Add optional notes and you're done!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAMP SELECTION STEPS */}
            {(step === 'good' || step === 'improvement') && (
              <div className="space-y-5">
                {/* Active stamp preview - LARGE and centered */}
                <div className="flex flex-col items-center gap-3 text-center">
                  {/* Pop text animation - Enhanced scale animation */}
                  <div className="h-10 flex items-center justify-center overflow-visible">
                    {popText && (
                      <p 
                        key={`${popText}-${Date.now()}`}
                        className={cn(
                          "text-3xl font-black uppercase",
                          isPositive ? "text-primary" : currentLevel === 3 ? "text-destructive" : "text-amber-500"
                        )}
                        style={{
                          animation: 'popScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                        }}
                      >
                        {popText}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleMainStampTap}
                    disabled={!activeStamp || (currentLevel === 0 && remainingSlots < 1)}
                    className={cn(
                      'w-32 h-32 rounded-full border-[3px] flex items-center justify-center transition-all duration-300',
                      'active:scale-90',
                      getActiveStyles(),
                      showFlash && 'scale-110',
                      (!activeStamp || (currentLevel === 0 && remainingSlots < 1)) && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <ActiveIcon size={56} strokeWidth={1.5} />
                  </button>

                  <div className="space-y-2 w-full max-w-[300px]">
                    {/* Stamp label - LARGE font, wrapping allowed */}
                    <p className="text-2xl font-bold leading-tight break-words">
                      {activeStamp?.label || 'Select a stamp'}
                    </p>

                    {/* Intensity display */}
                    <div className="flex flex-col items-center gap-2">
                      {/* Current level text */}
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
                        {currentLevel > 0 ? labels[currentLevel] : 'Tap to add'}
                      </p>

                      {/* Dots + X of 3 indicator */}
                      <div className="flex items-center gap-3 bg-muted/60 rounded-full px-5 py-2">
                        {renderDots(currentLevel, isPositive ? 'positive' : 'improvement')}
                        <span className="text-base font-semibold text-muted-foreground">
                          {currentLevel} of 3
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <p className="text-base text-muted-foreground pt-1">
                      {currentLevel === 0 
                        ? 'Tap the icon to select' 
                        : currentLevel < 3 
                        ? 'Tap again to increase strength'
                        : 'Tap again to remove'}
                    </p>
                  </div>
                </div>

                {/* Limit warning */}
                {remainingSlots < 1 && currentLevel === 0 && (
                  <p className="text-base text-amber-600 text-center bg-amber-500/10 py-3 px-4 rounded-xl font-medium">
                    You've selected {maxSlots} stamps. Remove one to add another.
                  </p>
                )}

                {/* Stamp carousel with scroll indicators */}
                <div className="border-t border-border pt-4">
                  <p className="text-base text-muted-foreground text-center mb-3 font-medium">
                    Tap a stamp to select it
                  </p>
                  
                  <div className="relative">
                    {/* Left scroll button */}
                    {canScrollLeft && (
                      <button
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/95 shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                      </button>
                    )}

                    {/* Right scroll button */}
                    {canScrollRight && (
                      <button
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/95 shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="w-6 h-6 text-foreground" />
                      </button>
                    )}

                    {/* Left fade */}
                    {canScrollLeft && (
                      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5]" />
                    )}

                    {/* Right fade */}
                    {canScrollRight && (
                      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5]" />
                    )}

                    <div 
                      ref={scrollContainerRef}
                      className="w-full overflow-x-auto overscroll-contain scrollbar-hide px-3"
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
                              onClick={() => {
                                // First tap on ANY stamp = select it with level 1
                                // Subsequent taps on same stamp = increase intensity
                                // Tapping different stamp when already selected = switch focus and select new one with level 1
                                if (!isActive) {
                                  setActiveStamp(stamp);
                                  // If not already selected, also select it with level 1
                                  if (!isSelected) {
                                    handleCarouselStampTap(stamp);
                                  }
                                } else {
                                  // Tapping the SAME stamp = increase intensity
                                  handleCarouselStampTap(stamp);
                                }
                              }}
                              className={cn(
                                'flex flex-col items-center text-center flex-shrink-0 rounded-2xl transition-all duration-200 p-3 relative',
                                isActive
                                  ? 'bg-muted ring-2 ring-primary scale-105'
                                  : isSelected
                                  ? 'bg-muted/50 ring-1 ring-border'
                                  : 'bg-transparent opacity-60 hover:opacity-90 hover:bg-muted/30'
                              )}
                              style={{ minWidth: '100px', maxWidth: '100px' }}
                            >
                              {/* Remove button for selected stamps */}
                              {isSelected && !isActive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveStamp(stamp.id, isPositive);
                                  }}
                                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-muted-foreground/20 hover:bg-destructive/20 flex items-center justify-center transition-colors z-10"
                                >
                                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                              )}

                              <div
                                className={cn(
                                  'rounded-full border-2 flex items-center justify-center transition-all',
                                  isActive ? 'w-16 h-16' : 'w-12 h-12',
                                  level > 0
                                    ? isPositive
                                      ? 'bg-primary/20 text-primary border-primary/60'
                                      : 'bg-amber-500/20 text-amber-500 border-amber-500/60'
                                    : 'bg-muted text-muted-foreground border-border'
                                )}
                              >
                                <Icon size={isActive ? 28 : 22} />
                              </div>

                              <span className="mt-2 text-sm leading-tight text-foreground font-medium whitespace-normal break-words">
                                {stamp.label}
                              </span>

                              <div className="mt-1.5 h-5 flex items-center justify-center">
                                {level > 0 ? (
                                  <div className="flex items-center gap-1.5">
                                    {[1, 2, 3].map((d) => (
                                      <div
                                        key={d}
                                        className={cn(
                                          'w-2.5 h-2.5 rounded-full transition-all',
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

                {/* Counter - FIXED LABELING */}
                <p className="text-base text-muted-foreground text-center font-semibold">
                  {stampCount} of {maxSlots} stamps selected
                </p>
              </div>
            )}

            {/* NOTES STEP */}
            {step === 'notes' && (
              <div className="space-y-5">
                <div>
                  <label className="text-base font-semibold text-foreground">Public note</label>
                  <p className="text-sm text-muted-foreground mb-2">Share tips or experiences with visitors</p>
                  <Textarea
                    value={notePublic}
                    onChange={(e) => setNotePublic(e.target.value.slice(0, 250))}
                    placeholder="What should others know about this place?"
                    className="mt-1 resize-none text-base"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{notePublic.length}/250</p>
                </div>
                <div>
                  <label className="text-base font-semibold text-foreground">Private note (optional)</label>
                  <p className="text-sm text-muted-foreground mb-2">Only visible to the owner</p>
                  <Textarea
                    value={notePrivate}
                    onChange={(e) => setNotePrivate(e.target.value.slice(0, 250))}
                    placeholder="Direct feedback for the owner..."
                    className="mt-1 resize-none text-base"
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
                    <p className="text-base font-semibold text-foreground mb-3">✨ Highlights</p>
                    {renderSelectedStamps(positiveSignals, positiveStamps, 'positive')}
                  </div>
                )}
                {improvementSignals.size > 0 && (
                  <div>
                    <p className="text-base font-semibold text-foreground mb-3">⚠️ Needs Improvement</p>
                    {renderSelectedStamps(improvementSignals, improvementStamps, 'improvement')}
                  </div>
                )}
                {positiveSignals.size === 0 && improvementSignals.size === 0 && (
                  <p className="text-lg text-muted-foreground text-center py-8">Add at least one stamp to submit.</p>
                )}
                {(notePublic || notePrivate) && (
                  <div className="text-sm text-muted-foreground border-t border-border pt-4 space-y-2">
                    {notePublic && <p className="break-words"><span className="font-semibold text-foreground">Public note:</span> {notePublic}</p>}
                    {notePrivate && <p className="break-words text-amber-600"><span className="font-semibold">Private note:</span> {notePrivate}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border bg-background">
          {step === 'confirm' ? (
            <Button onClick={goNext} disabled={!canGoNext() || isSubmitting} className="w-full h-12 text-base font-semibold">
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canGoNext()} className="w-full h-12 text-base font-semibold">
              {step === 'intro' ? "Let's Go" : 'Continue'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Onboarding Modal Overlay */}
        {showOnboarding && step !== 'intro' && (
          <div className="absolute inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-sm">
              <h3 className="text-xl font-bold text-foreground">How Reviews Work</h3>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-foreground">Pick what stood out</p>
                    <p className="text-sm text-muted-foreground">Up to 5 good stamps, 2 needs work</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-foreground">Tap to set strength</p>
                    <p className="text-sm text-muted-foreground">1 tap = Good, 2 = Great, 3 = Excellent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-foreground">Strength ≠ Slots</p>
                    <p className="text-sm text-muted-foreground">Tapping 3× on 1 stamp uses only 1 slot!</p>
                  </div>
                </div>
              </div>

              <Button onClick={dismissOnboarding} className="w-full">
                Got it!
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
