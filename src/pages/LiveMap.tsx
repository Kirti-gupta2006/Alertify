import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentMap } from '@/components/map/IncidentMap';
import { IncidentFilters } from '@/components/incidents/IncidentFilters';
import { IncidentList } from '@/components/incidents/IncidentList';
import { useIncidentStore } from '@/stores/incidentStore';
import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  ThumbsUp, 
  X,
  Car,
  Heart,
  Flame,
  Construction,
  Shield
} from 'lucide-react';
import { Incident, IncidentType, incidentTypeLabels, statusLabels, severityLabels } from '@/types/incident';
import { formatDistanceToNow } from 'date-fns';

const incidentIcons: Record<IncidentType, React.ElementType> = {
  accident: Car,
  medical: Heart,
  fire: Flame,
  infrastructure: Construction,
  crime: Shield,
};

export default function LiveMap() {
  const { getFilteredIncidents, selectedIncident, selectIncident, upvoteIncident } = useIncidentStore();
  const incidents = getFilteredIncidents();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleIncidentClick = (incident: Incident) => {
    selectIncident(incident);
    setIsSheetOpen(true);
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    selectIncident(null);
  };

  const Icon = selectedIncident ? incidentIcons[selectedIncident.type] : Car;

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl font-bold">Live Incident Map</h1>
                <p className="text-sm text-muted-foreground">
                  {incidents.length} active incidents in your area
                </p>
              </div>
            </div>
            <IncidentFilters />
          </div>
        </div>

        {/* Map & List */}
        <div className="flex-1 flex">
          {/* Map */}
          <div className="flex-1 relative">
            <IncidentMap 
              className="w-full h-full" 
              onIncidentClick={handleIncidentClick}
            />
          </div>

          {/* Side Panel */}
          <div className="hidden lg:block w-96 border-l border-border/50 bg-card/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-4">
              <h2 className="font-display font-semibold mb-4">Nearby Incidents</h2>
              <IncidentList compact maxItems={10} onIncidentClick={handleIncidentClick} />
            </div>
          </div>
        </div>

        {/* Mobile Incident Detail Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            {selectedIncident && (
              <div className="h-full overflow-y-auto">
                <SheetHeader className="text-left mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-incident-${selectedIncident.type}/20`}>
                      <Icon className={`h-6 w-6 text-incident-${selectedIncident.type}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant={selectedIncident.type as any}>
                          {incidentTypeLabels[selectedIncident.type]}
                        </Badge>
                        <Badge variant={`severity-${selectedIncident.severity}` as any}>
                          {severityLabels[selectedIncident.severity]}
                        </Badge>
                        <Badge variant={selectedIncident.status as any}>
                          {statusLabels[selectedIncident.status]}
                        </Badge>
                      </div>
                      <SheetTitle className="text-xl">{selectedIncident.title}</SheetTitle>
                      <SheetDescription className="text-sm">
                        ID: {selectedIncident.id}
                      </SheetDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </SheetHeader>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedIncident.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">Location</span>
                      </div>
                      <p className="text-sm font-medium">{selectedIncident.location.address}</p>
                    </div>
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Reported</span>
                      </div>
                      <p className="text-sm font-medium">
                        {formatDistanceToNow(selectedIncident.reportedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant={selectedIncident.hasUpvoted ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => upvoteIncident(selectedIncident.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 ${selectedIncident.hasUpvoted ? 'fill-current' : ''}`} />
                      Confirm Report ({selectedIncident.upvotes})
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  );
}
