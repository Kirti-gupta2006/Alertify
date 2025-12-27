import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  MapPin, 
  Activity,
  Shield,
  Users,
  Zap,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { IncidentFilters } from '@/components/incidents/IncidentFilters';
import { IncidentList } from '@/components/incidents/IncidentList';
import { IncidentMap } from '@/components/map/IncidentMap';
import { useIncidentStore } from '@/stores/incidentStore';

const features = [
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Incidents are broadcast live to all users and responders',
  },
  {
    icon: Shield,
    title: 'Verified Reports',
    description: 'Community upvoting and responder verification',
  },
  {
    icon: MapPin,
    title: 'GPS Location',
    description: 'Automatic location detection for accurate reporting',
  },
  {
    icon: Clock,
    title: 'Fast Response',
    description: 'Prioritized dispatch for critical emergencies',
  },
];

export default function Dashboard() {
  const { incidents, getFilteredIncidents } = useIncidentStore();
  const filteredIncidents = getFilteredIncidents();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-destructive/5" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 rounded-full bg-destructive/20 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  {incidents.filter(i => i.status !== 'resolved').length} Active Incidents
                </div>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Emergency Response
                <span className="text-gradient-primary"> Command Center</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Report incidents in real-time, coordinate emergency response, and help your community stay safe with our advanced incident management platform.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/report">
                  <Button variant="emergency" size="xl" className="gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    Report Incident
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/map">
                  <Button variant="glass" size="xl" className="gap-3">
                    <MapPin className="h-5 w-5" />
                    View Live Map
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <DashboardStats />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Incident Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Live Incident Feed</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredIncidents.length} incidents found
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Auto-refreshing</span>
              </div>
            </div>

            <IncidentFilters />
            <IncidentList />
          </div>

          {/* Map & Features */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Incident Map</h2>
              <IncidentMap className="h-[400px] rounded-xl overflow-hidden" />
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Platform Features
              </h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
