import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { FileEventsTable } from '@/components/dashboard/FileEventsTable';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { ManualScanModal } from '@/components/dashboard/ManualScanModal';
import { ManualScansPanel } from '@/components/dashboard/ManualScansPanel';
import { useAlerts } from '@/hooks/useAlerts';
import { useFileEvents } from '@/hooks/useFileEvents';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useManualScans } from '@/hooks/useManualScans';
import { Button } from '@/components/ui/button';
import { FileSearch } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading: authLoading, role, profile } = useAuth();
  const navigate = useNavigate();
  const { alerts, acknowledgeAlert, unacknowledgedCount, criticalCount } = useAlerts();
  const { fileEvents, detectionResults, ransomwareDetections } = useFileEvents();
  const { monitoring, thresholds, mlModel } = useSystemConfig();
  const { manualScans, isLoading: scansLoading, isScanning, uploadAndScan } = useManualScans();
  const [scanModalOpen, setScanModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground font-mono">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const riskScore = ransomwareDetections.length > 0 
    ? Math.min(100, ransomwareDetections.length * 15 + criticalCount * 25)
    : Math.min(100, unacknowledgedCount * 5);

  const systemStatus = criticalCount > 0 ? 'critical' : unacknowledgedCount > 3 ? 'warning' : 'online';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        profile={profile} 
        role={role} 
        alertCount={unacknowledgedCount}
      />
      
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Manual Scan Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => setScanModalOpen(true)}
            className="gap-2"
          >
            <FileSearch className="w-4 h-4" />
            Manual File Scan
          </Button>
        </div>

        <StatsCards
          totalEvents={fileEvents.length}
          activeAlerts={unacknowledgedCount}
          riskScore={riskScore}
          systemStatus={systemStatus}
          detectionRate={mlModel.accuracy * 100}
          ransomwareCount={ransomwareDetections.length}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ActivityChart 
              fileEvents={fileEvents} 
              detectionResults={detectionResults}
            />
            <FileEventsTable 
              fileEvents={fileEvents}
              detectionResults={detectionResults}
            />
          </div>
          
          <div className="space-y-6">
            <AlertsPanel 
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
            />
            <ManualScansPanel 
              scans={manualScans}
              isLoading={scansLoading}
            />
            <SystemStatus
              monitoring={monitoring}
              thresholds={thresholds}
              mlModel={mlModel}
            />
          </div>
        </div>
      </main>

      <ManualScanModal
        open={scanModalOpen}
        onOpenChange={setScanModalOpen}
        onScan={uploadAndScan}
        isScanning={isScanning}
      />
    </div>
  );
}
