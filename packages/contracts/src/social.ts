import { z } from 'zod';
import { ContactChannelsSchema } from './profile.js';

export const FriendshipStatusEnum = z.enum(['NONE', 'PENDING_SENT', 'PENDING_RECEIVED', 'ACCEPTED', 'BLOCKED']);
export type FriendshipStatus = z.infer<typeof FriendshipStatusEnum>;

export interface FriendSummary {
  id: string;
  userId: string;
  nickname: string;
  pronoun: string;
  avatarPresetId: string;
  avatarUrl?: string | null;
  status: FriendshipStatus;
  isOnline: boolean;
  currentRoomCode?: string | null;
  updatedAt: string;
}

export const ShareContactCardSchema = z.object({
  recipientUserId: z.string().min(1),
  channelsToShare: z.object({
    phone: z.boolean().default(false),
    email: z.boolean().default(false),
    zalo: z.boolean().default(false),
    telegram: z.boolean().default(false),
    social: z.boolean().default(false)
  }),
  note: z.string().max(150).optional()
});

export type ShareContactCardInput = z.infer<typeof ShareContactCardSchema>;

export interface ContactCardGrantDto {
  grantId: string;
  ownerUserId: string;
  ownerNickname: string;
  recipientUserId: string;
  sharedChannels: z.infer<typeof ContactChannelsSchema>;
  note?: string | null;
  grantedAt: string;
  isRevoked: boolean;
}
