import { EscrowContract, ReleasePlan } from '../../../contracts/escrow_contract';

const escrow = new EscrowContract();

export function createEscrowPlan(plan: Omit<ReleasePlan, 'releasedAmount' | 'emergencyUnlocked'>) {
  return escrow.createPlan(plan);
}

export function getEscrowPlan(id: string) {
  return escrow.getPlan(id);
}

export function releaseEscrow(id: string) {
  return escrow.releaseDue(id);
}

export function emergencyReleaseEscrow(id: string) {
  return escrow.emergencyRelease(id);
}
