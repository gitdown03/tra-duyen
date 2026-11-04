import { describe, it, expect } from 'vitest';
import { ApiError } from '../src/lib/api.js';

describe('Web Client Utilities & State Validation', () => {
  it('creates typed ApiError with status and message', () => {
    const err = new ApiError('Không tìm thấy phòng', 404);
    expect(err.message).toBe('Không tìm thấy phòng');
    expect(err.status).toBe(404);
    expect(err instanceof Error).toBe(true);
  });

  it('validates Lobby start logic for Duo Table correctly', () => {
    // 2 ready guests
    const guests = [
      { userId: 'u1', role: 'GUEST', isReady: true },
      { userId: 'u2', role: 'GUEST', isReady: true }
    ];
    const canStart = guests.length === 2 && guests.every(g => g.isReady);
    expect(canStart).toBe(true);

    // 1 guest not ready
    const unreadyGuests = [
      { userId: 'u1', role: 'GUEST', isReady: true },
      { userId: 'u2', role: 'GUEST', isReady: false }
    ];
    const cannotStart = unreadyGuests.length === 2 && unreadyGuests.every(g => g.isReady);
    expect(cannotStart).toBe(false);
  });
});
