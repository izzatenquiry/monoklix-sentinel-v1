import { ServerNode, ServerStatus, MetricPoint } from '../types';

export const generateMetrics = (currentServers: ServerNode[]): ServerNode[] => {
  const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return currentServers.map(server => {
    // Simulate fluctuation
    const cpuFluctuation = (Math.random() - 0.5) * 10;
    const ramFluctuation = (Math.random() - 0.5) * 5;
    
    let newCpu = Math.max(0, Math.min(100, server.metrics.cpu + cpuFluctuation));
    let newRam = Math.max(0, Math.min(100, server.metrics.ram + ramFluctuation));
    
    // Simulate spikes for specific servers to demonstrate UI
    if (server.name === 's3.monoklix.com' && Math.random() > 0.8) {
      newCpu = 95; // Simulate critical load
    }

    // Determine Status
    let newStatus = ServerStatus.ONLINE;
    if (newCpu > 90 || newRam > 95) newStatus = ServerStatus.CRITICAL;
    else if (newCpu > 70 || newRam > 80) newStatus = ServerStatus.WARNING;

    // Network traffic simulation
    const netIn = Math.max(0, server.metrics.networkIn + (Math.random() - 0.5) * 50);
    const netOut = Math.max(0, server.metrics.networkOut + (Math.random() - 0.5) * 100);

    // Update history
    const newHistoryPoint: MetricPoint = { time: now, value: Math.round(newCpu) };
    const cpuHistory = [...server.metrics.history.cpu, newHistoryPoint].slice(-20); // Keep last 20 points
    
    return {
      ...server,
      status: newStatus,
      metrics: {
        ...server.metrics,
        cpu: parseFloat(newCpu.toFixed(1)),
        ram: parseFloat(newRam.toFixed(1)),
        networkIn: parseFloat(netIn.toFixed(1)),
        networkOut: parseFloat(netOut.toFixed(1)),
        loadAvg: [
            parseFloat((newCpu / 20).toFixed(2)), 
            parseFloat((server.metrics.loadAvg[0]).toFixed(2)), 
            parseFloat((server.metrics.loadAvg[1]).toFixed(2))
        ] as [number, number, number],
        history: {
          cpu: cpuHistory,
          ram: server.metrics.history.ram // Simplified for demo
        }
      }
    };
  });
};