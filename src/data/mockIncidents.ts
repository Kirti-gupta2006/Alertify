import { Incident, IncidentType, Severity, IncidentStatus } from '@/types/incident';

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const locations = [
  { lat: 40.7128, lng: -74.006, address: '123 Broadway, New York, NY' },
  { lat: 40.7589, lng: -73.9851, address: 'Times Square, Manhattan, NY' },
  { lat: 40.7484, lng: -73.9857, address: 'Empire State Building, NY' },
  { lat: 40.7614, lng: -73.9776, address: '5th Avenue, New York, NY' },
  { lat: 40.7831, lng: -73.9712, address: 'Central Park West, NY' },
  { lat: 40.7061, lng: -74.0088, address: 'Wall Street, New York, NY' },
  { lat: 40.7527, lng: -73.9772, address: 'Grand Central Terminal, NY' },
  { lat: 40.689, lng: -74.0445, address: 'Liberty Island, NY' },
];

const incidentTypes: IncidentType[] = ['accident', 'medical', 'fire', 'infrastructure', 'crime'];
const severities: Severity[] = ['low', 'medium', 'high'];
const statuses: IncidentStatus[] = ['unverified', 'verified', 'acknowledged', 'in-progress', 'resolved'];

const titles: Record<IncidentType, string[]> = {
  accident: ['Multi-vehicle collision on highway', 'Pedestrian struck at crosswalk', 'Motorcycle accident reported', 'Hit and run incident'],
  medical: ['Cardiac arrest at subway station', 'Allergic reaction emergency', 'Person collapsed on sidewalk', 'Heat stroke victim'],
  fire: ['Building fire reported', 'Kitchen fire in apartment', 'Electrical fire in commercial building', 'Vehicle fire on highway'],
  infrastructure: ['Water main break', 'Power lines down', 'Sinkhole forming', 'Bridge structural concern'],
  crime: ['Armed robbery in progress', 'Assault reported', 'Suspicious activity', 'Vandalism incident'],
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = (hoursAgo: number): Date => {
  const now = new Date();
  const randomHours = Math.random() * hoursAgo;
  return new Date(now.getTime() - randomHours * 60 * 60 * 1000);
};

export const generateMockIncidents = (count: number = 15): Incident[] => {
  return Array.from({ length: count }, () => {
    const type = getRandomItem(incidentTypes);
    const location = getRandomItem(locations);
    const reportedAt = getRandomDate(24);
    
    return {
      id: `INC-${generateId()}`,
      type,
      title: getRandomItem(titles[type]),
      description: `Emergency incident requiring immediate attention. Multiple reports received from the area. First responders have been notified.`,
      severity: getRandomItem(severities),
      status: getRandomItem(statuses),
      location: {
        ...location,
        lat: location.lat + (Math.random() - 0.5) * 0.02,
        lng: location.lng + (Math.random() - 0.5) * 0.02,
      },
      reportedAt,
      updatedAt: new Date(reportedAt.getTime() + Math.random() * 60 * 60 * 1000),
      reportedBy: `citizen_${Math.random().toString(36).substr(2, 5)}`,
      upvotes: Math.floor(Math.random() * 25),
      hasUpvoted: false,
    };
  }).sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
};

export const mockIncidents = generateMockIncidents(15);
