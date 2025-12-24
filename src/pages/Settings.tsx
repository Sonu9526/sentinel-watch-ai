import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { user, isLoading: authLoading, role, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { monitoring, thresholds, mlModel, updateConfig } = useSystemConfig();
  const { toast } = useToast();
  
  const [localMonitoring, setLocalMonitoring] = useState(monitoring);
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    if (!authLoading && user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    setLocalMonitoring(monitoring);
    setLocalThresholds(thresholds);
  }, [monitoring, thresholds]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSaveMonitoring = async () => {
    try {
      await updateConfig('monitoring', localMonitoring as unknown as Record<string, unknown>);
      toast({ title: 'Configuration Saved', description: 'Monitoring settings updated successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save configuration.', variant: 'destructive' });
    }
  };

  const handleSaveThresholds = async () => {
    try {
      await updateConfig('thresholds', localThresholds as unknown as Record<string, unknown>);
      toast({ title: 'Configuration Saved', description: 'Threshold settings updated successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save configuration.', variant: 'destructive' });
    }
  };

  const simulateFileEvents = async () => {
    setIsSimulating(true);
    try {
      // Generate random file events
      const files = ['document.docx', 'report.xlsx', 'photo.jpg', 'data.csv', 'backup.zip'];
      const paths = ['/home/user/documents', '/home/user/downloads', '/home/user/desktop'];
      const processes = ['explorer.exe', 'word.exe', 'chrome.exe', 'unknown.exe'];

      for (let i = 0; i < 5; i++) {
        const isRansomware = Math.random() > 0.7;
        const modRate = isRansomware ? 15 + Math.random() * 30 : Math.random() * 8;
        const entropy = isRansomware ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4;
        const renames = isRansomware ? 6 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 3);

        const fileName = files[Math.floor(Math.random() * files.length)];
        const path = paths[Math.floor(Math.random() * paths.length)];

        // Insert file event
        const { data: eventData, error: eventError } = await supabase
          .from('file_events')
          .insert({
            file_name: fileName,
            file_path: `${path}/${fileName}`,
            modification_rate: modRate,
            entropy_change: entropy,
            rename_count: renames,
            process_id: Math.floor(Math.random() * 10000),
            process_name: processes[Math.floor(Math.random() * processes.length)],
          })
          .select()
          .single();

        if (eventError) throw eventError;

        // Classify the event
        const status = isRansomware ? 'ransomware' : modRate > 10 || entropy > 0.5 ? 'suspicious' : 'normal';
        const riskScore = isRansomware ? 80 + Math.random() * 20 : modRate > 10 ? 40 + Math.random() * 30 : Math.random() * 30;

        const { data: detectionData, error: detectionError } = await supabase
          .from('detection_results')
          .insert({
            file_event_id: eventData.id,
            status,
            risk_score: riskScore,
            confidence: 0.85 + Math.random() * 0.14,
            model_version: mlModel.version,
          })
          .select()
          .single();

        if (detectionError) throw detectionError;

        // Create alert if suspicious or ransomware
        if (status !== 'normal') {
          const severity = status === 'ransomware' ? 'critical' : riskScore > 60 ? 'high' : 'medium';
          await supabase.from('alerts').insert({
            detection_result_id: detectionData.id,
            severity,
            title: status === 'ransomware' 
              ? `Ransomware detected: ${fileName}` 
              : `Suspicious activity: ${fileName}`,
            description: `File ${fileName} shows ${status} behavior patterns. Modification rate: ${modRate.toFixed(1)}/s, Entropy change: ${entropy.toFixed(3)}, Renames: ${renames}`,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({ title: 'Simulation Complete', description: '5 file events simulated successfully.' });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({ title: 'Simulation Failed', description: 'Error generating file events.', variant: 'destructive' });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} role={role} alertCount={0} />
      
      <main className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure monitoring parameters and thresholds</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monitoring Settings */}
          <div className="cyber-card cyber-border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Monitoring Configuration</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Enable Monitoring</Label>
                <p className="text-xs text-muted-foreground">Activate real-time file monitoring</p>
              </div>
              <Switch
                checked={localMonitoring.enabled}
                onCheckedChange={(checked) => setLocalMonitoring({ ...localMonitoring, enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Monitored Folder</Label>
              <Input
                value={localMonitoring.folder}
                onChange={(e) => setLocalMonitoring({ ...localMonitoring, folder: e.target.value })}
                className="bg-secondary border-border font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Scan Interval (ms)</Label>
              <Input
                type="number"
                value={localMonitoring.scan_interval}
                onChange={(e) => setLocalMonitoring({ ...localMonitoring, scan_interval: parseInt(e.target.value) || 5000 })}
                className="bg-secondary border-border font-mono"
              />
            </div>

            <Button onClick={handleSaveMonitoring} className="w-full bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Monitoring Settings
            </Button>
          </div>

          {/* Threshold Settings */}
          <div className="cyber-card cyber-border p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Detection Thresholds</h2>
            
            <div className="space-y-2">
              <Label className="text-foreground">Modification Rate Threshold (/s)</Label>
              <Input
                type="number"
                step="0.1"
                value={localThresholds.modification_rate}
                onChange={(e) => setLocalThresholds({ ...localThresholds, modification_rate: parseFloat(e.target.value) || 10 })}
                className="bg-secondary border-border font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Entropy Change Threshold</Label>
              <Input
                type="number"
                step="0.01"
                value={localThresholds.entropy_change}
                onChange={(e) => setLocalThresholds({ ...localThresholds, entropy_change: parseFloat(e.target.value) || 0.5 })}
                className="bg-secondary border-border font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Rename Count Threshold</Label>
              <Input
                type="number"
                value={localThresholds.rename_count}
                onChange={(e) => setLocalThresholds({ ...localThresholds, rename_count: parseInt(e.target.value) || 5 })}
                className="bg-secondary border-border font-mono"
              />
            </div>

            <Button onClick={handleSaveThresholds} className="w-full bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Threshold Settings
            </Button>
          </div>

          {/* Simulation Panel */}
          <div className="cyber-card cyber-border p-6 space-y-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">Data Simulation</h2>
            <p className="text-sm text-muted-foreground">
              Generate simulated file events for testing and demonstration purposes. 
              This will create random file events with varying characteristics including potential ransomware-like behavior.
            </p>
            
            <Button 
              onClick={simulateFileEvents} 
              disabled={isSimulating}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Sample Events
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
