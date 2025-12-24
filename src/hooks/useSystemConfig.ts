import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MonitoringConfig, ThresholdsConfig, MLModelConfig } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useSystemConfig() {
  const [monitoring, setMonitoring] = useState<MonitoringConfig>({
    enabled: true,
    folder: '/home/user/documents',
    scan_interval: 5000,
  });
  const [thresholds, setThresholds] = useState<ThresholdsConfig>({
    modification_rate: 10,
    entropy_change: 0.5,
    rename_count: 5,
  });
  const [mlModel, setMlModel] = useState<MLModelConfig>({
    version: 'v1.0.0',
    type: 'random_forest',
    accuracy: 0.94,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchConfig = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*');

      if (error) throw error;

      data?.forEach(config => {
        const value = config.config_value as Record<string, unknown>;
        switch (config.config_key) {
          case 'monitoring':
            setMonitoring(value as unknown as MonitoringConfig);
            break;
          case 'thresholds':
            setThresholds(value as unknown as ThresholdsConfig);
            break;
          case 'ml_model':
            setMlModel(value as unknown as MLModelConfig);
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (key: string, value: Record<string, unknown>) => {
    if (!user || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('system_config')
        .update({
          config_value: value as unknown as import('@/integrations/supabase/types').Json,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('config_key', key);

      if (error) throw error;

      await fetchConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  return {
    monitoring,
    thresholds,
    mlModel,
    isLoading,
    updateConfig,
    refetch: fetchConfig,
  };
}
