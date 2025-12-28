import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Car,
  Heart,
  Flame,
  Construction,
  Shield,
  Cloud,
  HelpCircle,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Incident {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  location_name: string;
  created_at: string;
}

const incidentIcons: Record<string, React.ElementType> = {
  accident: Car,
  medical: Heart,
  fire: Flame,
  infrastructure: Construction,
  crime: Shield,
  natural_disaster: Cloud,
  other: HelpCircle,
};

const severityColors: Record<string, string> = {
  low: 'bg-severity-low/20 text-severity-low border-severity-low/30',
  medium: 'bg-severity-medium/20 text-severity-medium border-severity-medium/30',
  high: 'bg-severity-high/20 text-severity-high border-severity-high/30',
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
};

const statusColors: Record<string, string> = {
  reported: 'bg-severity-medium/20 text-severity-medium',
  verified: 'bg-primary/20 text-primary',
  responding: 'bg-purple-500/20 text-purple-500',
  resolved: 'bg-severity-low/20 text-severity-low',
};

export default function MyReports() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [user]);

  const fetchMyReports = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load your reports');
    } else {
      setIncidents(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('incidents').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete report');
      return;
    }

    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    toast.success('Report deleted successfully');
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your reported incidents
              </p>
              <Link to="/auth">
                <Button variant="hero">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FileText className="h-7 w-7 text-primary" />
              My Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage incidents you've reported
            </p>
          </div>
          <Link to="/report">
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Report New Incident
            </Button>
          </Link>
        </motion.div>

        {/* Reports List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : incidents.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
              <p className="text-muted-foreground mb-4">
                You haven't reported any incidents yet
              </p>
              <Link to="/report">
                <Button variant="hero">Report Your First Incident</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incidents.map((incident, index) => {
              const Icon = incidentIcons[incident.type] || AlertTriangle;
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{incident.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {incident.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(incident.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge className={severityColors[incident.severity] || ''}>
                              {incident.severity}
                            </Badge>
                            <Badge className={statusColors[incident.status] || ''}>
                              {incident.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.location_name}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(incident.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
