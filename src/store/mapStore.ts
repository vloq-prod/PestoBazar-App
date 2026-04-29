import { create } from "zustand";

interface MapState {
  selectedLocation: {
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  setSelectedLocation: (location: MapState["selectedLocation"]) => void;
  clearSelectedLocation: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedLocation: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  clearSelectedLocation: () => set({ selectedLocation: null }),
}));
