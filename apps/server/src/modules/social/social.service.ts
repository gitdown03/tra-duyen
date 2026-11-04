import { getPrismaClient } from '../../persistence/prisma.js';
import { ContactCrypto } from '../../persistence/crypto.js';
import { ContactChannels, ContactCardGrantDto, FriendSummary } from '@tra-duyen/contracts';

export class SocialService {
  private prisma = getPrismaClient();
  private crypto = new ContactCrypto();

  // --- FRIENDS ---

  async sendFriendRequest(senderId: string, recipientId: string) {
    if (senderId === recipientId) throw new Error('Không thể kết bạn với chính mình');

    if (await this.isBlocked(senderId, recipientId)) {
      throw new Error('Không thể gửi lời mời kết bạn');
    }

    const [uA, uB] = [senderId, recipientId].sort();
    const existing = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: { userAId: uA, userBId: uB } }
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') throw new Error('Hai bạn đã là bạn bè');
      throw new Error('Lời mời kết bạn đã tồn tại');
    }

    const status = senderId === uA ? 'PENDING_A_TO_B' : 'PENDING_B_TO_A';

    return this.prisma.friendship.create({
      data: {
        userAId: uA,
        userBId: uB,
        status
      }
    });
  }

  async respondFriendRequest(userId: string, targetId: string, accept: boolean) {
    const [uA, uB] = [userId, targetId].sort();
    const existing = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: { userAId: uA, userBId: uB } }
    });

    if (!existing) throw new Error('Không tìm thấy lời mời kết bạn');

    // Verify userId is the recipient of the pending request
    const isTargetA = existing.status === 'PENDING_B_TO_A' && userId === uA;
    const isTargetB = existing.status === 'PENDING_A_TO_B' && userId === uB;

    if (!isTargetA && !isTargetB) {
      throw new Error('Bạn không có quyền phản hồi lời mời này');
    }

    if (!accept) {
      return this.prisma.friendship.delete({
        where: { id: existing.id }
      });
    }

    return this.prisma.friendship.update({
      where: { id: existing.id },
      data: { status: 'ACCEPTED' }
    });
  }

  async removeFriend(userId: string, targetId: string) {
    const [uA, uB] = [userId, targetId].sort();
    await this.prisma.friendship.deleteMany({
      where: { userAId: uA, userBId: uB }
    });
  }

  async listFriends(userId: string): Promise<FriendSummary[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }]
      }
    });

    const otherIds = friendships.map(f => (f.userAId === userId ? f.userBId : f.userAId));
    const profiles = await this.prisma.playerProfile.findMany({
      where: { identityId: { in: otherIds } },
      include: { identity: true }
    });
    const profileMap = new Map(profiles.map(p => [p.identityId, p]));

    return friendships.map(f => {
      const otherId = f.userAId === userId ? f.userBId : f.userAId;
      const prof = profileMap.get(otherId);

      let status: any = 'NONE';
      if (f.status === 'ACCEPTED') status = 'ACCEPTED';
      else if (
        (f.status === 'PENDING_A_TO_B' && f.userAId === userId) ||
        (f.status === 'PENDING_B_TO_A' && f.userBId === userId)
      ) {
        status = 'PENDING_SENT';
      } else {
        status = 'PENDING_RECEIVED';
      }

      return {
        id: f.id,
        userId: otherId,
        nickname: prof?.nickname || 'Khách bộ hành',
        pronoun: prof?.pronoun || 'Các hạ',
        avatarPresetId: 'preset_default_1',
        avatarUrl: prof?.avatarUrl,
        status,
        isOnline: false, // Updated by room presence if in room
        updatedAt: f.updatedAt.toISOString()
      };
    });
  }

  // --- BLOCKING ---

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new Error('Không thể tự chặn chính mình');

    // 1. Remove friendship
    const [uA, uB] = [blockerId, blockedId].sort();
    await this.prisma.friendship.deleteMany({
      where: { userAId: uA, userBId: uB }
    });

    // 2. Revoke all mutual contact card grants immediately (Section 16: "Block phải thu hồi quyền danh thiếp liên quan")
    await this.prisma.contactCardGrant.updateMany({
      where: {
        OR: [
          { ownerIdentityId: blockerId, recipientIdentityId: blockedId },
          { ownerIdentityId: blockedId, recipientIdentityId: blockerId }
        ]
      },
      data: { isRevoked: true }
    });

    // 3. Upsert Block
    await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {}
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.deleteMany({
      where: { blockerId, blockedId }
    });
  }

  async isBlocked(user1Id: string, user2Id: string): Promise<boolean> {
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: user1Id, blockedId: user2Id },
          { blockerId: user2Id, blockedId: user1Id }
        ]
      }
    });
    return !!block;
  }

  // --- CONTACT CARDS (DANH THIẾP) ---

  async savePersonalContacts(identityId: string, contacts: ContactChannels) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId }
    });

    if (!identity || identity.isGuest || !identity.isEmailVerified) {
      throw new Error('Chỉ tài khoản đã xác minh email mới được lưu thông tin liên lạc');
    }

    const encryptedPhone = contacts.phone ? this.crypto.encrypt(contacts.phone) : null;
    const encryptedEmail = contacts.email ? this.crypto.encrypt(contacts.email) : null;
    const encryptedZalo = contacts.zalo ? this.crypto.encrypt(contacts.zalo) : null;
    const encryptedTelegram = contacts.telegram ? this.crypto.encrypt(contacts.telegram) : null;
    const encryptedSocial = contacts.social ? this.crypto.encrypt(contacts.social) : null;

    return this.prisma.contactCard.upsert({
      where: { ownerIdentityId: identityId },
      create: {
        ownerIdentityId: identityId,
        encryptedPhone,
        encryptedEmail,
        encryptedZalo,
        encryptedTelegram,
        encryptedSocial
      },
      update: {
        encryptedPhone,
        encryptedEmail,
        encryptedZalo,
        encryptedTelegram,
        encryptedSocial
      }
    });
  }

  async getMyDecryptedContacts(identityId: string): Promise<ContactChannels> {
    const card = await this.prisma.contactCard.findUnique({
      where: { ownerIdentityId: identityId }
    });

    if (!card) return {};

    return {
      phone: card.encryptedPhone ? this.crypto.decrypt(card.encryptedPhone) : null,
      email: card.encryptedEmail ? this.crypto.decrypt(card.encryptedEmail) : null,
      zalo: card.encryptedZalo ? this.crypto.decrypt(card.encryptedZalo) : null,
      telegram: card.encryptedTelegram ? this.crypto.decrypt(card.encryptedTelegram) : null,
      social: card.encryptedSocial ? this.crypto.decrypt(card.encryptedSocial) : null
    };
  }

  async shareContactCard(
    ownerId: string,
    recipientId: string,
    channels: { phone: boolean; email: boolean; zalo: boolean; telegram: boolean; social: boolean },
    note?: string
  ) {
    if (ownerId === recipientId) throw new Error('Không thể trao danh thiếp cho chính mình');

    if (await this.isBlocked(ownerId, recipientId)) {
      throw new Error('Không thể trao danh thiếp cho người đã chặn');
    }

    const card = await this.prisma.contactCard.findUnique({
      where: { ownerIdentityId: ownerId }
    });

    if (!card) {
      throw new Error('Bạn chưa thiết lập thông tin danh thiếp của mình');
    }

    return this.prisma.contactCardGrant.upsert({
      where: {
        ownerIdentityId_recipientIdentityId: {
          ownerIdentityId: ownerId,
          recipientIdentityId: recipientId
        }
      },
      create: {
        ownerIdentityId: ownerId,
        recipientIdentityId: recipientId,
        sharePhone: channels.phone,
        shareEmail: channels.email,
        shareZalo: channels.zalo,
        shareTelegram: channels.telegram,
        shareSocial: channels.social,
        note: note || null,
        isRevoked: false
      },
      update: {
        sharePhone: channels.phone,
        shareEmail: channels.email,
        shareZalo: channels.zalo,
        shareTelegram: channels.telegram,
        shareSocial: channels.social,
        note: note || null,
        isRevoked: false
      }
    });
  }

  async revokeContactCard(ownerId: string, recipientId: string) {
    return this.prisma.contactCardGrant.updateMany({
      where: {
        ownerIdentityId: ownerId,
        recipientIdentityId: recipientId
      },
      data: { isRevoked: true }
    });
  }

  async getReceivedContactCards(recipientId: string): Promise<ContactCardGrantDto[]> {
    const grants = await this.prisma.contactCardGrant.findMany({
      where: {
        recipientIdentityId: recipientId,
        isRevoked: false
      },
      include: {
        owner: {
          include: {
            profile: true,
            contactCard: true
          }
        }
      }
    });

    return grants.map(g => {
      const card = g.owner.contactCard;
      const shared: ContactChannels = {};

      if (card) {
        if (g.sharePhone && card.encryptedPhone) {
          shared.phone = this.crypto.decrypt(card.encryptedPhone);
        }
        if (g.shareEmail && card.encryptedEmail) {
          shared.email = this.crypto.decrypt(card.encryptedEmail);
        }
        if (g.shareZalo && card.encryptedZalo) {
          shared.zalo = this.crypto.decrypt(card.encryptedZalo);
        }
        if (g.shareTelegram && card.encryptedTelegram) {
          shared.telegram = this.crypto.decrypt(card.encryptedTelegram);
        }
        if (g.shareSocial && card.encryptedSocial) {
          shared.social = this.crypto.decrypt(card.encryptedSocial);
        }
      }

      return {
        grantId: g.id,
        ownerUserId: g.ownerIdentityId,
        ownerNickname: g.owner.profile?.nickname || 'Khách bộ hành',
        recipientUserId: recipientId,
        sharedChannels: shared,
        note: g.note,
        grantedAt: g.createdAt.toISOString(),
        isRevoked: g.isRevoked
      };
    });
  }
}
