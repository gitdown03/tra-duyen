import { describe, it, expect } from 'vitest';
import { SeatingManager } from '../src/seating-manager.js';
import { calculateReward, DAILY_LEAF_CAP, BASE_COMPLETION_LEAVES } from '../src/leaf-rewards.js';

describe('SeatingManager', () => {
  it('manages atomic seating without double occupation', () => {
    const sm = new SeatingManager('DUO_TABLE');

    // Guest claims seat
    const r1 = sm.claimSeat('u1', 'SEAT_GUEST_1', 'GUEST');
    expect(r1.success).toBe(true);

    // Another user tries claiming same seat
    const r2 = sm.claimSeat('u2', 'SEAT_GUEST_1', 'GUEST');
    expect(r2.success).toBe(false);
    expect(r2.error).toContain('Ghế đã có người ngồi');

    // Role mismatch check
    const r3 = sm.claimSeat('u3', 'SEAT_HOST', 'GUEST');
    expect(r3.success).toBe(false);
    expect(r3.error).toContain('Vai trò của bạn không phù hợp');

    // Releasing seat
    sm.releaseSeat('u1');
    const r4 = sm.claimSeat('u2', 'SEAT_GUEST_1', 'GUEST');
    expect(r4.success).toBe(true);
  });
});

describe('LeafRewardsCalculator', () => {
  it('rewards full session completion and respects daily cap', () => {
    const reward1 = calculateReward(
      {
        userId: 'u1',
        isHostOrMatchmaker: false,
        completedFullSession: true,
        leftEarlyDueToBlockOrReport: false
      },
      0
    );
    expect(reward1).toBe(BASE_COMPLETION_LEAVES);

    // Near cap
    const reward2 = calculateReward(
      {
        userId: 'u1',
        isHostOrMatchmaker: false,
        completedFullSession: true,
        leftEarlyDueToBlockOrReport: false
      },
      480
    );
    expect(reward2).toBe(20); // capped at 500

    // Already at cap
    const reward3 = calculateReward(
      {
        userId: 'u1',
        isHostOrMatchmaker: false,
        completedFullSession: true,
        leftEarlyDueToBlockOrReport: false
      },
      500
    );
    expect(reward3).toBe(0);
  });

  it('does not penalize players leaving early due to safety/report', () => {
    const reward = calculateReward(
      {
        userId: 'u1',
        isHostOrMatchmaker: false,
        completedFullSession: false,
        leftEarlyDueToBlockOrReport: true
      },
      100
    );
    expect(reward).toBe(BASE_COMPLETION_LEAVES);
  });
});
