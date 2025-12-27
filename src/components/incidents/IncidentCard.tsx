import { motion } from 'framer-motion';
import { 
  Car, 
  Heart, 
  Flame, 
  Construction, 
  Shield,
  Clock,
  MapPin,
  ThumbsUp,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Incident, IncidentType, incidentTypeLabels, statusLabels, severityLabels } from '@/types/incident';
import { useIncidentStore } from '@/stores/incidentStore';
import { formatDistanceToNow } from 'date-fns';

const incidentIcons: Record<IncidentType, React.ElementType> = {
  accident: Car,
  medical: Heart,
  fire: Flame,
  infrastructure: Construction,
  crime: Shield,
};

interface IncidentCardProps {
  incident: Incident;
  compact?: boolean;
  onClick?: () => void;
}

export function IncidentCard({ incident, compact = false, onClick }: IncidentCardProps) {
  const { upvoteIncident } = useIncidentStore();
  const Icon = incidentIcons[incident.type];

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'secondary';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'unverified': return 'unverified';
      case 'verified': return 'verified';
      case 'acknowledged': return 'acknowledged';
      case 'in-progress': return 'in-progress';
      case 'resolved': return 'resolved';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        glass 
        className={`overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/30 ${
          incident.severity === 'high' ? 'border-l-4 border-l-severity-high' : 
          incident.severity === 'medium' ? 'border-l-4 border-l-severity-medium' : 
          'border-l-4 border-l-severity-low'
        }`}
        onClick={onClick}
      >
        <div className={compact ? 'p-4' : 'p-5'}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg bg-${incident.type === 'accident' ? 'incident-accident' : 
                incident.type === 'medical' ? 'incident-medical' : 
                incident.type === 'fire' ? 'incident-fire' : 
                incident.type === 'infrastructure' ? 'incident-infrastructure' : 
                'incident-crime'}/10`}>
                <Icon className={`h-5 w-5 text-incident-${incident.type}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={incident.type as any} className="text-[10px]">
                    {incidentTypeLabels[incident.type]}
                  </Badge>
                  <Badge variant={getSeverityVariant(incident.severity) as any} className="text-[10px]">
                    {severityLabels[incident.severity]}
                  </Badge>
                  <Badge variant={getStatusVariant(incident.status) as any} className="text-[10px]">
                    {statusLabels[incident.status]}
                  </Badge>
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base truncate">
                  {incident.title}
                </h3>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Details */}
          {!compact && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {incident.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDistanceToNow(incident.reportedAt, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{incident.location.address.split(',')[0]}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs ${incident.hasUpvoted ? 'text-primary' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                upvoteIncident(incident.id);
              }}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${incident.hasUpvoted ? 'fill-current' : ''}`} />
              <span>{incident.upvotes}</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
