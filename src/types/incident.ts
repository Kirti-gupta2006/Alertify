export type IncidentType = 'accident' | 'medical' | 'fire' | 'infrastructure' | 'crime';
export type Severity = 'low' | 'medium' | 'high';
export type IncidentStatus = 'unverified' | 'verified' | 'acknowledged' | 'in-progress' | 'resolved';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedAt: Date;
  updatedAt: Date;
  reportedBy: string;
  upvotes: number;
  hasUpvoted?: boolean;
  images?: string[];
  responderNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'responder' | 'admin';
  avatar?: string;
}

export const incidentTypeLabels: Record<IncidentType, string> = {
  accident: 'Accident',
  medical: 'Medical Emergency',
  fire: 'Fire',
  infrastructure: 'Infrastructure',
  crime: 'Crime',
};

export const incidentTypeIcons: Record<IncidentType, string> = {
  accident: 'Car',
  medical: 'Heart',
  fire: 'Flame',
  infrastructure: 'Construction',
  crime: 'Shield',
};

export const severityLabels: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const statusLabels: Record<IncidentStatus, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  acknowledged: 'Acknowledged',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};
