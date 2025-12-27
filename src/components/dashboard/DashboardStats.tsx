import { useIncidentStore } from '@/stores/incidentStore';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color: 'primary' | 'destructive' | 'warning' | 'success';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    destructive: 'from-destructive/20 to-destructive/5 border-destructive/30 text-destructive',
    warning: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-500',
    success: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} border`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-display font-bold">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${trend.positive ? 'text-green-500' : 'text-destructive'}`}>
                  <TrendingUp className={`h-3 w-3 ${!trend.positive ? 'rotate-180' : ''}`} />
                  <span>{trend.value}% from last hour</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-background/50`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardStats() {
  const { incidents } = useIncidentStore();

  const activeIncidents = incidents.filter(i => !['resolved'].includes(i.status)).length;
  const verifiedIncidents = incidents.filter(i => i.status === 'verified' || i.status === 'acknowledged' || i.status === 'in-progress').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const highSeverity = incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Incidents"
        value={activeIncidents}
        icon={Activity}
        trend={{ value: 12, positive: false }}
        color="destructive"
      />
      <StatCard
        title="High Severity"
        value={highSeverity}
        icon={AlertTriangle}
        color="warning"
      />
      <StatCard
        title="Verified"
        value={verifiedIncidents}
        icon={CheckCircle}
        color="primary"
      />
      <StatCard
        title="Resolved Today"
        value={resolvedIncidents}
        icon={Clock}
        trend={{ value: 8, positive: true }}
        color="success"
      />
    </div>
  );
}
