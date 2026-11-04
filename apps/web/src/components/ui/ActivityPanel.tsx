import React, { useState, useEffect } from 'react';
import {
  TEA_VARIETIES,
  PASTRY_ITEMS,
  TEA_QUESTIONS,
  SCENARIO_CARDS
} from '@tra-duyen/content';
import {
  Clock,
  Sparkles,
  Heart,
  Coffee,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

interface ActivityPanelProps {
  mode: string;
  currentPhase: string;
  phaseDeadline: number;
  selectedTeaId?: string;
  currentQuestionId?: string;
  selectedScenarioId?: string;
  currentRound?: number;
  totalRounds?: number;
  isHostOrMatchmaker: boolean;
  myUserId: string;
  players: any[];
  pairings: any[];
  onAdvancePhase: () => void;
  onSubmitMenu: (pastryId: string) => void;
  onSubmitScenario: (choiceId: string) => void;
  onSubmitDecision: (wantMeetAgain: boolean) => void;
  onSubmitSelection: (chosenUserId: string | null) => void;
  onOpenContactShare?: (recipientId: string) => void;
  onOpenFriendModal?: () => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({
  mode,
  currentPhase,
  phaseDeadline,
  selectedTeaId,
  currentQuestionId,
  selectedScenarioId,
  currentRound,
  totalRounds,
  isHostOrMatchmaker,
  myUserId,
  players,
  pairings,
  onAdvancePhase,
  onSubmitMenu,
  onSubmitScenario,
  onSubmitDecision,
  onSubmitSelection,
  onOpenContactShare,
  onOpenFriendModal
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedPastry, setSelectedPastry] = useState<string | null>(null);
  const [selectedScenarioChoice, setSelectedScenarioChoice] = useState<string | null>(null);
  const [decisionSubmitted, setDecisionSubmitted] = useState(false);
  const [selectedGroupUserId, setSelectedGroupUserId] = useState<string | null>(null);

  // Timer calculation
  useEffect(() => {
    const update = () => {
      if (phaseDeadline > 0) {
        const diff = Math.max(0, Math.ceil((phaseDeadline - Date.now()) / 1000));
        setTimeLeft(diff);
      } else {
        setTimeLeft(0);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [phaseDeadline]);

  // Lookup content
  const currentTea = TEA_VARIETIES.find(t => t.id === selectedTeaId) || TEA_VARIETIES[0];
  const currentQuestion = TEA_QUESTIONS.find(q => q.id === currentQuestionId) || TEA_QUESTIONS[0];
  const currentScenario = SCENARIO_CARDS.find(s => s.id === selectedScenarioId) || SCENARIO_CARDS[0];

  // Group pairing lookup
  const myPair = pairings.find(p => p.user1Id === myUserId || p.user2Id === myUserId);
  const partnerId = myPair ? (myPair.user1Id === myUserId ? myPair.user2Id : myPair.user1Id) : null;
  const partnerPlayer = partnerId ? players.find(p => p.userId === partnerId) : null;

  return (
    <div className="bg-[#26140b]/95 border border-amber-900/60 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-[#f7f2e7] space-y-4 max-w-md w-full">
      {/* Phase Badge & Countdown */}
      <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold font-oriental text-amber-200 uppercase tracking-wider">
            {currentPhase === 'INTRODUCTION' && 'Nghi Thức Khởi Đầu'}
            {currentPhase === 'GROUP_INTRODUCTION' && 'Khai Tiệc Xem Mắt'}
            {currentPhase === 'TEA_ICEBREAKER' && 'Dâng Trà Mở Chuyện'}
            {currentPhase === 'GROUP_ICEBREAKER' && 'Đàm Đạo Toàn Bàn'}
            {currentPhase === 'MENU_TOGETHER' && 'Đồng Tâm Chọn Món'}
            {currentPhase === 'SCENARIO_CARD' && 'Thẻ Tình Huống'}
            {currentPhase === 'PAIR_ROTATIONS' && `Lượt Trò Chuyện Đôi (${currentRound}/${totalRounds})`}
            {currentPhase === 'PRIVATE_DECISION' && 'Gửi Thiệp Hẹn Kín'}
            {currentPhase === 'PRIVATE_SELECTION' && 'Chọn Duyên Kín'}
            {currentPhase === 'RESULT' && 'Kết Quả Tương Duyên'}
            {currentPhase === 'PRIVATE_TABLE' && 'Bàn Trà Riêng Sau Bình Phong'}
            {currentPhase === 'PRIVATE_TABLES' && 'Bàn Trà Riêng Sau Bình Phong'}
            {currentPhase === 'FINISHED' && 'Kết Thúc Buổi Trà'}
          </span>
        </div>

        {timeLeft > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-300 font-mono bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-900/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* PHASE: TEA ICEBREAKER */}
      {(currentPhase === 'TEA_ICEBREAKER' || currentPhase === 'GROUP_ICEBREAKER') && (
        <div className="space-y-3">
          <div className="bg-[#1b0d06] p-3 rounded-xl border border-amber-900/40 space-y-1">
            <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" />
              <span>Danh trà: {currentTea.name}</span>
            </div>
            <p className="text-xs text-stone-300 italic">{currentTea.aromaProfile}</p>
          </div>

          <div className="bg-[#1e1008] p-3.5 rounded-xl border border-amber-900/30 space-y-2">
            <div className="text-xs font-bold text-amber-200 font-oriental leading-relaxed">
              "{currentQuestion.text}"
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">{currentQuestion.suggestedPrompt}</p>
          </div>
        </div>
      )}

      {/* PHASE: MENU TOGETHER */}
      {currentPhase === 'MENU_TOGETHER' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-300 leading-relaxed">
            Chọn một món điểm tâm mà bạn yêu thích. Lựa chọn sẽ được giữ kín cho đến khi cả hai cùng chốt món.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {PASTRY_ITEMS.slice(0, 4).map(pastry => (
              <button
                key={pastry.id}
                onClick={() => {
                  setSelectedPastry(pastry.id);
                  onSubmitMenu(pastry.id);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedPastry === pastry.id
                    ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                    : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/60'
                }`}
              >
                <div className="font-semibold text-xs mb-0.5 truncate">{pastry.name}</div>
                <div className="text-[10px] text-stone-400 line-clamp-2">{pastry.flavor}</div>
              </button>
            ))}
          </div>

          {selectedPastry && (
            <div className="text-[11px] text-emerald-400 text-center flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Đã chọn món điểm tâm! Đang đợi đối phương chốt...</span>
            </div>
          )}
        </div>
      )}

      {/* PHASE: SCENARIO CARD */}
      {currentPhase === 'SCENARIO_CARD' && (
        <div className="space-y-3">
          <div className="bg-[#1e1008] p-3 rounded-xl border border-amber-900/40 space-y-1">
            <div className="font-oriental font-bold text-amber-200 text-xs">{currentScenario.title}</div>
            <p className="text-xs text-stone-300 leading-relaxed">{currentScenario.context}</p>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'optionA', text: currentScenario.optionA },
              { id: 'optionB', text: currentScenario.optionB },
              { id: 'optionC', text: currentScenario.optionC }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedScenarioChoice(opt.id);
                  onSubmitScenario(opt.id);
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedScenarioChoice === opt.id
                    ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-semibold'
                    : 'border-amber-950/40 bg-[#1b0d06] text-stone-300 hover:border-amber-900/60'
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PHASE: PAIR ROTATIONS (GROUP GATHERING) */}
      {currentPhase === 'PAIR_ROTATIONS' && (
        <div className="space-y-3">
          {partnerPlayer ? (
            <div className="bg-[#1e1008] p-3.5 rounded-xl border border-amber-900/40 space-y-2">
              <div className="text-xs text-stone-400">Bạn đang ghép đôi trò chuyện cùng:</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-200 text-sm font-oriental">{partnerPlayer.nickname}</span>
                <span className="text-xs text-stone-400">({partnerPlayer.pronoun})</span>
              </div>
              <div className="bg-[#180a04] p-2.5 rounded-lg border border-amber-950 text-xs text-amber-300/90 leading-relaxed">
                💡 <span className="font-semibold">{myPair?.topicTitle}:</span> {myPair?.topicPrompt}
              </div>
              <div className="text-[11px] text-amber-400/80">
                💬 Hãy dùng kênh chat [Cặp Đôi] để trao đổi riêng tư cùng người ấy.
              </div>
            </div>
          ) : (
            <div className="bg-[#1e1008] p-4 rounded-xl border border-amber-900/40 text-center space-y-2">
              <div className="text-amber-300 font-semibold text-xs">Lượt Thảnh Thơi Uống Trà</div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Bạn đang trong lượt nghỉ ngơi xoay vòng công bằng. Hãy nhâm nhi một tuần trà ấm trước khi bắt đầu lượt tiếp theo!
              </p>
            </div>
          )}
        </div>
      )}

      {/* PHASE: PRIVATE DECISION (DUO TABLE) */}
      {currentPhase === 'PRIVATE_DECISION' && (
        <div className="space-y-4">
          <p className="text-xs text-stone-300 leading-relaxed">
            Bạn có muốn mở bàn riêng sau bình phong để tiếp tục đàm đạo sâu hơn cùng đối phương không?
          </p>

          {!decisionSubmitted ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onSubmitDecision(true);
                  setDecisionSubmitted(true);
                }}
                className="p-3 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 rounded-xl text-white font-bold text-xs shadow transition-all flex flex-col items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Muốn Gặp Tiếp</span>
              </button>

              <button
                onClick={() => {
                  onSubmitDecision(false);
                  setDecisionSubmitted(true);
                }}
                className="p-3 bg-[#1e1008] hover:bg-[#26140b] border border-amber-950/60 rounded-xl text-stone-300 text-xs transition-all flex flex-col items-center gap-1.5"
              >
                <span>Hẹn Dịp Khác</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/40 border border-amber-900/40 rounded-xl text-center space-y-1">
              <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Đã bỏ thiệp vào hộp gấm thành công!</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Lựa chọn của bạn hoàn toàn bảo mật. Kết quả sẽ được công bố khi hết giờ.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PHASE: PRIVATE SELECTION (GROUP GATHERING) */}
      {currentPhase === 'PRIVATE_SELECTION' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-300 leading-relaxed">
            Chọn tối đa 1 người bạn muốn gặp lại để mở bàn riêng sau bình phong:
          </p>

          <div className="space-y-2">
            {players
              .filter(p => p.userId !== myUserId && p.role === 'GUEST')
              .map(guest => (
                <button
                  key={guest.userId}
                  onClick={() => {
                    setSelectedGroupUserId(guest.userId);
                    onSubmitSelection(guest.userId);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedGroupUserId === guest.userId
                      ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                      : 'border-amber-950/40 bg-[#1e1008] text-stone-300'
                  }`}
                >
                  <span>{guest.nickname} ({guest.pronoun})</span>
                  {selectedGroupUserId === guest.userId && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}

            <button
              onClick={() => {
                setSelectedGroupUserId('NONE');
                onSubmitSelection(null);
              }}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                selectedGroupUserId === 'NONE'
                  ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                  : 'border-amber-950/40 bg-[#1e1008] text-stone-400'
              }`}
            >
              <span>Không chọn ai (Kết thúc trong nhã nhặn)</span>
              {selectedGroupUserId === 'NONE' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>
        </div>
      )}

      {/* PHASE: PRIVATE TABLE (MUTUAL SUCCESS) */}
      {(currentPhase === 'PRIVATE_TABLE' || currentPhase === 'PRIVATE_TABLES') && (
        <div className="space-y-3">
          <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl text-center space-y-1">
            <div className="text-sm font-bold font-oriental text-emerald-300">Nhân Duyên Tương Hợp</div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Bạn đang ở góc bàn riêng sau bình phong. Kênh chat [Bàn Riêng] đã được mở hoàn toàn riêng tư cho hai người.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {onOpenContactShare && partnerId && (
              <button
                onClick={() => onOpenContactShare(partnerId)}
                className="py-2 px-3 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trao Danh Thiếp</span>
              </button>
            )}

            {onOpenFriendModal && (
              <button
                onClick={onOpenFriendModal}
                className="py-2 px-3 bg-[#1e1008] hover:bg-[#26140b] border border-amber-900/50 rounded-xl text-amber-200 text-xs flex items-center justify-center gap-1"
              >
                <span>Kết Bạn</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Host / Matchmaker Phase Advance Button */}
      {isHostOrMatchmaker && currentPhase !== 'FINISHED' && (
        <div className="pt-2 border-t border-amber-900/30 flex justify-end">
          <button
            onClick={onAdvancePhase}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-800/40 hover:bg-amber-800/70 border border-amber-700/40 rounded-xl text-xs text-amber-200 transition-colors"
          >
            <span>Chuyển Tuần Trà Tiếp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
