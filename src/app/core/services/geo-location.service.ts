interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

// Default to Cairo, Egypt
const DEFAULT_POSITION: GeoPosition = {
  lat: 30.0444,
  lng: 31.2357,
  accuracy: 0,
};

export type PermissionStatus = 'prompt' | 'granted' | 'denied';

export const geoLocationService = {
  defaultPosition: DEFAULT_POSITION,

  async requestLocation(): Promise<{
    position: GeoPosition;
    permissionStatus: PermissionStatus;
    error: string | null;
  }> {
    if (!navigator.geolocation) {
      return {
        position: DEFAULT_POSITION,
        permissionStatus: 'denied' as PermissionStatus,
        error: 'Geolocation is not supported by your browser',
      };
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      return {
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        permissionStatus: 'granted',
        error: null,
      };
    } catch (err: unknown) {
      const geoError = err as GeolocationPositionError;
      let message = 'Unable to determine your location';

      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          message = 'Location access denied. Please enable location services.';
          break;
        case geoError.POSITION_UNAVAILABLE:
          message = 'Location information unavailable.';
          break;
        case geoError.TIMEOUT:
          message = 'Location request timed out.';
          break;
      }

      return {
        position: DEFAULT_POSITION,
        permissionStatus: geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'prompt',
        error: message,
      };
    }
  },

  watchPosition(onUpdate: (pos: GeoPosition) => void): number {
    return navigator.geolocation.watchPosition(
      (position) => {
        onUpdate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 60000 }
    );
  },

  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  },
};
