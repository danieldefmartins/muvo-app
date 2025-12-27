import { useState } from 'react';
import { Filter, X, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PLACE_CATEGORIES, PLACE_FEATURES, PlaceCategory, PlaceFeature } from '@/hooks/usePlaces';

export type SortOption = 'recently-updated' | 'alphabetical';

export interface PlaceFiltersState {
  category: PlaceCategory | null;
  features: PlaceFeature[];
  openYearRound: boolean;
  petFriendly: boolean;
  bigRigFriendly: boolean;
}

interface PlaceFiltersProps {
  filters: PlaceFiltersState;
  onFiltersChange: (filters: PlaceFiltersState) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export function PlaceFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  totalCount,
  filteredCount,
}: PlaceFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.features.length +
    (filters.openYearRound ? 1 : 0) +
    (filters.petFriendly ? 1 : 0) +
    (filters.bigRigFriendly ? 1 : 0);

  function toggleFeature(feature: PlaceFeature) {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature];
    onFiltersChange({ ...filters, features: newFeatures });
  }

  function clearFilters() {
    onFiltersChange({
      category: null,
      features: [],
      openYearRound: false,
      petFriendly: false,
      bigRigFriendly: false,
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* Sort dropdown */}
      <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger className="w-auto gap-1.5 h-9 text-sm bg-card border-border">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          <SelectItem value="recently-updated">Recently updated</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>

      {/* Filters sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 h-9">
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl flex flex-col">
          <SheetHeader className="text-left pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-xl">Filter Places</SheetTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Clear all
                </Button>
              )}
            </div>
            <SheetDescription className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalCount} places
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6 pb-6">
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

              {/* Category filter */}
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
                  <SelectContent className="bg-popover border-border z-50 max-h-60">
                    <SelectItem value="">All categories</SelectItem>
                    {PLACE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Features multi-select */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Amenities & Features
                  {filters.features.length > 0 && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({filters.features.length} selected)
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PLACE_FEATURES.map((feature) => (
                    <div
                      key={feature}
                      className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        filters.features.includes(feature)
                          ? 'bg-primary/10 border-primary/30 text-foreground'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/20'
                      }`}
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

          {/* Apply button */}
          <div className="pt-4 border-t border-border">
            <Button className="w-full" onClick={() => setOpen(false)}>
              Show {filteredCount} places
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {filters.category && (
            <Badge variant="secondary" className="shrink-0 gap-1 pr-1">
              {filters.category.length > 15
                ? filters.category.substring(0, 15) + '...'
                : filters.category}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, category: null })}
                className="ml-0.5 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.petFriendly && (
            <Badge variant="secondary" className="shrink-0 gap-1 pr-1">
              Pet Friendly
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, petFriendly: false })}
                className="ml-0.5 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.bigRigFriendly && (
            <Badge variant="secondary" className="shrink-0 gap-1 pr-1">
              Big Rig
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, bigRigFriendly: false })}
                className="ml-0.5 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
