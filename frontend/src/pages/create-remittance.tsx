import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { createPlan } from '../lib/api';

const INTERVALS: Record<string, { label: string; ms: number }> = {
  weekly: { label: 'Weekly', ms: 604800000 },
  monthly: { label: 'Monthly', ms: 2592000000 },
};

export default function CreateRemittance() {
  const router = useRouter();
  const [form, setForm] = useState({
    recipient: '',
    totalAmount: '',
    portions: '4',
    interval: 'weekly',
    startNow: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.recipient || !form.totalAmount) return setError('All fields are required.');

    setLoading(true);
    const id = `plan_${Date.now()}`;
    const result = await createPlan({
      id,
      totalAmount: parseFloat(form.totalAmount),
      startAt: form.startNow ? Date.now() : Date.now() + 86400000,
      intervalMs: INTERVALS[form.interval].ms,
      portions: parseInt(form.portions),
      recipients: [{ recipient: form.recipient, share: 1 }],
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const stored = JSON.parse(localStorage.getItem('kinpay_plans') || '[]');
    localStorage.setItem('kinpay_plans', JSON.stringify([...stored, id]));
    router.push('/');
  }

  const perInstallment = form.totalAmount && form.portions
    ? (parseFloat(form.totalAmount) / parseInt(form.portions)).toFixed(2)
    : '—';

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">New Remittance</h1>
          <p className="text-slate-400 text-sm mt-1">Set up a scheduled escrow for your family</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Recipient name / wallet</label>
              <input
                value={form.recipient}
                onChange={e => set('recipient', e.target.value)}
                placeholder="e.g. Mom, or G3XYZ..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Total amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input
                  type="number" min="1" step="0.01"
                  value={form.totalAmount}
                  onChange={e => set('totalAmount', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Release schedule</label>
                <select
                  value={form.interval}
                  onChange={e => set('interval', e.target.value)}
                  className="w-full bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                  {Object.entries(INTERVALS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Installments</label>
                <select
                  value={form.portions}
                  onChange={e => set('portions', e.target.value)}
                  className="w-full bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                  {[2, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <input type="checkbox" id="startNow" checked={form.startNow} onChange={e => set('startNow', e.target.checked)}
                className="w-4 h-4 accent-violet-500" />
              <label htmlFor="startNow" className="text-sm text-slate-300">Start releasing immediately</label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-1">Per installment</p>
              <p className="text-2xl font-bold text-white">${perInstallment}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-1">Schedule</p>
              <p className="text-sm text-white font-medium">{INTERVALS[form.interval].label} × {form.portions}</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
            {loading ? 'Creating...' : 'Create Escrow'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
