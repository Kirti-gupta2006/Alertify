import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Maximize2, Minimize2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncidentStore } from '@/stores/incidentStore';
import { Incident } from '@/types/incident';

interface IncidentMapProps {
  className?: string;
  compact?: boolean;
  onIncidentClick?: (incident: Incident) => void;
}

export function IncidentMap({ className = '', compact = false, onIncidentClick }: IncidentMapProps) {
  const { getFilteredIncidents, selectIncident } = useIncidentStore();
  const incidents = getFilteredIncidents();
  const [isExpanded, setIsExpanded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate center based on incidents
  const centerLat = incidents.length > 0 
    ? incidents.reduce((sum, i) => sum + i.location.lat, 0) / incidents.length 
    : 40.7128;
  const centerLng = incidents.length > 0 
    ? incidents.reduce((sum, i) => sum + i.location.lng, 0) / incidents.length 
    : -74.006;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#3b82f6';
    }
  };

  const handleMarkerClick = (incident: Incident) => {
    selectIncident(incident);
    onIncidentClick?.(incident);
  };

  return (
    <div className={`relative ${className} ${isExpanded ? 'fixed inset-0 z-50 p-4' : ''}`}>
      <motion.div
        layout
        className={`w-full h-full map-container relative ${isExpanded ? 'rounded-xl' : ''}`}
        ref={mapRef}
      >
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/50" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Incident Markers */}
          {incidents.map((incident, index) => {
            // Calculate position based on lat/lng relative to center
            const x = 50 + (incident.location.lng - centerLng) * 1000;
            const y = 50 - (incident.location.lat - centerLat) * 1000;
            
            return (
              <motion.div
                key={incident.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, type: 'spring' }}
                className="absolute cursor-pointer"
                style={{ 
                  left: `${Math.max(10, Math.min(90, x))}%`, 
                  top: `${Math.max(10, Math.min(90, y))}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleMarkerClick(incident)}
              >
                {/* Pulse Ring for High Severity */}
                {incident.severity === 'high' && incident.status !== 'resolved' && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: getSeverityColor(incident.severity), opacity: 0.4 }}
                  />
                )}
                
                {/* Marker */}
                <div 
                  className="relative w-4 h-4 rounded-full shadow-lg flex items-center justify-center transform hover:scale-125 transition-transform"
                  style={{ 
                    backgroundColor: getSeverityColor(incident.severity),
                    boxShadow: `0 0 20px ${getSeverityColor(incident.severity)}80`
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="glass-card px-3 py-2 text-xs whitespace-nowrap">
                    <p className="font-semibold">{incident.title}</p>
                    <p className="text-muted-foreground">{incident.id}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Center Marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
          </div>
        </div>

        {/* Map Controls */}
        {!compact && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="glass"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="glass" size="icon">
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-card p-3">
          <p className="text-xs font-semibold mb-2">Severity</p>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-severity-high" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-severity-medium" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-severity-low" />
              <span>Low</span>
            </div>
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 left-4 glass-card px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold">{incidents.length}</span>
            <span className="text-muted-foreground">active incidents</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
