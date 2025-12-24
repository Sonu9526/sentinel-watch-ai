import { Activity, Cpu, FolderOpen, Settings, Clock } from 'lucide-react';
import type { MonitoringConfig, ThresholdsConfig, MLModelConfig } from '@/lib/types';

interface SystemStatusProps {
  monitoring: MonitoringConfig;
  thresholds: ThresholdsConfig;
  mlModel: MLModelConfig;
}

export function SystemStatus({ monitoring, thresholds, mlModel }: SystemStatusProps) {
  return (
    <div className="cyber-card cyber-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          System Configuration
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Monitoring Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Activity className="h-3 w-3" />
            Monitoring
          </div>
          <div className="pl-5 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={monitoring.enabled ? 'text-success' : 'text-muted-foreground'}>
                {monitoring.enabled ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scan Interval</span>
              <span className="font-mono text-foreground">{monitoring.scan_interval}ms</span>
            </div>
          </div>
        </div>

        {/* Monitored Folder */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <FolderOpen className="h-3 w-3" />
            Monitored Path
          </div>
          <div className="pl-5">
            <code className="text-xs bg-secondary px-2 py-1 rounded text-primary font-mono break-all">
              {monitoring.folder}
            </code>
          </div>
        </div>

        {/* Thresholds */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Clock className="h-3 w-3" />
            Detection Thresholds
          </div>
          <div className="pl-5 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mod Rate</span>
              <span className="font-mono text-foreground">{thresholds.modification_rate}/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entropy Δ</span>
              <span className="font-mono text-foreground">{thresholds.entropy_change}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rename Count</span>
              <span className="font-mono text-foreground">{thresholds.rename_count}</span>
            </div>
          </div>
        </div>

        {/* ML Model */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Cpu className="h-3 w-3" />
            ML Model
          </div>
          <div className="pl-5 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-mono text-foreground capitalize">{mlModel.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono text-primary">{mlModel.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-mono text-success">{(mlModel.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
