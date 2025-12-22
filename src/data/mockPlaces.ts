export interface Place {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  distance: number; // miles from user
  priceLevel: '$' | '$$' | '$$$';
  summary: string;
  packagesAccepted: 'Yes' | 'No' | 'Limited';
  packageFeeRequired: boolean;
  packageFeeAmount: string | null;
  isProRecommended: boolean;
  isVerified: boolean;
  lastUpdated: Date;
  hasConflict: boolean;
  amenities: string[];
  rigSizeMax: string;
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
}

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Desert Oasis RV Resort',
    location: {
      lat: 33.4484,
      lng: -112.0740,
      address: '1234 Cactus Road',
      city: 'Phoenix',
      state: 'AZ',
    },
    distance: 2.3,
    priceLevel: '$$',
    summary: 'Good for 35–40ft rigs • Quiet nights • Package fee',
    packagesAccepted: 'Yes',
    packageFeeRequired: true,
    packageFeeAmount: '$5 per package',
    isProRecommended: true,
    isVerified: true,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    hasConflict: false,
    amenities: ['Full hookups', 'WiFi', 'Laundry', 'Pool'],
    rigSizeMax: '45ft',
    contact: {
      phone: '(602) 555-0123',
      website: 'https://desertoasisrv.example.com',
    },
  },
  {
    id: '2',
    name: 'Mountain View Campground',
    location: {
      lat: 33.5722,
      lng: -112.0880,
      address: '567 Pine Trail',
      city: 'Scottsdale',
      state: 'AZ',
    },
    distance: 8.7,
    priceLevel: '$',
    summary: 'Easy overnight stop • Strong Verizon • No showers',
    packagesAccepted: 'No',
    packageFeeRequired: false,
    packageFeeAmount: null,
    isProRecommended: false,
    isVerified: true,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    hasConflict: false,
    amenities: ['Dry camping', 'Fire pits', 'Hiking trails'],
    rigSizeMax: '30ft',
    contact: {
      phone: '(480) 555-0456',
    },
  },
  {
    id: '3',
    name: 'Riverbend Family RV Park',
    location: {
      lat: 33.4255,
      lng: -111.9400,
      address: '890 River Lane',
      city: 'Tempe',
      state: 'AZ',
    },
    distance: 12.1,
    priceLevel: '$$$',
    summary: 'Family-friendly • Heated pool • Tight access',
    packagesAccepted: 'Yes',
    packageFeeRequired: false,
    packageFeeAmount: null,
    isProRecommended: true,
    isVerified: true,
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    hasConflict: false,
    amenities: ['Full hookups', 'Pool', 'Playground', 'Dog park', 'Clubhouse'],
    rigSizeMax: '38ft',
    contact: {
      phone: '(480) 555-0789',
      website: 'https://riverbendrvpark.example.com',
      email: 'info@riverbendrvpark.example.com',
    },
  },
  {
    id: '4',
    name: 'Sunset Mesa Boondocking',
    location: {
      lat: 33.3062,
      lng: -111.8413,
      address: 'BLM Land - Mile Marker 42',
      city: 'Mesa',
      state: 'AZ',
    },
    distance: 18.4,
    priceLevel: '$',
    summary: 'Free dispersed camping • No services • Dark skies',
    packagesAccepted: 'No',
    packageFeeRequired: false,
    packageFeeAmount: null,
    isProRecommended: false,
    isVerified: false,
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    hasConflict: true,
    amenities: ['Dispersed camping', 'No hookups'],
    rigSizeMax: 'Any',
    contact: undefined,
  },
  {
    id: '5',
    name: 'Cactus Country RV Resort',
    location: {
      lat: 32.2226,
      lng: -110.9747,
      address: '2100 Saguaro Boulevard',
      city: 'Tucson',
      state: 'AZ',
    },
    distance: 24.6,
    priceLevel: '$$',
    summary: '50 amp available • Good WiFi • Near grocery',
    packagesAccepted: 'Limited',
    packageFeeRequired: true,
    packageFeeAmount: '$3 handling fee',
    isProRecommended: false,
    isVerified: true,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    hasConflict: false,
    amenities: ['Full hookups', 'WiFi', 'Laundry', 'Store'],
    rigSizeMax: '42ft',
    contact: {
      phone: '(520) 555-0234',
      website: 'https://cactuscountryrv.example.com',
    },
  },
  {
    id: '6',
    name: 'Roadrunner Rest Stop',
    location: {
      lat: 33.6844,
      lng: -112.2478,
      address: '4500 Highway 60',
      city: 'Surprise',
      state: 'AZ',
    },
    distance: 31.2,
    priceLevel: '$',
    summary: 'Quick overnight • Truck stop nearby • Noisy',
    packagesAccepted: 'No',
    packageFeeRequired: false,
    packageFeeAmount: null,
    isProRecommended: false,
    isVerified: true,
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    hasConflict: true,
    amenities: ['Parking only', 'Restrooms'],
    rigSizeMax: 'Any',
    contact: undefined,
  },
];

export const getPlaceById = (id: string): Place | undefined => {
  return mockPlaces.find(place => place.id === id);
};

export const formatLastUpdated = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};
