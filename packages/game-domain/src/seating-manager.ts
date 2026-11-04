import { RoomRole, RoomMode } from '@tra-duyen/contracts';

export interface SeatDefinition {
  seatId: string;
  allowedRoles: RoomRole[];
  position: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
}

export const DUO_SEATS: SeatDefinition[] = [
  {
    seatId: 'SEAT_HOST',
    allowedRoles: ['HOST'],
    position: { x: 0, y: 0.45, z: -3.5 },
    lookAt: { x: 0, y: 0.45, z: 0 }
  },
  {
    seatId: 'SEAT_MATCHMAKER',
    allowedRoles: ['MATCHMAKER'],
    position: { x: 2.2, y: 0.45, z: -1.5 },
    lookAt: { x: 0, y: 0.45, z: 0 }
  },
  {
    seatId: 'SEAT_GUEST_1',
    allowedRoles: ['GUEST'],
    position: { x: -1.4, y: 0.45, z: 0 },
    lookAt: { x: 1.4, y: 0.45, z: 0 }
  },
  {
    seatId: 'SEAT_GUEST_2',
    allowedRoles: ['GUEST'],
    position: { x: 1.4, y: 0.45, z: 0 },
    lookAt: { x: -1.4, y: 0.45, z: 0 }
  }
];

export const GROUP_SEATS: SeatDefinition[] = [
  {
    seatId: 'SEAT_HOST',
    allowedRoles: ['HOST'],
    position: { x: 0, y: 0.45, z: -4 },
    lookAt: { x: 0, y: 0.45, z: 0 }
  },
  {
    seatId: 'SEAT_MATCHMAKER',
    allowedRoles: ['MATCHMAKER'],
    position: { x: 3, y: 0.45, z: -2 },
    lookAt: { x: 0, y: 0.45, z: 0 }
  },
  {
    seatId: 'SEAT_GUEST_1',
    allowedRoles: ['GUEST'],
    position: { x: -2.2, y: 0.45, z: -1.2 },
    lookAt: { x: 2.2, y: 0.45, z: 1.2 }
  },
  {
    seatId: 'SEAT_GUEST_2',
    allowedRoles: ['GUEST'],
    position: { x: -2.2, y: 0.45, z: 1.2 },
    lookAt: { x: 2.2, y: 0.45, z: -1.2 }
  },
  {
    seatId: 'SEAT_GUEST_3',
    allowedRoles: ['GUEST'],
    position: { x: 2.2, y: 0.45, z: -1.2 },
    lookAt: { x: -2.2, y: 0.45, z: 1.2 }
  },
  {
    seatId: 'SEAT_GUEST_4',
    allowedRoles: ['GUEST'],
    position: { x: 2.2, y: 0.45, z: 1.2 },
    lookAt: { x: -2.2, y: 0.45, z: -1.2 }
  },
  {
    seatId: 'SEAT_GUEST_5',
    allowedRoles: ['GUEST'],
    position: { x: -1.2, y: 0.45, z: 2.5 },
    lookAt: { x: 0, y: 0.45, z: -1.5 }
  },
  {
    seatId: 'SEAT_GUEST_6',
    allowedRoles: ['GUEST'],
    position: { x: 1.2, y: 0.45, z: 2.5 },
    lookAt: { x: 0, y: 0.45, z: -1.5 }
  }
];

export class SeatingManager {
  private occupiedSeats = new Map<string, string>(); // seatId -> userId
  private userSeats = new Map<string, string>(); // userId -> seatId
  private seatDefinitions: Map<string, SeatDefinition>;

  constructor(mode: RoomMode) {
    const list = mode === 'DUO_TABLE' ? DUO_SEATS : GROUP_SEATS;
    this.seatDefinitions = new Map(list.map(s => [s.seatId, s]));
  }

  getSeat(seatId: string): SeatDefinition | undefined {
    return this.seatDefinitions.get(seatId);
  }

  getUserSeat(userId: string): string | undefined {
    return this.userSeats.get(userId);
  }

  getOccupant(seatId: string): string | undefined {
    return this.occupiedSeats.get(seatId);
  }

  claimSeat(userId: string, seatId: string, userRole: RoomRole): { success: boolean; error?: string } {
    const def = this.seatDefinitions.get(seatId);
    if (!def) {
      return { success: false, error: 'Ghế không tồn tại' };
    }

    if (!def.allowedRoles.includes(userRole)) {
      return { success: false, error: 'Vai trò của bạn không phù hợp với ghế này' };
    }

    const currentOccupant = this.occupiedSeats.get(seatId);
    if (currentOccupant && currentOccupant !== userId) {
      return { success: false, error: 'Ghế đã có người ngồi' };
    }

    // Release any prior seat held by this user
    const priorSeat = this.userSeats.get(userId);
    if (priorSeat && priorSeat !== seatId) {
      this.occupiedSeats.delete(priorSeat);
    }

    this.occupiedSeats.set(seatId, userId);
    this.userSeats.set(userId, seatId);
    return { success: true };
  }

  releaseSeat(userId: string): string | undefined {
    const seatId = this.userSeats.get(userId);
    if (seatId) {
      this.userSeats.delete(userId);
      this.occupiedSeats.delete(seatId);
    }
    return seatId;
  }

  getAllOccupied(): Map<string, string> {
    return new Map(this.occupiedSeats);
  }
}
