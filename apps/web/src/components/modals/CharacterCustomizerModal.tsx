import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { APPEARANCE_PRESETS } from '@tra-duyen/content';
import { X, Sparkles, Check } from 'lucide-react';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAppearance: any;
  onSaved: (appearance: any) => void;
}

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentAppearance,
  onSaved
}) => {
  const [appearance, setAppearance] = useState({
    hairStyle: currentAppearance?.hairStyle || 'hair_scholar_1',
    hairColor: currentAppearance?.hairColor || '#2b201a',
    skinTone: currentAppearance?.skinTone || '#f5deb3',
    outfitStyle: currentAppearance?.outfitStyle || 'robe_hanfu_1',
    outfitPalette: currentAppearance?.outfitPalette || 'palette_burgundy',
    accessory: currentAppearance?.accessory || 'none',
    defaultExpression: currentAppearance?.defaultExpression || 'gentle'
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const hairOptions = [
    { id: 'hair_scholar_1', name: 'Nho Sinh Búi Ngọc' },
    { id: 'hair_maiden_1', name: 'Song Hoàn Yêu Kiều' },
    { id: 'hair_flowing_1', name: 'Phong Trần Buông Xõa' },
    { id: 'hair_royal_1', name: 'Hoàng Kim Vương Giả' }
  ];

  const paletteOptions = [
    { id: 'palette_burgundy', name: 'Chu Sa Đỏ Thẫm', color: '#782823' },
    { id: 'palette_cyan', name: 'Lam Sa Thanh Nhã', color: '#3a7d8c' },
    { id: 'palette_rose', name: 'Hồng Đào Dịu Dàng', color: '#b85c70' },
    { id: 'palette_charcoal', name: 'Mặc Y Thủy Mặc', color: '#232528' },
    { id: 'palette_jade', name: 'Bích Ngọc Thanh Phong', color: '#2d6a4f' },
    { id: 'palette_gold', name: 'Hoàng Kim Quý Khí', color: '#b5832a' }
  ];

  const accessoryOptions = [
    { id: 'none', name: 'Không phụ kiện' },
    { id: 'acc_jade_pendant', name: 'Ngọc Bội Bình An' },
    { id: 'acc_silk_fan', name: 'Quạt Lụa Thủy Trúc' },
    { id: 'acc_tea_gourd', name: 'Hồ Lô Trữ Trà' },
    { id: 'acc_lantern_pin', name: 'Trâm Hoa Đăng' }
  ];

  const handleApplyPreset = (p: any) => {
    setAppearance({
      hairStyle: p.hairStyle,
      hairColor: p.hairColor,
      skinTone: p.skinTone,
      outfitStyle: p.outfitStyle,
      outfitPalette: p.outfitPalette,
      accessory: p.accessory,
      defaultExpression: p.defaultExpression
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          character: { appearance }
        })
      });
      onSaved(appearance);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-oriental text-amber-200">Tùy Chỉnh Diện Mạo Cổ Trang</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Presets */}
          <div>
            <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Diện mạo định sẵn</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {APPEARANCE_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 rounded-xl border border-amber-900/40 bg-[#1e1008] hover:border-amber-400 text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-amber-200 truncate">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hairstyles */}
          <div>
            <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Kiểu Tóc</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hairOptions.map(h => (
                <button
                  key={h.id}
                  onClick={() => setAppearance({ ...appearance, hairStyle: h.id })}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center justify-between ${
                    appearance.hairStyle === h.id
                      ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/60'
                  }`}
                >
                  <span className="truncate">{h.name}</span>
                  {appearance.hairStyle === h.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Bảng Màu Hán Phục</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paletteOptions.map(pal => (
                <button
                  key={pal.id}
                  onClick={() => setAppearance({ ...appearance, outfitPalette: pal.id })}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                    appearance.outfitPalette === pal.id
                      ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/60'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-stone-600" style={{ backgroundColor: pal.color }} />
                  <span className="truncate">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Phụ Kiện</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {accessoryOptions.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setAppearance({ ...appearance, accessory: acc.id })}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center justify-between ${
                    appearance.accessory === acc.id
                      ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/60'
                  }`}
                >
                  <span className="truncate">{acc.name}</span>
                  {appearance.accessory === acc.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1e1008] px-6 py-4 border-t border-amber-900/40 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};
