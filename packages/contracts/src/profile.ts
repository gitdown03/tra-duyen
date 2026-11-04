import { z } from 'zod';

export const VisibilityLevelEnum = z.enum(['ONLY_ME', 'FRIENDS', 'ROOM', 'PUBLIC']);
export type VisibilityLevel = z.infer<typeof VisibilityLevelEnum>;

export const PurposeEnum = z.enum(['ROLEPLAY', 'FRIENDSHIP', 'DATING']);
export type DatingPurpose = z.infer<typeof PurposeEnum>;

export const CharacterAppearanceSchema = z.object({
  genderPresentation: z.string().default('neutral'),
  hairStyle: z.string().default('hair_scholar_1'),
  hairColor: z.string().default('#2b201a'),
  skinTone: z.string().default('#f5deb3'),
  outfitStyle: z.string().default('robe_hanfu_1'),
  outfitPalette: z.string().default('palette_burgundy'),
  accessory: z.string().default('none'),
  defaultExpression: z.string().default('gentle')
});

export type CharacterAppearance = z.infer<typeof CharacterAppearanceSchema>;

export const CharacterProfileSchema = z.object({
  nickname: z.string().trim().min(2).max(20),
  pronoun: z.string().default('Các hạ'),
  appearance: CharacterAppearanceSchema,
  bio: z.string().max(200).default('Một tách trà thơm đợi bạn hiền.'),
  interests: z.array(z.string()).max(5).default([]),
  conversationStyle: z.string().max(100).default('Nhã nhặn, lắng nghe'),
  purpose: PurposeEnum.default('FRIENDSHIP'),
  allowedIntroTags: z.array(z.string()).max(10).default([])
});

export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;

export const ContactChannelsSchema = z.object({
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  zalo: z.string().trim().max(50).optional().nullable(),
  telegram: z.string().trim().max(50).optional().nullable(),
  social: z.string().trim().max(100).optional().nullable()
});

export type ContactChannels = z.infer<typeof ContactChannelsSchema>;

export const PersonalProfileSchema = z.object({
  avatarUrl: z.string().optional().nullable(),
  cityRegion: z.string().max(100).optional().nullable(),
  personalBio: z.string().max(500).optional().nullable(),
  contacts: ContactChannelsSchema.default({}),
  visibility: z.object({
    cityRegion: VisibilityLevelEnum.default('ONLY_ME'),
    personalBio: VisibilityLevelEnum.default('ONLY_ME')
  }).default({
    cityRegion: 'ONLY_ME',
    personalBio: 'ONLY_ME'
  })
});

export type PersonalProfile = z.infer<typeof PersonalProfileSchema>;

export const UpdateProfileSchema = z.object({
  character: CharacterProfileSchema.partial().optional(),
  personal: z.object({
    cityRegion: z.string().max(100).optional().nullable(),
    personalBio: z.string().max(500).optional().nullable(),
    contacts: ContactChannelsSchema.optional(),
    visibility: z.object({
      cityRegion: VisibilityLevelEnum.optional(),
      personalBio: VisibilityLevelEnum.optional()
    }).optional()
  }).optional()
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Filtered profile safe for viewing by another user
 */
export interface SafePublicProfile {
  id: string;
  isGuest: boolean;
  nickname: string;
  pronoun: string;
  appearance: CharacterAppearance;
  bio: string;
  interests: string[];
  conversationStyle: string;
  purpose: DatingPurpose;
  allowedIntroTags: string[];
  avatarUrl?: string | null;
  cityRegion?: string | null;
  personalBio?: string | null;
}
