import { describe, it, expect } from 'vitest';
import { DuoTableStateMachine } from '../src/duo-table-machine.js';

describe('DuoTableStateMachine', () => {
  it('should initialize in LOBBY phase', () => {
    const sm = new DuoTableStateMachine('host_1');
    expect(sm.currentPhase).toBe('LOBBY');
  });

  it('should require two distinct guests to start', () => {
    const sm = new DuoTableStateMachine('host_1');
    expect(sm.canStart(undefined, 'g2')).toBe(false);
    expect(sm.canStart('g1', 'g1')).toBe(false);
    expect(sm.canStart('g1', 'g2')).toBe(true);
  });

  it('progresses smoothly through all 9 phases and unlocks private table if both agree', () => {
    const sm = new DuoTableStateMachine('host_1', 'matchmaker_1');
    const started = sm.start('g1', 'g2', 'matchmaker_1');
    expect(started).toBe(true);
    expect(sm.currentPhase).toBe('INTRODUCTION');

    expect(sm.setTeaAndIcebreaker('tea_long_tinh', 'q1')).toBe(true);
    expect(sm.currentPhase).toBe('TEA_ICEBREAKER');

    expect(sm.goToMenuTogether()).toBe(true);
    expect(sm.currentPhase).toBe('MENU_TOGETHER');

    sm.submitMenuChoice('g1', 'pastry_hoa_mai');
    sm.submitMenuChoice('g2', 'pastry_hoa_mai');
    expect(sm.areBothMenuSubmitted()).toBe(true);

    expect(sm.goToScenarioCard('sc1')).toBe(true);
    expect(sm.currentPhase).toBe('SCENARIO_CARD');
    sm.submitScenarioChoice('g1', 'optionA');
    sm.submitScenarioChoice('g2', 'optionA');

    expect(sm.goToPrivateDecision()).toBe(true);
    expect(sm.currentPhase).toBe('PRIVATE_DECISION');

    // Both vote yes
    sm.submitDecision('g1', true);
    sm.submitDecision('g2', true);
    expect(sm.areBothDecisionsSubmitted()).toBe(true);

    const res = sm.resolveResult();
    expect(res.isMutualMatch).toBe(true);
    expect(sm.currentPhase).toBe('RESULT');

    const next = sm.enterPrivateTableOrFinish();
    expect(next).toBe('PRIVATE_TABLE');
    expect(sm.currentPhase).toBe('PRIVATE_TABLE');
  });

  it('concludes gracefully without private table if either guest declines', () => {
    const sm = new DuoTableStateMachine('host_1');
    sm.start('g1', 'g2');
    sm.setTeaAndIcebreaker('tea_long_tinh', 'q1');
    sm.goToMenuTogether();
    sm.goToScenarioCard('sc1');
    sm.goToPrivateDecision();

    // g1 votes yes, g2 votes no
    sm.submitDecision('g1', true);
    sm.submitDecision('g2', false);

    const res = sm.resolveResult();
    expect(res.isMutualMatch).toBe(false);

    const next = sm.enterPrivateTableOrFinish();
    expect(next).toBe('FINISHED');
  });
});
