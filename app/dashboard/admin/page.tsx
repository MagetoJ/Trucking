'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { ShieldCheck, Layers, Landmark, TrendingUp, AlertCircle, RefreshCw, PhoneCall } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const fetchOversightData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin-dashboard/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && !data.error) setSystemState(data);
    } catch (err) {
      console.error('Systemic refresh error:', err);
    } finally {
      setLoading(false);
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 text-sm font-semibold text-slate-200 transition"
          >
            <RefreshCw className="h-4 w-4" /> Recalculate State Ledger
          </button>
        </div>

        {/* Component Analytical Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Booked Volume</p>
              <h3 className="text-2xl font-black text-white mt-2">${systemState?.financials.totalRevenue.toLocaleString() || '0.00'}</h3>
              <p className="text-[10px] text-emerald-400 font-mono mt-1"> Fulfilled Transits</p>
            </div>
            <Landmark className="h-10 w-10 text-indigo-500/20" />
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned Loads</p>
              <h3 className="text-2xl font-black text-amber-500 mt-2">{systemState?.workloads.activeLoads || 0}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Pending Driver Capture</p>
            </div>
            <Layers className="h-10 w-10 text-amber-500/20" />
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Transits</p>
              <h3 className="text-2xl font-black text-indigo-400 mt-2">{systemState?.workloads.inTransitLoads || 0}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">En-route Tracking Logs</p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-400/20" />
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged Registrations</p>
              <h3 className="text-2xl font-black text-red-400 mt-2">{systemState?.metrics.unverifiedUsers || 0}</h3>
              <p className="text-[10px] text-red-400/70 font-mono mt-1">Suspended / Pending Vetting</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500/20" />
          </div>

        </div>

        {/* Global Operational Live Flow Log Ledger */}
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
                  {systemState?.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/30 transition">
                      <td className="py-4 pl-2 font-medium text-white">
                        <div className="flex flex-col">
                          <span>{b.origin}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">➔ {b.destination}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{b.shipper.name}</span>
                          <PhoneCall className="h-3 w-3 text-slate-600" title={b.shipper.phone} />
                        </div>
                      </td>
                      <td className="py-4 font-mono text-slate-400">
                        {b.driver ? (
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <span>{b.driver.name}</span>
                            <PhoneCall className="h-3 w-3 text-slate-600" title={b.driver.phone} />
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
                    <span className="text-white font-bold">{systemState?.metrics.shippersCount || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" 
                      style={{ width: `${((systemState?.metrics.shippersCount || 0) / ((systemState?.metrics.shippersCount || 1) + (systemState?.metrics.driversCount || 0))) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Vetted Haulers/Drivers</span>
                    <span className="text-white font-bold">{systemState?.metrics.driversCount || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" 
                      style={{ width: `${((systemState?.metrics.driversCount || 0) / ((systemState?.metrics.shippersCount || 0) + (systemState?.metrics.driversCount || 1))) * 100}%` }}
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

      </div>
    </div>
  );
}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Super Admin Hub</h2>
        <p className="text-muted-foreground">Admin Access: admin@truckhub.com</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase">Total Platform Shippers</p>
            <p className="text-3xl font-extrabold mt-2">{users.filter(u => u.role.toLowerCase() === 'shipper').length}</p>
          </div>
          <Users className="w-10 h-10 text-blue-500/20" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase">Total Registered Drivers</p>
            <p className="text-3xl font-extrabold mt-2">{users.filter(u => u.role.toLowerCase() === 'driver').length}</p>
          </div>
          <Truck className="w-10 h-10 text-orange-500/20" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase">Total User Accounts</p>
            <p className="text-3xl font-extrabold mt-2">{users.length}</p>
          </div>
          <ShieldAlert className="w-10 h-10 text-emerald-500/20" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-xs uppercase border-b border-border font-semibold">
              <th className="p-4">Full Name</th>
              <th className="p-4">Contact Particulars</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition">
                <td className="p-4 font-semibold text-foreground">{user.name}</td>
                <td className="p-4">
                  <div className="flex flex-col text-xs">
                    <span>{user.email}</span>
                    <span className="text-muted-foreground mt-0.5">{user.phone}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                    user.role.toLowerCase() === 'driver' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-semibold ${user.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {user.verified ? '✓ Vetted & Active' : '⚠ Pending Review'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => toggleVerification(user.id, user.verified)}
                      className="p-1.5 border border-border hover:bg-muted rounded-lg transition"
                      title="Toggle Vetting Status"
                    >
                      <Check className="w-4 h-4 text-foreground" />
                    </button>
                    <button 
                      onClick={() => deleteAccount(user.id)}
                      className="p-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition"
                      title="Permanently Delete Account"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}