import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManualScanResult {
  id: string;
  status: 'normal' | 'suspicious' | 'ransomware';
  risk_score: number;
  confidence: number;
  original_filename: string | null;
  file_size: number | null;
  file_extension: string | null;
  entropy: number | null;
  created_at: string;
}

export interface ScanResponse {
  success: boolean;
  result: {
    id: string;
    filename: string;
    status: 'normal' | 'suspicious' | 'ransomware';
    riskScore: number;
    confidence: number;
    entropy: number;
    fileSize: number;
    extension: string;
    timestamp: string;
    alertGenerated: boolean;
  };
  error?: string;
}

export function useManualScans() {
  const [manualScans, setManualScans] = useState<ManualScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const fetchManualScans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('detection_results')
        .select('*')
        .eq('scan_type', 'manual')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setManualScans(data as ManualScanResult[]);
    } catch (err) {
      console.error('Error fetching manual scans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManualScans();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('manual-scans-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'detection_results',
          filter: 'scan_type=eq.manual',
        },
        (payload) => {
          setManualScans((prev) => [payload.new as ManualScanResult, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchManualScans]);

  const uploadAndScan = async (file: File): Promise<ScanResponse> => {
    setIsScanning(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manual-scan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      if (data.result.alertGenerated) {
        toast({
          title: "Alert Generated",
          description: `File "${file.name}" triggered a security alert due to high risk score.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan Complete",
          description: `File "${file.name}" scanned successfully. Status: ${data.result.status}`,
        });
      }

      // Refresh the list
      fetchManualScans();

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed';
      toast({
        title: "Scan Failed",
        description: message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    manualScans,
    isLoading,
    isScanning,
    uploadAndScan,
    refetch: fetchManualScans,
  };
}
