import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { COSMETIC_CATALOG } from '@tra-duyen/content';
import { CosmeticItem } from '@tra-duyen/contracts';
import { X, Sparkles, Check, ShoppingBag, Leaf } from 'lucide-react';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemEquipped?: () => void;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  onItemEquipped
}) => {
  const [balance, setBalance] = useState(0);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInventory();
    }
  }, [isOpen]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/progression/inventory');
      setBalance(data.balanceLeaves);
      setOwnedIds(data.ownedItemIds || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePurchase = async (item: CosmeticItem) => {
    if (balance < item.priceLeaves) {
      alert('Bạn không đủ Lá Trà để đổi vật phẩm này. Hãy tham gia thêm các buổi thưởng trà!');
      return;
    }

    setPurchasingId(item.id);
    const idempotencyKey = `buy_${item.id}_${Date.now()}`;
    try {
      await apiRequest('/progression/purchase', {
        method: 'POST',
        body: JSON.stringify({
          itemId: item.id,
          idempotencyKey
        })
      });
      alert(`Đã mở khóa thành công vật phẩm: ${item.name}!`);
      loadInventory();
      onItemEquipped?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-oriental text-amber-200">Kỳ Trân Các (Tủ Đồ & Phụ Kiện)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Bar */}
        <div className="bg-[#1e1008] px-6 py-3 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-stone-300">Số dư hiện tại:</span>
            <span className="text-sm font-bold text-amber-300">{balance} Lá Trà</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Tối đa 500 Lá Trà / ngày từ các buổi chơi
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {COSMETIC_CATALOG.map(item => {
            const isOwned = ownedIds.includes(item.id) || item.isDefault;
            return (
              <div
                key={item.id}
                className="bg-[#1b0d06] border border-amber-900/40 p-3.5 rounded-xl flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-200 text-xs font-oriental">{item.name}</span>
                    <span className="text-[10px] bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded-full border border-amber-900/40">
                      {item.category === 'HAIR' && 'Tóc'}
                      {item.category === 'OUTFIT' && 'Trang phục'}
                      {item.category === 'ACCESSORY' && 'Phụ kiện'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-950">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    {item.priceLeaves === 0 ? 'Mặc định' : `${item.priceLeaves} Lá`}
                  </div>

                  {isOwned ? (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã sở hữu</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={purchasingId === item.id || balance < item.priceLeaves}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-40 text-stone-900 font-bold rounded-lg text-xs shadow transition-all"
                    >
                      {purchasingId === item.id ? 'Đang đổi...' : 'Đổi Vật Phẩm'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
