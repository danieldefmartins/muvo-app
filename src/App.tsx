import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TrustedCongratsModal } from "@/components/TrustedCongratsModal";
import Index from "./pages/Index";
import PlacesToStay from "./pages/PlacesToStay";
import PlaceDetail from "./pages/PlaceDetail";
import SearchResults from "./pages/SearchResults";
import SavedPlaces from "./pages/SavedPlaces";
import AdminSuggestions from "./pages/AdminSuggestions";
import AdminPhotos from "./pages/AdminPhotos";
import AdminUsers from "./pages/AdminUsers";
import AdminPlaceSubmissions from "./pages/AdminPlaceSubmissions";
import Auth from "./pages/Auth";
import MapView from "./pages/MapView";
import RoutePlanning from "./pages/RoutePlanning";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TrustedCongratsModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/places" element={<PlacesToStay />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/route" element={<RoutePlanning />} />
          <Route path="/saved" element={<SavedPlaces />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/suggestions" element={<AdminSuggestions />} />
          <Route path="/admin/photos" element={<AdminPhotos />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/place-submissions" element={<AdminPlaceSubmissions />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
