import { ServerNode, ServerType, ServerStatus } from './types';

export const APP_NAME = "MONOKLIX SENTINEL";
export const REFRESH_RATE_MS = 3000;

// List of Proxy IPs provided by user
const PROXY_IPS = [
  '144.217.165.108', // s1
  '151.80.145.125',  // s2
  '151.80.144.116',  // s3
  '57.131.25.192',   // s4
  '57.131.25.193',   // s5
  '57.129.112.17',   // s6
  '57.129.112.19',   // s7
  '57.129.112.18',   // s8
  '57.129.112.20',   // s9
  '54.36.181.10',    // s10 (Updated)
  '51.38.64.164',    // s11 (New)
  '192.99.168.190'   // s12 (New)
];

export const INITIAL_SERVERS: ServerNode[] = [
  // Main Servers (All share the same IP: 57.129.46.103)
  {
    id: 'main-01',
    name: 'app.monoklix.com',
    ip: '57.129.46.103',
    type: ServerType.MAIN,
    status: ServerStatus.ONLINE,
    uptime: '14d 2h',
    metrics: {
      cpu: 45,
      ram: 60,
      disk: 30,
      loadAvg: [0.45, 0.50, 0.40],
      networkIn: 120,
      networkOut: 450,
      history: { cpu: [], ram: [] }
    }
  },
  {
    id: 'main-02',
    name: 'veox.monoklix.com',
    ip: '57.129.46.103',
    type: ServerType.MAIN,
    status: ServerStatus.ONLINE,
    uptime: '45d 12h',
    metrics: {
      cpu: 25,
      ram: 40,
      disk: 20,
      loadAvg: [0.20, 0.25, 0.22],
      networkIn: 80,
      networkOut: 200,
      history: { cpu: [], ram: [] }
    }
  },
  {
    id: 'main-03',
    name: 'gemx.monoklix.com',
    ip: '57.129.46.103',
    type: ServerType.MAIN,
    status: ServerStatus.ONLINE,
    uptime: '5d 1h',
    metrics: {
      cpu: 10,
      ram: 35,
      disk: 15,
      loadAvg: [0.10, 0.12, 0.09],
      networkIn: 50,
      networkOut: 100,
      history: { cpu: [], ram: [] }
    }
  },
  // Proxy Servers (s1 - s12)
  ...PROXY_IPS.map((ip, i) => ({
    id: `proxy-${i + 1}`,
    name: `s${i + 1}.monoklix.com`,
    ip: ip,
    type: ServerType.PROXY,
    status: ServerStatus.ONLINE,
    uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
    metrics: {
      cpu: 0,
      ram: 0,
      disk: 0,
      loadAvg: [0, 0, 0] as [number, number, number],
      networkIn: 0,
      networkOut: 0,
      history: { cpu: [], ram: [] }
    }
  }))
];