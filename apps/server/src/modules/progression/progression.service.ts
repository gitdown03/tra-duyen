import { getPrismaClient } from '../../persistence/prisma.js';
import { COSMETIC_CATALOG } from '@tra-duyen/content';
import { calculateReward, SessionParticipation } from '@tra-duyen/game-domain';
import { PlayerInventoryDto } from '@tra-duyen/contracts';

export class ProgressionService {
  private prisma = getPrismaClient();

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async getBalance(identityId: string) {
    const today = this.getTodayString();
    let record = await this.prisma.leafBalance.findUnique({
      where: { identityId }
    });

    if (!record) {
      record = await this.prisma.leafBalance.create({
        data: {
          identityId,
          balance: 50,
          earnedToday: 0,
          lastEarnedDate: today
        }
      });
    } else if (record.lastEarnedDate !== today) {
      // New day, reset daily counter
      record = await this.prisma.leafBalance.update({
        where: { identityId },
        data: {
          earnedToday: 0,
          lastEarnedDate: today
        }
      });
    }

    return record;
  }

  async awardSessionCompletion(participation: SessionParticipation, sessionId: string): Promise<number> {
    const today = this.getTodayString();

    return this.prisma.$transaction(async tx => {
      // Check if session was already rewarded for this user (prevent duplicate payout)
      const existing = await tx.rewardLedger.findFirst({
        where: {
          identityId: participation.userId,
          sessionId,
          type: 'SESSION_REWARD'
        }
      });

      if (existing) {
        return 0; // Already rewarded
      }

      let balance = await tx.leafBalance.findUnique({
        where: { identityId: participation.userId }
      });

      if (!balance) {
        balance = await tx.leafBalance.create({
          data: {
            identityId: participation.userId,
            balance: 0,
            earnedToday: 0,
            lastEarnedDate: today
          }
        });
      } else if (balance.lastEarnedDate !== today) {
        balance = await tx.leafBalance.update({
          where: { identityId: participation.userId },
          data: { earnedToday: 0, lastEarnedDate: today }
        });
      }

      const rewardAmount = calculateReward(participation, balance.earnedToday);
      if (rewardAmount <= 0) return 0;

      await tx.leafBalance.update({
        where: { identityId: participation.userId },
        data: {
          balance: { increment: rewardAmount },
          earnedToday: { increment: rewardAmount }
        }
      });

      await tx.rewardLedger.create({
        data: {
          identityId: participation.userId,
          sessionId,
          amount: rewardAmount,
          type: 'SESSION_REWARD',
          description: `Thưởng hoàn thành buổi thưởng trà (${sessionId})`
        }
      });

      return rewardAmount;
    });
  }

  async purchaseCosmetic(identityId: string, itemId: string, idempotencyKey: string) {
    const item = COSMETIC_CATALOG.find(c => c.id === itemId);
    if (!item) {
      throw new Error('Vật phẩm không tồn tại trong danh mục');
    }

    return this.prisma.$transaction(async tx => {
      // 1. Idempotency check
      const existingLedger = await tx.rewardLedger.findFirst({
        where: {
          identityId,
          description: { contains: idempotencyKey }
        }
      });

      if (existingLedger) {
        return { success: true, message: 'Giao dịch đã được xử lý trước đó' };
      }

      // 2. Check if already owned
      const alreadyOwned = await tx.cosmeticOwnership.findUnique({
        where: {
          identityId_itemId: { identityId, itemId }
        }
      });

      if (alreadyOwned) {
        throw new Error('Bạn đã sở hữu vật phẩm này');
      }

      // 3. Balance check
      const balanceRecord = await tx.leafBalance.findUnique({
        where: { identityId }
      });

      if (!balanceRecord || balanceRecord.balance < item.priceLeaves) {
        throw new Error('Số Lá Trà của bạn không đủ để đổi vật phẩm này');
      }

      // 4. Deduct and grant item
      await tx.leafBalance.update({
        where: { identityId },
        data: {
          balance: { decrement: item.priceLeaves }
        }
      });

      await tx.cosmeticOwnership.create({
        data: {
          identityId,
          itemId
        }
      });

      await tx.rewardLedger.create({
        data: {
          identityId,
          amount: -item.priceLeaves,
          type: 'PURCHASE',
          description: `Đổi vật phẩm [${item.name}] - Khóa: ${idempotencyKey}`
        }
      });

      return { success: true, itemId };
    });
  }

  async getInventory(identityId: string): Promise<PlayerInventoryDto> {
    const balance = await this.getBalance(identityId);
    const ownerships = await this.prisma.cosmeticOwnership.findMany({
      where: { identityId }
    });

    const ownedItemIds = ownerships.map(o => o.itemId);

    // Default items are always considered owned
    const defaultIds = COSMETIC_CATALOG.filter(c => c.isDefault).map(c => c.id);
    const fullOwned = Array.from(new Set([...defaultIds, ...ownedItemIds]));

    const profile = await this.prisma.playerProfile.findUnique({
      where: { identityId }
    });

    let equippedItems = {};
    if (profile?.appearanceJson) {
      try {
        const app = JSON.parse(profile.appearanceJson);
        equippedItems = {
          hair: app.hairStyle,
          outfit: app.outfitStyle,
          accessory: app.accessory
        };
      } catch {
        // ignore
      }
    }

    return {
      balanceLeaves: balance.balance,
      ownedItemIds: fullOwned,
      equippedItems
    };
  }
}
