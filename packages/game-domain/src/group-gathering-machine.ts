import { GroupGatheringPhase, ActivePairing } from '@tra-duyen/contracts';

export interface GroupContext {
  hostUserId: string;
  matchmakerUserId?: string;
  guestUserIds: string[];
  currentRound: number;
  totalRounds: number;
  currentPairs: ActivePairing[];
  restingUserIds: string[];
  pastPairs: Set<string>; // 'userA:userB' sorted
  blockedPairs: Set<string>; // 'userA:userB' sorted
  privateSelections: Map<string, string | null>; // voterUserId -> targetUserId | null
  mutualMatches: [string, string][]; // Pairs that matched both ways
  phaseDeadline?: number;
}

export function makePairKey(u1: string, u2: string): string {
  return [u1, u2].sort().join(':');
}

export class GroupGatheringStateMachine {
  private phase: GroupGatheringPhase = 'LOBBY';
  private context: GroupContext;

  constructor(hostUserId: string, matchmakerUserId?: string) {
    this.context = {
      hostUserId,
      matchmakerUserId,
      guestUserIds: [],
      currentRound: 0,
      totalRounds: 3,
      currentPairs: [],
      restingUserIds: [],
      pastPairs: new Set(),
      blockedPairs: new Set(),
      privateSelections: new Map(),
      mutualMatches: []
    };
  }

  get currentPhase(): GroupGatheringPhase {
    return this.phase;
  }

  getContext(): Readonly<GroupContext> {
    return this.context;
  }

  setBlockedPairs(pairs: [string, string][]) {
    this.context.blockedPairs.clear();
    for (const [u1, u2] of pairs) {
      this.context.blockedPairs.add(makePairKey(u1, u2));
    }
  }

  canStart(guestIds: string[]): boolean {
    if (this.phase !== 'LOBBY') return false;
    if (guestIds.length < 4 || guestIds.length > 6) return false;
    return true;
  }

  start(guestIds: string[], now = Date.now()): boolean {
    if (!this.canStart(guestIds)) return false;
    this.context.guestUserIds = [...guestIds];
    this.context.currentRound = 0;
    this.context.pastPairs.clear();
    this.context.privateSelections.clear();
    this.context.mutualMatches = [];

    this.phase = 'GROUP_INTRODUCTION';
    this.context.phaseDeadline = now + 90 * 1000;
    return true;
  }

  goToGroupIcebreaker(now = Date.now()): boolean {
    if (this.phase !== 'GROUP_INTRODUCTION') return false;
    this.phase = 'GROUP_ICEBREAKER';
    this.context.phaseDeadline = now + 120 * 1000;
    return true;
  }

  /**
   * Computes pairing for a given round using round-robin with block & repeat avoidance
   */
  computePairings(guests: string[], roundIndex: number): { pairs: [string, string][]; resting: string[] } {
    const n = guests.length;
    if (n < 2) return { pairs: [], resting: [...guests] };

    const pool = [...guests];
    let resting: string[] = [];

    // If odd number, roundIndex dictates who rests in rotation
    if (n % 2 !== 0) {
      const restIdx = roundIndex % n;
      const restingGuest = pool.splice(restIdx, 1)[0];
      resting.push(restingGuest);
    }

    const m = pool.length; // m is even
    const pairs: [string, string][] = [];
    const paired = new Set<string>();

    // Try round-robin standard rotation
    // Keep pool[0] fixed, rotate the rest
    const fixed = pool[0];
    const rotating = pool.slice(1);
    const rotCount = rotating.length;

    // Shift array by roundIndex
    const shifted: string[] = [];
    for (let i = 0; i < rotCount; i++) {
      shifted.push(rotating[(i + roundIndex) % rotCount]);
    }

    const roundList = [fixed, ...shifted];
    const half = roundList.length / 2;

    for (let i = 0; i < half; i++) {
      const u1 = roundList[i];
      const u2 = roundList[roundList.length - 1 - i];
      const key = makePairKey(u1, u2);

      // If blocked, try swap with another available pair
      if (this.context.blockedPairs.has(key)) {
        // Swap fallback
        continue;
      }
      pairs.push([u1, u2]);
      paired.add(u1);
      paired.add(u2);
    }

    // Any remaining unpaired due to block conflicts
    const remaining = pool.filter(u => !paired.has(u));
    while (remaining.length >= 2) {
      const a = remaining.pop()!;
      const b = remaining.pop()!;
      pairs.push([a, b]);
    }
    if (remaining.length === 1) {
      resting.push(remaining[0]);
    }

    return { pairs, resting };
  }

  nextRotation(topicList: { title: string; prompt: string }[], now = Date.now()): boolean {
    if (this.phase !== 'GROUP_ICEBREAKER' && this.phase !== 'PAIR_ROTATIONS') return false;

    if (this.context.currentRound >= this.context.totalRounds) {
      return this.goToPrivateSelection(now);
    }

    this.phase = 'PAIR_ROTATIONS';
    this.context.currentRound += 1;

    const { pairs, resting } = this.computePairings(this.context.guestUserIds, this.context.currentRound - 1);
    this.context.restingUserIds = resting;

    this.context.currentPairs = pairs.map(([u1, u2], idx) => {
      const key = makePairKey(u1, u2);
      this.context.pastPairs.add(key);
      const topic = topicList[idx % topicList.length] || {
        title: 'Tương Tri Đồng Điệu',
        prompt: 'Chia sẻ về điều khiến bạn thấy trân quý nhất trong tình bạn.'
      };

      return {
        pairId: `pair_r${this.context.currentRound}_${idx}`,
        user1Id: u1,
        user2Id: u2,
        tableSeat1: `PAIR_SEAT_${idx}_A`,
        tableSeat2: `PAIR_SEAT_${idx}_B`,
        topicTitle: topic.title,
        topicPrompt: topic.prompt
      };
    });

    this.context.phaseDeadline = now + 90 * 1000;
    return true;
  }

  goToPrivateSelection(now = Date.now()): boolean {
    this.phase = 'PRIVATE_SELECTION';
    this.context.currentPairs = [];
    this.context.restingUserIds = [];
    this.context.phaseDeadline = now + 60 * 1000;
    return true;
  }

  submitSelection(voterId: string, chosenUserId: string | null): boolean {
    if (this.phase !== 'PRIVATE_SELECTION') return false;
    if (!this.context.guestUserIds.includes(voterId)) return false;

    // Must be either null or someone the voter actually chatted with
    if (chosenUserId !== null) {
      if (chosenUserId === voterId) return false;
      const key = makePairKey(voterId, chosenUserId);
      if (!this.context.pastPairs.has(key)) return false;
      if (this.context.blockedPairs.has(key)) return false;
    }

    this.context.privateSelections.set(voterId, chosenUserId);
    return true;
  }

  allSelectionsSubmitted(): boolean {
    return this.context.guestUserIds.every(id => this.context.privateSelections.has(id));
  }

  resolveResult(): [string, string][] {
    if (this.phase !== 'PRIVATE_SELECTION') {
      throw new Error('Cannot resolve result outside PRIVATE_SELECTION');
    }

    const matches: [string, string][] = [];
    const guests = this.context.guestUserIds;

    for (let i = 0; i < guests.length; i++) {
      const a = guests[i];
      const targetA = this.context.privateSelections.get(a);
      if (!targetA) continue;

      const targetB = this.context.privateSelections.get(targetA);
      if (targetB === a) {
        // Mutual match! Ensure pair only added once
        if (a < targetA) {
          matches.push([a, targetA]);
        }
      }
    }

    this.context.mutualMatches = matches;
    this.phase = 'RESULT';
    return matches;
  }

  enterPrivateTablesOrFinish(): GroupGatheringPhase {
    if (this.phase !== 'RESULT') return this.phase;
    if (this.context.mutualMatches.length > 0) {
      this.phase = 'PRIVATE_TABLES';
    } else {
      this.phase = 'FINISHED';
    }
    return this.phase;
  }

  finish(): GroupGatheringPhase {
    this.phase = 'FINISHED';
    return this.phase;
  }
}
