import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Truck,
  Camera,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { TrustBadge } from '@/components/TrustBadge';
import { PriceIndicator } from '@/components/PriceIndicator';
import { SuggestUpdateForm } from '@/components/SuggestUpdateForm';
import { PendingSuggestions } from '@/components/PendingSuggestions';
import { usePlace, formatLastUpdated } from '@/hooks/usePlaces';
import { useAuth } from '@/hooks/useAuth';
import { ImageUpload } from '@/components/ImageUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: place, isLoading, error } = usePlace(id || '');
  const { user, isVerified } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
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

  const displayImageUrl = localImageUrl || place.coverImageUrl;

  function handleImageUploadSuccess(imageUrl: string) {
    setLocalImageUrl(imageUrl);
    setShowUpload(false);
    // Invalidate the query to refresh
    queryClient.invalidateQueries({ queryKey: ['place', id] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={place.name} showBack />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Cover Image */}
        <section className="mb-6 animate-fade-in">
          <div className="relative rounded-lg overflow-hidden">
            <AspectRatio ratio={16 / 9}>
              {displayImageUrl ? (
                <img
                  src={displayImageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-muted-foreground text-sm">No photo yet</span>
                  </div>
                </div>
              )}
            </AspectRatio>
            
            {/* Category badge overlay */}
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-background/90 text-foreground backdrop-blur-sm">
                {place.primaryCategory}
              </span>
            </div>
          </div>
        </section>

        {/* Upload Photo Section */}
        {user && (
          <section className="mb-6 animate-fade-in">
            {showUpload ? (
              <div className="space-y-3">
                <ImageUpload
                  placeId={id!}
                  onSuccess={handleImageUploadSuccess}
                  disabled={!isVerified}
                />
                {!isVerified && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Link to="/auth" className="text-primary hover:underline">
                      Complete verification
                    </Link>{' '}
                    to upload photos
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUpload(true)}
              >
                <Camera className="w-4 h-4 mr-2" />
                {displayImageUrl ? 'Update photo' : 'Add a photo'}
              </Button>
            )}
          </section>
        )}

        {!user && (
          <section className="mb-6 animate-fade-in">
            <Link to="/auth">
              <Button variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Sign in to add a photo
              </Button>
            </Link>
          </section>
        )}

        {/* Hero section */}
        <section className="mb-6 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {place.name}
            </h1>
            <PriceIndicator level={place.priceLevel} className="mt-1" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{locationString}</span>
            <span className="text-sm">• {place.distance} mi away</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {place.isProRecommended && <TrustBadge type="pro" />}
            {place.isVerified && <TrustBadge type="verified" />}
            <TrustBadge type="updated" value={formatLastUpdated(place.lastUpdated)} />
            {place.hasConflict && <TrustBadge type="conflict" />}
          </div>

          {/* Conflict warning */}
          {place.hasConflict && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning flex items-center gap-2">
                ⚠️ Some details reported differently by users. Always verify locally.
              </p>
            </div>
          )}
        </section>

        {/* Summary */}
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '50ms' }}
        >
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-secondary-foreground font-medium">
              {place.summary}
            </p>
          </div>
        </section>

        {/* Key RV Facts */}
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '100ms' }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Key RV Facts
          </h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            <InfoRow
              icon={Truck}
              label="Distance"
              value={`${place.distance} miles`}
            />
            <InfoRow
              icon={DollarSign}
              label="Price Level"
              value={place.priceLevel === '$' ? 'Budget-friendly' : place.priceLevel === '$$' ? 'Moderate' : 'Premium'}
            />
          </div>
        </section>

        {/* Features */}
        {place.features.length > 0 && (
          <section 
            className="mb-6 animate-fade-in" 
            style={{ animationDelay: '125ms' }}
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Amenities & Features
            </h2>
            <div className="flex flex-wrap gap-2">
              {place.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
          </section>
        )}
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '150ms' }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Packages / Amazon
          </h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            <InfoRow
              icon={Package}
              label="Packages Accepted"
              value={place.packagesAccepted}
              valueClassName={cn(
                place.packagesAccepted === 'Yes' && 'text-success',
                place.packagesAccepted === 'No' && 'text-destructive',
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
        </section>

        {/* Suggest Update - Verified users only */}
        {user && isVerified && (
          <section 
            className="mb-6 animate-fade-in" 
            style={{ animationDelay: '200ms' }}
          >
            <SuggestUpdateForm place={place} isVerified={isVerified} />
          </section>
        )}

        {/* Not verified prompt */}
        {user && !isVerified && (
          <section 
            className="mb-6 animate-fade-in" 
            style={{ animationDelay: '200ms' }}
          >
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
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '225ms' }}
        >
          <PendingSuggestions placeId={id!} />
        </section>

        {/* Reviews placeholder */}
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '250ms' }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Community Reports
          </h2>
          <div className="bg-secondary/30 border border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Community reviews coming soon
            </p>
          </div>
        </section>

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
