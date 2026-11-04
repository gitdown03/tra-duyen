import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, MessageSquare, Lock } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderNickname: string;
  senderPronoun: string;
  scope: 'ROOM' | 'PAIR' | 'PRIVATE_TABLE';
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  currentScope: 'ROOM' | 'PAIR' | 'PRIVATE_TABLE';
  availableScopes: ('ROOM' | 'PAIR' | 'PRIVATE_TABLE')[];
  myUserId: string;
  onSendChat: (scope: 'ROOM' | 'PAIR' | 'PRIVATE_TABLE', text: string) => void;
  onSendEmote: (emoteName: string) => void;
  onScopeChange: (scope: 'ROOM' | 'PAIR' | 'PRIVATE_TABLE') => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentScope,
  availableScopes,
  myUserId,
  onSendChat,
  onSendEmote,
  onScopeChange
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentScope]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendChat(currentScope, inputText);
    setInputText('');
  };

  const filteredMessages = messages.filter(m => m.scope === currentScope);

  const emotes = [
    { id: 'bow', label: 'Chắp tay chào', icon: '🙏' },
    { id: 'sip_tea', label: 'Uống trà', icon: '🍵' },
    { id: 'offer_tea', label: 'Mời trà', icon: '🫖' },
    { id: 'offer_snack', label: 'Mời bánh', icon: '🥮' },
    { id: 'nod', label: 'Gật đầu', icon: '😌' },
    { id: 'clap', label: 'Vỗ tay', icon: '👏' },
    { id: 'gentle_decline', label: 'Từ chối nhã nhặn', icon: '🌿' }
  ];

  return (
    <div className="bg-[#26140b]/95 border border-amber-900/60 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col text-[#f7f2e7] w-80 sm:w-96 h-80 overflow-hidden">
      {/* Scope Selector Tabs */}
      <div className="flex bg-[#1e1008] border-b border-amber-900/40 text-xs">
        <button
          onClick={() => onScopeChange('ROOM')}
          className={`flex-1 py-2 text-center transition-colors font-medium ${
            currentScope === 'ROOM'
              ? 'text-amber-300 border-b-2 border-amber-400 font-bold bg-[#26140b]'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Toàn Phòng
        </button>

        {availableScopes.includes('PAIR') && (
          <button
            onClick={() => onScopeChange('PAIR')}
            className={`flex-1 py-2 text-center transition-colors font-medium flex items-center justify-center gap-1 ${
              currentScope === 'PAIR'
                ? 'text-amber-300 border-b-2 border-amber-400 font-bold bg-[#26140b]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Cặp Đôi</span>
          </button>
        )}

        {availableScopes.includes('PRIVATE_TABLE') && (
          <button
            onClick={() => onScopeChange('PRIVATE_TABLE')}
            className={`flex-1 py-2 text-center transition-colors font-medium flex items-center justify-center gap-1 ${
              currentScope === 'PRIVATE_TABLE'
                ? 'text-emerald-300 border-b-2 border-emerald-400 font-bold bg-[#26140b]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Bàn Riêng</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-stone-500 text-[11px] italic">
            Chưa có tin nhắn trong kênh này. Hãy gửi một lời chào nhã nhặn!
          </div>
        ) : (
          filteredMessages.map(msg => {
            const isSystem = msg.senderId === 'SYSTEM';
            const isMe = msg.senderId === myUserId;

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="bg-amber-950/40 text-amber-300/80 px-2.5 py-1 rounded-full text-[10px] border border-amber-900/30">
                    📜 {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="text-[10px] text-stone-400 mb-0.5 px-1">
                  {msg.senderNickname} <span className="opacity-75">({msg.senderPronoun})</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 leading-relaxed break-words shadow-sm ${
                    isMe
                      ? 'bg-amber-800/80 text-amber-100 rounded-br-xs'
                      : 'bg-[#1b0d06] text-stone-200 border border-amber-950/60 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emote Quick Bar */}
      {showEmotes && (
        <div className="bg-[#1b0d06] p-2 border-t border-amber-900/40 grid grid-cols-4 gap-1.5 text-[11px]">
          {emotes.map(em => (
            <button
              key={em.id}
              onClick={() => {
                onSendEmote(em.id);
                setShowEmotes(false);
              }}
              className="p-1.5 bg-[#26140b] hover:bg-amber-950/60 rounded-lg border border-amber-900/30 flex items-center justify-center gap-1 transition-colors"
              title={em.label}
            >
              <span>{em.icon}</span>
              <span className="truncate">{em.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 bg-[#1b0d06] border-t border-amber-900/40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmotes(!showEmotes)}
          className="p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-amber-950/40 transition-colors"
          title="Động tác & Nghi lễ"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          maxLength={300}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Nói điều gì đó..."
          className="flex-1 bg-[#26140b] border border-amber-900/40 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-stone-900 font-bold rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
