import { useParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Package,
  DollarSign,
  Calendar,
  Truck,
  Wifi,
  Droplets,
  Flame,
  ParkingCircle,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { TrustBadge } from '@/components/TrustBadge';
import { PriceIndicator } from '@/components/PriceIndicator';
import { getPlaceById, formatLastUpdated } from '@/data/mockPlaces';
import { cn } from '@/lib/utils';

const amenityIcons: Record<string, React.ElementType> = {
  'Full hookups': Droplets,
  'WiFi': Wifi,
  'Fire pits': Flame,
  'Dry camping': ParkingCircle,
  'default': ParkingCircle,
};

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const place = getPlaceById(id || '');

  if (!place) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Place Not Found" showBack />
        <main className="container px-4 py-8 max-w-lg mx-auto text-center">
          <p className="text-muted-foreground">This place could not be found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={place.name} showBack />

      <main className="container px-4 py-6 max-w-lg mx-auto">
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
            <span className="text-sm">
              {place.location.address}, {place.location.city}, {place.location.state}
            </span>
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
              label="Max Rig Size"
              value={place.rigSizeMax}
            />
            <InfoRow
              icon={DollarSign}
              label="Price Level"
              value={place.priceLevel === '$' ? 'Budget-friendly' : place.priceLevel === '$$' ? 'Moderate' : 'Premium'}
            />
          </div>
        </section>

        {/* Package Information */}
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

        {/* Amenities */}
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '200ms' }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Amenities
          </h2>
          <div className="flex flex-wrap gap-2">
            {place.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || amenityIcons.default;
              return (
                <div
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm text-secondary-foreground"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {amenity}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact */}
        {place.contact && (
          <section 
            className="mb-6 animate-fade-in" 
            style={{ animationDelay: '250ms' }}
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">
              Contact
            </h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {place.contact.phone && (
                <a
                  href={`tel:${place.contact.phone}`}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{place.contact.phone}</span>
                </a>
              )}
              {place.contact.website && (
                <a
                  href={place.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
                >
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-foreground truncate">Website</span>
                </a>
              )}
              {place.contact.email && (
                <a
                  href={`mailto:${place.contact.email}`}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-foreground truncate">{place.contact.email}</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Reviews placeholder */}
        <section 
          className="mb-6 animate-fade-in" 
          style={{ animationDelay: '300ms' }}
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
