import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '../../store/map.store';
import { useTeacherStore } from '../../store/teacher.store';
import type { MapMarker } from '../../core/models/teacher.model';
import { Loader2, MapPin } from 'lucide-react';

// Use env variable for token — safe in client bundles, not a secret
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface TeacherMapProps {
  onSelectTeacher?: (teacherId: number) => void;
  className?: string;
}

export function TeacherMap({ onSelectTeacher, className = '' }: TeacherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const { mapCenter, mapZoom, setMapCenter, setMapZoom } = useMapStore();
  const { mapMarkers, loadMapMarkers } = useTeacherStore();
  const [mapReady, setMapReady] = useState(false);
  const [noToken, setNoToken] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) {
      setNoToken(true);
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
      attributionControl: false,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');
    m.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );
    m.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    m.on('load', () => {
      setMapReady(true);

      // Add clustered source
      m.addSource('teachers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'teachers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10,
            '#f1f075',
            50,
            '#f28cb1',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Cluster count text
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'teachers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      // Individual markers
      m.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'teachers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#131313',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click to zoom into cluster
      m.on('click', 'clusters', (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = m.getSource('teachers') as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const geometry = features[0].geometry;
          if (geometry.type === 'Point') {
            m.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom ?? 14,
            });
          }
        });
      });

      // Click individual marker → show popup
      m.on('click', 'unclustered-point', (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const props = feature.properties;
        const geometry = feature.geometry;
        if (!props || geometry.type !== 'Point') return;

        const coordinates = geometry.coordinates.slice() as [number, number];

        // Ensure popup is visible if map was wrapped around
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        if (popupRef.current) popupRef.current.remove();

        const popup = new mapboxgl.Popup({ offset: 15, closeButton: true, maxWidth: '260px' })
          .setLngLat(coordinates)
          .setHTML(
            `<div style="font-family:Poppins,sans-serif;padding:4px 0">
              <strong style="font-size:14px">${props.name || 'Teacher'}</strong>
              <div style="color:#666;font-size:12px;margin:4px 0">${props.subject || ''}</div>
              <div style="display:flex;align-items:center;gap:4px;font-size:12px">
                <span style="color:#EAB308">★</span> ${props.rating || '—'}
                <span style="color:#999">(${props.reviews || 0})</span>
              </div>
              <div style="font-weight:600;margin-top:4px;font-size:14px">${props.price || ''} EGP/hr</div>
              <button
                onclick="window.__mapTeacherClick && window.__mapTeacherClick(${props.id})"
                style="margin-top:8px;width:100%;padding:6px;background:#131313;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-family:Poppins,sans-serif"
              >View Profile</button>
            </div>`
          )
          .addTo(m);

        popupRef.current = popup;
      });

      // Cursor styles
      m.on('mouseenter', 'clusters', () => (m.getCanvas().style.cursor = 'pointer'));
      m.on('mouseleave', 'clusters', () => (m.getCanvas().style.cursor = ''));
      m.on('mouseenter', 'unclustered-point', () => (m.getCanvas().style.cursor = 'pointer'));
      m.on('mouseleave', 'unclustered-point', () => (m.getCanvas().style.cursor = ''));
    });

    // Sync center/zoom on move
    m.on('moveend', () => {
      const center = m.getCenter();
      setMapCenter(center.lat, center.lng);
      setMapZoom(m.getZoom());
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global handler for popup "View Profile" button
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__mapTeacherClick = (id: number) => {
      onSelectTeacher?.(id);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__mapTeacherClick;
    };
  }, [onSelectTeacher]);

  // Update markers data
  const updateMarkers = useCallback(
    (markers: MapMarker[]) => {
      if (!map.current || !mapReady) return;
      const source = map.current.getSource('teachers') as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: markers.map((m) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [m.longitude, m.latitude],
          },
          properties: {
            id: m.id,
            name: `${m.first_name} ${m.last_name}`,
            subject: '',
            rating: m.avg_rating,
            reviews: 0,
            price: m.hourly_rate,
          },
        })),
      };

      source.setData(geojson);
    },
    [mapReady]
  );

  // Load markers on mount and when map is ready
  useEffect(() => {
    if (mapReady) {
      loadMapMarkers();
    }
  }, [mapReady, loadMapMarkers]);

  // Update GeoJSON when markers change
  useEffect(() => {
    updateMarkers(mapMarkers);
  }, [mapMarkers, updateMarkers]);

  if (noToken) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ minHeight: 300 }}
      >
        <MapPin className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-['Poppins'] text-sm text-center px-4">
          Map is not available. Set <code>VITE_MAPBOX_TOKEN</code> in your <code>.env</code> file.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: 300 }} />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
}
