import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReportIncidentForm } from '@/components/report/ReportIncidentForm';
import { AlertTriangle, Clock, Shield, Users } from 'lucide-react';

const tips = [
  { icon: Clock, text: 'Report incidents as they happen for faster response' },
  { icon: AlertTriangle, text: 'Be specific about the nature of the emergency' },
  { icon: Shield, text: 'Stay safe - only report if you can do so safely' },
  { icon: Users, text: 'Your report helps protect your community' },
];

export default function ReportIncident() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] relative">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-background to-background" />
        
        <div className="container mx-auto px-4 py-8 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/30 text-destructive mb-4">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium">Emergency Report</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Report an Incident
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your report helps emergency responders reach those in need quickly
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <ReportIncidentForm />
            </div>

            {/* Tips Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Reporting Tips</h3>
                <div className="space-y-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <tip.icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 border-destructive/30">
                <h3 className="font-display font-semibold mb-2 text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Life-Threatening Emergency?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For immediate life-threatening emergencies, always call emergency services directly.
                </p>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-2xl font-display font-bold text-destructive">100</p>
                  <p className="text-xs text-muted-foreground">Police Emergency (India)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
