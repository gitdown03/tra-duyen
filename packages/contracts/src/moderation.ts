import { z } from 'zod';

export const ReportReasonEnum = z.enum([
  'HARASSMENT',
  'INAPPROPRIATE_CONTENT',
  'SPAM',
  'IMPERSONATION',
  'UNSOLICITED_CONTACT',
  'OTHER'
]);
export type ReportReason = z.infer<typeof ReportReasonEnum>;

export const CreateReportSchema = z.object({
  reportedUserId: z.string().min(1),
  roomCode: z.string().optional(),
  reason: ReportReasonEnum,
  detail: z.string().max(500),
  selectedMessageIds: z.array(z.string()).max(10).optional()
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export interface ModerationReportDto {
  id: string;
  reporterUserId: string;
  reporterNickname: string;
  reportedUserId: string;
  reportedNickname: string;
  roomCode?: string | null;
  reason: ReportReason;
  detail: string;
  evidenceSnippet?: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export const AdminActionSchema = z.object({
  action: z.enum(['BAN_USER', 'UNBAN_USER', 'REMOVE_AVATAR', 'CLOSE_ROOM', 'RESOLVE_REPORT']),
  targetUserId: z.string().optional(),
  reportId: z.string().optional(),
  roomCode: z.string().optional(),
  reason: z.string().min(3)
});

export type AdminActionInput = z.infer<typeof AdminActionSchema>;
