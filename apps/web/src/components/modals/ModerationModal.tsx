import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetNickname?: string;
  roomCode?: string;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetNickname,
  roomCode
}) => {
  const [reason, setReason] = useState('HARASSMENT');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !targetUserId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) {
      alert('Vui lòng mô tả chi tiết lý do báo cáo');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          reportedUserId: targetUserId,
          roomCode,
          reason,
          detail
        })
      });
      alert('Đã gửi báo cáo vi phạm. Quản trị viên sẽ xem xét và xử lý theo chính sách cộng đồng.');
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold font-oriental text-red-200">Báo Cáo Vi Phạm Quy Tắc</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-stone-300">
            Người bị báo cáo: <span className="font-bold text-amber-200">{targetNickname || 'Người chơi'}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-200/90 mb-1">Lý do vi phạm</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="HARASSMENT">Quấy rối, xúc phạm hoặc thô lỗ</option>
              <option value="INAPPROPRIATE_CONTENT">Nội dung đồi trụy hoặc không phù hợp</option>
              <option value="SPAM">Gửi tin nhắn rác / lặp lại liên tục</option>
              <option value="IMPERSONATION">Mạo danh người khác</option>
              <option value="UNSOLICITED_CONTACT">Ép buộc xin thông tin cá nhân ngoài ý muốn</option>
              <option value="OTHER">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-200/90 mb-1">Mô tả cụ thể sự việc</label>
            <textarea
              rows={3}
              required
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="Vui lòng cung cấp thêm ngữ cảnh sự việc xảy ra..."
              className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="bg-[#1b0d06] p-3 rounded-xl border border-amber-950/60 text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Minh bạch dữ liệu: Báo cáo này sẽ được chuyển đến ban quản trị kèm nhật ký tin nhắn liên quan trong phòng để làm căn cứ xử lý vi phạm.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
