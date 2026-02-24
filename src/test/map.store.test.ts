import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '../app/store/map.store';

describe('Map Store', () => {
  beforeEach(() => {
    useMapStore.setState({
      currentPosition: null,
      permissionStatus: 'prompt',
      isLocating: false,
      error: null,
      mapCenter: { lat: 30.0444, lng: 31.2357 },
      mapZoom: 13,
      radius: 10000,
    });
  });

  it('should have correct initial state with Cairo as default center', () => {
    const state = useMapStore.getState();
    expect(state.currentPosition).toBeNull();
    expect(state.permissionStatus).toBe('prompt');
    expect(state.isLocating).toBe(false);
    expect(state.error).toBeNull();
    expect(state.mapCenter).toEqual({ lat: 30.0444, lng: 31.2357 });
    expect(state.mapZoom).toBe(13);
    expect(state.radius).toBe(10000);
  });

  it('should set map center', () => {
    useMapStore.getState().setMapCenter(31.2, 29.9);
    const state = useMapStore.getState();
    expect(state.mapCenter).toEqual({ lat: 31.2, lng: 29.9 });
  });

  it('should set map zoom', () => {
    useMapStore.getState().setMapZoom(16);
    expect(useMapStore.getState().mapZoom).toBe(16);
  });

  it('should set radius', () => {
    useMapStore.getState().setRadius(20000);
    expect(useMapStore.getState().radius).toBe(20000);
  });

  it('should not affect other state when updating map center', () => {
    useMapStore.getState().setMapCenter(25.0, 35.0);
    const state = useMapStore.getState();
    expect(state.mapZoom).toBe(13); // unchanged
    expect(state.radius).toBe(10000); // unchanged
    expect(state.mapCenter).toEqual({ lat: 25.0, lng: 35.0 });
  });
});
