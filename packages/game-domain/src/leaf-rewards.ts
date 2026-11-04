export interface SessionParticipation {
  userId: string;
  isHostOrMatchmaker: boolean;
  completedFullSession: boolean;
  leftEarlyDueToBlockOrReport: boolean;
}

export const BASE_COMPLETION_LEAVES = 50;
export const DAILY_LEAF_CAP = 500;

export function calculateReward(participation: SessionParticipation, currentEarnedToday: number): number {
  // If left early due to block or report, they are NOT penalized (spec Section 17: "Không phạt người rời vì block/report")
  if (!participation.completedFullSession && !participation.leftEarlyDueToBlockOrReport) {
    return 0;
  }

  const rawReward = BASE_COMPLETION_LEAVES;
  const remainingAllowance = Math.max(0, DAILY_LEAF_CAP - currentEarnedToday);
  return Math.min(rawReward, remainingAllowance);
}
