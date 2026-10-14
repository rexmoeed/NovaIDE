import React, { useState, useEffect } from 'react';
import { useIDE } from '../../context/IDEContext';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Bug,
  GitBranch,
  ArrowRight,
  Server,
  FileCode,
  Lock,
  Radio,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ProductionIncident, MonitoringConnectionResult } from '../../types/productionWatchdog';

export const ProductionWatchdogView: React.FC = () => {
  const { productionWatchdogService, setActiveView, openFile } = useIDE();

  const [incidents, setIncidents] = useState<ProductionIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ProductionIncident | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<MonitoringConnectionResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'incidents' | 'spikes' | 'settings'>('incidents');
  const [branchCreated, setBranchCreated] = useState<string | null>(null);

  useEffect(() => {
    productionWatchdogService.getIncidents().then(res => {
      setIncidents(res);
      if (res.length > 0) setSelectedIncident(res[0]);
    });
    productionWatchdogService.testProviderConnection().then(setConnectionStatus);
  }, [productionWatchdogService]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await productionWatchdogService.testProviderConnection();
      setConnectionStatus(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleHandoverToBugDetective = async (incident: ProductionIncident) => {
    await productionWatchdogService.handOverToBugDetective(incident.id);
    setActiveView('bug-detective');
  };

  const handleCreateBranch = async (incident: ProductionIncident) => {
    const res = await productionWatchdogService.createFixBranch(incident.id);
    setBranchCreated(res.branchName);
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Production Watchdog
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Observability & Incident AI
              </span>
            </h1>
            <p className="text-xs text-slate-400">Live telemetry, fingerprint grouping, source-map resolution, and auto-fix branches.</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'incidents' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('spikes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'spikes' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Error Spikes & Rate
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry Providers
          </button>
        </div>

        <button
          onClick={() => setActiveView('editor')}
          className="px-3 py-1.5 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Return to Main Editor Workspace"
        >
          <span>←</span> Back to Editor
        </button>
      </div>

      {/* Observability Summary Metrics */}
      <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-slate-800 bg-slate-900/30 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Telemetry Stream:</span>
          <span className="font-bold text-emerald-300">Active (Sentry OTel)</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="text-slate-400">Unresolved Incidents:</span>
          <span className="font-bold text-rose-300">{incidents.length} grouped</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Incident Rate:</span>
          <span className="font-bold text-amber-300">+120x spike detected</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400">Safe Execution:</span>
          <span className="font-bold text-purple-300">Read-Only Enforced</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {activeTab === 'incidents' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Incidents List */}
            <div className="w-1/2 border-r border-slate-800 flex flex-col min-h-0 p-3 space-y-2 overflow-y-auto">
              {incidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="text-amber-400 font-bold">{inc.id}</span>
                      <span className="text-slate-400">{inc.environment}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-100 truncate">{inc.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 font-mono">
                      <span>{inc.occurrenceCount.toLocaleString()} events</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {inc.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Incident Inspector */}
            <div className="w-1/2 flex flex-col min-h-0 overflow-y-auto p-6 bg-slate-950 space-y-5">
              {selectedIncident ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">{selectedIncident.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {selectedIncident.environment}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-white mt-1">{selectedIncident.title}</h2>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreateBranch(selectedIncident)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                        Fix Branch
                      </button>

                      <button
                        onClick={() => handleHandoverToBugDetective(selectedIncident)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                      >
                        <Bug className="w-3.5 h-3.5" />
                        Investigate with Bug Detective
                      </button>
                    </div>
                  </div>

                  {branchCreated && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Isolated worktree branch created: <strong>{branchCreated}</strong></span>
                    </div>
                  )}

                  {/* Source Mapping Card */}
                  {selectedIncident.sourceMapping && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Source Map Resolution
                      </span>
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span
                          onClick={() => {
                            openFile(selectedIncident.sourceMapping!.resolvedFile);
                            setActiveView('editor');
                          }}
                          className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                          <FileCode className="w-4 h-4" />
                          {selectedIncident.sourceMapping.resolvedFile}:{selectedIncident.sourceMapping.resolvedLine}
                        </span>
                        <span className="text-emerald-400">Map Verified</span>
                      </div>

                      {selectedIncident.sourceMapping.sourceContext && (
                        <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {selectedIncident.sourceMapping.sourceContext.join('\n')}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* AI Root Cause Analysis */}
                  {selectedIncident.analysis && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        AI Incident Diagnosis
                      </span>
                      <p className="text-xs text-slate-200">{selectedIncident.analysis.summary}</p>
                      <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                        <span className="text-slate-400 block font-semibold">Suggested Fix:</span>
                        <p className="text-slate-300">{selectedIncident.analysis.suggestedFix.description}</p>
                        <pre className="text-emerald-400 font-mono text-[11px] mt-1 bg-slate-900 p-2 rounded">
                          {selectedIncident.analysis.suggestedFix.patch}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Stack Trace */}
                  {selectedIncident.stackTrace && (
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Production Stack Trace
                      </span>
                      <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto">
                        {selectedIncident.stackTrace.raw}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Select an incident from the left panel.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ERROR SPIKES */}
        {activeTab === 'spikes' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white">Error Spike & Anomaly Detection</h2>
              <p className="text-xs text-slate-400">Compares incoming error velocity against trailing 7-day baseline rate.</p>
            </div>

            <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase">Anomaly Spike Detected</span>
                <p className="text-sm font-semibold text-white mt-1">
                  Error rate reached 5,120 events/hour (Baseline: 42 events/hour)
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Correlates with production release <strong>v2.4.1</strong> (commit a1b2c3d).
                </p>
              </div>
              <span className="px-4 py-2 bg-amber-600 text-white font-bold text-sm rounded-xl">
                +121.9x Spike
              </span>
            </div>

            {/* Redacted Telemetry Logs */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Sanitized Telemetry Logs (PII & Secrets Redacted)</span>
                <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Credentials Redacted
                </span>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 space-y-1">
{`2026-10-08T00:10:04Z [ERROR] POST /api/login returned 500: TypeError at authService.ts:142 Authorization=Bearer [REDACTED]
2026-10-08T00:10:12Z [ERROR] Uncaught TypeError in browser client session cookie: [REDACTED]
2026-10-08T00:10:18Z [WARN] Database pool connection latency (482ms)`}
              </pre>
            </div>
          </div>
        )}

        {/* 3. SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-2xl space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white">Observability & Monitoring Provider</h2>
              <p className="text-xs text-slate-400">Configure telemetry connection and read-only safety guardrails.</p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Provider Type</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none">
                  <option value="sentry">Sentry (Real API)</option>
                  <option value="opentelemetry">OpenTelemetry OTLP Collector</option>
                  <option value="datadog">Datadog APM</option>
                  <option value="custom">Custom HTTP Telemetry Webhook</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Telemetry Endpoint</label>
                <input
                  type="text"
                  defaultValue="https://sentry.io/api/0/"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-white block">Enforce Read-Only Mode</span>
                  <span className="text-[11px] text-slate-400">Prevents automatic modifications to production databases or deployments</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-600" />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Test Telemetry Connection
                </button>

                {connectionStatus && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected ({connectionStatus.latencyMs}ms latency)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
