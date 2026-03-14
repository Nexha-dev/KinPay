# Global Remittance Escrow for Families

A starter implementation for a Stellar-based programmable remittance escrow. It supports:

- time-locked remittances
- multi-recipient distribution schedule (mocked)
- emergency unlock
- basic endpoint scaffolding

## Core flow

1. sender deposits USD Coin into an escrow contract
2. schedule is created (weekly/monthly/milestone)
3. release is triggered periodically by scheduler
4. recipient withdraws

## Project structure

- `contracts`: escrow model and tests
- `backend`: API server with escrow service
- `frontend`: user dashboard
- `scripts`: deploy + seeding
- `tests`: integration and unit
