import thousandTrailsLogo from '@/assets/memberships/thousand-trails.png';
import koaLogo from '@/assets/memberships/koa.jpg';
import goodSamLogo from '@/assets/memberships/good-sam.png';
import harvestHostsLogo from '@/assets/memberships/harvest-hosts.png';
import boondockersLogo from '@/assets/memberships/boondockers-welcome.png';

// Membership logos - using local assets
const memberships = [
  { id: 'thousand_trails', name: 'Thousand Trails', logo: thousandTrailsLogo },
  { id: 'koa', name: 'KOA', logo: koaLogo },
  { id: 'good_sam', name: 'Good Sam', logo: goodSamLogo },
  { id: 'harvest_hosts', name: 'Harvest Hosts', logo: harvestHostsLogo },
  { id: 'boondockers', name: 'Boondockers Welcome', logo: boondockersLogo },
];

export function MembershipsSection() {
  return (
    <section className="py-8 sm:py-10 px-4">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          All Your Memberships in One App
        </h2>
        <p className="text-base text-muted-foreground mb-8">
          Filter by what you already have
        </p>

        {/* Membership Logos Grid - 2 cols on mobile, 3 on larger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className="bg-card rounded-xl border border-border p-4 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={membership.logo} 
                  alt={membership.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-sm text-muted-foreground text-center font-medium leading-tight">${membership.name}</span>`;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
