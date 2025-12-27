import { PlaceFiltersState } from '@/components/PlaceFilters';
import { PlaceCategory, PlaceFeature } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { hapticLight } from '@/lib/haptics';
import { Filter, X, ThumbsUp, Sparkles, Ban } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLACE_CATEGORIES, PLACE_FEATURES } from '@/hooks/usePlaces';
import { useAllStamps, StampDefinition } from '@/hooks/useStamps';
import { ReviewFiltersState, DEFAULT_REVIEW_FILTERS, countActiveReviewFilters } from '@/hooks/useReviewFilters';

interface QuickChip {
  id: string;
  label: string;
  icon: string;
  isActive: (filters: PlaceFiltersState) => boolean;
  toggle: (filters: PlaceFiltersState) => PlaceFiltersState;
}

const QUICK_CHIPS: QuickChip[] = [
  {
    id: 'boondocking',
    label: 'Boondocking',
    icon: '🏕️',
    isActive: (f) => f.category === 'Boondocking',
    toggle: (f) => ({
      ...f,
      category: f.category === 'Boondocking' ? null : 'Boondocking' as PlaceCategory,
    }),
  },
  {
    id: 'free',
    label: 'Free',
    icon: '💵',
    isActive: (f) => f.category === 'Overnight Parking',
    toggle: (f) => ({
      ...f,
      category: f.category === 'Overnight Parking' ? null : 'Overnight Parking' as PlaceCategory,
    }),
  },
  {
    id: 'full-hookups',
    label: 'Hookups',
    icon: '🔌',
    isActive: (f) => 
      f.features.includes('Electric Hookups') && 
      f.features.includes('Sewer Hookups'),
    toggle: (f) => {
      const hasAll = f.features.includes('Electric Hookups') && f.features.includes('Sewer Hookups');
      if (hasAll) {
        return {
          ...f,
          features: f.features.filter((feat) => !['Electric Hookups', 'Sewer Hookups'].includes(feat)),
        };
      }
      const newFeatures = [...f.features];
      (['Electric Hookups', 'Sewer Hookups'] as PlaceFeature[]).forEach((feat) => {
        if (!newFeatures.includes(feat)) newFeatures.push(feat);
      });
      return { ...f, features: newFeatures };
    },
  },
  {
    id: 'pets',
    label: 'Pets',
    icon: '🐕',
    isActive: (f) => f.petFriendly,
    toggle: (f) => ({ ...f, petFriendly: !f.petFriendly }),
  },
  {
    id: 'big-rig',
    label: 'Big Rig',
    icon: '🚛',
    isActive: (f) => f.bigRigFriendly,
    toggle: (f) => ({ ...f, bigRigFriendly: !f.bigRigFriendly }),
  },
  {
    id: 'showers',
    label: 'Showers',
    icon: '🚿',
    isActive: (f) => f.features.includes('Showers'),
    toggle: (f) => ({
      ...f,
      features: f.features.includes('Showers')
        ? f.features.filter((feat) => feat !== 'Showers')
        : [...f.features, 'Showers' as PlaceFeature],
    }),
  },
];

interface MapFilterChipsProps {
  filters: PlaceFiltersState;
  onFiltersChange: (filters: PlaceFiltersState) => void;
  filteredCount?: number;
  reviewFilters?: ReviewFiltersState;
  onReviewFiltersChange?: (filters: ReviewFiltersState) => void;
}

export function MapFilterChips({ 
  filters, 
  onFiltersChange, 
  filteredCount,
  reviewFilters = DEFAULT_REVIEW_FILTERS,
  onReviewFiltersChange,
}: MapFilterChipsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: allStamps } = useAllStamps();

  // Filter stamps by polarity for campgrounds/national_parks (main categories)
  const positiveStamps = (allStamps || []).filter(
    s => s.polarity === 'positive' && (s.category === 'campgrounds' || s.category === 'national_parks')
  );
  const neutralStamps = (allStamps || []).filter(
    s => s.polarity === 'neutral' && (s.category === 'campgrounds' || s.category === 'national_parks')
  );
  const negativeStamps = (allStamps || []).filter(
    s => s.polarity === 'improvement' && (s.category === 'campgrounds' || s.category === 'national_parks')
  );

  // Deduplicate stamps by label (same label across categories)
  const dedupeByLabel = (stamps: StampDefinition[]): StampDefinition[] => {
    const seen = new Set<string>();
    return stamps.filter(s => {
      if (seen.has(s.label)) return false;
      seen.add(s.label);
      return true;
    });
  };

  const uniquePositive = dedupeByLabel(positiveStamps);
  const uniqueNeutral = dedupeByLabel(neutralStamps);
  const uniqueNegative = dedupeByLabel(negativeStamps);

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.features.length +
    (filters.openYearRound ? 1 : 0) +
    (filters.petFriendly ? 1 : 0) +
    (filters.bigRigFriendly ? 1 : 0);

  const activeReviewFilterCount = countActiveReviewFilters(reviewFilters);
  const totalActiveFilters = activeFilterCount + activeReviewFilterCount;

  function toggleFeature(feature: PlaceFeature) {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature];
    onFiltersChange({ ...filters, features: newFeatures });
  }

  function toggleReviewStamp(stampId: string, type: 'positive' | 'neutral' | 'negative') {
    if (!onReviewFiltersChange) return;
    
    const key = type === 'positive' ? 'positiveStamps' : type === 'neutral' ? 'neutralStamps' : 'negativeStamps';
    const current = reviewFilters[key];
    const updated = current.includes(stampId)
      ? current.filter(id => id !== stampId)
      : [...current, stampId];
    
    onReviewFiltersChange({ ...reviewFilters, [key]: updated });
  }

  function clearFilters() {
    onFiltersChange({
      category: null,
      features: [],
      openYearRound: false,
      petFriendly: false,
      bigRigFriendly: false,
    });
    if (onReviewFiltersChange) {
      onReviewFiltersChange(DEFAULT_REVIEW_FILTERS);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max py-1">
          {/* More filters button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-chip',
                  'bg-card/[0.88] backdrop-blur-xl transition-all duration-200',
                  'active:scale-[0.95] touch-manipulation',
                  totalActiveFilters > 0
                    ? 'ring-2 ring-primary text-primary font-semibold'
                    : 'text-foreground font-medium'
                )}
                style={{ boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.12)' }}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {totalActiveFilters > 0 && (
                  <span className="ml-0.5 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-chip font-bold">
                    {totalActiveFilters}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col">
              <SheetHeader className="text-left pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-display text-xl">Filters</SheetTitle>
                  {totalActiveFilters > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                      Clear all
                    </Button>
                  )}
                </div>
                {filteredCount !== undefined && (
                  <p className="text-sm text-muted-foreground">{filteredCount} places found</p>
                )}
              </SheetHeader>

              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-6 pb-6">
                  {/* REVIEW FILTERS - POSITIVE */}
                  {onReviewFiltersChange && uniquePositive.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsUp className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-medium text-foreground">What people liked</h3>
                        {reviewFilters.positiveStamps.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({reviewFilters.positiveStamps.length})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {uniquePositive.map((stamp) => {
                          const isActive = reviewFilters.positiveStamps.includes(stamp.id);
                          return (
                            <button
                              key={stamp.id}
                              onClick={() => toggleReviewStamp(stamp.id, 'positive')}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                                isActive
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/50'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              )}
                            >
                              {stamp.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* REVIEW FILTERS - NEUTRAL */}
                  {onReviewFiltersChange && uniqueNeutral.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          <h3 className="text-sm font-medium text-foreground">Place feels like</h3>
                          {reviewFilters.neutralStamps.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({reviewFilters.neutralStamps.length})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {uniqueNeutral.map((stamp) => {
                            const isActive = reviewFilters.neutralStamps.includes(stamp.id);
                            return (
                              <button
                                key={stamp.id}
                                onClick={() => toggleReviewStamp(stamp.id, 'neutral')}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                                  isActive
                                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500/50'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                              >
                                {stamp.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* REVIEW FILTERS - NEGATIVE (EXCLUDE/HIDE) */}
                  {onReviewFiltersChange && uniqueNegative.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Ban className="w-4 h-4 text-red-500" />
                          <h3 className="text-sm font-medium text-foreground">Exclude places with</h3>
                          {reviewFilters.negativeStamps.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({reviewFilters.negativeStamps.length})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Places with these issues will be hidden from results
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {uniqueNegative.slice(0, 15).map((stamp) => {
                            const isActive = reviewFilters.negativeStamps.includes(stamp.id);
                            return (
                              <button
                                key={stamp.id}
                                onClick={() => toggleReviewStamp(stamp.id, 'negative')}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                                  isActive
                                    ? 'bg-red-500/20 text-red-700 dark:text-red-400 ring-1 ring-red-500/50'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                              >
                                {stamp.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Quick filters */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Quick Filters</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="petFriendly"
                          checked={filters.petFriendly}
                          onCheckedChange={(checked) =>
                            onFiltersChange({ ...filters, petFriendly: !!checked })
                          }
                        />
                        <Label htmlFor="petFriendly" className="text-sm cursor-pointer">
                          🐕 Pet Friendly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="bigRigFriendly"
                          checked={filters.bigRigFriendly}
                          onCheckedChange={(checked) =>
                            onFiltersChange({ ...filters, bigRigFriendly: !!checked })
                          }
                        />
                        <Label htmlFor="bigRigFriendly" className="text-sm cursor-pointer">
                          🚛 Big Rig Friendly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="openYearRound"
                          checked={filters.openYearRound}
                          onCheckedChange={(checked) =>
                            onFiltersChange({ ...filters, openYearRound: !!checked })
                          }
                        />
                        <Label htmlFor="openYearRound" className="text-sm cursor-pointer">
                          📅 Open Year-Round
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Category */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Category</h3>
                    <Select
                      value={filters.category || ''}
                      onValueChange={(v) =>
                        onFiltersChange({ ...filters, category: (v || null) as PlaceCategory | null })
                      }
                    >
                      <SelectTrigger className="w-full bg-card border-border">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-[100] max-h-60">
                        <SelectItem value="">All categories</SelectItem>
                        {PLACE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Amenities
                      {filters.features.length > 0 && (
                        <span className="text-muted-foreground font-normal ml-2">
                          ({filters.features.length})
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {PLACE_FEATURES.map((feature) => (
                        <div
                          key={feature}
                          className={cn(
                            'flex items-center p-2.5 rounded-xl border cursor-pointer transition-colors',
                            filters.features.includes(feature)
                              ? 'bg-primary/10 border-primary/30 text-foreground'
                              : 'bg-card border-border text-muted-foreground hover:border-primary/20'
                          )}
                          onClick={() => toggleFeature(feature)}
                        >
                          <Checkbox
                            checked={filters.features.includes(feature)}
                            className="mr-2"
                            onCheckedChange={() => toggleFeature(feature)}
                          />
                          <span className="text-xs leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="pt-4 border-t border-border">
                <Button className="w-full" onClick={() => setSheetOpen(false)}>
                  Show {filteredCount} places
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Quick chips */}
          {QUICK_CHIPS.map((chip) => {
            const isActive = chip.isActive(filters);
            return (
              <button
                key={chip.id}
                onClick={() => {
                  hapticLight();
                  onFiltersChange(chip.toggle(filters));
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-chip',
                  'bg-card/[0.88] backdrop-blur-xl transition-all duration-200',
                  'active:scale-[0.95] touch-manipulation whitespace-nowrap',
                  isActive
                    ? 'ring-2 ring-primary text-primary font-semibold'
                    : 'text-foreground font-medium'
                )}
                style={{ boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.12)' }}
              >
                <span className="text-base leading-none">{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            );
          })}

          {/* Clear all button - only show if filters active */}
          {totalActiveFilters > 0 && (
            <button
              onClick={() => {
                hapticLight();
                clearFilters();
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-destructive/10 text-destructive transition-all active:scale-[0.95] touch-manipulation whitespace-nowrap"
              style={{ boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.12)' }}
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
