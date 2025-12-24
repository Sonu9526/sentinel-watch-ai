import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileWarning, CheckCircle, AlertTriangle, XCircle, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScanResponse } from '@/hooks/useManualScans';

interface ManualScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (file: File) => Promise<ScanResponse>;
  isScanning: boolean;
}

export function ManualScanModal({ open, onOpenChange, onScan, isScanning }: ManualScanModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse['result'] | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    
    setProgress(0);
    setScanResult(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await onScan(selectedFile);
      setProgress(100);
      setScanResult(response.result);
    } catch {
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleClose = () => {
    if (!isScanning) {
      setSelectedFile(null);
      setScanResult(null);
      setProgress(0);
      onOpenChange(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ransomware':
        return <XCircle className="w-12 h-12 text-destructive" />;
      case 'suspicious':
        return <AlertTriangle className="w-12 h-12 text-warning" />;
      default:
        return <CheckCircle className="w-12 h-12 text-success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ransomware':
        return 'text-destructive';
      case 'suspicious':
        return 'text-warning';
      default:
        return 'text-success';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileWarning className="w-5 h-5 text-primary" />
            Manual File Scan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload a file to analyze for ransomware-like characteristics. Files are analyzed statically and never executed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!scanResult && (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragOver 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50",
                  isScanning && "pointer-events-none opacity-50"
                )}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isScanning}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-foreground mb-1">
                    Drag & drop a file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Any file type accepted for analysis
                  </p>
                </label>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <File className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  {!isScanning && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )}

              {/* Progress */}
              {isScanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Analyzing file...</span>
                    <span className="text-foreground font-mono">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isScanning}>
                  Cancel
                </Button>
                <Button onClick={handleScan} disabled={!selectedFile || isScanning}>
                  {isScanning ? 'Scanning...' : 'Scan File'}
                </Button>
              </div>
            </>
          )}

          {/* Results */}
          {scanResult && (
            <div className="space-y-4">
              <div className="text-center py-4">
                {getStatusIcon(scanResult.status)}
                <h3 className={cn("text-xl font-bold mt-2 capitalize", getStatusColor(scanResult.status))}>
                  {scanResult.status}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {scanResult.filename}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <p className={cn("text-2xl font-bold font-mono", getStatusColor(scanResult.status))}>
                    {scanResult.riskScore}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {(scanResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Entropy</p>
                  <p className="text-lg font-mono text-foreground">
                    {scanResult.entropy.toFixed(4)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">File Size</p>
                  <p className="text-lg font-mono text-foreground">
                    {formatFileSize(scanResult.fileSize)}
                  </p>
                </div>
              </div>

              {scanResult.alertGenerated && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                  <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />
                  <p className="text-sm text-destructive font-medium">
                    Security alert generated for this file
                  </p>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground">
                Scanned at {new Date(scanResult.timestamp).toLocaleString()}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setScanResult(null);
                  setSelectedFile(null);
                }}>
                  Scan Another
                </Button>
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
