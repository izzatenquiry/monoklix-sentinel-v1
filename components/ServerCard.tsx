import React from 'react';
import { ServerNode, ServerStatus, ServerType } from '../types';
import { Activity, HardDrive, Cpu, Network, ExternalLink } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface ServerCardProps {
  server: ServerNode;
}

const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
  const isCritical = server.status === ServerStatus.CRITICAL;
  const isWarning = server.status === ServerStatus.WARNING;
  const isMain = server.type === ServerType.MAIN;

  // Define Theme based on Server Type
  const theme = isMain 
    ? {
        bg: "bg-gradient-to-br from-slate-900 to-blue-950/30",
        borderDefault: "border-blue-500/20",
        borderHover: "hover:border-blue-500/50",
        buttonHover: "hover:bg-blue-600",
        glow: "shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]"
      }
    : {
        bg: "bg-gradient-to-br from-slate-900 to-purple-950/30",
        borderDefault: "border-purple-500/20",
        borderHover: "hover:border-purple-500/50",
        buttonHover: "hover:bg-purple-600",
        glow: "shadow-[0_4px_20px_-10px_rgba(168,85,247,0.15)]"
      };
  
  // Status Logic Overrides
  let statusColor = "bg-emerald-500";
  let borderColor = theme.borderDefault;
  let glowClass = theme.glow;
  let bgClass = theme.bg;

  if (isCritical) {
    statusColor = "bg-rose-500";
    borderColor = "border-rose-900";
    glowClass = "shadow-[0_0_15px_rgba(244,63,94,0.3)]";
    // Keep the background dark to make red pop, but maybe slightly red tinted
    bgClass = "bg-slate-900"; 
  } else if (isWarning) {
    statusColor = "bg-amber-500";
    borderColor = "border-amber-900";
  }

  return (
    <div className={`relative ${bgClass} border ${borderColor} rounded-xl p-4 transition-all duration-300 ${theme.borderHover} ${glowClass} flex flex-col group`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            {server.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{server.ip}</p>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full ${statusColor} animate-pulse shadow-lg`} />
      </div>

      {/* Mini Chart Background */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none overflow-hidden rounded-xl">
         <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={server.metrics.history.cpu}>
            <Area type="monotone" dataKey="value" stroke="#fff" fill="#fff" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 flex-grow">
        {/* CPU */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs uppercase">
            <Cpu size={12} />
            <span>CPU</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${server.metrics.cpu > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} 
              style={{ width: `${server.metrics.cpu}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white font-mono">{server.metrics.cpu}%</span>
            <span className="text-slate-500">{server.metrics.loadAvg[0]}</span>
          </div>
        </div>

        {/* RAM */}
        <div className="space-y-1">
           <div className="flex items-center space-x-2 text-slate-400 text-xs uppercase">
            <HardDrive size={12} />
            <span>RAM</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${server.metrics.ram > 90 ? 'bg-rose-500' : 'bg-purple-500'}`} 
              style={{ width: `${server.metrics.ram}%` }}
            />
          </div>
           <span className="text-white font-mono text-xs">{server.metrics.ram}%</span>
        </div>

        {/* Network */}
        <div className="col-span-2 pt-2 border-t border-slate-800 mt-2">
            <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                    <Network size={12} />
                    <span>NET I/O</span>
                </div>
                <div className="font-mono text-slate-300">
                    <span className="text-emerald-400">↓ {Math.round(server.metrics.networkIn)}</span>
                    <span className="mx-2 text-slate-600">|</span>
                    <span className="text-sky-400">↑ {Math.round(server.metrics.networkOut)}</span>
                    <span className="text-slate-600 ml-1">Mbps</span>
                </div>
            </div>
        </div>
      </div>

      {/* Login Button Footer */}
      <div className="relative z-10 mt-4 pt-3 border-t border-slate-800">
        <a 
          href={`http://${server.ip}:3000/`} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`group flex items-center justify-center w-full px-4 py-2 bg-slate-800 ${theme.buttonHover} text-slate-300 hover:text-white rounded-lg transition-all duration-300 text-xs font-bold tracking-wide`}
        >
          <span className="mr-2">LOGIN SERVER</span>
          <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default ServerCard;