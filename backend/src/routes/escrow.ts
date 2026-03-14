import { Router } from 'express';
import { createEscrowPlan, getEscrowPlan, releaseEscrow, emergencyReleaseEscrow } from '../services/escrowService';

const router = Router();

router.post('/create', (req, res) => {
  const { id, totalAmount, startAt, intervalMs, portions, recipients } = req.body;
  if (!id || !totalAmount || !startAt || !intervalMs || !portions || !recipients) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  const plan = createEscrowPlan({ id, totalAmount, startAt, intervalMs, portions, recipients });
  res.status(201).json(plan);
});

router.get('/plan/:id', (req, res) => {
  const plan = getEscrowPlan(req.params.id);
  if (!plan) return res.status(404).json({ error: 'not found' });
  res.json(plan);
});

router.post('/release/:id', (req, res) => {
  try {
    const result = releaseEscrow(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/emergency/:id', (req, res) => {
  try {
    const result = emergencyReleaseEscrow(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
