import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileSearch, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ManualScanResult } from '@/hooks/useManualScans';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ManualScansPanelProps {
  scans: ManualScanResult[];
  isLoading: boolean;
}

export function ManualScansPanel({ scans, isLoading }: ManualScansPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ransomware':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ransomware':
        return <Badge variant="destructive">Ransomware</Badge>;
      case 'suspicious':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Suspicious</Badge>;
      default:
        return <Badge className="bg-success/20 text-success border-success/30">Normal</Badge>;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="w-4 h-4 text-primary" />
            Manual Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSearch className="w-4 h-4 text-primary" />
          Manual Scans
          {scans.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {scans.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No manual scans yet</p>
            <p className="text-xs">Upload a file to analyze</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    scan.status === 'ransomware' 
                      ? "bg-destructive/5 border-destructive/30" 
                      : scan.status === 'suspicious'
                      ? "bg-warning/5 border-warning/30"
                      : "bg-muted/30 border-border/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getStatusIcon(scan.status)}
                      <span className="text-sm font-medium text-foreground truncate">
                        {scan.original_filename || 'Unknown file'}
                      </span>
                    </div>
                    {getStatusBadge(scan.status)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Risk:</span>
                      <span className={cn(
                        "ml-1 font-mono font-medium",
                        scan.risk_score >= 70 ? "text-destructive" 
                          : scan.risk_score >= 40 ? "text-warning" 
                          : "text-success"
                      )}>
                        {scan.risk_score}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-1 font-mono text-foreground">
                        {formatFileSize(scan.file_size)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Entropy:</span>
                      <span className="ml-1 font-mono text-foreground">
                        {scan.entropy?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
