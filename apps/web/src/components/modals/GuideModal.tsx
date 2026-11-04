import React from 'react';
import { X, BookOpen, Coffee, Heart, Shield, Users } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-oriental text-amber-200">Quy Tắc & Nghi Thức Phòng Trà</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs leading-relaxed text-stone-300">
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold font-oriental text-amber-200 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Tinh Thần Trà Đạo Cổ Trang</span>
            </h3>
            <p>
              "Trà Duyên" là không gian giao lưu, kết bạn và nhập vai phong cách quán trà cổ kính. Người chơi đến đây để
              tìm kiếm những cuộc trò chuyện tao nhã, thư thái và chân thành. Mọi tương tác đều tuân theo nguyên tắc tôn
              trọng, lịch thiệp và hoàn toàn đồng thuận.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold font-oriental text-amber-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Hai Chế Độ Buổi Trà</span>
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <span className="font-semibold text-amber-300">Bàn Đôi:</span> 2 Khách cùng 1 Chủ quán và 1 Người mai mối
                (hoặc 3 người nếu chủ quán kiêm vai). Trải qua tuần trà giới thiệu, dâng trà đàm đạo, đồng tâm chọn món, thẻ
                tình huống và bỏ thiệp hẹn kín.
              </li>
              <li>
                <span className="font-semibold text-amber-300">Xem Mắt Chung:</span> 4 đến 6 Khách cùng chủ quán. Trải qua
                tối đa 3 lượt xoay vòng 1-1 (Round-Robin) đàm đạo riêng tư. Cuối buổi mỗi người chọn tối đa 1 người muốn gặp
                lại.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold font-oriental text-amber-200 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>Thiệp Hẹn Kín & Bàn Riêng Sau Bình Phong</span>
            </h3>
            <p>
              Lựa chọn gặp tiếp được bỏ vào hộp gấm với animation giống hệt nhau, tuyệt đối không lộ màu sắc hay hiệu ứng.
              Chỉ khi <span className="font-bold text-amber-300">CẢ HAI CÙNG ĐỒNG Ý</span>, góc bàn riêng sau bình phong mới
              được mở khóa. Nếu một hoặc cả hai không chọn, buổi trà kết thúc trong hòa nhã và không bao giờ công bố ai từ
              chối ai.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold font-oriental text-amber-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Cam Kết Quyền Riêng Tư & An Toàn</span>
            </h3>
            <p>
              Chúng tôi không yêu cầu tên thật, địa chỉ cụ thể hay số CCCD. Thông tin liên lạc (Telegram, Zalo, SĐT) chỉ
              được gửi khi bạn chủ động xác nhận trao Danh Thiếp. Bất kỳ lúc nào, bạn cũng có thể thu hồi danh thiếp hoặc
              chặn người chơi quấy rối ngay lập tức.
            </p>
          </div>
        </div>

        <div className="bg-[#1e1008] px-6 py-3 border-t border-amber-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold text-xs rounded-xl shadow"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
