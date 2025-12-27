import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePrimaryCategories } from '@/hooks/usePlaceForm';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Plus,
  Tent,
  Caravan,
  TreePine,
  Mountain,
  Trees,
  Grape,
  ParkingSquare,
  CircleParking,
  Warehouse,
  Shield,
  Home,
  Building,
  Hotel,
  Bed,
  Trash2,
  Droplets,
  Flame,
  Wrench,
  Truck,
  Store,
  Sparkles,
  Circle,
  Fuel,
  ShoppingCart,
  ShoppingBasket,
  IceCream2 as IceCream,
  Hammer,
  Car,
  Building2,
  ShoppingBag,
  Backpack,
  UtensilsCrossed,
  Sandwich,
  Coffee,
  Beer,
  Wine,
  Hospital,
  HeartPulse,
  Stethoscope,
  Smile,
  Pill,
  Dog,
  Umbrella,
  Waves,
  Footprints,
  Info,
  Landmark,
  Ticket,
  MapPin,
  Camera,
  Shirt,
  Wifi,
  Users,
  BookOpen,
  Laptop,
  FileCheck,
  AlertTriangle,
  Ship,
  Construction,
  Ban,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

// Icon mapping for categories
const ICON_MAP: Record<string, LucideIcon> = {
  Tent, Caravan, TreePine, Mountain, Trees, Grape, ParkingSquare, CircleParking,
  Warehouse, Shield, Home, Building, Hotel, Bed, Trash2, Droplets, Flame, Wrench,
  Truck, Store, Sparkles, Circle, Fuel, ShoppingCart, ShoppingBasket, IceCream,
  Hammer, Car, Building2, ShoppingBag, Backpack, UtensilsCrossed, Sandwich,
  Coffee, Beer, Wine, Hospital, HeartPulse, Stethoscope, Smile, Pill, Dog,
  Umbrella, Waves, Footprints, Info, Landmark, Ticket, MapPin, Camera, Shirt,
  Wifi, Users, BookOpen, Laptop, FileCheck, AlertTriangle, Ship, Construction,
  Ban, MoreHorizontal,
};

// Group labels with icons
const CATEGORY_GROUP_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  stay_sleep: { label: 'Camping & Overnight', icon: Tent },
  rv_services: { label: 'RV Services', icon: Caravan },
  essential_stops: { label: 'Essentials & Shopping', icon: ShoppingBasket },
  food_drink: { label: 'Food & Drink', icon: UtensilsCrossed },
  health_safety: { label: 'Health & Safety', icon: Hospital },
  attractions: { label: 'Travel & Attractions', icon: Camera },
  general_services: { label: 'Utilities & Connectivity', icon: Wifi },
  non_rv_lodging: { label: 'Non-RV Lodging', icon: Hotel },
  retail: { label: 'Retail', icon: Store },
  community_other: { label: 'Administrative & Other', icon: MoreHorizontal },
};

// Order of groups for display
const GROUP_ORDER = [
  'stay_sleep',
  'rv_services',
  'essential_stops',
  'food_drink',
  'health_safety',
  'attractions',
  'general_services',
  'non_rv_lodging',
  'retail',
  'community_other',
];

interface CategorySelectorProps {
  primaryCategoryId: string;
  additionalCategoryIds: string[];
  customCategoryText?: string;
  onPrimaryChange: (categoryId: string) => void;
  onAdditionalChange: (categoryIds: string[]) => void;
  onCustomTextChange?: (text: string) => void;
  maxAdditional?: number;
}

export function CategorySelector({
  primaryCategoryId,
  additionalCategoryIds,
  customCategoryText = '',
  onPrimaryChange,
  onAdditionalChange,
  onCustomTextChange,
  maxAdditional = 4,
}: CategorySelectorProps) {
  const { data: categories } = usePrimaryCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['stay_sleep', 'rv_services']));

  // Group categories by category_group
  const groupedCategories = useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc, cat) => {
      const group = cat.category_group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(cat);
      return acc;
    }, {} as Record<string, typeof categories>);
  }, [categories]);

  // Filter categories by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedCategories;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof categories> = {};
    
    Object.entries(groupedCategories).forEach(([group, cats]) => {
      const matchingCats = cats?.filter(cat => 
        cat.label.toLowerCase().includes(query) ||
        group.toLowerCase().includes(query)
      );
      if (matchingCats && matchingCats.length > 0) {
        filtered[group] = matchingCats;
      }
    });
    
    return filtered;
  }, [groupedCategories, searchQuery]);

  // Auto-expand groups that have search matches
  const effectiveExpandedGroups = useMemo(() => {
    if (searchQuery.trim()) {
      return new Set(Object.keys(filteredGroups));
    }
    return expandedGroups;
  }, [searchQuery, filteredGroups, expandedGroups]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleSelectPrimary = (categoryId: string) => {
    onPrimaryChange(categoryId);
    // Remove from additional if it was selected there
    if (additionalCategoryIds.includes(categoryId)) {
      onAdditionalChange(additionalCategoryIds.filter(id => id !== categoryId));
    }
  };

  const toggleAdditional = (categoryId: string) => {
    if (categoryId === primaryCategoryId) return; // Can't add primary as additional
    
    if (additionalCategoryIds.includes(categoryId)) {
      onAdditionalChange(additionalCategoryIds.filter(id => id !== categoryId));
    } else if (additionalCategoryIds.length < maxAdditional) {
      onAdditionalChange([...additionalCategoryIds, categoryId]);
    }
  };

  const removeAdditional = (categoryId: string) => {
    onAdditionalChange(additionalCategoryIds.filter(id => id !== categoryId));
  };

  const getCategoryLabel = (categoryId: string) => {
    return categories?.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const isOtherSelected = primaryCategoryId === 'other';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Primary Category */}
      {primaryCategoryId && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Primary Category</Label>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1.5 bg-primary">
              {getCategoryLabel(primaryCategoryId)}
              <button
                type="button"
                onClick={() => onPrimaryChange('')}
                className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        </div>
      )}

      {/* "Other" category custom text input */}
      {isOtherSelected && onCustomTextChange && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-dashed">
          <Label htmlFor="custom-category" className="text-sm">
            Describe this place in your own words
          </Label>
          <Input
            id="custom-category"
            placeholder="e.g., Pet grooming for RVers, Solar panel installer..."
            value={customCategoryText}
            onChange={(e) => onCustomTextChange(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Your custom category will be visible on the place and searchable.
          </p>
        </div>
      )}

      {/* Selected Additional Categories */}
      {additionalCategoryIds.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Additional Categories ({additionalCategoryIds.length}/{maxAdditional})
          </Label>
          <div className="flex flex-wrap gap-2">
            {additionalCategoryIds.map(catId => (
              <Badge key={catId} variant="secondary" className="gap-1">
                {getCategoryLabel(catId)}
                <button
                  type="button"
                  onClick={() => removeAdditional(catId)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Category Groups */}
      <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
        {GROUP_ORDER.filter(group => filteredGroups[group]).map((group) => {
          const cats = filteredGroups[group];
          const config = CATEGORY_GROUP_CONFIG[group];
          const isExpanded = effectiveExpandedGroups.has(group);
          const GroupIcon = config?.icon || MoreHorizontal;

          return (
            <Collapsible key={group} open={isExpanded} onOpenChange={() => toggleGroup(group)}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors border-b text-left">
                <div className="flex items-center gap-2">
                  <GroupIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{config?.label || group}</span>
                  <span className="text-xs text-muted-foreground">({cats?.length || 0})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-2 space-y-1">
                  {cats?.map((cat) => {
                    const isPrimary = cat.id === primaryCategoryId;
                    const isAdditional = additionalCategoryIds.includes(cat.id);
                    const canAddMore = additionalCategoryIds.length < maxAdditional;
                    const icon = getCategoryIcon(cat.icon);

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          isPrimary 
                            ? 'bg-primary/10 border border-primary/30' 
                            : isAdditional
                            ? 'bg-secondary/50 border border-secondary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {icon && <span className="text-muted-foreground">{icon}</span>}
                          <span className={`text-sm ${isPrimary ? 'font-medium' : ''}`}>
                            {cat.label}
                          </span>
                          {isPrimary && (
                            <Badge variant="default" className="text-xs py-0">Primary</Badge>
                          )}
                          {isAdditional && (
                            <Badge variant="secondary" className="text-xs py-0">Added</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSelectPrimary(cat.id)}
                              className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            >
                              Set Primary
                            </button>
                          )}
                          {!isPrimary && !isAdditional && canAddMore && (
                            <button
                              type="button"
                              onClick={() => toggleAdditional(cat.id)}
                              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                          )}
                          {isAdditional && (
                            <button
                              type="button"
                              onClick={() => removeAdditional(cat.id)}
                              className="text-xs px-2 py-1 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Select 1 primary category (required) and up to {maxAdditional} additional categories (optional).
      </p>
    </div>
  );
}