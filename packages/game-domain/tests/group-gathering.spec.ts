import { describe, it, expect } from 'vitest';
import { GroupGatheringStateMachine } from '../src/group-gathering-machine.js';

describe('GroupGatheringStateMachine', () => {
  it('requires between 4 and 6 guests to start', () => {
    const sm = new GroupGatheringStateMachine('host_1');
    expect(sm.canStart(['u1', 'u2', 'u3'])).toBe(false);
    expect(sm.canStart(['u1', 'u2', 'u3', 'u4'])).toBe(true);
    expect(sm.canStart(['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'])).toBe(false);
  });

  it('handles even guests (4) with 3 non-repeating rounds', () => {
    const sm = new GroupGatheringStateMachine('host_1');
    const guests = ['u1', 'u2', 'u3', 'u4'];
    sm.start(guests);
    sm.goToGroupIcebreaker();

    const topics = [
      { title: 'T1', prompt: 'P1' },
      { title: 'T2', prompt: 'P2' }
    ];

    // Round 1
    expect(sm.nextRotation(topics)).toBe(true);
    expect(sm.getContext().currentPairs.length).toBe(2);
    expect(sm.getContext().restingUserIds.length).toBe(0);

    // Round 2
    expect(sm.nextRotation(topics)).toBe(true);
    expect(sm.getContext().currentPairs.length).toBe(2);

    // Round 3
    expect(sm.nextRotation(topics)).toBe(true);
    expect(sm.getContext().currentPairs.length).toBe(2);

    // Round 4 moves automatically to PRIVATE_SELECTION
    expect(sm.nextRotation(topics)).toBe(true);
    expect(sm.currentPhase).toBe('PRIVATE_SELECTION');
  });

  it('handles odd guests (5) with fair rotating rests', () => {
    const sm = new GroupGatheringStateMachine('host_1');
    const guests = ['u1', 'u2', 'u3', 'u4', 'u5'];
    sm.start(guests);
    sm.goToGroupIcebreaker();

    const topics = [{ title: 'T1', prompt: 'P1' }];

    // Round 1
    sm.nextRotation(topics);
    expect(sm.getContext().currentPairs.length).toBe(2);
    expect(sm.getContext().restingUserIds.length).toBe(1);
    const resting1 = sm.getContext().restingUserIds[0];

    // Round 2
    sm.nextRotation(topics);
    expect(sm.getContext().restingUserIds.length).toBe(1);
    const resting2 = sm.getContext().restingUserIds[0];
    // Different person resting
    expect(resting2).not.toBe(resting1);
  });

  it('strictly excludes blocked pairs from being matched', () => {
    const sm = new GroupGatheringStateMachine('host_1');
    const guests = ['u1', 'u2', 'u3', 'u4'];
    sm.setBlockedPairs([['u1', 'u2']]);
    sm.start(guests);
    sm.goToGroupIcebreaker();

    const pairings = sm.computePairings(guests, 0);
    for (const [a, b] of pairings.pairs) {
      const isBlocked = (a === 'u1' && b === 'u2') || (a === 'u2' && b === 'u1');
      expect(isBlocked).toBe(false);
    }
  });

  it('unlocks private tables only for mutual matches', () => {
    const sm = new GroupGatheringStateMachine('host_1');
    const guests = ['u1', 'u2', 'u3', 'u4'];
    sm.start(guests);
    sm.goToGroupIcebreaker();

    // Force some past pairs so selection is valid
    sm.getContext().pastPairs.add('u1:u2');
    sm.getContext().pastPairs.add('u3:u4');

    sm.goToPrivateSelection();

    // u1 and u2 pick each other
    sm.submitSelection('u1', 'u2');
    sm.submitSelection('u2', 'u1');

    // u3 picks u4, but u4 picks null
    sm.submitSelection('u3', 'u4');
    sm.submitSelection('u4', null);

    const matches = sm.resolveResult();
    expect(matches.length).toBe(1);
    expect(matches[0]).toEqual(['u1', 'u2']);

    const phase = sm.enterPrivateTablesOrFinish();
    expect(phase).toBe('PRIVATE_TABLES');
  });
});
