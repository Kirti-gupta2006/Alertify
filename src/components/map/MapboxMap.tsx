import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { MapPin, Maximize2, Minimize2, Layers, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Incident } from '@/types/incident';

interface MapboxMapProps {
  incidents: Incident[];
  className?: string;
  compact?: boolean;
  onIncidentClick?: (incident: Incident) => void;
}

// Default center: India (Delhi)
const INDIA_CENTER: [number, number] = [77.2090, 28.6139];
const DEFAULT_ZOOM = 5;

export function MapboxMap({ 
  incidents, 
  className = '', 
  compact = false, 
  onIncidentClick 
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  // Check for stored token
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
      setTokenSubmitted(true);
    }
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !tokenSubmitted) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: INDIA_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: 30,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setIsMapReady(true);
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenSubmitted(false);
      localStorage.removeItem('mapbox_token');
    }
  }, [mapboxToken, tokenSubmitted]);

  // Add incident markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    incidents.forEach((incident) => {
      const el = document.createElement('div');
      el.className = 'incident-marker';
      
      const color = getSeverityColor(incident.severity);
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 10px ${color}80, 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          position: relative;
        ">
          ${incident.severity === 'high' ? `
            <div style="
              position: absolute;
              top: -4px;
              left: -4px;
              right: -4px;
              bottom: -4px;
              border-radius: 50%;
              border: 2px solid ${color};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          ` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong style="font-size: 14px;">${incident.title}</strong>
              <p style="color: #888; font-size: 12px; margin-top: 4px;">${incident.location.address}</p>
              <div style="margin-top: 8px;">
                <span style="
                  background-color: ${color}20;
                  color: ${color};
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 500;
                  text-transform: uppercase;
                ">${incident.severity}</span>
              </div>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onIncidentClick?.(incident);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all incidents if there are any
    if (incidents.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      incidents.forEach((incident) => {
        bounds.extend([incident.location.lng, incident.location.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }
  }, [incidents, isMapReady, onIncidentClick]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#3b82f6';
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setTokenSubmitted(true);
    }
  };

  // Token input screen
  if (!tokenSubmitted) {
    return (
      <div className={`relative ${className} glass-card`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
          <MapPin className="h-12 w-12 text-primary mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">Enable Live Map</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            To view the real-time incident map, please enter your Mapbox public token. 
            You can get one for free at{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2 w-full max-w-md">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTokenSubmit} variant="hero">
              Enable Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} ${isExpanded ? 'fixed inset-0 z-50 p-4' : ''}`}>
      <motion.div
        layout
        className={`w-full h-full relative ${isExpanded ? 'rounded-xl overflow-hidden' : 'rounded-xl overflow-hidden'}`}
      >
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Loading overlay */}
        {!isMapReady && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Map Controls */}
        {!compact && (
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <Button
              variant="glass"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-card p-3 z-10">
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
        <div className="absolute top-4 right-20 glass-card px-4 py-2 z-10">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span className="font-semibold">{incidents.length}</span>
            <span className="text-muted-foreground">active incidents</span>
          </div>
        </div>
      </motion.div>

      {/* CSS for marker animation */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
