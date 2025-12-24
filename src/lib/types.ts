export type AppRole = 'admin' | 'viewer';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DetectionStatus = 'normal' | 'suspicious' | 'ransomware';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface FileEvent {
  id: string;
  file_path: string;
  file_name: string;
  modification_rate: number;
  entropy_change: number;
  rename_count: number;
  process_id: number | null;
  process_name: string | null;
  created_at: string;
}

export interface DetectionResult {
  id: string;
  file_event_id: string | null;
  status: DetectionStatus;
  risk_score: number;
  confidence: number;
  model_version: string | null;
  created_at: string;
  file_event?: FileEvent;
}

export interface Alert {
  id: string;
  detection_result_id: string | null;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  detection_result?: DetectionResult;
}

export interface SystemConfig {
  id: string;
  config_key: string;
  config_value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  folder: string;
  scan_interval: number;
}

export interface ThresholdsConfig {
  modification_rate: number;
  entropy_change: number;
  rename_count: number;
}

export interface MLModelConfig {
  version: string;
  type: string;
  accuracy: number;
}

export interface DashboardStats {
  totalEvents: number;
  activeAlerts: number;
  riskScore: number;
  systemStatus: 'online' | 'warning' | 'critical';
  detectionRate: number;
  lastScanTime: string | null;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'file_event' | 'detection' | 'alert';
  title: string;
  description: string;
  severity?: AlertSeverity;
  status?: DetectionStatus;
}
