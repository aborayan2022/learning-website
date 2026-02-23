import { create } from 'zustand';
import { geoLocationService, type PermissionStatus } from '../core/services/geo-location.service';

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

interface MapState {
  currentPosition: GeoPosition | null;
  permissionStatus: PermissionStatus;
  isLocating: boolean;
  error: string | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  radius: number;

  // Actions
  requestLocation: () => Promise<GeoPosition>;
  setMapCenter: (lat: number, lng: number) => void;
  setMapZoom: (zoom: number) => void;
  setRadius: (radius: number) => void;
}

export const useMapStore = create<MapState>()((set) => ({
  currentPosition: null,
  permissionStatus: 'prompt',
  isLocating: false,
  error: null,
  mapCenter: { lat: 30.0444, lng: 31.2357 }, // Default: Cairo
  mapZoom: 13,
  radius: 10000,

  requestLocation: async () => {
    set({ isLocating: true, error: null });
    const result = await geoLocationService.requestLocation();
    set({
      currentPosition: result.position,
      permissionStatus: result.permissionStatus,
      isLocating: false,
      error: result.error,
      mapCenter: { lat: result.position.lat, lng: result.position.lng },
    });
    return result.position;
  },

  setMapCenter: (lat: number, lng: number) => {
    set({ mapCenter: { lat, lng } });
  },

  setMapZoom: (zoom: number) => {
    set({ mapZoom: zoom });
  },

  setRadius: (radius: number) => {
    set({ radius });
  },
}));
