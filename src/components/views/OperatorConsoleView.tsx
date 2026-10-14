import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Users,
  Briefcase,
  Layers,
  Activity,
  Cpu,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  Trash2,
  Search,
  Filter,
  Check,
  ChevronRight,
  Terminal,
  Server,
  Zap,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react';
import { CredentialVaultService } from '../../services/credentialVaultService';
import { RulebookEngine } from '../../services/rulebookEngine';
import { MultiAiCouncilService } from '../../services/multiAiCouncilService';
import { BusinessTrackerService } from '../../services/businessTrackerService';
import { ApprovalQueueService } from '../../services/approvalQueueService';
import { BackgroundJobScheduler } from '../../services/backgroundJobScheduler';
import { ModelRouterService } from '../../services/modelRouterService';
import { LocalAiNodeService } from '../../services/localAiNodeService';
import { OpsVisibilityService } from '../../services/opsVisibilityService';
import { KnowledgeGraphService } from '../../services/knowledgeGraphService';
import { SkillSetService } from '../../services/skillSetService';
import { VersioningService } from '../../services/versioningService';
import { TaskRoutingCategory, TrackerStatus } from '../../types/kos';

export const OperatorConsoleView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'approvals' | 'rulebook' | 'vault' | 'council' | 'businesses' | 'jobs' | 'router' | 'ops' | 'skills'
  >('approvals');

  // State slices
  const [approvals, setApprovals] = useState(() => ApprovalQueueService.listAll());
  const [rules, setRules] = useState(() => RulebookEngine.listRules());
  const [violations, setViolations] = useState(() => RulebookEngine.listViolations());
  const [secrets, setSecrets] = useState(() => CredentialVaultService.listSecrets());
  const [councilSessions, setCouncilSessions] = useState(() => MultiAiCouncilService.listSessions());
  const [businesses, setBusinesses] = useState(() => BusinessTrackerService.listBusinesses());
  const [activeBiz, setActiveBiz] = useState(() => BusinessTrackerService.getActiveBusiness());
  const [trackerItems, setTrackerItems] = useState(() => BusinessTrackerService.listTrackerItems());
  const [jobs, setJobs] = useState(() => BackgroundJobScheduler.listJobs());
  const [routes, setRoutes] = useState(() => ModelRouterService.listRoutes());
  const [nodes, setNodes] = useState(() => LocalAiNodeService.listNodes());
  const [opsSnapshot, setOpsSnapshot] = useState(() => OpsVisibilityService.getRealtimeSnapshot());
  const [auditTrail, setAuditTrail] = useState(() => OpsVisibilityService.getUnifiedAuditTrail());
  const [skills, setSkills] = useState(() => SkillSetService.listSkills());
  const [graph, setGraph] = useState(() => KnowledgeGraphService.getGraph());
  const [version, setVersion] = useState(() => VersioningService.getCurrentVersion());

  // Modals & sub-state
  const [isConveningCouncil, setIsConveningCouncil] = useState(false);
  const [councilTopic, setCouncilTopic] = useState('');
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretVal, setNewSecretVal] = useState('');
  const [newSecretType, setNewSecretType] = useState<'api_key' | 'token' | 'db_credential'>('api_key');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolveApproval = (id: string, decision: 'approved' | 'rejected') => {
    ApprovalQueueService.resolveItem(id, decision);
    setApprovals(ApprovalQueueService.listAll());
    setOpsSnapshot(OpsVisibilityService.getRealtimeSnapshot());
    setAuditTrail(OpsVisibilityService.getUnifiedAuditTrail());
    showToast(`Decision recorded: ${decision.toUpperCase()}`);
  };

  const handleConveneCouncil = async () => {
    if (!councilTopic.trim()) return;
    setIsConveningCouncil(true);
    try {
      await MultiAiCouncilService.conveneCouncil(councilTopic, undefined, 'vote');
      setCouncilSessions(MultiAiCouncilService.listSessions());
      setCouncilTopic('');
      showToast('Multi-AI Council session concluded with verdict.');
    } finally {
      setIsConveningCouncil(false);
    }
  };

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretName.trim() || !newSecretVal.trim()) return;
    CredentialVaultService.addSecret(newSecretName, newSecretVal, newSecretType, 'ask_once_per_session', activeBiz.id);
    setSecrets(CredentialVaultService.listSecrets());
    setNewSecretName('');
    setNewSecretVal('');
    setAuditTrail(OpsVisibilityService.getUnifiedAuditTrail());
    showToast(`Saved secret "${newSecretName}" to encrypted vault.`);
  };

  const handleToggleRule = (id: string, enabled: boolean) => {
    RulebookEngine.toggleRule(id, enabled);
    setRules(RulebookEngine.listRules());
    showToast(`Rule ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleTriggerJob = async (id: string) => {
    const res = await BackgroundJobScheduler.triggerJob(id);
    setJobs(BackgroundJobScheduler.listJobs());
    showToast(`Job finished: ${res.output}`);
  };

  const handleSwitchBusiness = (id: string) => {
    BusinessTrackerService.setActiveBusiness(id);
    const b = BusinessTrackerService.getActiveBusiness();
    setActiveBiz(b);
    setTrackerItems(BusinessTrackerService.listTrackerItems(id));
    showToast(`Switched context to "${b.name}"`);
  };

  const handleMoveTask = (id: string, status: TrackerStatus) => {
    BusinessTrackerService.moveTrackerItem(id, status);
    setTrackerItems(BusinessTrackerService.listTrackerItems(activeBiz.id));
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col text-slate-100 select-none overflow-hidden h-full">
      {/* 1. Header Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">Operator Console</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                KOS PARITY ACTIVE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                v{version}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero-Trust AI Governance: Vault, Hard Rulebook Gates, Council Deliberation & Ops Control
            </p>
          </div>
        </div>

        {/* Business Selector Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Business Scope:</span>
          <select
            value={activeBiz.id}
            onChange={e => handleSwitchBusiness(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {businesses.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} (${b.spentBudgetUsd.toFixed(1)} / ${b.monthlyBudgetUsd})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Horizontal Navigation Tabs */}
      <div className="h-11 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center gap-1 shrink-0 overflow-x-auto">
        {[
          { id: 'approvals', label: 'Owner Approvals', icon: CheckCircle2, badge: approvals.filter(a => a.status === 'pending').length },
          { id: 'rulebook', label: 'Rulebook & Gates', icon: BookOpen, badge: violations.length },
          { id: 'vault', label: 'Credential Vault', icon: Key, badge: secrets.length },
          { id: 'council', label: 'Multi-AI Council', icon: Users, badge: councilSessions.length },
          { id: 'businesses', label: 'Business Trackers', icon: Briefcase, badge: trackerItems.length },
          { id: 'jobs', label: 'Background Jobs', icon: Clock, badge: jobs.filter(j => j.enabled).length },
          { id: 'router', label: 'Model Router & LAN', icon: Radio, badge: nodes.filter(n => n.status === 'online').length },
          { id: 'ops', label: 'Ops Visibility & Audit', icon: Activity, badge: auditTrail.length },
          { id: 'skills', label: 'Skills & Knowledge', icon: Cpu, badge: skills.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                    tab.id === 'approvals' && tab.badge > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Main Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: OWNER APPROVAL QUEUE */}
        {activeTab === 'approvals' && (
          <div className="max-w-5xl flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Owner Approval Queue</h2>
              <p className="text-xs text-slate-400">
                Untrusted agents cannot bypass this queue. Risky tool calls, overrides, and budget expenses await explicit owner sign-off.
              </p>
            </div>

            <div className="space-y-3">
              {approvals.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 transition ${
                    item.status === 'pending'
                      ? 'bg-slate-900 border-amber-500/40 shadow-sm'
                      : item.status === 'approved'
                      ? 'bg-slate-900/60 border-emerald-500/30 opacity-75'
                      : 'bg-slate-900/60 border-rose-500/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          item.risk === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : item.risk === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {item.risk} risk
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        item.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                          : item.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{item.description}</p>

                  {item.diffSnippet && (
                    <pre className="p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      {item.diffSnippet}
                    </pre>
                  )}

                  {item.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleResolveApproval(item.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Approve & Execute
                      </button>
                      <button
                        onClick={() => handleResolveApproval(item.id, 'rejected')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: RULEBOOK & HARD GATES */}
        {activeTab === 'rulebook' && (
          <div className="max-w-5xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Rulebook Hard Gates</h2>
              <p className="text-xs text-slate-400">
                Pre-execution checks run strictly in the backend. Blocks cannot be overridden by AI; only owner overrides are permitted.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
                    rule.enabled ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/40 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{rule.description}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        rule.severity === 'block' ? 'bg-rose-500/20 text-rose-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>

                  {rule.pattern && (
                    <code className="text-[10px] font-mono text-cyan-300 bg-black/40 p-1.5 rounded border border-white/5 truncate">
                      {rule.pattern}
                    </code>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                    <span className="text-slate-400">Scope: {rule.scope.join(', ')}</span>
                    <button
                      onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Violations */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white mb-2">Recent Gate Violations</h3>
              <div className="space-y-1.5">
                {violations.map(v => (
                  <div key={v.id} className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-300">[{v.severity.toUpperCase()}]</span> {v.ruleDescription} on{' '}
                      <code className="text-white">{v.target}</code>
                    </div>
                    <span className="text-slate-400 text-[10px]">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CREDENTIAL VAULT */}
        {activeTab === 'vault' && (
          <div className="max-w-5xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Credential Vault</h2>
              <p className="text-xs text-slate-400">
                Encrypted secret storage. Agents reference secrets as <code className="text-emerald-400">vault:name</code> and never view raw values in plain text.
              </p>
            </div>

            {/* Add Secret Form */}
            <form onSubmit={handleAddSecret} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
              <input
                type="text"
                placeholder="Secret name (e.g. github-pat)"
                value={newSecretName}
                onChange={e => setNewSecretName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none flex-1"
              />
              <input
                type="password"
                placeholder="Raw Secret Value"
                value={newSecretVal}
                onChange={e => setNewSecretVal(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none flex-1"
              />
              <select
                value={newSecretType}
                onChange={e => setNewSecretType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="api_key">API Key</option>
                <option value="token">Token</option>
                <option value="db_credential">DB Credential</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Save to Vault
              </button>
            </form>

            {/* Secrets List */}
            <div className="space-y-2">
              {secrets.map(s => (
                <div key={s.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>vault:{s.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">({s.type})</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{s.maskedPreview}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {s.policy}
                    </span>
                    <button
                      onClick={() => {
                        CredentialVaultService.deleteSecret(s.id);
                        setSecrets(CredentialVaultService.listSecrets());
                        showToast(`Deleted secret ${s.name}`);
                      }}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-AI COUNCIL */}
        {activeTab === 'council' && (
          <div className="max-w-5xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Multi-AI Council</h2>
              <p className="text-xs text-slate-400">
                Deliberate high-impact architectural changes across multiple foundation models simultaneously.
              </p>
            </div>

            {/* Convene Council Toolbar */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex gap-2">
              <input
                type="text"
                placeholder="Enter topic or architectural decision to deliberate..."
                value={councilTopic}
                onChange={e => setCouncilTopic(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleConveneCouncil}
                disabled={isConveningCouncil}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isConveningCouncil ? 'Deliberating...' : 'Convene Council'}</span>
              </button>
            </div>

            {/* Council Sessions List */}
            <div className="space-y-4">
              {councilSessions.map(session => (
                <div key={session.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Topic: {session.topic}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        session.finalVerdict === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {session.finalVerdict}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono">
                    {session.consensusSummary}
                  </p>

                  {/* Individual Model Votes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {session.votes.map((v, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex flex-col gap-1">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>{v.memberModel}</span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                              v.decision === 'approve'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : v.decision === 'reject'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {v.decision}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] line-clamp-3">{v.reasoning}</p>
                        <div className="text-slate-500 text-[9px] mt-1 font-mono">
                          Latency: {v.latencyMs}ms | Cost: ${v.estimatedCostUsd.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BUSINESSES & TRACKERS */}
        {activeTab === 'businesses' && (
          <div className="max-w-6xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Business Trackers ({activeBiz.name})</h2>
              <p className="text-xs text-slate-400">
                Workspaces and agent tasks organized by business entities with complete memory & budget boundary isolation.
              </p>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {(['backlog', 'in_progress', 'review', 'done'] as TrackerStatus[]).map(statusCol => {
                const items = trackerItems.filter(i => i.status === statusCol);
                return (
                  <div key={statusCol} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2.5 min-h-[300px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-xs uppercase tracking-wide text-slate-300 font-mono">
                        {statusCol.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {items.map(t => (
                        <div key={t.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs flex flex-col gap-1.5 shadow-xs">
                          <span className="font-bold text-slate-200">{t.title}</span>
                          <p className="text-[10px] text-slate-400 line-clamp-2">{t.description}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[9px]">
                            <span className="text-amber-400 font-mono uppercase">{t.priority}</span>
                            <div className="flex gap-1">
                              {statusCol !== 'done' && (
                                <button
                                  onClick={() => handleMoveTask(t.id, statusCol === 'backlog' ? 'in_progress' : statusCol === 'in_progress' ? 'review' : 'done')}
                                  className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                                >
                                  Advance &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: BACKGROUND JOBS */}
        {activeTab === 'jobs' && (
          <div className="max-w-5xl flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Self-Healing Background Jobs</h2>
              <p className="text-xs text-slate-400">
                Scheduled automated engineering jobs. Includes exponential backoff retry and circuit breakers on repetitive failures.
              </p>
            </div>

            <div className="space-y-2.5">
              {jobs.map(job => (
                <div key={job.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{job.name}</span>
                      <code className="text-[10px] font-mono text-cyan-300 bg-black/40 px-1.5 py-0.5 rounded">
                        {job.schedule}
                      </code>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          job.lastStatus === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : job.lastStatus === 'running'
                            ? 'bg-indigo-500/20 text-indigo-400 animate-pulse'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {job.lastStatus}
                      </span>
                    </div>
                    {job.lastOutput && (
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">{job.lastOutput}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTriggerJob(job.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Run Now</span>
                    </button>
                    {job.circuitBroken && (
                      <button
                        onClick={() => {
                          BackgroundJobScheduler.resetCircuitBreaker(job.id);
                          setJobs(BackgroundJobScheduler.listJobs());
                        }}
                        className="px-2.5 py-1 bg-rose-900 text-rose-200 rounded text-xs cursor-pointer font-bold"
                      >
                        Reset Breaker
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MODEL ROUTER & LAN NODES */}
        {activeTab === 'router' && (
          <div className="max-w-5xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Model Routing & LAN GPU Nodes</h2>
              <p className="text-xs text-slate-400">
                Cost-aware task routing across cloud providers and private local LAN inference hardware.
              </p>
            </div>

            {/* LAN Nodes */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2">Registered LAN Nodes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nodes.map(n => (
                  <div key={n.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{n.name}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            n.status === 'online' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {n.host}:{n.port} ({n.type}) | Latency: {n.latencyMs}ms
                      </div>
                      {n.hardwareInfo && (
                        <div className="text-[9px] text-indigo-300 font-mono mt-0.5">{n.hardwareInfo}</div>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        await LocalAiNodeService.pingNode(n.id);
                        setNodes(LocalAiNodeService.listNodes());
                        showToast(`Checked node ${n.name}`);
                      }}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Ping Node Health"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Router Table */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2">Task Routing Rules</h3>
              <div className="space-y-1.5">
                {routes.map(r => (
                  <div key={r.category} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between font-mono">
                    <span className="text-indigo-300 font-bold">{r.category}</span>
                    <span className="text-slate-200">
                      Primary: {r.primaryProvider}/{r.primaryModel}
                    </span>
                    <span className="text-slate-400 text-[10px]">Max tokens: {r.maxTokens}</span>
                    <span className="text-emerald-400 text-[10px]">${r.costCeilingPerReqUsd} cap</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: OPS VISIBILITY & UNIFIED AUDIT */}
        {activeTab === 'ops' && (
          <div className="max-w-5xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Operations Dashboard & Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Real-time governance metrics and append-only audit log across all agent executions.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-mono">ACTIVE JOBS</div>
                <div className="text-lg font-bold text-white mt-1">{opsSnapshot.activeJobs}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-mono">PENDING APPROVALS</div>
                <div className="text-lg font-bold text-amber-400 mt-1">{opsSnapshot.pendingApprovals}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-mono">SESSION COST</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">${opsSnapshot.totalCostUsdSession.toFixed(4)}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-mono">HEALTH SCORE</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{opsSnapshot.nodeHealthScore}%</div>
              </div>
            </div>

            {/* Audit Trail */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2">Unified Audit Stream</h3>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {auditTrail.map(event => (
                  <div key={event.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          event.source === 'rulebook'
                            ? 'bg-rose-500/20 text-rose-400'
                            : event.source === 'vault'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {event.source}
                      </span>
                      <span className="text-slate-200">{event.details}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SKILLS & KNOWLEDGE GRAPH */}
        {activeTab === 'skills' && (
          <div className="max-w-5xl flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white">Skills Registry & Codebase Knowledge Graph</h2>
              <p className="text-xs text-slate-400">
                Executable skill definitions and symbol relationship graphs built for context generation.
              </p>
            </div>

            {/* Knowledge Graph Stats */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white">Symbol & Dependency Graph</span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {graph.nodeCount} nodes indexed, {graph.edgeCount} relationships verified
                </p>
              </div>
              <button
                onClick={() => {
                  KnowledgeGraphService.rebuildGraph([
                    'src/App.tsx',
                    'src/context/IDEContext.tsx',
                    'src/services/aiProviderService.ts',
                    'src/services/credentialVaultService.ts',
                    'src/services/rulebookEngine.ts',
                    'server.ts',
                  ]);
                  setGraph(KnowledgeGraphService.getGraph());
                  showToast('Rebuilt codebase knowledge graph.');
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold cursor-pointer"
              >
                Sync Graph
              </button>
            </div>

            {/* Skills List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map(skill => (
                <div key={skill.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">/{skill.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">v{skill.version}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{skill.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                    Allowed tools: {skill.allowedTools.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 right-6 px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
