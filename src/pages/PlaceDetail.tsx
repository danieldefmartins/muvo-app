import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Truck,
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  Images,
  ChevronDown,
  ChevronUp,
  Cloud,
  Navigation,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { WeatherBadge } from '@/components/WeatherBadge';
import { TrustBadge } from '@/components/TrustBadge';
import { PriceIndicator } from '@/components/PriceIndicator';
import { SuggestUpdateForm } from '@/components/SuggestUpdateForm';
import { PendingSuggestions } from '@/components/PendingSuggestions';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PlaceCheckin } from '@/components/PlaceCheckin';
import { PlaceStatusBadge } from '@/components/PlaceStatusBadge';
import { ReportStatusForm } from '@/components/ReportStatusForm';
import { PlacePhotoGallery } from '@/components/PlacePhotoGallery';
import { PhotoUploadForm } from '@/components/PhotoUploadForm';
import { CompactReviewStrip } from '@/components/CompactReviewStrip';
import { usePlace, formatLastUpdated } from '@/hooks/usePlaces';
import { useAuth } from '@/hooks/useAuth';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { PlaceMiniMap, PlaceMiniMapPlaceholder } from '@/components/PlaceMiniMap';
import { NavigateButton } from '@/components/NavigateButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: place, isLoading, error } = usePlace(id || '');
  const { user, isVerified } = useAuth();
  const { data: mapboxToken } = useMapboxToken();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Loading..." showBack />
        <main className="container px-4 py-6 max-w-lg mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Place Not Found" showBack />
        <main className="container px-4 py-8 max-w-lg mx-auto text-center">
          <p className="text-muted-foreground">This place could not be found.</p>
        </main>
      </div>
    );
  }

  // Create a simple location string from coordinates
  const locationString = `${place.latitude.toFixed(4)}°N, ${Math.abs(place.longitude).toFixed(4)}°W`;

  // Show only first 6 amenities, then "Show more"
  const visibleAmenities = showAllAmenities ? place.features : place.features.slice(0, 6);
  const hasMoreAmenities = place.features.length > 6;

  // Check if logistics is relevant (has packages info)
  const hasLogisticsInfo = place.packagesAccepted !== 'No' || place.packageFeeRequired || place.packageFeeAmount;

  return (
    <div className="min-h-screen bg-background">
      <Header title={place.name} showBack />

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-5">
        
        {/* 1. Place Name + Price Level */}
        <section className="animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {place.name}
            </h1>
            <PriceIndicator level={place.priceLevel} className="mt-1" />
          </div>

          {/* Location + Distance */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{locationString}</span>
            <span>•</span>
            <span>{place.distance} mi away</span>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mt-3">
            {place.isVerified && <TrustBadge type="verified" />}
            <TrustBadge type="updated" value={formatLastUpdated(place.lastUpdated)} />
            {place.openYearRound && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium">
                <Calendar className="w-3 h-3 mr-1" />
                Year-round
              </span>
            )}
          </div>
        </section>

        {/* 2. Reviews Summary + CTA */}
        <section className="animate-fade-in bg-card border border-border rounded-xl p-4">
          <CompactReviewStrip
            placeId={id!}
            placeName={place.name}
            placeCategory={place.primaryCategory}
          />
        </section>

        {/* Quick Actions */}
        <section className="animate-fade-in">
          <div className="flex gap-2">
            <FavoriteButton placeId={place.id} variant="full" className="flex-1" />
            <NavigateButton
              latitude={place.latitude}
              longitude={place.longitude}
              name={place.name}
              variant="compact"
              className="flex-1"
            />
          </div>
        </section>

        {/* 3. Map Preview (small, tappable) */}
        <section className="animate-fade-in">
          <div className="rounded-xl overflow-hidden border border-border">
            {mapboxToken ? (
              <PlaceMiniMap
                latitude={place.latitude}
                longitude={place.longitude}
                name={place.name}
                mapboxToken={mapboxToken}
                category={place.primaryCategory}
                isVerified={place.isVerified}
                lastUpdated={place.lastUpdated instanceof Date ? place.lastUpdated.toISOString() : place.lastUpdated}
              />
            ) : (
              <PlaceMiniMapPlaceholder />
            )}
          </div>
        </section>

        {/* 4. Current Conditions (Weather + Status combined) */}
        <section className="animate-fade-in">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Current Conditions
          </h2>
          <div className="space-y-3">
            {/* Weather */}
            <WeatherBadge 
              latitude={place.latitude} 
              longitude={place.longitude} 
              variant="card"
            />
            
            {/* Status */}
            <div className="bg-card border border-border rounded-lg p-3">
              <PlaceStatusBadge 
                status={place.currentStatus} 
                statusUpdatedAt={place.statusUpdatedAt} 
              />
              <div className="mt-3">
                <ReportStatusForm placeId={id!} currentStatus={place.currentStatus} />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Amenities & Features (chips, collapsible) */}
        {place.features.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Amenities & Features
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleAmenities.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
            {hasMoreAmenities && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
              >
                {showAllAmenities ? (
                  <>Show less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>+{place.features.length - 6} more <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </section>
        )}

        {/* 6. Logistics / Packages / Fees (collapsed by default) */}
        <Collapsible open={showLogistics} onOpenChange={setShowLogistics}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between py-3 px-4 bg-secondary/50 rounded-lg text-left hover:bg-secondary/70 transition-colors">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Packages & Fees</span>
                {hasLogisticsInfo && (
                  <span className="text-xs text-muted-foreground">
                    ({place.packagesAccepted === 'Yes' ? 'Accepts packages' : place.packagesAccepted === 'Limited' ? 'Limited' : 'Info available'})
                  </span>
                )}
              </div>
              {showLogistics ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              <InfoRow
                icon={Package}
                label="Packages Accepted"
                value={place.packagesAccepted}
                valueClassName={cn(
                  place.packagesAccepted === 'Yes' && 'text-primary',
                  place.packagesAccepted === 'No' && 'text-muted-foreground',
                  place.packagesAccepted === 'Limited' && 'text-warning'
                )}
              />
              <InfoRow
                icon={DollarSign}
                label="Fee Required"
                value={place.packageFeeRequired ? 'Yes' : 'No'}
              />
              {place.packageFeeAmount && (
                <InfoRow
                  icon={DollarSign}
                  label="Fee Amount"
                  value={place.packageFeeAmount}
                />
              )}
              <InfoRow
                icon={Calendar}
                label="Last Verified"
                value={formatLastUpdated(place.lastUpdated)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 7. Check-in Section */}
        <section className="animate-fade-in">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Check In
          </h2>
          <PlaceCheckin placeId={id!} />
        </section>

        {/* Photo Gallery - moved lower, still accessible */}
        <section className="animate-fade-in">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Images className="w-5 h-5 text-primary" />
            Photos
          </h2>
          {showPhotoUpload ? (
            <PhotoUploadForm 
              placeId={id!}
              onSuccess={() => {
                setShowPhotoUpload(false);
                queryClient.invalidateQueries({ queryKey: ['place-photos', id] });
              }}
              onCancel={() => setShowPhotoUpload(false)}
            />
          ) : (
            <PlacePhotoGallery 
              placeId={id!} 
              onAddPhoto={() => setShowPhotoUpload(true)}
            />
          )}
        </section>

        {/* Suggest Update - Verified users only */}
        {user && isVerified && (
          <section className="animate-fade-in">
            <SuggestUpdateForm place={place} isVerified={isVerified} />
          </section>
        )}

        {/* Not verified prompt */}
        {user && !isVerified && (
          <section className="animate-fade-in">
            <div className="p-4 bg-secondary/30 border border-dashed border-border rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Want to suggest updates to this place?
              </p>
              <Link to="/auth" className="text-sm text-primary hover:underline">
                Complete verification to contribute
              </Link>
            </div>
          </section>
        )}

        {/* Pending Suggestions */}
        <PendingSuggestions placeId={id!} />

        {/* Conflict warning - only show if relevant */}
        {place.hasConflict && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Some details reported differently by users. Always verify locally.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          Information is based on community reports. Always verify locally.
        </p>
      </main>
    </div>
  );
};

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoRow({ icon: Icon, label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn('text-sm font-medium text-foreground', valueClassName)}>
        {value}
      </span>
    </div>
  );
}

export default PlaceDetail;
