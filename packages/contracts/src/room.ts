import { z } from 'zod';
import { CharacterAppearanceSchema } from './profile.js';

export const RoomModeEnum = z.enum(['DUO_TABLE', 'GROUP_GATHERING']);
export type RoomMode = z.infer<typeof RoomModeEnum>;

export const RoomThemeEnum = z.enum(['LANTERN_FESTIVAL', 'SPRING_TEA', 'MOON_NIGHT']);
export type RoomTheme = z.infer<typeof RoomThemeEnum>;

export const RoomRoleEnum = z.enum(['HOST', 'MATCHMAKER', 'GUEST']);
export type RoomRole = z.infer<typeof RoomRoleEnum>;

export const RoomStatusEnum = z.enum(['LOBBY', 'IN_PROGRESS', 'FINISHED', 'CLOSED']);
export type RoomStatus = z.infer<typeof RoomStatusEnum>;

export const CreateRoomSchema = z.object({
  name: z.string().trim().min(3).max(40),
  mode: RoomModeEnum.default('DUO_TABLE'),
  isPrivate: z.boolean().default(false),
  theme: RoomThemeEnum.default('LANTERN_FESTIVAL'),
  maxGuests: z.number().int().min(2).max(6).default(2)
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export interface RoomListItem {
  id: string;
  code: string;
  name: string;
  mode: RoomMode;
  theme: RoomTheme;
  isPrivate: boolean;
  status: RoomStatus;
  currentCount: number;
  maxCapacity: number;
  hostNickname: string;
  createdAt: string;
}

export interface RoomPlayerState {
  sessionId: string;
  userId: string;
  nickname: string;
  pronoun: string;
  role: RoomRole;
  seatId: string | null;
  isReady: boolean;
  isConnected: boolean;
  appearance: z.infer<typeof CharacterAppearanceSchema>;
  position: { x: number; y: number; z: number };
  rotationY: number;
  currentAnimation: string;
}
