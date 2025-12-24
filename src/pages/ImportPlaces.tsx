import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useAdmin";
import type { Database } from "@/integrations/supabase/types";

type PlaceCategory = Database["public"]["Enums"]["place_category"];
type PlaceFeature = Database["public"]["Enums"]["place_feature"];
type PriceLevel = Database["public"]["Enums"]["price_level"];

interface EntranceData {
  name?: string;
  latitude?: number;
  longitude?: number;
  road?: string;
  notes?: string;
  is_primary?: boolean;
}

interface ParsedPlace {
  name: string;
  latitude: number;
  longitude: number;
  primary_category: PlaceCategory;
  price_level?: PriceLevel;
  features?: PlaceFeature[];
  entrances: EntranceData[];
  valid: boolean;
  error?: string;
}

const VALID_CATEGORIES: PlaceCategory[] = [
  "National Park",
  "State Park",
  "County / Regional Park",
  "RV Campground",
  "Luxury RV Resort",
  "Overnight Parking",
  "Boondocking",
  "Business Allowing Overnight",
  "Rest Area / Travel Plaza",
  "Fairgrounds / Event Grounds"
];

const VALID_FEATURES: PlaceFeature[] = [
  "Dump Station",
  "Fresh Water",
  "Electric Hookups",
  "Sewer Hookups",
  "Showers",
  "Laundry",
  "Wi-Fi",
  "Pet Friendly",
  "Big Rig Friendly",
  "Swimming Pool",
  "Hot Tub",
  "Heated Pool",
  "Heated Hot Tub"
];

const VALID_PRICE_LEVELS: PriceLevel[] = ["$", "$$", "$$$"];

export default function ImportPlaces() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [parsedPlaces, setParsedPlaces] = useState<ParsedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const parseCSV = (text: string): ParsedPlace[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const nameIdx = headers.findIndex(h => h === 'name');
    const latIdx = headers.findIndex(h => h === 'latitude' || h === 'lat');
    const lngIdx = headers.findIndex(h => h === 'longitude' || h === 'lng' || h === 'lon');
    const categoryIdx = headers.findIndex(h => h === 'category' || h === 'primary_category');
    const priceIdx = headers.findIndex(h => h === 'price' || h === 'price_level');
    const featuresIdx = headers.findIndex(h => h === 'features');

    // Entrance column indices (1-6)
    const entranceIndices: Record<number, { name: number; lat: number; lng: number; road: number; notes: number; primary: number }> = {};
    for (let i = 1; i <= 6; i++) {
      entranceIndices[i] = {
        name: headers.findIndex(h => h === `entrance_${i}_name`),
        lat: headers.findIndex(h => h === `entrance_${i}_latitude`),
        lng: headers.findIndex(h => h === `entrance_${i}_longitude`),
        road: headers.findIndex(h => h === `entrance_${i}_road`),
        notes: headers.findIndex(h => h === `entrance_${i}_notes`),
        primary: headers.findIndex(h => h === `entrance_${i}_is_primary`),
      };
    }

    if (nameIdx === -1 || latIdx === -1 || lngIdx === -1) {
      toast({
        title: "Invalid CSV format",
        description: "CSV must have 'name', 'latitude', and 'longitude' columns",
        variant: "destructive"
      });
      return [];
    }

    return lines.slice(1).map(line => {
      // Handle CSV with quoted fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const name = values[nameIdx]?.replace(/"/g, '') || '';
      const lat = parseFloat(values[latIdx]);
      const lng = parseFloat(values[lngIdx]);
      const rawCategory = values[categoryIdx]?.replace(/"/g, '') || 'RV Campground';
      const rawPrice = values[priceIdx]?.replace(/"/g, '') || '$$';
      const rawFeatures = values[featuresIdx]?.replace(/"/g, '') || '';

      // Parse entrances
      const entrances: EntranceData[] = [];
      let foundPrimary = false;
      
      for (let i = 1; i <= 6; i++) {
        const idx = entranceIndices[i];
        const eName = idx.name >= 0 ? values[idx.name]?.replace(/"/g, '').trim() : undefined;
        const eLat = idx.lat >= 0 ? parseFloat(values[idx.lat]) : undefined;
        const eLng = idx.lng >= 0 ? parseFloat(values[idx.lng]) : undefined;
        const eRoad = idx.road >= 0 ? values[idx.road]?.replace(/"/g, '').trim() : undefined;
        const eNotes = idx.notes >= 0 ? values[idx.notes]?.replace(/"/g, '').trim() : undefined;
        const eIsPrimary = idx.primary >= 0 ? values[idx.primary]?.toLowerCase() === 'true' || values[idx.primary] === '1' : false;

        // Only add entrance if it has name and valid coordinates
        if (eName && !isNaN(eLat!) && !isNaN(eLng!)) {
          // Enforce only one primary
          let isPrimary = eIsPrimary;
          if (isPrimary && foundPrimary) {
            isPrimary = false; // Already have a primary, ignore this one
          }
          if (isPrimary) {
            foundPrimary = true;
          }

          entrances.push({
            name: eName,
            latitude: eLat,
            longitude: eLng,
            road: eRoad || undefined,
            notes: eNotes || undefined,
            is_primary: isPrimary,
          });
        }
      }

      // Validate
      const errors: string[] = [];
      
      if (!name) errors.push("Missing name");
      if (isNaN(lat) || lat < -90 || lat > 90) errors.push("Invalid latitude");
      if (isNaN(lng) || lng < -180 || lng > 180) errors.push("Invalid longitude");
      
      // Match category (case-insensitive)
      const category = VALID_CATEGORIES.find(c => 
        c.toLowerCase() === rawCategory.toLowerCase()
      ) || "RV Campground";
      
      const priceLevel = VALID_PRICE_LEVELS.includes(rawPrice as PriceLevel) 
        ? rawPrice as PriceLevel 
        : "$$";

      // Parse features (semicolon or comma separated)
      const featuresList = rawFeatures
        .split(/[;|]/)
        .map(f => f.trim())
        .filter(f => VALID_FEATURES.some(vf => vf.toLowerCase() === f.toLowerCase()))
        .map(f => VALID_FEATURES.find(vf => vf.toLowerCase() === f.toLowerCase())!) as PlaceFeature[];

      return {
        name,
        latitude: lat,
        longitude: lng,
        primary_category: category,
        price_level: priceLevel,
        features: featuresList,
        entrances,
        valid: errors.length === 0,
        error: errors.length > 0 ? errors.join(", ") : undefined
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const places = parseCSV(text);
      setParsedPlaces(places);
      setImportComplete(false);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validPlaces = parsedPlaces.filter(p => p.valid);
    if (validPlaces.length === 0) {
      toast({
        title: "No valid places",
        description: "Please fix the errors in your CSV",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const placesToInsert = validPlaces.map(p => {
        const placeData = {
          name: p.name,
          latitude: p.latitude,
          longitude: p.longitude,
          primary_category: p.primary_category,
          price_level: p.price_level || '$$' as const,
          features: p.features || [],
          // Entrance 1
          entrance_1_name: p.entrances[0]?.name || null,
          entrance_1_latitude: p.entrances[0]?.latitude || null,
          entrance_1_longitude: p.entrances[0]?.longitude || null,
          entrance_1_road: p.entrances[0]?.road || null,
          entrance_1_notes: p.entrances[0]?.notes || null,
          entrance_1_is_primary: p.entrances[0]?.is_primary || false,
          // Entrance 2
          entrance_2_name: p.entrances[1]?.name || null,
          entrance_2_latitude: p.entrances[1]?.latitude || null,
          entrance_2_longitude: p.entrances[1]?.longitude || null,
          entrance_2_road: p.entrances[1]?.road || null,
          entrance_2_notes: p.entrances[1]?.notes || null,
          entrance_2_is_primary: p.entrances[1]?.is_primary || false,
          // Entrance 3
          entrance_3_name: p.entrances[2]?.name || null,
          entrance_3_latitude: p.entrances[2]?.latitude || null,
          entrance_3_longitude: p.entrances[2]?.longitude || null,
          entrance_3_road: p.entrances[2]?.road || null,
          entrance_3_notes: p.entrances[2]?.notes || null,
          entrance_3_is_primary: p.entrances[2]?.is_primary || false,
          // Entrance 4
          entrance_4_name: p.entrances[3]?.name || null,
          entrance_4_latitude: p.entrances[3]?.latitude || null,
          entrance_4_longitude: p.entrances[3]?.longitude || null,
          entrance_4_road: p.entrances[3]?.road || null,
          entrance_4_notes: p.entrances[3]?.notes || null,
          entrance_4_is_primary: p.entrances[3]?.is_primary || false,
          // Entrance 5
          entrance_5_name: p.entrances[4]?.name || null,
          entrance_5_latitude: p.entrances[4]?.latitude || null,
          entrance_5_longitude: p.entrances[4]?.longitude || null,
          entrance_5_road: p.entrances[4]?.road || null,
          entrance_5_notes: p.entrances[4]?.notes || null,
          entrance_5_is_primary: p.entrances[4]?.is_primary || false,
          // Entrance 6
          entrance_6_name: p.entrances[5]?.name || null,
          entrance_6_latitude: p.entrances[5]?.latitude || null,
          entrance_6_longitude: p.entrances[5]?.longitude || null,
          entrance_6_road: p.entrances[5]?.road || null,
          entrance_6_notes: p.entrances[5]?.notes || null,
          entrance_6_is_primary: p.entrances[5]?.is_primary || false,
        };
        return placeData;
      });

      const { data, error } = await supabase
        .from('places')
        .insert(placesToInsert)
        .select();

      if (error) throw error;

      setImportedCount(data?.length || 0);
      setImportComplete(true);
      toast({
        title: "Import successful",
        description: `Imported ${data?.length || 0} places`
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Base columns
    const baseHeaders = ["name", "latitude", "longitude", "category", "price", "features"];
    
    // Entrance columns (1-6)
    const entranceHeaders: string[] = [];
    for (let i = 1; i <= 6; i++) {
      entranceHeaders.push(
        `entrance_${i}_name`,
        `entrance_${i}_latitude`,
        `entrance_${i}_longitude`,
        `entrance_${i}_road`,
        `entrance_${i}_notes`,
        `entrance_${i}_is_primary`
      );
    }
    
    const headers = [...baseHeaders, ...entranceHeaders].join(',');
    const example = '"Yosemite National Park",37.8651,-119.5383,"National Park","$$","Dump Station|Fresh Water|Showers","Arch Rock Entrance",37.6842,-119.8453,"Highway 140","Main entrance from Merced",true,"Big Oak Flat Entrance",37.8065,-119.8777,"Highway 120","Northern entrance",,,,,,,,,,,,,,,,,,,,';
    const csv = `${headers}\n${example}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'places-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Admin access required to import places</AlertDescription>
        </Alert>
      </div>
    );
  }

  const validCount = parsedPlaces.filter(p => p.valid).length;
  const invalidCount = parsedPlaces.filter(p => !p.valid).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Import Places from CSV</h1>
        </div>

        {importComplete ? (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div>
                  <h2 className="text-xl font-semibold">Import Complete!</h2>
                  <p className="text-muted-foreground">
                    Successfully imported {importedCount} places
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => {
                    setParsedPlaces([]);
                    setImportComplete(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}>
                    Import More
                  </Button>
                  <Button onClick={() => navigate('/map')}>
                    View on Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Upload a CSV file with your places. Required columns: name, latitude, longitude
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    ref={fileInputRef}
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>CSV Format:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                      <li>Required: name, latitude, longitude</li>
                      <li>Optional: category, price, features</li>
                      <li>Features: separate with | (e.g., "Showers|Wi-Fi")</li>
                      <li>Categories: {VALID_CATEGORIES.slice(0, 3).join(", ")}...</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {parsedPlaces.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview ({parsedPlaces.length} rows)</CardTitle>
                  <CardDescription>
                    <span className="text-green-600">{validCount} valid</span>
                    {invalidCount > 0 && (
                      <span className="text-red-500 ml-2">{invalidCount} with errors</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedPlaces.slice(0, 50).map((place, idx) => (
                          <TableRow key={idx} className={!place.valid ? "bg-red-500/10" : ""}>
                            <TableCell>
                              {place.valid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{place.name || '—'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {!isNaN(place.latitude) ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}` : '—'}
                            </TableCell>
                            <TableCell className="text-sm">{place.primary_category}</TableCell>
                            <TableCell className="text-sm text-red-500">{place.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {parsedPlaces.length > 50 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing first 50 of {parsedPlaces.length} rows
                    </p>
                  )}

                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={handleImport} 
                      disabled={validCount === 0 || isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? "Importing..." : `Import ${validCount} Places`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
