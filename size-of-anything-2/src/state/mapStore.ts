import { create } from 'zustand';

interface MapArea {
  id: string;
  name: string;
  coordinates: [number, number][]; // Array of lat, lng pairs
  type: 'polygon' | 'rectangle' | 'circle';
  properties?: Record<string, any>;
}

interface MapState {
  areas: MapArea[];
  activeAreaId: string | null;
  addArea: (area: MapArea) => void;
  updateArea: (id: string, area: Partial<MapArea>) => void;
  removeArea: (id: string) => void;
  setActiveArea: (id: string | null) => void;
}

/**
 * Zustand store for managing map areas and active area
 */
export const useMap = create<MapState>((set) => ({
  areas: [],
  activeAreaId: null,
  addArea: (area) => 
    set((state) => ({ areas: [...state.areas, area] })),
  updateArea: (id, updatedProps) =>
    set((state) => ({
      areas: state.areas.map((area) =>
        area.id === id ? { ...area, ...updatedProps } : area
      ),
    })),
  removeArea: (id) =>
    set((state) => ({
      areas: state.areas.filter((area) => area.id !== id),
      activeAreaId: state.activeAreaId === id ? null : state.activeAreaId,
    })),
  setActiveArea: (id) => set({ activeAreaId: id }),
}));