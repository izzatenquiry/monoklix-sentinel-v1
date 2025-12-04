import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Server, Settings, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { INITIAL_SERVERS, REFRESH_RATE_MS } from './constants';
import { ServerNode, ServerType, ServerStatus, AnalysisResult } from './types';
import { generateMetrics } from './services/mockDataService';
import ServerCard from './components/ServerCard';
import ArchitectureGuide from './components/ArchitectureGuide';
import { GoogleGenAI } from "@google/genai";

enum View {
  DASHBOARD = 'DASHBOARD',
  ARCHITECTURE = 'ARCHITECTURE'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [servers, setServers] = useState<ServerNode[]>(INITIAL_SERVERS);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [analysis, setAnalysis] = useState<AnalysisResult>({ status: 'idle', report: '' });

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev => generateMetrics(prev));
      setLastUpdated(new Date());
    }, REFRESH_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  // Filter helpers
  const mainServers = servers.filter(s => s.type === ServerType.MAIN);
  const proxyServers = servers.filter(s => s.type === ServerType.PROXY);
  const criticalCount = servers.filter(s => s.status === ServerStatus.CRITICAL).length;

  const handleAIAnalysis = async () => {
    if (!process.env.API_KEY) {
      setAnalysis({ status: 'error', report: 'API Key not found. Please set REACT_APP_GEMINI_API_KEY environment variable.' });
      return;
    }

    setAnalysis({ status: 'analyzing', report: '' });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare the context for Gemini
      const systemContext = `
        You are a Senior DevOps Engineer analyzing the Monoklix Server Infrastructure.
        Infrastructure:
        - Main Nodes: 3 (app, veox, gemx)
        - Proxy Nodes: 12 (s1-s12)
        
        Analyze the provided JSON metrics. Look for high load, anomalies, or network bottlenecks.
        Provide a concise, bulleted health report and 2 actionable recommendations.
        Keep it professional and technical.
      `;

      const metricsSnapshot = JSON.stringify(servers.map(s => ({
        name: s.name,
        cpu: s.metrics.cpu,
        ram: s.metrics.ram,
        load: s.metrics.loadAvg[0],
        netIn: s.metrics.networkIn,
        netOut: s.metrics.networkOut
      })), null, 2);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `System Context: ${systemContext}\n\nCurrent Metrics Snapshot:\n${metricsSnapshot}`,
      });

      setAnalysis({ status: 'complete', report: response.text });
    } catch (error) {
      console.error(error);
      setAnalysis({ status: 'error', report: 'Failed to generate analysis. Ensure API Key is valid.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-200 bg-slate-950 font-sans">
      
      {/* Top Header Navigation */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center w-full md:w-auto justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-wider flex items-center">
                <Zap className="text-emerald-500 mr-2" fill="currentColor" />
                MONOKLIX
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest ml-7">Sentinel Core</p>
            </div>
            {/* Mobile Status Indicator */}
            <div className={`md:hidden flex items-center px-2 py-1 rounded-full border ${criticalCount > 0 ? 'bg-rose-950/30 border-rose-900 text-rose-400' : 'bg-emerald-950/30 border-emerald-900 text-emerald-400'}`}>
               <div className={`w-2 h-2 rounded-full mr-2 ${criticalCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
               <span className="text-[10px] font-bold">{criticalCount > 0 ? 'ISSUES' : 'OK'}</span>
            </div>
          </div>

          {/* Center Navigation Switcher */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex relative">
            <button
                onClick={() => setCurrentView(View.DASHBOARD)}
                className={`relative z-10 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center ${currentView === View.DASHBOARD ? 'text-white bg-slate-800 shadow-lg border border-slate-700/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
                <LayoutDashboard size={16} className="mr-2" />
                Monitor
            </button>
            <button
                onClick={() => setCurrentView(View.ARCHITECTURE)}
                className={`relative z-10 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center ${currentView === View.ARCHITECTURE ? 'text-white bg-slate-800 shadow-lg border border-slate-700/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
                <Settings size={16} className="mr-2" />
                Setup
            </button>
          </div>

          {/* Right Section: System Status (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
             <div className={`flex items-center px-4 py-2 rounded-lg border ${criticalCount > 0 ? 'bg-rose-950/30 border-rose-900/50 text-rose-400' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'}`}>
                {criticalCount > 0 ? (
                  <AlertTriangle size={16} className="mr-2 animate-bounce" />
                ) : (
                  <CheckCircle size={16} className="mr-2" />
                )}
                <span className="text-xs font-bold tracking-wide">{criticalCount > 0 ? `${criticalCount} SYSTEM ISSUES` : 'ALL SYSTEMS OPTIMAL'}</span>
             </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/50">
        <div className="max-w-[1920px] mx-auto">
          
          {/* Page Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {currentView === View.DASHBOARD ? 'Infrastructure Overview' : 'System Architecture'}
                </h2>
                {currentView === View.DASHBOARD && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold tracking-wider uppercase border border-amber-500/20 rounded">
                    Simulation Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 font-mono flex items-center">
                 <RefreshCw size={12} className="mr-2 opacity-50" />
                 Last Sync: {lastUpdated.toLocaleTimeString()} 
              </p>
            </div>

            {currentView === View.DASHBOARD && (
                <button 
                onClick={handleAIAnalysis}
                disabled={analysis.status === 'analyzing'}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {analysis.status === 'analyzing' ? (
                    <RefreshCw className="animate-spin mr-2" size={16} />
                  ) : (
                    <Zap className="mr-2" size={16} fill="currentColor" />
                  )}
                  {analysis.status === 'analyzing' ? 'Analyzing...' : 'Run AI Diagnostics'}
                </button>
            )}
          </div>

          {/* View Content */}
          {currentView === View.DASHBOARD ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* AI Analysis Result */}
              {analysis.report && (
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                  <h3 className="text-purple-300 font-bold mb-3 flex items-center text-lg">
                    <Zap size={18} className="mr-2" /> AI Analysis Report
                  </h3>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
                    {analysis.report}
                  </div>
                </div>
              )}

              {/* Main Servers Section */}
              <div>
                <div className="flex items-center space-x-3 mb-5">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                     <Server size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Core Infrastructure</h3>
                    <p className="text-xs text-slate-500">Primary application & management nodes</p>
                  </div>
                </div>
                {/* 3 columns for main servers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mainServers.map(server => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>

              {/* Proxy Servers Section */}
              <div>
                 <div className="flex items-center space-x-3 mb-5 mt-8 border-t border-slate-800 pt-8">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                     <Server size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Proxy Network</h3>
                    <p className="text-xs text-slate-500">Load balancing & traffic distribution nodes</p>
                  </div>
                </div>
                {/* Changed to 4 columns to show 4 servers per row on large screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {proxyServers.map(server => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <ArchitectureGuide />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;