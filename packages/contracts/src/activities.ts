import { z } from 'zod';

export const DuoTablePhaseEnum = z.enum([
  'LOBBY',
  'INTRODUCTION',
  'TEA_ICEBREAKER',
  'MENU_TOGETHER',
  'SCENARIO_CARD',
  'PRIVATE_DECISION',
  'RESULT',
  'PRIVATE_TABLE',
  'FINISHED'
]);
export type DuoTablePhase = z.infer<typeof DuoTablePhaseEnum>;

export const GroupGatheringPhaseEnum = z.enum([
  'LOBBY',
  'GROUP_INTRODUCTION',
  'GROUP_ICEBREAKER',
  'PAIR_ROTATIONS',
  'PRIVATE_SELECTION',
  'RESULT',
  'PRIVATE_TABLES',
  'FINISHED'
]);
export type GroupGatheringPhase = z.infer<typeof GroupGatheringPhaseEnum>;

export type GameActivityPhase = DuoTablePhase | GroupGatheringPhase;

export interface ActivePairing {
  pairId: string;
  user1Id: string;
  user2Id: string;
  tableSeat1: string;
  tableSeat2: string;
  topicTitle: string;
  topicPrompt: string;
}

export interface ActivityRoundInfo {
  roundNumber: number;
  totalRounds: number;
  durationSeconds: number;
  remainingSeconds: number;
  deadlineTimestamp: number;
  activePairs: ActivePairing[];
  restingUserIds: string[];
}

export const EmoteTypeEnum = z.enum([
  'BOW',
  'SIP_TEA',
  'OFFER_TEA',
  'OFFER_SNACK',
  'GIVE_CARD',
  'RECEIVE_CARD',
  'NOD',
  'CLAP',
  'GENTLE_DECLINE'
]);
export type EmoteType = z.infer<typeof EmoteTypeEnum>;
