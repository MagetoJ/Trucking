'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { authenticatedFetcher } from '@/lib/fetcher';
import { BACKEND_BASE_URL } from '@/lib/fetcher'; // Import BACKEND_BASE_URL
import { useAuthStore } from '@/lib/store'; // Import useAuthStore
import {
  Layers, 
  Landmark, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Users, 
  Check, 
  Trash2,
  Settings as ConfigIcon,
  History,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

interface SystemState {
  metrics: { shippersCount: number; driversCount: number; unverifiedUsers: number };
  workloads: { activeLoads: number; inTransitLoads: number; fulfilledLoads: number };
  financials: { totalRevenue: number };
  recentBookings: Array<{
    id: string;
    origin: string;
    destination: string;
    price: string;
    status: string;
    shipper: { name: string; phone: string };
    driver: { name: string; phone: string } | null;
  }>;
}

export default function AdministrativeOversightCenter() {
  const token = useAuthStore((state) => state.token);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true); // Defined here as loadingUsers
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'config' | 'audit'>('overview');

  // Config Form Local State
  const [feePercent, setFeePercent] = useState('10.0');
  const [pricePerKm, setPricePerKm] = useState('2.50');

  // 1. Live SWR Data Fetching Hook for Global Ecosystem Overview Metrics
  const { data: systemState, error: metricsError, mutate: mutateMetrics } = useSWR<SystemState>( // Corrected import
    token ? '/api/admin-dashboard/metrics' : null,
    authenticatedFetcher,
    { refreshInterval: 5000 }
  );

  // 2. Live SWR Data Fetching Hook for Security Audit Logs Trail
  const { data: auditLogs, error: auditError, mutate: mutateAudit } = useSWR<AuditLog[]>(
    token && activeTab === 'audit' ? '/api/admin-dashboard/audit-logs' : null,
    authenticatedFetcher,
    { refreshInterval: 4000 }
  );

  // Fetch users array directories directly from backend matching Express rule models
  const fetchUserDirectory = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try { // Use BACKEND_BASE_URL for direct fetch calls
      const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Failed to sync user records directory:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch System Financial Variables baseline context live
  const fetchConfigVariables = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/admin-dashboard/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && !data.error) {
        setFeePercent(String(data.platformFeePercent));
        setPricePerKm(String(data.basePricePerKm));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserDirectory();
      fetchConfigVariables();
    }
  }, [token]);

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    setSubmittingId(userId);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified: !currentStatus })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !currentStatus } : u));
        mutateMetrics();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingId(null);
    }
  };

  const deleteAccount = async (userId: string) => {
    if (!confirm('Are you absolutely certain you want to permanently purge this account from the platform?')) return;
    setSubmittingId(userId);
    try { // Use BACKEND_BASE_URL for direct fetch calls
      const res = await fetch(`${BACKEND_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        mutateMetrics();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { // Use BACKEND_BASE_URL for direct fetch calls
      const res = await fetch(`${BACKEND_BASE_URL}/api/admin-dashboard/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platformFeePercent: parseFloat(feePercent),
          basePricePerKm: parseFloat(pricePerKm)
        })
      });
      if (res.ok) {
        alert('System configuration parameters committed and updated successfully!');
        fetchConfigVariables();
        mutateMetrics();
      }
    } catch (err) {
      alert('Failed to update config.');
    }
  };

  const forceGlobalRecalculation = () => {
    mutateMetrics();
    fetchUserDirectory();
    if (activeTab === 'audit') mutateAudit();
  };

  /* CRITICAL FIX: Changed isLoadingUsers to matching loadingUsers hook to resolve Runtime ReferenceError */
  if (loadingUsers && !systemState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" aria-hidden="true" />
          <p className="text-sm tracking-widest font-mono">CALCULATING REAL-TIME METRICS SYSTEMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Control Banner */}
        <div className="flex flex-col justify-between sm:flex-row sm:items-center border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Ecosystem Master Control</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Active Real-Time Audit Session Enforced</p>
          </div>
          <button 
            onClick={forceGlobalRecalculation}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 text-sm font-semibold text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Recalculate State Ledger
          </button>
        </div>

        {/* Tab Module Selectors */}
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-900 w-fit" role="tablist" aria-label="Administrative Panels">
          {[
            { id: 'overview', label: 'Ecosystem Overview', icon: Layers },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'config', label: 'System Config', icon: ConfigIcon },
            { id: 'audit', label: 'Security Logs', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)} // Removed 'as any' as it's correctly typed
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" aria-hidden="true" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW COMPONENT */}
        {activeTab === 'overview' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Booked Volume</p>
                  <h3 className="text-2xl font-black text-white mt-2">
                    ${systemState?.financials?.totalRevenue ? systemState.financials.totalRevenue.toLocaleString() : '0.00'}
                  </h3>
                </div>
                <Landmark className="h-10 w-10 text-indigo-500/20" aria-hidden="true" />
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned Loads</p>
                  <h3 className="text-2xl font-black text-amber-500 mt-2">{systemState?.workloads?.activeLoads || 0}</h3>
                </div>
                <Layers className="h-10 w-10 text-amber-500/20" aria-hidden="true" />
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Transits</p>
                  <h3 className="text-2xl font-black text-indigo-400 mt-2">{systemState?.workloads?.inTransitLoads || 0}</h3>
                </div>
                <TrendingUp className="h-10 w-10 text-indigo-400/20" aria-hidden="true" />
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged Registrations</p>
                  <h3 className="text-2xl font-black text-red-400 mt-2">{systemState?.metrics?.unverifiedUsers || 0}</h3>
                </div>
                <AlertCircle className="h-10 w-10 text-red-500/20" aria-hidden="true" />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white tracking-wide">Live Assignment Dispatch Activity Feed</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-900">
                        <th className="pb-3 pl-2">Routing Parameters</th>
                        <th className="pb-3">Shipper</th>
                        <th className="pb-3">Assigned Hauler</th>
                        <th className="pb-3">Value</th>
                        <th className="pb-3 text-right pr-2">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {systemState?.recentBookings?.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-900/30 transition">
                          <td className="py-4 pl-2 font-medium text-white">
                            <div className="flex flex-col">
                              <span>{b.origin}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">➔ {b.destination}</span>
                            </div>
                          </td>
                          <td className="py-4 font-mono">{b.shipper?.name || 'Unknown'}</td>
                          <td className="py-4 font-mono text-slate-400">
                            {b.driver ? <span className="text-indigo-400">{b.driver.name}</span> : <span className="text-amber-500/70 italic">Unassigned</span>}
                          </td>
                          <td className="py-4 font-bold text-white">{b.price}</td>
                          <td className="py-4 text-right pr-2">
                            <span className="inline-block px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-900 pb-3">Platform Density Spread</h3>
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Shippers Volume</span>
                      <span className="text-white font-bold">{systemState?.metrics?.shippersCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Vetted Haulers/Drivers</span>
                      <span className="text-white font-bold">{systemState?.metrics?.driversCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center gap-3 bg-indigo-500/5 p-3 border rounded-xl border-indigo-500/10">
                  <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" aria-hidden="true" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    All platform roles run behind a backend privacy shield. Drivers can only access matching data payloads when assigned to active workloads.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: USER DIRECTORY COMPONENT */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 overflow-x-auto text-foreground">
              <table className="w-full text-left whitespace-nowrap text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-mono font-bold uppercase tracking-wider text-[11px] border-b border-slate-900 bg-slate-900/50">
                    <th className="p-3">User Legal Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone Connection</th>
                    <th className="p-3">Role Assigned</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Administrative Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-3 font-semibold text-white">{user.name}</td>
                      <td className="p-3 font-mono">{user.email}</td>
                      <td className="p-3 font-mono text-slate-400">{user.phone}</td>
                      <td className="p-3 capitalize">{user.role?.toLowerCase()}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold ${user.verified ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {user.verified ? '✓ Active & Verified' : '⚠ Verification Pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => toggleVerification(user.id, user.verified)}
                            disabled={submittingId === user.id}
                            title={`Toggle verification status for ${user.name}`}
                            aria-label={`Toggle verification status for ${user.name}`}
                            className="p-1.5 border border-slate-800 rounded-md hover:bg-slate-800 text-slate-300 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button 
                            onClick={() => deleteAccount(user.id)}
                            disabled={submittingId === user.id}
                            title={`Permanently delete user profile for ${user.name}`}
                            aria-label={`Permanently delete user profile for ${user.name}`}
                            className="p-1.5 border border-red-500/20 bg-red-500/5 rounded-md hover:bg-red-500/10 text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM CONFIG WORKSPACE */}
        {activeTab === 'config' && (
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
            <div className="border-b border-slate-900 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ConfigIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" /> Platform Financial Variables
              </h3>
              <p className="text-xs text-slate-500 mt-1">Alter global pricing rates and commission margins committed to the database ledger layers.</p>
            </div>
            
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div>
                <label htmlFor="platformFeeInput" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Marketplace Commission Fee (%)</label>
                <input 
                  id="platformFeeInput"
                  type="number" 
                  value={feePercent} 
                  onChange={(e) => setFeePercent(e.target.value)}
                  step="0.1"
                  placeholder="10.0"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl outline-none focus:border-indigo-500 font-mono" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="baseTariffInput" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Base Trajectory Tariff Price Per KM ($)</label>
                <input 
                  id="baseTariffInput"
                  type="number" 
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  step="0.01"
                  placeholder="2.50"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl outline-none focus:border-indigo-500 font-mono" 
                  required 
                />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-widest uppercase rounded-xl shadow-lg transition cursor-pointer">
                Commit Operational Variable Changes
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SECURITY LOGS AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Ecosystem Security Audit Trail Ledger</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Immutable record of supervisor actions pulled live from the AuditTrail database channel.</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono text-[10px] uppercase border border-red-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" aria-hidden="true" /> Secure Stream Active
              </span>
            </div>
            
            <div className="p-4 overflow-x-auto text-foreground">
              {auditError && (
                <div className="p-4 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                  Failed to synchronize security trail: {auditError.message}
                </div>
              )}
              
              <table className="w-full text-left whitespace-nowrap text-xs border-collapse">
                <thead> 
                  <tr className="text-slate-400 font-mono font-bold uppercase tracking-wider text-[11px] border-b border-slate-900 bg-slate-900/50">
                    <th className="p-3">Timestamp Log</th>
                    <th className="p-3">Supervisor ID</th>
                    <th className="p-3">Action Enforced</th>
                    <th className="p-3">Target Reference</th>
                    <th className="p-3">Operation Details Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-mono text-[11px]">
                  {!auditLogs || auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        No auditable master control history entries committed to the database yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/30 transition">
                        <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 text-slate-500 truncate max-w-[120px]" title={log.adminId}>{log.adminId}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            log.action.includes('DELETE') 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-indigo-400 truncate max-w-[120px]" title={log.targetId}>{log.targetId}</td>
                        <td className="p-3 text-slate-200 font-sans">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}