import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Alert, AlertSeverity } from '@/lib/types';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => Promise<void>;
}

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; class: string; label: string }> = {
  low: { icon: AlertTriangle, class: 'severity-low', label: 'LOW' },
  medium: { icon: AlertTriangle, class: 'severity-medium', label: 'MED' },
  high: { icon: AlertTriangle, class: 'severity-high', label: 'HIGH' },
  critical: { icon: Skull, class: 'severity-critical', label: 'CRIT' },
};

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const acknowledged = alerts.filter(a => a.acknowledged);

  return (
    <div className="cyber-card cyber-border h-[400px] flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Active Alerts
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {unacknowledged.length} PENDING
        </span>
      </div>

      <ScrollArea className="flex-1 scrollbar-cyber">
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No active alerts</p>
              <p className="text-muted-foreground text-xs">System is operating normally</p>
            </div>
          ) : (
            <>
              {unacknowledged.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;
                
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${config.class} fade-in`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{alert.title}</p>
                          {alert.description && (
                            <p className="text-xs opacity-80 mt-1 line-clamp-2">
                              {alert.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(alert.created_at), 'HH:mm:ss')}</span>
                            <span className="font-mono">{config.label}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-7 text-xs"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        ACK
                      </Button>
                    </div>
                  </div>
                );
              })}

              {acknowledged.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide pt-4 pb-2">
                    Acknowledged
                  </div>
                  {acknowledged.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-muted/30 border border-border/50 opacity-60"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm truncate">{alert.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(alert.acknowledged_at || alert.created_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
