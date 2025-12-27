import { Incident, IncidentType, Severity, IncidentStatus } from '@/types/incident';
import { mockIncidents, generateMockIncidents } from '@/data/mockIncidents';
import { create } from 'zustand';

interface IncidentFilters {
  type?: IncidentType;
  severity?: Severity;
  status?: IncidentStatus;
  timeRange?: '1h' | '6h' | '24h' | '7d' | 'all';
  searchQuery?: string;
}

interface IncidentStore {
  incidents: Incident[];
  filters: IncidentFilters;
  selectedIncident: Incident | null;
  isLoading: boolean;
  
  setFilters: (filters: Partial<IncidentFilters>) => void;
  clearFilters: () => void;
  selectIncident: (incident: Incident | null) => void;
  upvoteIncident: (id: string) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus, notes?: string) => void;
  addIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt' | 'upvotes' | 'status'>) => void;
  getFilteredIncidents: () => Incident[];
}

const generateId = () => `INC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  incidents: mockIncidents,
  filters: {},
  selectedIncident: null,
  isLoading: false,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () => set({ filters: {} }),

  selectIncident: (incident) => set({ selectedIncident: incident }),

  upvoteIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id
          ? { ...inc, upvotes: inc.hasUpvoted ? inc.upvotes - 1 : inc.upvotes + 1, hasUpvoted: !inc.hasUpvoted }
          : inc
      ),
    })),

  updateIncidentStatus: (id, status, notes) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id
          ? { ...inc, status, responderNotes: notes || inc.responderNotes, updatedAt: new Date() }
          : inc
      ),
    })),

  addIncident: (incidentData) =>
    set((state) => ({
      incidents: [
        {
          ...incidentData,
          id: generateId(),
          reportedAt: new Date(),
          updatedAt: new Date(),
          upvotes: 0,
          hasUpvoted: false,
          status: 'unverified',
        },
        ...state.incidents,
      ],
    })),

  getFilteredIncidents: () => {
    const { incidents, filters } = get();
    let filtered = [...incidents];

    if (filters.type) {
      filtered = filtered.filter((inc) => inc.type === filters.type);
    }

    if (filters.severity) {
      filtered = filtered.filter((inc) => inc.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter((inc) => inc.status === filters.status);
    }

    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      const ranges: Record<string, number> = {
        '1h': 1,
        '6h': 6,
        '24h': 24,
        '7d': 168,
      };
      const hoursAgo = ranges[filters.timeRange] || 24;
      const cutoff = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      filtered = filtered.filter((inc) => inc.reportedAt >= cutoff);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.title.toLowerCase().includes(query) ||
          inc.description.toLowerCase().includes(query) ||
          inc.location.address.toLowerCase().includes(query) ||
          inc.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  },
}));
