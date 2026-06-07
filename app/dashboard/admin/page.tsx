'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { 
  ShieldCheck, 
  Layers, 
  Landmark, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  PhoneCall, 
  Users, 
  Truck, 
  ShieldAlert, 
  Check, 
  Trash2,
  UserX,
  Settings as ConfigIcon,
  History
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
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'config' | 'audit'>('overview');
  const token = useAuthStore((state) => state.token);

  // Fetch both system aggregates and user listings directly from the database
  const fetchOversightData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system metrics
      const metricsRes = await fetch('http://localhost:5000/api/admin-dashboard/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      if (metricsData && !metricsData.error) {
        setSystemState(metricsData);
      }

      // 2. Fetch user directory
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Systemic administration refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle account vetting verification status (PUT)
  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    setSubmittingId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified: !currentStatus })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !currentStatus } : u));
        
        // Silently update top stats badges
        if (systemState?.metrics) {
          setSystemState({
            ...systemState,
            metrics: {
              ...systemState.metrics,
              unverifiedUsers: systemState.metrics.unverifiedUsers + (currentStatus ? 1 : -1)
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to update verification toggle:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  // Permanent account removal option (DELETE)
  const deleteAccount = async (userId: string) => {
    if (!confirm('Are you absolutely certain you want to permanently purge this account from the platform? This cannot be undone.')) return;
    setSubmittingId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        // Refresh system matrices automatically
        const metricsRes = await fetch('http://localhost:5000/api/admin-dashboard/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mData = await metricsRes.json();
        if (mData && !mData.error) setSystemState(mData);
      }
    } catch (error) {
      console.error('Failed to purge target account instance:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    if (token) fetchOversightData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm tracking-widest font-mono">CALCULATING ECOSYSTEM METRICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Oversight Navigation Banner */}
        <div className="flex flex-col justify-between sm:flex-row sm:items-center border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Ecosystem Master Control</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Active Real-Time Audit Session Enforced</p>
          </div>
          <button 
            onClick={fetchOversightData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 text-sm font-semibold text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Recalculate State Ledger
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-900 w-fit">
          {[
            { id: 'overview', label: 'Ecosystem Overview', icon: Layers },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'config', label: 'System Config', icon: ConfigIcon },
            { id: 'audit', label: 'Security Logs', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
        {/* Component Analytical Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Booked Volume</p>
              <h3 className="text-2xl font-black text-white mt-2">
                ${systemState?.financials?.totalRevenue ? systemState.financials.totalRevenue.toLocaleString() : '0.00'}
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono mt-1"> Fulfilled Transits</p>
            </div>
            <Landmark className="h-10 w-10 text-indigo-500/20" />
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned Loads</p>
              <h3 className="text-2xl font-black text-amber-500 mt-2">{systemState?.workloads?.activeLoads || 0}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Pending Driver Capture</p>
            </div>
            <Layers className="h-10 w-10 text-amber-500/20" />
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Transits</p>
              <h3 className="text-2xl font-black text-indigo-400 mt-2">{systemState?.workloads?.inTransitLoads || 0}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">En-route Tracking Logs</p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-400/20" />
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged Registrations</p>
              <h3 className="text-2xl font-black text-red-400 mt-2">{systemState?.metrics?.unverifiedUsers || 0}</h3>
              <p className="text-[10px] text-red-400/70 font-mono mt-1">Suspended / Pending Vetting</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500/20" />
          </div>
        </div>

        {/* Global Operational Live Flow Log Ledger & System Summary Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white tracking-wide">Live Assignment Dispatch Activity Feed</h3>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase border border-indigo-500/20">Operational Ledger</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-900">
                    <th className="pb-3 pl-2">Routing Parameters</th>
                    <th className="pb-3">Shipper Target</th>
                    <th className="pb-3">Assigned Hauler</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3 text-right pr-2">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {systemState?.recentBookings?.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/30 transition">
                      <td className="py-4 pl-2 font-medium text-white">
                        <div className="flex flex-col">
                          <span>{b.origin}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">➔ {b.destination}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{b.shipper?.name}</span>
                          <PhoneCall className="h-3 w-3 text-slate-600" />
                        </div>
                      </td>
                      <td className="py-4 font-mono text-slate-400">
                        {b.driver ? (
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <span>{b.driver?.name}</span>
                            <PhoneCall className="h-3 w-3 text-slate-600" />
                          </div>
                        ) : (
                          <span className="text-amber-500/70 italic text-[11px]">Unassigned Open Listing</span>
                        )}
                      </td>
                      <td className="py-4 font-bold text-white">{b.price}</td>
                      <td className="py-4 text-right pr-2">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                          b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          b.status === 'ACCEPTED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Distribution Structural Metrics Card */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="pb-4 border-b border-slate-900">
                <h3 className="text-sm font-bold text-white tracking-wide">Platform Density Spread</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Demographics Breakdown across Registered Roles</p>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Shippers Volume</span>
                    <span className="text-white font-bold">{systemState?.metrics?.shippersCount || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" 
                      style={{ width: `${((systemState?.metrics?.shippersCount || 0) / ((systemState?.metrics?.shippersCount || 1) + (systemState?.metrics?.driversCount || 0))) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Vetted Haulers/Drivers</span>
                    <span className="text-white font-bold">{systemState?.metrics?.driversCount || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" 
                      style={{ width: `${((systemState?.metrics?.driversCount || 0) / ((systemState?.metrics?.shippersCount || 0) + (systemState?.metrics?.driversCount || 1))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-900 flex items-center gap-3 bg-indigo-500/5 p-3 border rounded-xl border-indigo-500/10">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All platform roles run behind a backend privacy shield. Drivers can only access matching data payloads when assigned to active workloads.
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
        {/* Global Accounts Controls Table Dashboard Module */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-900">
            <h3 className="text-sm font-bold text-white tracking-wide">Global Platform Account Registry Directory</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-900 bg-slate-900/10">
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
                    <td className="p-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role?.toLowerCase() === 'driver' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        user.role?.toLowerCase() === 'shipper' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold ${user.verified ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {user.verified ? '✓ Active & Verified' : '⚠ Verification Pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => toggleVerification(user.id, user.verified)}
                          disabled={submittingId === user.id || user.role?.toUpperCase() === 'SUPER_ADMIN'}
                          className="p-1.5 border border-slate-800 rounded-md hover:bg-slate-800 text-slate-300 transition disabled:opacity-20 cursor-pointer"
                          title="Toggle Account Approval Vetting State"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteAccount(user.id)}
                          disabled={submittingId === user.id || user.role?.toUpperCase() === 'SUPER_ADMIN'}
                          className="p-1.5 border border-red-500/20 bg-red-500/5 rounded-md hover:bg-red-500/10 text-red-400 transition disabled:opacity-20 cursor-pointer"
                          title="Purge Account Matrix Profile Instantly"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {activeTab === 'config' && (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl">
            <ConfigIcon className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-mono text-sm">System Configuration Module Initializing...</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl">
            <History className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-mono text-sm">Security Audit Trail Streaming Offline</p>
          </div>
        )}

      </div>
    </div>
  );
}