import React, { useState } from 'react';
import { Copy, Check, Play, ShieldAlert, Award, Coffee } from 'lucide-react';

interface LobbyPanelProps {
  roomCode: string;
  roomName: string;
  mode: string;
  myRole: string;
  mySeatId?: string;
  isReady: boolean;
  isHost: boolean;
  canStart: boolean;
  missingRequirements?: string;
  onSetRole: (role: 'HOST' | 'MATCHMAKER' | 'GUEST') => void;
  onToggleReady: (ready: boolean) => void;
  onStartSession: () => void;
}

export const LobbyPanel: React.FC<LobbyPanelProps> = ({
  roomCode,
  roomName,
  mode,
  myRole,
  mySeatId,
  isReady,
  isHost,
  canStart,
  missingRequirements,
  onSetRole,
  onToggleReady,
  onStartSession
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#26140b]/90 border border-amber-900/60 rounded-2xl p-4 shadow-xl backdrop-blur-md text-[#f7f2e7] space-y-4 max-w-sm w-full">
      {/* Room Header */}
      <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
        <div>
          <h2 className="font-oriental font-bold text-amber-200 text-sm truncate">{roomName}</h2>
          <div className="text-[11px] text-stone-400">
            {mode === 'DUO_TABLE' ? 'Chế độ Bàn Đôi (4 người)' : 'Chế độ Xem Mắt Chung (8 người)'}
          </div>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/40 border border-amber-800/40 rounded-lg text-xs font-mono text-amber-300 transition-colors"
          title="Bấm để sao chép mã phòng"
        >
          <span>{roomCode}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {/* Role Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-amber-300/80">Vai trò trong phòng:</label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onSetRole('GUEST')}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
              myRole === 'GUEST'
                ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                : 'border-amber-950/40 bg-[#1e1008] text-stone-400 hover:text-stone-200'
            }`}
          >
            Khách Xem Mắt
          </button>
          <button
            onClick={() => onSetRole('MATCHMAKER')}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
              myRole === 'MATCHMAKER'
                ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                : 'border-amber-950/40 bg-[#1e1008] text-stone-400 hover:text-stone-200'
            }`}
          >
            Người Mai Mối
          </button>
          <button
            onClick={() => onSetRole('HOST')}
            disabled={!isHost}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
              myRole === 'HOST'
                ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                : 'border-amber-950/40 bg-[#1e1008] text-stone-400 opacity-50'
            }`}
          >
            Chủ Quán
          </button>
        </div>
      </div>

      {/* Seat Status */}
      <div className="bg-[#1b0d06] p-2.5 rounded-xl border border-amber-950/50 flex items-center justify-between text-xs">
        <span className="text-stone-400">Vị trí ngồi:</span>
        <span className="font-semibold text-amber-300">
          {mySeatId ? `Ghế: ${mySeatId}` : 'Chưa ngồi ghế (bấm ghế trên sàn để ngồi)'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {myRole === 'GUEST' && (
          <button
            onClick={() => onToggleReady(!isReady)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
              isReady
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                : 'bg-amber-700 hover:bg-amber-600 text-stone-900'
            }`}
          >
            {isReady ? '✓ Đã Sẵn Sàng (Bấm để hủy)' : 'Bấm Để Sẵn Sàng'}
          </button>
        )}

        {isHost && (
          <div className="space-y-1.5">
            <button
              onClick={onStartSession}
              disabled={!canStart}
              className="w-full py-2.5 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt Đầu Buổi Trà</span>
            </button>
            {!canStart && missingRequirements && (
              <div className="text-[11px] text-amber-400/80 bg-amber-950/40 p-2 rounded-lg border border-amber-900/30 text-center">
                {missingRequirements}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
