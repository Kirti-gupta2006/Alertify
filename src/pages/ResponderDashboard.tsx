import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useIncidentStore } from '@/stores/incidentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  MapPin,
  MessageSquare,
  ChevronRight,
  Loader2,
  Eye,
  Car,
  Heart,
  Flame,
  Construction
} from 'lucide-react';
import { Incident, IncidentType, IncidentStatus, incidentTypeLabels, statusLabels, severityLabels } from '@/types/incident';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const incidentIcons: Record<IncidentType, React.ElementType> = {
  accident: Car,
  medical: Heart,
  fire: Flame,
  infrastructure: Construction,
  crime: Shield,
};

const statusOptions: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'verified', label: 'Verified', color: 'text-status-verified' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'text-primary' },
  { value: 'in-progress', label: 'In Progress', color: 'text-status-in-progress' },
  { value: 'resolved', label: 'Resolved', color: 'text-status-resolved' },
];

export default function ResponderDashboard() {
  const { incidents, updateIncidentStatus, getFilteredIncidents } = useIncidentStore();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [responderNotes, setResponderNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortBy, setSortBy] = useState<'severity' | 'time'>('severity');

  // Get unresolved incidents and sort them
  const activeIncidents = incidents
    .filter(i => i.status !== 'resolved')
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.reportedAt.getTime() - a.reportedAt.getTime();
    });

  const handleStatusUpdate = async (incident: Incident, newStatus: IncidentStatus) => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateIncidentStatus(incident.id, newStatus, responderNotes);
    setIsUpdating(false);
    setSelectedIncident(null);
    setResponderNotes('');
    toast.success(`Incident ${incident.id} updated to ${statusLabels[newStatus]}`);
  };

  const stats = {
    total: activeIncidents.length,
    highSeverity: activeIncidents.filter(i => i.severity === 'high').length,
    unverified: activeIncidents.filter(i => i.status === 'unverified').length,
    inProgress: activeIncidents.filter(i => i.status === 'in-progress').length,
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Responder Dashboard</h1>
                <p className="text-muted-foreground">Manage and coordinate incident response</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Severity</p>
                    <p className="text-3xl font-display font-bold text-destructive">{stats.highSeverity}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unverified</p>
                    <p className="text-3xl font-display font-bold text-amber-500">{stats.unverified}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-display font-bold text-purple-500">{stats.inProgress}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Active</p>
                    <p className="text-3xl font-display font-bold text-primary">{stats.total}</p>
                  </div>
                  <Eye className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Incident Queue</h2>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'severity' | 'time')}>
              <SelectTrigger className="w-[180px] bg-card/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity">Sort by Severity</SelectItem>
                <SelectItem value="time">Sort by Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incident List */}
          <div className="space-y-3">
            {activeIncidents.map((incident, index) => {
              const Icon = incidentIcons[incident.type];
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    glass 
                    className={`cursor-pointer transition-all hover:border-primary/30 ${
                      incident.severity === 'high' ? 'border-l-4 border-l-severity-high' : 
                      incident.severity === 'medium' ? 'border-l-4 border-l-severity-medium' : 
                      'border-l-4 border-l-severity-low'
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-incident-${incident.type}/20 hidden sm:block`}>
                          <Icon className={`h-6 w-6 text-incident-${incident.type}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant={`severity-${incident.severity}` as any}>
                              {severityLabels[incident.severity]}
                            </Badge>
                            <Badge variant={incident.status as any}>
                              {statusLabels[incident.status]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{incident.id}</span>
                          </div>
                          <h3 className="font-semibold truncate">{incident.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(incident.reportedAt, { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.location.address.split(',')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {incident.upvotes >= 3 && (
                            <Badge variant="verified" className="hidden sm:flex">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {incident.upvotes} confirmations
                            </Badge>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {activeIncidents.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No active incidents require attention</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        <DialogContent className="max-w-lg">
          {selectedIncident && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={selectedIncident.type as any}>
                    {incidentTypeLabels[selectedIncident.type]}
                  </Badge>
                  <Badge variant={`severity-${selectedIncident.severity}` as any}>
                    {severityLabels[selectedIncident.severity]}
                  </Badge>
                </div>
                <DialogTitle>{selectedIncident.title}</DialogTitle>
                <DialogDescription>
                  {selectedIncident.id} • {formatDistanceToNow(selectedIncident.reportedAt, { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedIncident.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedIncident.location.address}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Responder Notes
                  </p>
                  <Textarea
                    placeholder="Add notes about this incident..."
                    value={responderNotes}
                    onChange={(e) => setResponderNotes(e.target.value)}
                    rows={3}
                    className="bg-card/50"
                  />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-medium mb-3">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        variant={selectedIncident.status === status.value ? 'default' : 'outline'}
                        className="justify-start"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(selectedIncident, status.value)}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
