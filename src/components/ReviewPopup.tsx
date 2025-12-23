import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
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

  // Reset active stamp when step changes
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
  }, [step, positiveStamps, improvementStamps, positiveSignals, improvementSignals]);

  // Vote calculations
  const totalPositiveVotes = Array.from(positiveSignals.values()).reduce((sum, l) => sum + l, 0);
  const totalImprovementVotes = Array.from(improvementSignals.values()).reduce((sum, l) => sum + l, 0);
  const remainingPositive = 5 - totalPositiveVotes;
  const remainingImprovement = 2 - totalImprovementVotes;

  const handleStampTap = () => {
    if (!activeStamp) return;

    const isPositive = step === 'good';
    const signals = isPositive ? positiveSignals : improvementSignals;
    const setSignals = isPositive ? setPositiveSignals : setImprovementSignals;
    const remaining = isPositive ? remainingPositive : remainingImprovement;

    const current = signals.get(activeStamp.id) || 0;
    let newLevel: number;

    if (current === 0) {
      if (remaining < 1) return;
      newLevel = 1;
    } else if (current < 3) {
      if (remaining < 1) return;
      newLevel = current + 1;
    } else {
      newLevel = 0;
    }

    const newMap = new Map(signals);
    if (newLevel === 0) {
      newMap.delete(activeStamp.id);
    } else {
      newMap.set(activeStamp.id, newLevel);
    }
    setSignals(newMap);

    // Visual feedback
    if (newLevel > 0) {
      setFlashLevel(newLevel);
      setShowFlash(true);
      window.setTimeout(() => setShowFlash(false), 450);
      window.setTimeout(() => setFlashLevel(null), 500);
    }
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
      case 'good': return true; // Can skip with 0
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
        ? 'bg-primary/10 text-primary border-primary/30'
        : 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    }
    if (isPositive) {
      switch (currentLevel) {
        case 1: return 'bg-primary/20 text-primary border-primary/50';
        case 2: return 'bg-primary/40 text-primary border-primary ring-2 ring-primary/40';
        case 3: return 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/60';
        default: return 'bg-primary/10 text-primary border-primary/30';
      }
    } else {
      switch (currentLevel) {
        case 1: return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
        case 2: return 'bg-amber-500/40 text-amber-600 border-amber-500 ring-2 ring-amber-500/40';
        case 3: return 'bg-destructive text-destructive-foreground border-destructive ring-2 ring-destructive/40';
        default: return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      }
    }
  };

  const renderDots = (level: number, polarity: 'positive' | 'improvement') => (
    <div className="flex gap-1.5 justify-center">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={cn(
            'w-2.5 h-2.5 rounded-full transition-all',
            dot <= level
              ? polarity === 'positive'
                ? 'bg-primary'
                : level === 3 ? 'bg-destructive' : 'bg-amber-500'
              : 'bg-muted-foreground/30'
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
      <div className="flex flex-wrap gap-3 justify-center">
        {Array.from(stampMap.entries()).map(([id, level]) => {
          const stamp = stampList.find((s) => s.id === id);
          if (!stamp) return null;
          const Icon = stamp.icon
            ? (LucideIcons as any)[stamp.icon] || LucideIcons.Circle
            : LucideIcons.Circle;

          return (
            <div key={id} className="flex flex-col items-center gap-1 max-w-[96px]">
              <div
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center',
                  polarity === 'positive'
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                )}
              >
                <Icon size={20} />
              </div>
              <span className="text-[11px] text-center leading-tight whitespace-normal break-words">
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
      <DialogContent className="w-[94vw] max-w-sm mx-auto p-0 overflow-hidden gap-0 flex flex-col max-h-[85vh]">
        {/* Header (Radix close button is already rendered by DialogContent) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="w-10">
            {step !== 'intro' && (
              <button onClick={goBack} className="p-2 -m-2 rounded hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <h2 className="text-base font-semibold text-center flex-1 px-6">
            {getStepTitle()}
          </h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5">
            {/* INTRO STEP */}
            {step === 'intro' && (
              <div className="text-center space-y-4 py-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instead of stars, we focus on what actually stood out — the good and what needs work.
                </p>
                <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4">
                  <p className="text-xs"><span className="font-medium">Step 1:</span> Pick up to 5 Good stamps</p>
                  <p className="text-xs"><span className="font-medium">Step 2:</span> Pick up to 2 Needs Work stamps</p>
                  <p className="text-xs"><span className="font-medium">Step 3:</span> Add a note (optional)</p>
                  <p className="text-xs"><span className="font-medium">Tip:</span> Tap a stamp again to rate it higher</p>
                </div>
              </div>
            )}

            {/* STAMP SELECTION STEPS */}
            {(step === 'good' || step === 'improvement') && (
              <div className="space-y-5">
                {/* Active stamp preview */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <button
                    onClick={handleStampTap}
                    disabled={!activeStamp || (currentLevel === 0 && remaining < 1)}
                    className={cn(
                      'w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                      'active:scale-95',
                      'shadow-md',
                      getActiveStyles(),
                      showFlash && 'animate-enter',
                      (!activeStamp || (currentLevel === 0 && remaining < 1)) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <ActiveIcon size={40} />
                  </button>

                  <div className="space-y-1 max-w-[260px]">
                    <p className="text-lg font-semibold leading-tight">
                      {activeStamp?.label || 'Select a stamp'}
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <p
                        className={cn(
                          'text-sm',
                          currentLevel > 0
                            ? isPositive
                              ? 'text-primary font-semibold'
                              : currentLevel === 3
                              ? 'text-destructive font-semibold'
                              : 'text-amber-500 font-semibold'
                            : 'text-muted-foreground'
                        )}
                      >
                        {showFlash && flashLevel !== null && flashLevel > 0
                          ? labels[flashLevel]
                          : currentLevel > 0
                          ? labels[currentLevel]
                          : 'Tap to add'}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {currentLevel > 0 ? `${currentLevel} of 3` : '0 of 3'}
                      </span>
                    </div>

                    {renderDots(currentLevel, isPositive ? 'positive' : 'improvement')}

                    <p className="text-xs text-muted-foreground">
                      Tap again to increase strength (Good → Great → Excellent)
                    </p>
                  </div>
                </div>

                {/* Limit warning */}
                {remaining < 1 && currentLevel === 0 && (
                  <p className="text-sm text-amber-600 text-center bg-amber-500/10 py-2 px-3 rounded-lg">
                    You’ve reached the max for this step.
                  </p>
                )}

                {/* Stamp carousel (native horizontal scroll for mobile) */}
                <div className="border-t border-border pt-3">
                  <div className="w-full overflow-x-auto overscroll-contain">
                    <div className="flex gap-3 py-2 px-1">
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
                            onClick={() => setActiveStamp(stamp)}
                            className={cn(
                              'flex flex-col items-center text-center flex-shrink-0 rounded-2xl transition-all duration-200',
                              'w-[104px] px-2.5 py-2.5',
                              isActive
                                ? 'bg-muted ring-2 ring-primary/50'
                                : isSelected
                                ? 'bg-muted/40 ring-1 ring-border'
                                : 'bg-transparent opacity-60 hover:opacity-90 hover:bg-muted/30'
                            )}
                          >
                            <div
                              className={cn(
                                'rounded-full border-2 flex items-center justify-center transition-all',
                                isActive ? 'w-14 h-14' : 'w-12 h-12',
                                level > 0
                                  ? isPositive
                                    ? 'bg-primary/20 text-primary border-primary/50'
                                    : 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                                  : 'bg-muted text-muted-foreground border-border'
                              )}
                            >
                              <Icon size={20} />
                            </div>

                            <span className="mt-2 text-[12px] leading-snug text-foreground whitespace-normal break-words">
                              {stamp.label}
                            </span>

                            <div className="mt-1">
                              {level > 0 ? (
                                <div className="flex items-center justify-center gap-1">
                                  {[1, 2, 3].map((d) => (
                                    <div
                                      key={d}
                                      className={cn(
                                        'w-1.5 h-1.5 rounded-full',
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
                                <div className="h-[6px]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Counter */}
                <p className="text-xs text-muted-foreground text-center">
                  {maxVotes - remaining} of {maxVotes} votes used
                </p>
              </div>
            )}

            {/* NOTES STEP */}
            {step === 'notes' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Note for visitors</label>
                  <Textarea
                    value={notePublic}
                    onChange={(e) => setNotePublic(e.target.value.slice(0, 250))}
                    placeholder="Tips or experiences..."
                    className="mt-1 resize-none text-sm"
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground text-right mt-0.5">{notePublic.length}/250</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Private note (owner only)</label>
                  <Textarea
                    value={notePrivate}
                    onChange={(e) => setNotePrivate(e.target.value.slice(0, 250))}
                    placeholder="Feedback for owner..."
                    className="mt-1 resize-none text-sm"
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground text-right mt-0.5">{notePrivate.length}/250</p>
                </div>
              </div>
            )}

            {/* CONFIRM STEP */}
            {step === 'confirm' && (
              <div className="space-y-4">
                {positiveSignals.size > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Highlights</p>
                    {renderSelectedStamps(positiveSignals, positiveStamps, 'positive')}
                  </div>
                )}
                {improvementSignals.size > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Improvements</p>
                    {renderSelectedStamps(improvementSignals, improvementStamps, 'improvement')}
                  </div>
                )}
                {positiveSignals.size === 0 && improvementSignals.size === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Add at least one stamp to submit.</p>
                )}
                {(notePublic || notePrivate) && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    {notePublic && <p className="break-words">Note: {notePublic}</p>}
                    {notePrivate && <p className="break-words text-amber-600">Private: {notePrivate}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex gap-2">
          {step === 'confirm' ? (
            <Button onClick={goNext} disabled={!canGoNext() || isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Update' : 'Submit'}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canGoNext()} className="flex-1">
              {step === 'intro' ? 'Start' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
