import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FileEvent, DetectionResult, DetectionStatus } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useFileEvents() {
  const [fileEvents, setFileEvents] = useState<FileEvent[]>([]);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [eventsResult, detectionsResult] = await Promise.all([
        supabase
          .from('file_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('detection_results')
          .select('*, file_event:file_events(*)')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (detectionsResult.error) throw detectionsResult.error;

      const transformedEvents = (eventsResult.data || []).map(item => ({
        id: item.id,
        file_path: item.file_path,
        file_name: item.file_name,
        modification_rate: Number(item.modification_rate),
        entropy_change: Number(item.entropy_change),
        rename_count: item.rename_count,
        process_id: item.process_id,
        process_name: item.process_name,
        created_at: item.created_at,
      }));

      const transformedDetections = (detectionsResult.data || []).map(item => ({
        id: item.id,
        file_event_id: item.file_event_id,
        status: item.status as DetectionStatus,
        risk_score: Number(item.risk_score),
        confidence: Number(item.confidence),
        model_version: item.model_version,
        created_at: item.created_at,
        file_event: item.file_event || undefined,
      }));

      setFileEvents(transformedEvents);
      setDetectionResults(transformedDetections);
    } catch (error) {
      console.error('Error fetching file events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;

    const eventsChannel = supabase
      .channel('file-events-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'file_events' },
        () => fetchData()
      )
      .subscribe();

    const detectionsChannel = supabase
      .channel('detections-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'detection_results' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(detectionsChannel);
    };
  }, [user, fetchData]);

  const ransomwareDetections = detectionResults.filter(d => d.status === 'ransomware');
  const suspiciousDetections = detectionResults.filter(d => d.status === 'suspicious');

  return {
    fileEvents,
    detectionResults,
    isLoading,
    ransomwareDetections,
    suspiciousDetections,
    refetch: fetchData,
  };
}
