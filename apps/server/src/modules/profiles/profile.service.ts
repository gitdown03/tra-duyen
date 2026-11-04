import { getPrismaClient } from '../../persistence/prisma.js';
import { SafePublicProfile, CharacterAppearance, DatingPurpose, VisibilityLevel } from '@tra-duyen/contracts';

export class ProfileService {
  private prisma = getPrismaClient();

  async getProfile(identityId: string) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { identityId },
      include: { identity: true }
    });
    if (!profile) throw new Error('Không tìm thấy hồ sơ người chơi');
    return profile;
  }

  async getSafeProfile(
    viewerIdentityId: string,
    targetIdentityId: string,
    relationship: 'SELF' | 'FRIEND' | 'ROOM' | 'PUBLIC' = 'PUBLIC'
  ): Promise<SafePublicProfile> {
    const profile = await this.getProfile(targetIdentityId);

    const isSelf = viewerIdentityId === targetIdentityId;
    let effectiveRel = relationship;
    if (isSelf) {
      effectiveRel = 'SELF';
    } else if (effectiveRel === 'PUBLIC') {
      // Check if friend in DB
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { userAId: viewerIdentityId, userBId: targetIdentityId, status: 'ACCEPTED' },
            { userAId: targetIdentityId, userBId: viewerIdentityId, status: 'ACCEPTED' }
          ]
        }
      });
      if (friendship) {
        effectiveRel = 'FRIEND';
      }
    }

    const canSee = (vis: string): boolean => {
      if (effectiveRel === 'SELF') return true;
      if (vis === 'PUBLIC') return true;
      if (vis === 'ROOM' && (effectiveRel === 'ROOM' || effectiveRel === 'FRIEND')) return true;
      if (vis === 'FRIENDS' && effectiveRel === 'FRIEND') return true;
      return false;
    };

    const appearance: CharacterAppearance = JSON.parse(profile.appearanceJson || '{}');
    const interests: string[] = JSON.parse(profile.interestsJson || '[]');
    const allowedIntroTags: string[] = JSON.parse(profile.allowedIntroTagsJson || '[]');

    return {
      id: profile.identityId,
      isGuest: profile.identity.isGuest,
      nickname: profile.nickname,
      pronoun: profile.pronoun,
      appearance,
      bio: profile.bio,
      interests,
      conversationStyle: profile.conversationStyle,
      purpose: profile.purpose as DatingPurpose,
      allowedIntroTags,
      avatarUrl: profile.avatarUrl,
      cityRegion: canSee(profile.cityRegionVisibility) ? profile.cityRegion : null,
      personalBio: canSee(profile.personalBioVisibility) ? profile.personalBio : null
    };
  }

  async updateProfile(
    identityId: string,
    data: {
      character?: {
        nickname?: string;
        pronoun?: string;
        appearance?: CharacterAppearance;
        bio?: string;
        interests?: string[];
        conversationStyle?: string;
        purpose?: DatingPurpose;
        allowedIntroTags?: string[];
      };
      personal?: {
        cityRegion?: string | null;
        personalBio?: string | null;
        visibility?: {
          cityRegion?: VisibilityLevel;
          personalBio?: VisibilityLevel;
        };
      };
    }
  ) {
    const existing = await this.getProfile(identityId);

    const updateData: any = {};

    if (data.character) {
      if (data.character.nickname) updateData.nickname = data.character.nickname;
      if (data.character.pronoun) updateData.pronoun = data.character.pronoun;
      if (data.character.appearance) updateData.appearanceJson = JSON.stringify(data.character.appearance);
      if (data.character.bio !== undefined) updateData.bio = data.character.bio;
      if (data.character.interests) updateData.interestsJson = JSON.stringify(data.character.interests);
      if (data.character.conversationStyle) updateData.conversationStyle = data.character.conversationStyle;
      if (data.character.purpose) updateData.purpose = data.character.purpose;
      if (data.character.allowedIntroTags) updateData.allowedIntroTagsJson = JSON.stringify(data.character.allowedIntroTags);
    }

    if (data.personal) {
      if (data.personal.cityRegion !== undefined) updateData.cityRegion = data.personal.cityRegion;
      if (data.personal.personalBio !== undefined) updateData.personalBio = data.personal.personalBio;
      if (data.personal.visibility) {
        if (data.personal.visibility.cityRegion) updateData.cityRegionVisibility = data.personal.visibility.cityRegion;
        if (data.personal.visibility.personalBio) updateData.personalBioVisibility = data.personal.visibility.personalBio;
      }
    }

    const updated = await this.prisma.playerProfile.update({
      where: { identityId },
      data: updateData
    });

    return updated;
  }
}
