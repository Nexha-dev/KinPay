import { EscrowContract } from '../../contracts/escrow_contract';

test('escrow plan creation and release', () => {
  const escrow = new EscrowContract();
  const plan = escrow.createPlan({ id: '1', totalAmount: 100, startAt: Date.now() - 1000*60*60*24*7, intervalMs: 1000*60*60*24, portions: 4, recipients: [{ recipient: 'mom', share: 1 }] });
  expect(plan.releasedAmount).toBe(0);
  const release = escrow.releaseDue('1');
  expect(release.amount).toBeGreaterThan(0);
});
