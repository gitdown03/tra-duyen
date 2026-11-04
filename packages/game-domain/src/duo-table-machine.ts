import { DuoTablePhase } from '@tra-duyen/contracts';

export interface DuoTableContext {
  hostUserId: string;
  matchmakerUserId?: string;
  guest1UserId?: string;
  guest2UserId?: string;
  selectedTeaId?: string;
  currentQuestionId?: string;
  guest1MenuChoice?: string;
  guest2MenuChoice?: string;
  selectedScenarioId?: string;
  guest1ScenarioChoice?: string;
  guest2ScenarioChoice?: string;
  guest1Decision?: boolean; // private vote: want to meet again
  guest2Decision?: boolean; // private vote: want to meet again
  isMutualMatch?: boolean;
  phaseDeadline?: number; // epoch ms
}

export class DuoTableStateMachine {
  private phase: DuoTablePhase = 'LOBBY';
  private context: DuoTableContext;

  constructor(hostUserId: string, matchmakerUserId?: string) {
    this.context = {
      hostUserId,
      matchmakerUserId
    };
  }

  get currentPhase(): DuoTablePhase {
    return this.phase;
  }

  getContext(): Readonly<DuoTableContext> {
    return this.context;
  }

  canStart(guest1Id: string | undefined, guest2Id: string | undefined): boolean {
    if (this.phase !== 'LOBBY') return false;
    if (!guest1Id || !guest2Id) return false;
    if (guest1Id === guest2Id) return false;
    return true;
  }

  start(guest1Id: string, guest2Id: string, matchmakerId?: string, now = Date.now()): boolean {
    if (!this.canStart(guest1Id, guest2Id)) return false;
    this.context.guest1UserId = guest1Id;
    this.context.guest2UserId = guest2Id;
    if (matchmakerId) this.context.matchmakerUserId = matchmakerId;

    this.phase = 'INTRODUCTION';
    this.context.phaseDeadline = now + 60 * 1000; // 60s introduction
    return true;
  }

  setTeaAndIcebreaker(teaId: string, questionId: string, now = Date.now()): boolean {
    if (this.phase !== 'INTRODUCTION' && this.phase !== 'TEA_ICEBREAKER') return false;
    this.phase = 'TEA_ICEBREAKER';
    this.context.selectedTeaId = teaId;
    this.context.currentQuestionId = questionId;
    this.context.phaseDeadline = now + 90 * 1000; // 90s
    return true;
  }

  goToMenuTogether(now = Date.now()): boolean {
    if (this.phase !== 'TEA_ICEBREAKER') return false;
    this.phase = 'MENU_TOGETHER';
    this.context.guest1MenuChoice = undefined;
    this.context.guest2MenuChoice = undefined;
    this.context.phaseDeadline = now + 60 * 1000;
    return true;
  }

  submitMenuChoice(userId: string, pastryId: string): boolean {
    if (this.phase !== 'MENU_TOGETHER') return false;
    if (userId === this.context.guest1UserId) {
      this.context.guest1MenuChoice = pastryId;
      return true;
    }
    if (userId === this.context.guest2UserId) {
      this.context.guest2MenuChoice = pastryId;
      return true;
    }
    return false;
  }

  areBothMenuSubmitted(): boolean {
    return !!(this.context.guest1MenuChoice && this.context.guest2MenuChoice);
  }

  goToScenarioCard(scenarioId: string, now = Date.now()): boolean {
    if (this.phase !== 'MENU_TOGETHER') return false;
    this.phase = 'SCENARIO_CARD';
    this.context.selectedScenarioId = scenarioId;
    this.context.guest1ScenarioChoice = undefined;
    this.context.guest2ScenarioChoice = undefined;
    this.context.phaseDeadline = now + 90 * 1000;
    return true;
  }

  submitScenarioChoice(userId: string, optionKey: string): boolean {
    if (this.phase !== 'SCENARIO_CARD') return false;
    if (userId === this.context.guest1UserId) {
      this.context.guest1ScenarioChoice = optionKey;
      return true;
    }
    if (userId === this.context.guest2UserId) {
      this.context.guest2ScenarioChoice = optionKey;
      return true;
    }
    return false;
  }

  goToPrivateDecision(now = Date.now()): boolean {
    if (this.phase !== 'SCENARIO_CARD') return false;
    this.phase = 'PRIVATE_DECISION';
    this.context.guest1Decision = undefined;
    this.context.guest2Decision = undefined;
    this.context.phaseDeadline = now + 45 * 1000;
    return true;
  }

  submitDecision(userId: string, wantMeetAgain: boolean): boolean {
    if (this.phase !== 'PRIVATE_DECISION') return false;
    if (userId === this.context.guest1UserId) {
      this.context.guest1Decision = wantMeetAgain;
      return true;
    }
    if (userId === this.context.guest2UserId) {
      this.context.guest2Decision = wantMeetAgain;
      return true;
    }
    return false;
  }

  areBothDecisionsSubmitted(): boolean {
    return this.context.guest1Decision !== undefined && this.context.guest2Decision !== undefined;
  }

  resolveResult(): { isMutualMatch: boolean; nextPhase: DuoTablePhase } {
    if (this.phase !== 'PRIVATE_DECISION') {
      throw new Error('Cannot resolve result outside PRIVATE_DECISION');
    }
    // Default to false if unsubmitted when deadline expires
    const g1 = this.context.guest1Decision === true;
    const g2 = this.context.guest2Decision === true;
    const mutual = g1 && g2;
    this.context.isMutualMatch = mutual;
    this.phase = 'RESULT';
    return {
      isMutualMatch: mutual,
      nextPhase: 'RESULT'
    };
  }

  enterPrivateTableOrFinish(): DuoTablePhase {
    if (this.phase !== 'RESULT') return this.phase;
    if (this.context.isMutualMatch) {
      this.phase = 'PRIVATE_TABLE';
    } else {
      this.phase = 'FINISHED';
    }
    return this.phase;
  }

  finish(): DuoTablePhase {
    this.phase = 'FINISHED';
    return this.phase;
  }
}
