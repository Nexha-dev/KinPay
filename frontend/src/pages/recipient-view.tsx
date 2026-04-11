import { useState } from 'react';
import Layout from '../components/Layout';
import { getPlan } from '../lib/api';

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

export default function RecipientView() {
  const [planId, setPlanId] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setNotFound(false);
    const result = await getPlan(planId.trim());
    if (!result) setNotFound(true);
    else setPlan(result);
  }

  const pct = plan ? Math.round((plan.releasedAmount / plan.totalAmount) * 100) : 0;
  const remaining = plan ? plan.totalAmount - plan.releasedAmount : 0;
  const intervalLabel = plan
    ? plan.intervalMs === 604800000 ? 'Weekly' : plan.intervalMs === 2592000000 ? 'Monthly' : 'Custom'
    : '';

  function nextRelease(plan: Plan) {
    const elapsed = Date.now() - plan.startAt;
    const steps = Math.floor(elapsed / plan.intervalMs);
    const nextAt = plan.startAt + (steps + 1) * plan.intervalMs;
    return new Date(nextAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Recipient View</h1>
          <p className="text-slate-400 text-sm mt-1">Look up your escrow plan by ID</p>
        </div>

        <form onSubmit={lookup} className="flex gap-3 mb-8">
          <input
            value={planId}
            onChange={e => setPlanId(e.target.value)}
            placeholder="Enter plan ID (e.g. plan_1234567890)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button type="submit"
            className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap">
            Look up
          </button>
        </form>

        {notFound && (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-white font-medium">Plan not found</p>
            <p className="text-slate-500 text-sm mt-1">Check the ID and try again</p>
          </div>
        )}

        {plan && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Plan ID</p>
                  <p className="text-white font-mono text-sm">{plan.id}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${plan.emergencyUnlocked ? 'bg-red-500/20 text-red-400' : pct >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-violet-500/20 text-violet-400'}`}>
                  {plan.emergencyUnlocked ? 'Emergency Released' : pct >= 100 ? 'Complete' : 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: 'Total', value: `$${plan.totalAmount.toFixed(2)}` },
                  { label: 'Released', value: `$${plan.releasedAmount.toFixed(2)}` },
                  { label: 'Remaining', value: `$${remaining.toFixed(2)}` },
                  { label: 'Schedule', value: `${intervalLabel} × ${plan.portions}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="text-white font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-medium">{pct}%</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            {pct < 100 && !plan.emergencyUnlocked && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 text-lg">📅</div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Next release</p>
                  <p className="text-white font-medium">{nextRelease(plan)}</p>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Recipients</p>
              {plan.recipients.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white font-medium">{r.recipient}</span>
                  <span className="text-slate-400 text-sm">{Math.round((r.share / plan.recipients.reduce((a, x) => a + x.share, 0)) * 100)}% share</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
