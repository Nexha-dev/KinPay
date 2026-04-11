import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getPlan, releasePlan, emergencyRelease } from '../lib/api';

type Plan = {
  id: string;
  totalAmount: number;
  releasedAmount: number;
  portions: number;
  intervalMs: number;
  startAt: number;
  emergencyUnlocked: boolean;
  recipients: { recipient: string; share: number }[];
};

function PlanCard({ planId, onUpdate }: { planId: string; onUpdate: () => void }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPlan(planId).then(setPlan);
  }, [planId]);

  if (!plan) return null;

  const pct = Math.round((plan.releasedAmount / plan.totalAmount) * 100);
  const intervalLabel = plan.intervalMs === 604800000 ? 'Weekly' : plan.intervalMs === 2592000000 ? 'Monthly' : 'Custom';

  async function doRelease() {
    setLoading(true);
    const r = await releasePlan(plan!.id);
    setMsg(r.amount > 0 ? `Released $${r.amount.toFixed(2)}` : 'Nothing due yet');
    getPlan(plan!.id).then(setPlan);
    setLoading(false);
  }

  async function doEmergency() {
    if (!confirm('Emergency release all remaining funds?')) return;
    setLoading(true);
    const r = await emergencyRelease(plan!.id);
    setMsg(`Emergency released $${r.amount.toFixed(2)}`);
    getPlan(plan!.id).then(setPlan);
    setLoading(false);
    onUpdate();
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{intervalLabel} · {plan.portions} installments</p>
          <h3 className="text-white font-semibold text-lg">Plan #{plan.id}</h3>
          <p className="text-slate-400 text-sm mt-0.5">
            To: {plan.recipients.map(r => r.recipient).join(', ')}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${plan.emergencyUnlocked ? 'bg-red-500/20 text-red-400' : pct >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-violet-500/20 text-violet-400'}`}>
          {plan.emergencyUnlocked ? 'Emergency' : pct >= 100 ? 'Complete' : 'Active'}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Released</span>
          <span className="text-white font-medium">${plan.releasedAmount.toFixed(2)} <span className="text-slate-500">/ ${plan.totalAmount.toFixed(2)}</span></span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-xs text-slate-500 mt-1">{pct}%</p>
      </div>

      {msg && <p className="text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">{msg}</p>}

      <div className="flex gap-2 pt-1">
        <button onClick={doRelease} disabled={loading || pct >= 100}
          className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
          Trigger Release
        </button>
        <button onClick={doEmergency} disabled={loading || plan.emergencyUnlocked || pct >= 100}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 text-sm font-medium transition-colors border border-white/10">
          Emergency
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [planIds, setPlanIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('kinpay_plans');
    if (stored) setPlanIds(JSON.parse(stored));
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your active remittance escrows</p>
        </div>
        <Link href="/create-remittance"
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
          + New Remittance
        </Link>
      </div>

      {planIds.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
          <p className="text-4xl mb-4">💸</p>
          <p className="text-white font-medium mb-1">No remittances yet</p>
          <p className="text-slate-500 text-sm mb-6">Create your first escrow to get started</p>
          <Link href="/create-remittance"
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
            Send Money
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {planIds.map(id => (
            <PlanCard key={id} planId={id} onUpdate={() => setPlanIds(ids => [...ids])} />
          ))}
        </div>
      )}
    </Layout>
  );
}
