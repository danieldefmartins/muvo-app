import { useState } from 'react';
import { MapPin, Navigation, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface Entrance {
  name: string;
  latitude: number;
  longitude: number;
  road?: string;
  notes?: string;
  isPrimary?: boolean;
}

interface PlaceEntrancesProps {
  entrances: Entrance[];
  placeName: string;
}

export function PlaceEntrances({ entrances, placeName }: PlaceEntrancesProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  if (entrances.length === 0) return null;

  const handleNavigate = (entrance: Entrance) => {
    const destination = `${entrance.latitude},${entrance.longitude}`;
    const label = encodeURIComponent(`${placeName} - ${entrance.name}`);
    
    // Try to detect platform and open appropriate maps app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.apple.com/?daddr=${destination}&dirflg=d`, '_blank');
    } else if (isAndroid) {
      window.open(`geo:${destination}?q=${destination}(${label})`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  };

  const toggleNotes = (index: number) => {
    setExpandedNotes(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className="animate-fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Entrances
      </h2>
      
      <div className="space-y-3">
        {entrances.map((entrance, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground">{entrance.name}</h3>
                  {entrance.isPrimary && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </Badge>
                  )}
                </div>
                
                {entrance.road && (
                  <p className="text-sm text-muted-foreground mt-1">
                    via {entrance.road}
                  </p>
                )}

                {entrance.notes && (
                  <div className="mt-2">
                    {entrance.notes.length > 80 ? (
                      <Collapsible 
                        open={expandedNotes[index]} 
                        onOpenChange={() => toggleNotes(index)}
                      >
                        <p className="text-sm text-muted-foreground">
                          {expandedNotes[index] 
                            ? entrance.notes 
                            : `${entrance.notes.slice(0, 80)}...`
                          }
                        </p>
                        <CollapsibleTrigger className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                          {expandedNotes[index] ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Show more <ChevronDown className="w-3 h-3" /></>
                          )}
                        </CollapsibleTrigger>
                      </Collapsible>
                    ) : (
                      <p className="text-sm text-muted-foreground">{entrance.notes}</p>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground/70 mt-2">
                  {entrance.latitude.toFixed(4)}°N, {Math.abs(entrance.longitude).toFixed(4)}°W
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => handleNavigate(entrance)}
              >
                <Navigation className="w-4 h-4 mr-1.5" />
                Navigate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Helper function to extract entrances from a place object
export function extractEntrances(place: Record<string, unknown>): Entrance[] {
  const entrances: Entrance[] = [];

  for (let i = 1; i <= 6; i++) {
    const name = place[`entrance_${i}_name`] as string | undefined;
    const lat = place[`entrance_${i}_latitude`] as number | undefined;
    const lng = place[`entrance_${i}_longitude`] as number | undefined;

    if (name && lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      entrances.push({
        name,
        latitude: lat,
        longitude: lng,
        road: (place[`entrance_${i}_road`] as string) || undefined,
        notes: (place[`entrance_${i}_notes`] as string) || undefined,
        isPrimary: (place[`entrance_${i}_is_primary`] as boolean) || false,
      });
    }
  }

  return entrances;
}
