import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Alert, AlertSeverity, DetectionStatus } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          detection_result:detection_results(
            *,
            file_event:file_events(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        id: item.id,
        detection_result_id: item.detection_result_id,
        severity: item.severity as AlertSeverity,
        title: item.title,
        description: item.description,
        acknowledged: item.acknowledged,
        acknowledged_by: item.acknowledged_by,
        acknowledged_at: item.acknowledged_at,
        created_at: item.created_at,
        detection_result: item.detection_result ? {
          id: item.detection_result.id,
          file_event_id: item.detection_result.file_event_id,
          status: item.detection_result.status as DetectionStatus,
          risk_score: Number(item.detection_result.risk_score),
          confidence: Number(item.detection_result.confidence),
          model_version: item.detection_result.model_version,
          created_at: item.detection_result.created_at,
          file_event: item.detection_result.file_event || undefined,
        } : undefined,
      }));
      
      setAlerts(transformedData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const acknowledgeAlert = async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledged_by: user.id, acknowledged_at: new Date().toISOString() }
            : alert
        )
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAlerts]);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return {
    alerts,
    isLoading,
    acknowledgeAlert,
    unacknowledgedCount,
    criticalCount,
    refetch: fetchAlerts,
  };
}
