import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { X, Plus, LogIn, Users, Sparkles, Lock, RefreshCw } from 'lucide-react';

interface RoomListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (options: { roomId?: string; roomCode?: string; createNew?: boolean; roomOptions?: any }) => void;
}

export const RoomListModal: React.FC<RoomListModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom
}) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [joinCode, setJoinCode] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [roomName, setRoomName] = useState('Trà Thất Tương Ngộ');
  const [mode, setMode] = useState<'DUO_TABLE' | 'GROUP_GATHERING'>('DUO_TABLE');
  const [theme, setTheme] = useState('LANTERN_FESTIVAL');
  const [isPrivate, setIsPrivate] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/rooms');
      setRooms(data);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinRoom({
      createNew: true,
      roomOptions: {
        name: roomName,
        mode,
        theme,
        isPrivate
      }
    });
    onClose();
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) return;
    onJoinRoom({
      roomCode: cleanCode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-oriental text-amber-200">Danh Sách Phòng Trà</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-[#1e1008] text-xs font-medium border-b border-amber-900/40 text-center">
          <button
            onClick={() => setTab('list')}
            className={`py-3 transition-colors ${tab === 'list' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Tìm Phòng Công Khai
          </button>
          <button
            onClick={() => setTab('create')}
            className={`py-3 transition-colors ${tab === 'create' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Mở Phòng Trà Mới
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {tab === 'list' ? (
            <div className="space-y-5">
              {/* Join by Code Input */}
              <form onSubmit={handleCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  placeholder="Nhập mã phòng (ví dụ: TRAD01)"
                  className="flex-1 bg-[#1b0d06] border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm uppercase tracking-widest placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-stone-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Vào Phòng</span>
                </button>
              </form>

              {/* Public Rooms List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-300/80 font-medium">
                  <span>Phòng Đang Mở Đón Khách ({rooms.length})</span>
                  <button
                    onClick={fetchRooms}
                    className="flex items-center gap-1 text-stone-400 hover:text-stone-200 text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                  </button>
                </div>

                {rooms.length === 0 ? (
                  <div className="bg-[#1b0d06] border border-amber-950/50 rounded-xl p-8 text-center text-stone-400 text-xs space-y-2">
                    <p>Hiện chưa có phòng trà công khai nào đang mở.</p>
                    <button
                      onClick={() => setTab('create')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800/40 hover:bg-amber-800/60 text-amber-200 rounded-xl border border-amber-700/50 text-xs mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tự mở phòng trà ngay</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {rooms.map(room => (
                      <div
                        key={room.roomId}
                        className="bg-[#1e1008] border border-amber-900/40 hover:border-amber-700/60 p-4 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-200 text-sm font-oriental">{room.name}</span>
                            <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded-full text-amber-400 border border-amber-900/60">
                              Mã: {room.code}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400 flex items-center gap-3">
                            <span>
                              Chế độ: {room.mode === 'DUO_TABLE' ? 'Bàn Đôi (4 người)' : 'Xem Mắt Chung (8 người)'}
                            </span>
                            <span>•</span>
                            <span className="text-amber-300/80">
                              Khách: {room.currentCount}/{room.maxCapacity}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onJoinRoom({ roomId: room.roomId });
                            onClose();
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl text-xs shadow transition-all"
                        >
                          Vào Quán
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CREATE ROOM FORM */
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Tên phòng trà</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="Ví dụ: Tây Hồ Thính Vũ Trà Thất"
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Chế độ giao lưu</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('DUO_TABLE')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      mode === 'DUO_TABLE'
                        ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold'
                        : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/60'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">Bàn Đôi</div>
                    <div className="text-[11px] opacity-75 font-normal leading-relaxed">
                      2 Khách + 1 Chủ quán + 1 Mai mối (hoặc 3 người). Buổi xem mắt sâu sắc qua từng tuần trà.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('GROUP_GATHERING')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      mode === 'GROUP_GATHERING'
                        ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold'
                        : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/60'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">Xem Mắt Chung</div>
                    <div className="text-[11px] opacity-75 font-normal leading-relaxed">
                      4 đến 6 Khách + Chủ quán & Mai mối. Xoay vòng đàm đạo 1-1 qua các lượt trà.
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Chủ đề bài trí</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'LANTERN_FESTIVAL', name: 'Hội Đèn Lồng' },
                    { id: 'SPRING_TEA', name: 'Trà Đầu Xuân' },
                    { id: 'MOON_NIGHT', name: 'Đêm Thưởng Nguyệt' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-2 rounded-xl border text-xs text-center transition-all ${
                        theme === t.id
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold'
                          : 'border-amber-950/40 bg-[#1e1008] text-stone-300'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phòng riêng tư (Chỉ vào được bằng mã phòng hoặc đường liên kết)</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl shadow-md transition-all text-sm mt-2"
              >
                Mở Cửa Quán Trà
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
