// Membership logos - using placeholder images for now
const memberships = [
  { id: 'thousand_trails', name: 'Thousand Trails', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Thousand_Trails_Logo.svg/200px-Thousand_Trails_Logo.svg.png' },
  { id: 'koa', name: 'KOA', logo: 'https://koa.com/content/favicons/apple-touch-icon-180x180.png' },
  { id: 'good_sam', name: 'Good Sam', logo: 'https://www.goodsam.com/content/dam/goodsam/logos/GS-logo.svg' },
  { id: 'passport_america', name: 'Passport America', logo: 'https://www.passportamerica.com/wp-content/uploads/2020/01/PA-50-Logo-Original-1.png' },
  { id: 'harvest_hosts', name: 'Harvest Hosts', logo: 'https://harvesthosts.com/static/images/harvest-hosts-logo.svg' },
  { id: 'boondockers', name: 'Boondockers Welcome', logo: 'https://www.boondockerswelcome.com/wp-content/uploads/2019/06/BoondockersWelcome_Logo.png' },
  { id: 'escapees', name: 'Escapees RV Club', logo: 'https://www.escapees.com/wp-content/uploads/2023/01/Escapees-Logo-Stacked.png' },
  { id: 'rod', name: 'Resorts of Distinction', logo: 'https://www.rodrv.com/wp-content/uploads/2021/03/ROD-Logo.png' },
  { id: 'state_parks', name: 'State Parks', logo: 'https://www.parks.ca.gov/portals/0/Images/Logo/parks_logo.png' },
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
                <span className="text-sm text-muted-foreground text-center font-medium leading-tight">
                  {membership.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
