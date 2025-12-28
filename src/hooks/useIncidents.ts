import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Incident, IncidentType, Severity, IncidentStatus } from '@/types/incident';

interface DbIncident {
  id: string;
  user_id: string | null;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  location_name: string;
  latitude: number;
  longitude: number;
  upvotes: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Map database incident to frontend incident type
const mapDbToIncident = (dbIncident: DbIncident): Incident => ({
  id: dbIncident.id,
  type: dbIncident.type as IncidentType,
  title: dbIncident.title,
  description: dbIncident.description || '',
  severity: dbIncident.severity as Severity,
  status: (dbIncident.status === 'reported' ? 'unverified' : 
           dbIncident.status === 'responding' ? 'in-progress' : 
           dbIncident.status) as IncidentStatus,
  location: {
    lat: dbIncident.latitude,
    lng: dbIncident.longitude,
    address: dbIncident.location_name,
  },
  reportedAt: new Date(dbIncident.created_at),
  updatedAt: new Date(dbIncident.updated_at),
  reportedBy: dbIncident.user_id || 'anonymous',
  upvotes: dbIncident.upvotes || 0,
  images: dbIncident.image_url ? [dbIncident.image_url] : undefined,
});

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedIncidents = (data || []).map(mapDbToIncident);
      setIncidents(mappedIncidents);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newIncident = mapDbToIncident(payload.new as DbIncident);
            setIncidents((prev) => [newIncident, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedIncident = mapDbToIncident(payload.new as DbIncident);
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === updatedIncident.id ? updatedIncident : inc))
            );
          } else if (payload.eventType === 'DELETE') {
            setIncidents((prev) => prev.filter((inc) => inc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addIncident = async (incidentData: {
    type: IncidentType;
    severity: Severity;
    title: string;
    description: string;
    location: { lat: number; lng: number; address: string };
    userId?: string;
  }) => {
    const dbSeverity = incidentData.severity === 'high' ? 'critical' : incidentData.severity;
    
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        type: incidentData.type,
        severity: dbSeverity,
        title: incidentData.title,
        description: incidentData.description,
        location_name: incidentData.location.address,
        latitude: incidentData.location.lat,
        longitude: incidentData.location.lng,
        user_id: incidentData.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbToIncident(data);
  };

  const upvoteIncident = async (incidentId: string, userId: string) => {
    // Check if already upvoted
    const { data: existing } = await supabase
      .from('incident_upvotes')
      .select('id')
      .eq('incident_id', incidentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Remove upvote
      await supabase.from('incident_upvotes').delete().eq('id', existing.id);
      
      // Get current upvotes and decrement
      const { data: incident } = await supabase
        .from('incidents')
        .select('upvotes')
        .eq('id', incidentId)
        .single();
      
      await supabase
        .from('incidents')
        .update({ upvotes: Math.max(0, (incident?.upvotes || 1) - 1) })
        .eq('id', incidentId);
    } else {
      // Add upvote
      await supabase.from('incident_upvotes').insert({
        incident_id: incidentId,
        user_id: userId,
      });
      
      // Get current upvotes and increment
      const { data: incident } = await supabase
        .from('incidents')
        .select('upvotes')
        .eq('id', incidentId)
        .single();
      
      await supabase
        .from('incidents')
        .update({ upvotes: (incident?.upvotes || 0) + 1 })
        .eq('id', incidentId);
    }

    // Refetch to get updated data
    fetchIncidents();
  };

  return {
    incidents,
    isLoading,
    error,
    addIncident,
    upvoteIncident,
    refetch: fetchIncidents,
  };
}
