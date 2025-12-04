import React from 'react';
import { Terminal, Box, Server, Database, Globe, Github, UploadCloud, Monitor } from 'lucide-react';

const CodeBlock = ({ label, code }: { label: string; code: string }) => (
  <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
      <div className="flex items-center">
        <Terminal size={12} className="mr-2" />
        {label}
      </div>
      <span className="text-[10px] text-slate-500 uppercase">SHELL / CONFIG</span>
    </div>
    <div className="p-4 overflow-x-auto">
      <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre select-all">
        {code}
      </pre>
    </div>
  </div>
);

const ArchitectureGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* Intro Section */}
      <div className="space-y-4 border-l-4 border-amber-500 pl-6 bg-slate-900/50 py-4 rounded-r-xl">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Monitor className="mr-3 text-amber-500" />
          Deployment Guide: Monoklix Sentinel
        </h2>
        <p className="text-slate-300 leading-relaxed">
          Panduan ini terbahagi kepada dua bahagian: 
          <br/>
          <strong>Bahagian A:</strong> Setup Backend (Prometheus & Grafana) untuk kutip data.
          <br/>
          <strong>Bahagian B:</strong> Deploy Frontend (Dashboard ini) ke Easypanel.
        </p>
        <p className="text-slate-400 text-sm">
          Lokasi: <strong>Server s12 (192.99.168.190)</strong> adalah pusat operasi.
        </p>
      </div>

      <hr className="border-slate-800" />

      {/* Deployment Tabs/Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Backend Setup */}
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-blue-400 flex items-center mb-6">
                <Database className="mr-2" /> BAHAGIAN A: Backend Setup
            </h3>

            {/* Step 1: Prepare Config */}
            <div>
                <h4 className="font-bold text-white mb-2 text-sm">1. Config Prometheus (SSH ke s12)</h4>
                <p className="text-slate-400 mb-2 text-xs">
                SSH masuk ke server s12 dan buat fail <code>/root/monoklix-monitor/prometheus.yml</code>:
                </p>

                <CodeBlock 
                    label="prometheus.yml" 
                    code={`global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'monoklix_nodes'
    static_configs:
      - targets: 
        # Main Server
        - '57.129.46.103:9100'

        # Proxies
        - '144.217.165.108:9100' # s1
        - '151.80.145.125:9100'  # s2
        - '151.80.144.116:9100'  # s3
        - '57.131.25.192:9100'   # s4
        - '57.131.25.193:9100'   # s5
        - '57.129.112.17:9100'   # s6
        - '57.129.112.19:9100'   # s7
        - '57.129.112.18:9100'   # s8
        - '57.129.112.20:9100'   # s9
        - '54.36.181.10:9100'    # s10
        - '51.38.64.164:9100'    # s11
        - '192.99.168.190:9100'  # s12
`} 
                />
            </div>

            {/* Step 2: Easypanel Setup */}
            <div>
                <h4 className="font-bold text-white mb-2 text-sm">2. Create Services di Easypanel (s12)</h4>
                
                <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg">
                        <span className="text-orange-400 font-bold text-xs block mb-1">SERVICE 1: PROMETHEUS</span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            <li>Image: <code>prom/prometheus:latest</code></li>
                            <li>Port: <code>9090</code></li>
                            <li>Mounts: Host <code>/root/monoklix-monitor/prometheus.yml</code> -> Container <code>/etc/prometheus/prometheus.yml</code></li>
                        </ul>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg">
                        <span className="text-blue-400 font-bold text-xs block mb-1">SERVICE 2: GRAFANA</span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            <li>Image: <code>grafana/grafana:latest</code></li>
                            <li>Port: <code>3000</code></li>
                            <li>Env: <code>GF_SECURITY_ADMIN_PASSWORD</code> = <code>rahsia_monoklix</code></li>
                            <li>Login: User <strong>admin</strong></li>
                        </ul>
                    </div>
                </div>
            </div>

             {/* Step 3: Install Agents */}
            <div>
                <h4 className="font-bold text-white mb-2 text-sm">3. Install Agent (Semua Server)</h4>
                <p className="text-slate-400 mb-2 text-xs">
                  Run command ini di dalam terminal (SSH) setiap server (s1-s12, App, Veox):
                </p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <code className="text-xs text-emerald-400 font-mono select-all">
                        docker run -d --name=node_exporter --net="host" --pid="host" --restart=unless-stopped -v "/:/host:ro,rslave" quay.io/prometheus/node-exporter:latest --path.rootfs=/host
                    </code>
                </div>
            </div>
        </div>

        {/* Right Column: Frontend Deployment */}
        <div className="space-y-8 border-l border-slate-800 lg:pl-10">
             <h3 className="text-xl font-bold text-emerald-400 flex items-center mb-6">
                <UploadCloud className="mr-2" /> BAHAGIAN B: Deploy Dashboard Ini
            </h3>
            
            <p className="text-sm text-slate-300">
                Untuk menaikkan dashboard React ini supaya boleh diakses oleh team, ikut langkah ini:
            </p>

            <ol className="list-decimal space-y-6 ml-4">
                <li className="pl-2">
                    <strong className="text-white block mb-1">Upload Code ke GitHub</strong>
                    <p className="text-xs text-slate-400 mb-2">
                        Pastikan kesemua fail config (Dockerfile, package.json, nginx.conf) telah di-upload ke repo GitHub anda.
                    </p>
                    <div className="bg-slate-900 p-2 rounded flex items-center gap-2 text-xs text-slate-300">
                       <Github size={14} />
                       <span>git push origin main</span>
                    </div>
                </li>

                <li className="pl-2">
                    <strong className="text-white block mb-1">Easypanel: Create New App</strong>
                    <ul className="list-disc text-xs text-slate-400 space-y-2 mt-2">
                        <li>Buka Easypanel -> Project "Monitoring".</li>
                        <li>Klik <strong>+ Service</strong> -> <strong>App</strong>.</li>
                        <li>Namakan service: <code>sentinel-dashboard</code>.</li>
                        <li><strong>Source:</strong> Pilih <strong>GitHub</strong> dan pilih repo anda.</li>
                    </ul>
                </li>

                <li className="pl-2">
                    <strong className="text-white block mb-1">Build Configuration</strong>
                    <p className="text-xs text-slate-400 mb-2">Easypanel akan kesan Dockerfile secara automatik.</p>
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg">
                        <span className="text-emerald-400 font-bold text-xs block mb-1">SETTINGS:</span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            <li>Build Method: <code>Dockerfile</code></li>
                            <li>Docker Path: <code>./Dockerfile</code> (Default)</li>
                            <li><strong>HTTP Port:</strong> <code>8080</code> (Updated!)</li>
                        </ul>
                    </div>
                </li>

                <li className="pl-2">
                    <strong className="text-white block mb-1">Set Domain</strong>
                    <p className="text-xs text-slate-400 mb-2">
                        Pergi ke tab "Domains" dalam service tadi.
                    </p>
                    <div className="bg-emerald-900/20 border border-emerald-900/50 p-2 rounded text-emerald-200 text-xs font-mono">
                        dashboard.monoklix.com
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Easypanel akan auto-handle SSL (HTTPS).</p>
                </li>
            </ol>

            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl mt-6">
                <h4 className="text-blue-200 font-bold text-sm mb-2">Ringkasan Port:</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="block text-slate-500">Dashboard Ini (React)</span>
                        <span className="font-mono text-white">Port 8080 (Internal)</span>
                    </div>
                    <div>
                        <span className="block text-slate-500">Grafana</span>
                        <span className="font-mono text-white">Port 3000 (Internal)</span>
                    </div>
                    <div className="col-span-2 text-[10px] text-slate-400 mt-2">
                        *User hanya akses melalui Domain (Port 443 HTTPS). Anda tak perlu buka port firewall selain 80/443.
                    </div>
                </div>
            </div>

        </div>

      </div>

    </div>
  );
};

export default ArchitectureGuide;