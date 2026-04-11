const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function createPlan(data: {
  id: string;
  totalAmount: number;
  startAt: number;
  intervalMs: number;
  portions: number;
  recipients: { recipient: string; share: number }[];
}) {
  const res = await fetch(`${API}/escrow/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getPlan(id: string) {
  const res = await fetch(`${API}/escrow/plan/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function releasePlan(id: string) {
  const res = await fetch(`${API}/escrow/release/${id}`, { method: 'POST' });
  return res.json();
}

export async function emergencyRelease(id: string) {
  const res = await fetch(`${API}/escrow/emergency/${id}`, { method: 'POST' });
  return res.json();
}
