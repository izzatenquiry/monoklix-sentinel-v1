export enum ServerType {
  MAIN = 'MAIN',
  PROXY = 'PROXY',
  FALLBACK = 'FALLBACK'
}

export enum ServerStatus {
  ONLINE = 'ONLINE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'OFFLINE'
}

export interface MetricPoint {
  time: string;
  value: number;
}

export interface ServerMetrics {
  cpu: number; // Percentage
  ram: number; // Percentage
  disk: number; // Percentage
  loadAvg: [number, number, number]; // 1m, 5m, 15m
  networkIn: number; // Mbps
  networkOut: number; // Mbps
  history: {
    cpu: MetricPoint[];
    ram: MetricPoint[];
  };
}

export interface ServerNode {
  id: string;
  name: string;
  ip: string;
  type: ServerType;
  status: ServerStatus;
  metrics: ServerMetrics;
  uptime: string;
}

export interface AnalysisResult {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  report: string;
}