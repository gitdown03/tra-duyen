import { z } from 'zod';

export const CosmeticCategoryEnum = z.enum(['HAIR', 'OUTFIT', 'ACCESSORY', 'TEA_SET', 'DECORATION']);
export type CosmeticCategory = z.infer<typeof CosmeticCategoryEnum>;

export interface CosmeticItem {
  id: string;
  name: string;
  category: CosmeticCategory;
  description: string;
  priceLeaves: number;
  icon: string;
  modelAssetKey: string;
  isDefault: boolean;
}

export interface PlayerInventoryDto {
  balanceLeaves: number;
  ownedItemIds: string[];
  equippedItems: {
    hair?: string;
    outfit?: string;
    accessory?: string;
  };
}

export const PurchaseCosmeticSchema = z.object({
  itemId: z.string().min(1),
  idempotencyKey: z.string().min(8)
});

export type PurchaseCosmeticInput = z.infer<typeof PurchaseCosmeticSchema>;
