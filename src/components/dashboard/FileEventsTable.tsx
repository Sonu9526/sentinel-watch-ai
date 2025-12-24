import { format } from 'date-fns';
import { FileText, AlertTriangle, CheckCircle, Skull } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { FileEvent, DetectionResult, DetectionStatus } from '@/lib/types';

interface FileEventsTableProps {
  fileEvents: FileEvent[];
  detectionResults: DetectionResult[];
}

const statusConfig: Record<DetectionStatus, { icon: typeof CheckCircle; class: string; label: string }> = {
  normal: { icon: CheckCircle, class: 'text-success', label: 'Normal' },
  suspicious: { icon: AlertTriangle, class: 'text-warning', label: 'Suspicious' },
  ransomware: { icon: Skull, class: 'text-destructive', label: 'Ransomware' },
};

export function FileEventsTable({ fileEvents, detectionResults }: FileEventsTableProps) {
  // Create a map of file_event_id to detection result
  const detectionMap = new Map<string, DetectionResult>();
  detectionResults.forEach(result => {
    if (result.file_event_id) {
      detectionMap.set(result.file_event_id, result);
    }
  });

  return (
    <div className="cyber-card cyber-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          Recent File Events
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {fileEvents.length} EVENTS
        </span>
      </div>

      <ScrollArea className="h-[300px] scrollbar-cyber">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-mono text-xs">TIME</TableHead>
              <TableHead className="text-muted-foreground font-mono text-xs">FILE</TableHead>
              <TableHead className="text-muted-foreground font-mono text-xs">MOD RATE</TableHead>
              <TableHead className="text-muted-foreground font-mono text-xs">ENTROPY</TableHead>
              <TableHead className="text-muted-foreground font-mono text-xs">RENAMES</TableHead>
              <TableHead className="text-muted-foreground font-mono text-xs">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fileEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No file events recorded yet
                </TableCell>
              </TableRow>
            ) : (
              fileEvents.slice(0, 20).map((event) => {
                const detection = detectionMap.get(event.id);
                const status = detection?.status || 'normal';
                const config = statusConfig[status];
                const Icon = config.icon;

                return (
                  <TableRow key={event.id} className="border-border hover:bg-secondary/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(event.created_at), 'HH:mm:ss')}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate text-sm text-foreground" title={event.file_path}>
                        {event.file_name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground" title={event.file_path}>
                        {event.file_path}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={event.modification_rate > 10 ? 'text-warning' : 'text-foreground'}>
                        {event.modification_rate.toFixed(1)}/s
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={event.entropy_change > 0.5 ? 'text-warning' : 'text-foreground'}>
                        {event.entropy_change.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={event.rename_count > 5 ? 'text-warning' : 'text-foreground'}>
                        {event.rename_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1.5 ${config.class}`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{config.label}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
