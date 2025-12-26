import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Place } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';
import { hapticLight } from '@/lib/haptics';
import { ChevronUp, ChevronRight, MapPin, ShieldCheck } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '@/lib/categoryColors';
import { Button } from '@/components/ui/button';
import { NavigateButton } from '@/components/NavigateButton';

type SheetState = 'collapsed' | 'peek' | 'expanded';

interface MapPlaceBottomSheetProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (place: Place) => void;
  mapCenter?: { lng: number; lat: number };
}

function distanceFromCenter(place: Place, center?: { lng: number; lat: number }): number {
  if (!center) return place.distance || 0;
  const R = 3959; // Earth radius in miles
  const dLat = ((place.latitude - center.lat) * Math.PI) / 180;
  const dLng = ((place.longitude - center.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((center.lat * Math.PI) / 180) *
      Math.cos((place.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function MapPlaceBottomSheet({ 
  places, 
  selectedPlaceId, 
  onPlaceSelect, 
  mapCenter 
}: MapPlaceBottomSheetProps) {
  const navigate = useNavigate();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentTranslateY = useRef(0);
  const isDragging = useRef(false);

  // Sort places by distance from map center
  const sortedPlaces = useMemo(() => {
    return [...places]
      .sort((a, b) => distanceFromCenter(a, mapCenter) - distanceFromCenter(b, mapCenter))
      .slice(0, 30);
  }, [places, mapCenter]);

  // Find selected place details
  const selectedPlace = useMemo(() => {
    return selectedPlaceId ? sortedPlaces.find(p => p.id === selectedPlaceId) : null;
  }, [selectedPlaceId, sortedPlaces]);

  // Auto-expand to peek when a place is selected
  useEffect(() => {
    if (selectedPlaceId && sheetState === 'collapsed') {
      setSheetState('peek');
    }
  }, [selectedPlaceId]);

  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    currentTranslateY.current = 0;
    
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }, []);

  const handleDragMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY.current;
    currentTranslateY.current = deltaY;
    
    if (sheetRef.current) {
      const maxDrag = window.innerHeight * 0.5;
      const clampedDelta = Math.max(-maxDrag, Math.min(maxDrag, deltaY));
      sheetRef.current.style.transform = `translateY(${clampedDelta}px)`;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const threshold = 40;
    const delta = currentTranslateY.current;
    
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      sheetRef.current.style.transform = '';
    }
    
    hapticLight();
    
    if (delta > threshold) {
      // Dragged down - collapse
      if (sheetState === 'expanded') {
        setSheetState('peek');
      } else if (sheetState === 'peek') {
        setSheetState('collapsed');
      }
    } else if (delta < -threshold) {
      // Dragged up - expand
      if (sheetState === 'collapsed') {
        setSheetState('peek');
      } else if (sheetState === 'peek') {
        setSheetState('expanded');
      }
    }
  }, [sheetState]);

  const handlePlaceClick = (place: Place) => {
    hapticLight();
    onPlaceSelect(place);
    setSheetState('peek');
  };

  const handleViewDetails = (placeId: string) => {
    hapticLight();
    navigate(`/place/${placeId}`);
  };

  // Sheet heights
  const getSheetHeight = () => {
    switch (sheetState) {
      case 'collapsed': return '52px';
      case 'peek': return selectedPlace ? '180px' : '200px';
      case 'expanded': return '60vh';
    }
  };

  if (sortedPlaces.length === 0) return null;

  return (
    <div
      ref={sheetRef}
      className="fixed left-0 right-0 z-[35] bg-card/[0.96] backdrop-blur-xl rounded-t-2xl transition-all duration-300 ease-out"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        height: getSheetHeight(),
        boxShadow: '0 -4px 24px -4px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Drag Handle */}
      <div
        className="flex flex-col items-center py-2 cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mb-1" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ChevronUp className={cn(
            "w-3 h-3 transition-transform",
            sheetState === 'expanded' && "rotate-180"
          )} />
          <span>{sortedPlaces.length} places nearby</span>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="overflow-y-auto px-3 pb-3"
        style={{ maxHeight: 'calc(100% - 44px)' }}
      >
        {/* Selected Place Card (when peek) */}
        {sheetState === 'peek' && selectedPlace && (
          <div 
            className="bg-muted/50 rounded-xl p-3 mb-3"
            onClick={() => handleViewDetails(selectedPlace.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {selectedPlace.name}
                  </h3>
                  {selectedPlace.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>
                
                {/* Category label - TEXT FIRST */}
                <div 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2"
                  style={{ 
                    backgroundColor: `${getCategoryColor(selectedPlace.primaryCategory)}20`,
                    color: getCategoryColor(selectedPlace.primaryCategory),
                  }}
                >
                  {getCategoryLabel(selectedPlace.primaryCategory)}
                </div>
                
                {/* Distance + Price */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{distanceFromCenter(selectedPlace, mapCenter).toFixed(1)} mi</span>
                  <span>•</span>
                  <span>{selectedPlace.priceLevel}</span>
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(selectedPlace.id);
                }}
              >
                View Details
              </Button>
              <NavigateButton 
                latitude={selectedPlace.latitude}
                longitude={selectedPlace.longitude}
                name={selectedPlace.name}
                className="flex-1 h-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Places List */}
        {(sheetState === 'expanded' || (sheetState === 'peek' && !selectedPlace)) && (
          <div className="space-y-2">
            {sortedPlaces.map((place) => {
              const isSelected = place.id === selectedPlaceId;
              const categoryColor = getCategoryColor(place.primaryCategory);
              const distance = distanceFromCenter(place, mapCenter);

              return (
                <div
                  key={place.id}
                  onClick={() => sheetState === 'expanded' ? handleViewDetails(place.id) : handlePlaceClick(place)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors',
                    isSelected 
                      ? 'bg-primary/10 ring-1 ring-primary/30' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  )}
                >
                  {/* Category color indicator */}
                  <div 
                    className="w-1.5 h-12 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: categoryColor }}
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {place.name}
                      </h4>
                      {place.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Category label - ALWAYS TEXT */}
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {getCategoryLabel(place.primaryCategory)}
                    </p>
                    
                    {/* Distance + Price */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{distance.toFixed(1)} mi</span>
                      </div>
                      <span>•</span>
                      <span>{place.priceLevel}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsed state hint */}
        {sheetState === 'collapsed' && (
          <div className="text-center text-xs text-muted-foreground py-1">
            Drag up to see places
          </div>
        )}
      </div>
    </div>
  );
}
