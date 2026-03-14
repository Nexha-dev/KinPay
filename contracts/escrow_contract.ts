export type ReleasePlan = {
  id: string;
  totalAmount: number;
  releasedAmount: number;
  startAt: number; // epoch ms
  intervalMs: number;
  portions: number;
  emergencyUnlocked: boolean;
  recipients: { recipient: string; share: number }[];
};

export class EscrowContract {
  private plans: Record<string, ReleasePlan> = {};

  createPlan(plan: Omit<ReleasePlan, 'releasedAmount' | 'emergencyUnlocked'>) {
    this.plans[plan.id] = {
      ...plan,
      releasedAmount: 0,
      emergencyUnlocked: false,
    };
    return this.plans[plan.id];
  }

  getPlan(id: string) {
    return this.plans[id];
  }

  releaseDue(id: string, now = Date.now()) {
    const plan = this.plans[id];
    if (!plan) throw new Error('Plan not found');

    if (plan.emergencyUnlocked) {
      const remaining = plan.totalAmount - plan.releasedAmount;
      plan.releasedAmount = plan.totalAmount;
      return { amount: remaining, status: 'emergency' };
    }

    const elapsed = Math.max(0, now - plan.startAt);
    const steps = Math.floor(elapsed / plan.intervalMs);
    const perPart = plan.totalAmount / plan.portions;
    const totalDue = Math.min(plan.totalAmount, Math.floor(perPart * steps));
    const toRelease = Math.max(0, totalDue - plan.releasedAmount);

    plan.releasedAmount += toRelease;
    return { amount: toRelease, status: 'scheduled', releasedAmount: plan.releasedAmount };
  }

  emergencyRelease(id: string) {
    const plan = this.plans[id];
    if (!plan) throw new Error('Plan not found');
    plan.emergencyUnlocked = true;
    return this.releaseDue(id);
  }
}
