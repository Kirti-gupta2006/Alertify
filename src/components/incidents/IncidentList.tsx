import { useIncidentStore } from '@/stores/incidentStore';
import { IncidentCard } from './IncidentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface IncidentListProps {
  compact?: boolean;
  onIncidentClick?: (incident: any) => void;
  maxItems?: number;
}

export function IncidentList({ compact = false, onIncidentClick, maxItems }: IncidentListProps) {
  const { getFilteredIncidents, selectIncident } = useIncidentStore();
  const incidents = getFilteredIncidents();
  const displayIncidents = maxItems ? incidents.slice(0, maxItems) : incidents;

  const handleClick = (incident: any) => {
    selectIncident(incident);
    onIncidentClick?.(incident);
  };

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">No incidents found</h3>
        <p className="text-sm text-muted-foreground">
          No incidents match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {displayIncidents.map((incident, index) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <IncidentCard
              incident={incident}
              compact={compact}
              onClick={() => handleClick(incident)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
