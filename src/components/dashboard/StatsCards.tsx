import { Activity, AlertTriangle, Shield, TrendingUp, Skull, FileWarning } from 'lucide-react';

interface StatsCardsProps {
  totalEvents: number;
  activeAlerts: number;
  riskScore: number;
  systemStatus: 'online' | 'warning' | 'critical';
  detectionRate: number;
  ransomwareCount: number;
}

export function StatsCards({
  totalEvents,
  activeAlerts,
  riskScore,
  systemStatus,
  detectionRate,
  ransomwareCount,
}: StatsCardsProps) {
  const statusConfig = {
    online: { color: 'text-success', bg: 'bg-success/10', label: 'SECURE' },
    warning: { color: 'text-warning', bg: 'bg-warning/10', label: 'WARNING' },
    critical: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'CRITICAL' },
  };

  const status = statusConfig[systemStatus];

  const cards = [
    {
      title: 'System Status',
      value: status.label,
      icon: Shield,
      color: status.color,
      bg: status.bg,
      pulse: systemStatus === 'critical',
    },
    {
      title: 'Risk Score',
      value: `${riskScore}%`,
      icon: TrendingUp,
      color: riskScore > 70 ? 'text-destructive' : riskScore > 40 ? 'text-warning' : 'text-success',
      bg: riskScore > 70 ? 'bg-destructive/10' : riskScore > 40 ? 'bg-warning/10' : 'bg-success/10',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts.toString(),
      icon: AlertTriangle,
      color: activeAlerts > 5 ? 'text-destructive' : activeAlerts > 0 ? 'text-warning' : 'text-muted-foreground',
      bg: activeAlerts > 5 ? 'bg-destructive/10' : activeAlerts > 0 ? 'bg-warning/10' : 'bg-muted/50',
    },
    {
      title: 'File Events',
      value: totalEvents.toString(),
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Detection Rate',
      value: `${detectionRate.toFixed(1)}%`,
      icon: FileWarning,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Ransomware Detected',
      value: ransomwareCount.toString(),
      icon: Skull,
      color: ransomwareCount > 0 ? 'text-destructive' : 'text-muted-foreground',
      bg: ransomwareCount > 0 ? 'bg-destructive/10' : 'bg-muted/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={`cyber-card cyber-border p-4 fade-in ${card.pulse ? 'animate-pulse-glow' : ''}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${card.color}`}>
            {card.value}
          </div>
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}
