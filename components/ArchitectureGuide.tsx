import React from 'react';
import { Terminal, Box, Server, Database, Bell, Shield, Layers, Globe } from 'lucide-react';

const CodeBlock = ({ label, code }: { label: string; code: string }) => (
  <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
      <div className="flex items-center">
        <Terminal size={12} className="mr-2" />
        {label}
      </div>
      <span className="text-[10px] text-slate-500 uppercase">YAML / BASH</span>
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
          <Shield className="mr-3 text-amber-500" />
          Easypanel Integration Mode (s12 Hub)
        </h2>
        <p className="text-slate-300 leading-relaxed">
          Disebabkan anda menggunakan <strong>Easypanel</strong> (Port 3000 busy), kita tidak akan guna Docker Compose biasa. Kita akan install monitoring stack terus di dalam Easypanel sebagai <strong>Services</strong>.
        </p>
        <p className="text-slate-400 text-sm">
          Lokasi Setup: <strong>Server s12 (192.99.168.190)</strong> akan bertindak sebagai "Monitoring Hub" yang mengumpul data dari semua server lain.
        </p>
      </div>

      <hr className="border-slate-800" />

      {/* Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Server, color: 'text-blue-500', title: '1. Target Nodes', desc: 'Install Node Exporter pada SEMUA server (App, Veox, s1-s12).' },
          { icon: Database, color: 'text-orange-500', title: '2. s12: Prometheus', desc: 'Prometheus di s12 tarik data dari semua server lain.' },
          { icon: Globe, color: 'text-purple-500', title: '3. s12: Grafana', desc: 'Grafana di s12 paparkan dashboard visual.' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors">
            <item.icon className={`${item.color} mb-3`} />
            <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Step 1: Prepare Config */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-3">STEP 1</span>
          Persediaan Config di s12 (SSH)
        </h3>
        <p className="text-slate-400 mb-6 text-sm">
          Prometheus perlukan fail config. Masuk ke <strong>Server s12</strong> via SSH dan buat folder ini.
        </p>

        <CodeBlock 
            label="SSH Command (Server s12)" 
            code={`# Buat folder untuk simpan config
mkdir -p /root/monoklix-monitor

# Masuk ke folder
cd /root/monoklix-monitor

# Buat file prometheus.yml
nano prometheus.yml`} 
        />

        <p className="text-slate-400 mb-2 text-sm">Paste content ini ke dalam <code>prometheus.yml</code>. Ini memberitahu s12 untuk scan semua IP server anda:</p>
        <CodeBlock 
            label="prometheus.yml content" 
            code={`global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'monoklix_nodes'
    static_configs:
      - targets: 
        # Main Server (App, Veox, Gemx)
        - '57.129.46.103:9100'

        # Proxy Servers (s1 - s12)
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
        - '192.99.168.190:9100'  # s12 (Self Monitor)
`} 
        />
        <p className="text-xs text-amber-500 mt-2">*Tips: Tekan Ctrl+X, kemudian Y, kemudian Enter untuk save.</p>
      </div>

      {/* Step 2: Easypanel Setup */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded mr-3">STEP 2</span>
          Setup di Easypanel (s12)
        </h3>
        <p className="text-slate-400 mb-6 text-sm">
          Login ke <strong>Easypanel pada s12</strong>, buat Project baru (cth: "Monitoring").
        </p>

        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <h4 className="text-orange-400 font-bold mb-2">Service 1: Prometheus</h4>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    <li>Create <strong>App Service</strong> -> Pilih <strong>Docker Image</strong>.</li>
                    <li>Image: <code>prom/prometheus:latest</code></li>
                    <li>Container Port: <code>9090</code></li>
                    <li><strong>Mounts (PENTING):</strong>
                        <ul className="pl-6 mt-1 text-slate-400 text-xs">
                           <li>Host Path: <code>/root/monoklix-monitor/prometheus.yml</code></li>
                           <li>Container Path: <code>/etc/prometheus/prometheus.yml</code></li>
                        </ul>
                    </li>
                    <li>Deploy!</li>
                </ul>
            </div>

            <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <h4 className="text-blue-400 font-bold mb-2">Service 2: Grafana</h4>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    <li>Create <strong>App Service</strong> -> Pilih <strong>Docker Image</strong>.</li>
                    <li>Image: <code>grafana/grafana:latest</code></li>
                    <li>Container Port: <code>3000</code> (Easypanel akan map ini ke domain, jadi tiada conflict port host).</li>
                    <li><strong>Domains:</strong> Set domain anda, contoh: <code>monitor.monoklix.com</code>.</li>
                    <li><strong>Environment Variables:</strong>
                        <ul className="pl-6 mt-1 text-slate-400 text-xs">
                           <li>Key: <code>GF_SECURITY_ADMIN_PASSWORD</code> | Value: <code>rahsia_monoklix</code></li>
                        </ul>
                    </li>
                    <li>Deploy!</li>
                </ul>
            </div>
        </div>
      </div>

      {/* Step 3: Install Agents */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded mr-3">STEP 3</span>
          Install Agent (Node Exporter)
        </h3>
        <p className="text-slate-400 mb-6 text-sm">
          Anda wajib install <strong>Node Exporter</strong> di OS Host (melalui SSH) pada <strong>SEMUA 13 SERVER</strong> (Termasuk s12 itu sendiri, Server Utama, dan Proxy s1-s11).
        </p>

        <CodeBlock 
            label="Run di Terminal Setiap Server (SSH)" 
            code={`docker run -d \\
  --name=node_exporter \\
  --net="host" \\
  --pid="host" \\
  --restart=unless-stopped \\
  -v "/:/host:ro,rslave" \\
  quay.io/prometheus/node-exporter:latest \\
  --path.rootfs=/host`} 
        />
      </div>

      {/* Final Step */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Langkah Terakhir: Connect Grafana</h3>
        <ol className="list-decimal list-inside space-y-3 text-slate-400 text-sm">
            <li>Buka domain Grafana anda (cth: <code>https://monitor.monoklix.com</code>).</li>
            <li className="p-3 bg-slate-800 rounded border border-slate-700">
                <span className="block text-emerald-400 font-bold mb-1">CREDENTIALS LOGIN:</span>
                <span className="block">Email/Username: <strong className="text-white">admin</strong></span>
                <span className="block">Password: <strong className="text-white">rahsia_monoklix</strong></span>
                <span className="text-xs text-slate-500 mt-1">(Atau password yang anda set dalam Environment Variable tadi)</span>
            </li>
            <li>Pergi ke <strong>Connections -> Data Sources -> Add new</strong>.</li>
            <li>Pilih <strong>Prometheus</strong>.</li>
            <li>
                Connection URL:
                <br />
                <span className="text-emerald-400 text-xs font-mono ml-4">http://prometheus:9090</span>
                <br />
                <span className="text-slate-500 text-xs ml-4">(Sebab dalam Easypanel s12, services boleh bercakap guna nama service).</span>
            </li>
            <li>Click "Save & Test".</li>
            <li>Import Dashboard ID <code>1860</code> untuk paparan visual.</li>
        </ol>
      </div>

    </div>
  );
};

export default ArchitectureGuide;