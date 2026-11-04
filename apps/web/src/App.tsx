import React, { useState, useEffect, useRef } from 'react';
import { Client, Room } from 'colyseus.js';
import { apiRequest } from './lib/api';
import { TeaRoomCanvas } from './components/scene/TeaRoomCanvas';
import { LobbyPanel } from './components/ui/LobbyPanel';
import { ActivityPanel } from './components/ui/ActivityPanel';
import { ChatPanel } from './components/ui/ChatPanel';
import { AuthModal } from './components/modals/AuthModal';
import { CharacterCustomizerModal } from './components/modals/CharacterCustomizerModal';
import { RoomListModal } from './components/modals/RoomListModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { SocialModal } from './components/modals/SocialModal';
import { WardrobeModal } from './components/modals/WardrobeModal';
import { ModerationModal } from './components/modals/ModerationModal';
import { AdminModal } from './components/modals/AdminModal';
import { GuideModal } from './components/modals/GuideModal';
import {
  Coffee,
  Users,
  ShoppingBag,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Shield,
  Leaf,
  LogOut,
  User,
  Volume2,
  VolumeX
} from 'lucide-react';

const WS_URL =
  window.location.protocol === 'https:'
    ? `wss://${window.location.host}`
    : `ws://${window.location.hostname}:3001`;

export function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [leafBalance, setLeafBalance] = useState(0);

  // Colyseus Room State
  const [room, setRoom] = useState<Room | null>(null);
  const [roomState, setRoomState] = useState<any>({
    roomCode: '',
    roomName: 'Trà Thất Tương Ngộ',
    mode: 'DUO_TABLE',
    status: 'LOBBY',
    theme: 'LANTERN_FESTIVAL',
    hostUserId: '',
    currentPhase: 'LOBBY',
    phaseDeadline: 0,
    players: [],
    messages: [],
    pairings: []
  });

  const [chatScope, setChatScope] = useState<'ROOM' | 'PAIR' | 'PRIVATE_TABLE'>('ROOM');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [roomListOpen, setRoomListOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [moderationTarget, setModerationTarget] = useState<any>(null);
  const [contactRecipientId, setContactRecipientId] = useState<string | null>(null);

  const colyseusClient = useRef(new Client(WS_URL));

  // 1. Check active session on initial load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const data = await apiRequest('/auth/me');
      setCurrentUser(data);
      loadLeafBalance();
    } catch {
      // Not logged in -> open guest/login modal
      setAuthOpen(true);
    }
  };

  const loadLeafBalance = async () => {
    try {
      const inv = await apiRequest('/progression/inventory');
      setLeafBalance(inv.balanceLeaves || 0);
    } catch {
      // ignore
    }
  };

  // 2. Connect to Colyseus Room
  const joinRoom = async (options: { roomId?: string; roomCode?: string; createNew?: boolean; roomOptions?: any }) => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }

    try {
      // Leave current room if in one
      if (room) {
        room.leave();
      }

      let newRoom: Room;
      if (options.createNew) {
        newRoom = await colyseusClient.current.create('tea_room', {
          ...options.roomOptions,
          token: sessionToken || 'cookie_session'
        });
      } else if (options.roomId) {
        newRoom = await colyseusClient.current.joinById(options.roomId, {
          token: sessionToken || 'cookie_session'
        });
      } else if (options.roomCode) {
        newRoom = await colyseusClient.current.joinOrCreate('tea_room', {
          roomCode: options.roomCode,
          token: sessionToken || 'cookie_session'
        });
      } else {
        newRoom = await colyseusClient.current.joinOrCreate('tea_room', {
          token: sessionToken || 'cookie_session'
        });
      }

      setRoom(newRoom);
      setupRoomListeners(newRoom);
    } catch (err: any) {
      alert(`Không thể vào phòng trà: ${err.message}`);
    }
  };

  const setupRoomListeners = (activeRoom: Room) => {
    activeRoom.onStateChange(state => {
      const playersList: any[] = [];
      state.players.forEach((p: any) => {
        playersList.push({
          sessionId: p.sessionId,
          userId: p.userId,
          nickname: p.nickname,
          pronoun: p.pronoun,
          role: p.role,
          seatId: p.seatId,
          isReady: p.isReady,
          isConnected: p.isConnected,
          x: p.x,
          y: p.y,
          z: p.z,
          rotationY: p.rotationY,
          animation: p.animation,
          appearanceJson: p.appearanceJson
        });
      });

      const messagesList: any[] = [];
      state.messages.forEach((m: any) => {
        messagesList.push({
          id: m.id,
          senderId: m.senderId,
          senderNickname: m.senderNickname,
          senderPronoun: m.senderPronoun,
          scope: m.scope,
          text: m.text,
          timestamp: m.timestamp
        });
      });

      const pairingsList: any[] = [];
      state.pairings.forEach((pr: any) => {
        pairingsList.push({
          pairId: pr.pairId,
          user1Id: pr.user1Id,
          user2Id: pr.user2Id,
          topicTitle: pr.topicTitle,
          topicPrompt: pr.topicPrompt
        });
      });

      setRoomState({
        roomCode: state.roomCode,
        roomName: state.roomName,
        mode: state.mode,
        status: state.status,
        theme: state.theme,
        hostUserId: state.hostUserId,
        currentPhase: state.currentPhase,
        phaseDeadline: state.phaseDeadline,
        selectedTeaId: state.selectedTeaId,
        currentQuestionId: state.currentQuestionId,
        selectedScenarioId: state.selectedScenarioId,
        currentRound: state.currentRound,
        totalRounds: state.totalRounds,
        players: playersList,
        messages: messagesList,
        pairings: pairingsList
      });
    });

    activeRoom.onMessage('SCOPED_CHAT_MESSAGE', (msg: any) => {
      setRoomState((prev: any) => ({
        ...prev,
        messages: [...prev.messages, msg]
      }));
    });

    activeRoom.onMessage('ERROR_MESSAGE', (data: any) => {
      alert(`[Thông báo phòng]: ${data.message}`);
    });
  };

  // Auto-connect to default room once authenticated if not in a room
  useEffect(() => {
    if (currentUser && !room) {
      joinRoom({});
    }
  }, [currentUser]);

  // Current player within room
  const myPlayer = roomState.players.find((p: any) => p.userId === currentUser?.id);
  const isHost = myPlayer?.userId === roomState.hostUserId || myPlayer?.role === 'HOST';

  // Available chat scopes
  const availableScopes: ('ROOM' | 'PAIR' | 'PRIVATE_TABLE')[] = ['ROOM'];
  if (roomState.currentPhase === 'PAIR_ROTATIONS') {
    availableScopes.push('PAIR');
  }
  if (roomState.currentPhase === 'PRIVATE_TABLE' || roomState.currentPhase === 'PRIVATE_TABLES') {
    availableScopes.push('PRIVATE_TABLE');
  }

  // Start Session Validation
  const guests = roomState.players.filter((p: any) => p.role === 'GUEST');
  let canStart = false;
  let missingReq = '';
  if (roomState.mode === 'DUO_TABLE') {
    if (guests.length !== 2) {
      missingReq = `Cần đủ 2 khách xem mắt (hiện có: ${guests.length}/2)`;
    } else if (!guests.every((g: any) => g.isReady)) {
      missingReq = 'Cả hai khách đều cần bấm Sẵn sàng';
    } else {
      canStart = true;
    }
  } else {
    if (guests.length < 4 || guests.length > 6) {
      missingReq = `Cần từ 4 đến 6 khách xem mắt (hiện có: ${guests.length})`;
    } else if (!guests.every((g: any) => g.isReady)) {
      missingReq = 'Tất cả khách cần bấm Sẵn sàng';
    } else {
      canStart = true;
    }
  }

  return (
    <div className="w-screen h-screen relative bg-[#1e130c] overflow-hidden select-none">
      {/* 3D Scene Viewport */}
      <div className="absolute inset-0 z-0">
        <TeaRoomCanvas
          mode={roomState.mode}
          theme={roomState.theme}
          players={roomState.players}
          currentUserId={currentUser?.id || ''}
          onMoveIntent={(x, z) => room?.send('INTENT_MOVE', { x, z })}
          onSitIntent={seatId => room?.send('INTENT_SIT', { seatId })}
          onSelectPlayer={targetId => {
            if (targetId !== currentUser?.id) {
              const target = roomState.players.find((p: any) => p.userId === targetId);
              setModerationTarget(target);
            }
          }}
        />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between pointer-events-none">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#26140b]/85 border border-amber-900/60 rounded-2xl px-3.5 py-2 shadow-lg backdrop-blur-md">
            <span className="text-xl">🍵</span>
            <div>
              <h1 className="font-oriental font-bold text-amber-200 text-sm tracking-wide leading-none">
                Trà Duyên
              </h1>
              <span className="text-[10px] text-stone-400 font-sans">
                {roomState.roomName} • {roomState.roomCode}
              </span>
            </div>
          </div>

          <button
            onClick={() => setRoomListOpen(true)}
            className="flex items-center gap-1.5 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl px-3 py-2 text-xs text-amber-200 transition-colors shadow-lg backdrop-blur-md"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Phòng Trà</span>
          </button>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Leaf Balance Badge */}
          <button
            onClick={() => setWardrobeOpen(true)}
            className="flex items-center gap-1.5 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl px-3 py-2 text-xs text-emerald-300 transition-colors shadow-lg backdrop-blur-md"
            title="Số Lá Trà hiện có. Bấm để mở Tủ đồ & Phụ kiện"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{leafBalance}</span>
          </button>

          {/* Wardrobe */}
          <button
            onClick={() => setWardrobeOpen(true)}
            className="p-2 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl text-amber-300 transition-colors shadow-lg backdrop-blur-md"
            title="Kỳ Trân Các (Tủ đồ)"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Social (Friends & Cards) */}
          <button
            onClick={() => setSocialOpen(true)}
            className="p-2 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl text-amber-300 transition-colors shadow-lg backdrop-blur-md"
            title="Bạn bè & Danh thiếp"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Appearance Customizer */}
          <button
            onClick={() => setCustomizerOpen(true)}
            className="p-2 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl text-amber-300 transition-colors shadow-lg backdrop-blur-md"
            title="Tùy chỉnh diện mạo cổ trang"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Etiquette & Guide */}
          <button
            onClick={() => setGuideOpen(true)}
            className="p-2 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl text-amber-300 transition-colors shadow-lg backdrop-blur-md"
            title="Quy tắc & Nghi thức"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Admin Dashboard */}
          {currentUser?.isAdmin && (
            <button
              onClick={() => setAdminOpen(true)}
              className="p-2 bg-red-950/80 hover:bg-red-900 border border-red-800/60 rounded-2xl text-red-200 transition-colors shadow-lg backdrop-blur-md"
              title="Quản trị viên"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {/* User Profile */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 bg-[#26140b]/85 hover:bg-[#381e13] border border-amber-900/60 rounded-2xl px-3 py-1.5 text-xs text-amber-200 transition-colors shadow-lg backdrop-blur-md"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span className="font-semibold max-w-[90px] truncate hidden sm:inline">
              {currentUser?.nickname || 'Khách'}
            </span>
          </button>
        </div>
      </header>

      {/* FLOATING OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none p-4 pt-16 flex flex-col justify-between">
        {/* Top/Center: Activity or Lobby State */}
        <div className="flex justify-end pointer-events-auto">
          {roomState.status === 'LOBBY' ? (
            <LobbyPanel
              roomCode={roomState.roomCode}
              roomName={roomState.roomName}
              mode={roomState.mode}
              myRole={myPlayer?.role || 'GUEST'}
              mySeatId={myPlayer?.seatId}
              isReady={!!myPlayer?.isReady}
              isHost={isHost}
              canStart={canStart}
              missingRequirements={missingReq}
              onSetRole={role => room?.send('INTENT_SET_ROLE', { role })}
              onToggleReady={ready => room?.send('INTENT_SET_READY', { ready })}
              onStartSession={() => room?.send('INTENT_START_SESSION')}
            />
          ) : (
            <ActivityPanel
              mode={roomState.mode}
              currentPhase={roomState.currentPhase}
              phaseDeadline={roomState.phaseDeadline}
              selectedTeaId={roomState.selectedTeaId}
              currentQuestionId={roomState.currentQuestionId}
              selectedScenarioId={roomState.selectedScenarioId}
              currentRound={roomState.currentRound}
              totalRounds={roomState.totalRounds}
              isHostOrMatchmaker={isHost || myPlayer?.role === 'MATCHMAKER'}
              myUserId={currentUser?.id || ''}
              players={roomState.players}
              pairings={roomState.pairings}
              onAdvancePhase={() => room?.send('INTENT_ADVANCE_PHASE')}
              onSubmitMenu={pastryId => room?.send('INTENT_SUBMIT_MENU', { pastryId })}
              onSubmitScenario={choiceId => room?.send('INTENT_SUBMIT_SCENARIO', { choiceId })}
              onSubmitDecision={wantMeetAgain => room?.send('INTENT_SUBMIT_DECISION', { wantMeetAgain })}
              onSubmitSelection={chosenUserId => room?.send('INTENT_SUBMIT_SELECTION', { chosenUserId })}
              onOpenContactShare={recipientId => {
                setContactRecipientId(recipientId);
                setSocialOpen(true);
              }}
              onOpenFriendModal={() => setSocialOpen(true)}
            />
          )}
        </div>

        {/* Bottom Left: Scoped Chat Panel */}
        <div className="pointer-events-auto flex items-end justify-between">
          <ChatPanel
            messages={roomState.messages}
            currentScope={chatScope}
            availableScopes={availableScopes}
            myUserId={currentUser?.id || ''}
            onScopeChange={s => setChatScope(s)}
            onSendChat={(scope, text) => room?.send('INTENT_CHAT', { scope, text })}
            onSendEmote={emoteName => room?.send('INTENT_EMOTE', { emoteName })}
          />

          {/* Quick Interaction Helper Pill */}
          <div className="hidden md:flex bg-[#26140b]/80 border border-amber-900/40 rounded-xl px-3 py-1.5 text-[11px] text-stone-400 backdrop-blur-sm gap-3">
            <span>🖱️ Bấm sàn để di chuyển</span>
            <span>•</span>
            <span>🪑 Bấm ghế để ngồi</span>
            <span>•</span>
            <span>👤 Bấm nhã khách khác để tương tác</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(user, token) => {
          setCurrentUser(user);
          setSessionToken(token);
          loadLeafBalance();
        }}
      />

      <CharacterCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        currentAppearance={currentUser?.appearance}
        onSaved={app => {
          setCurrentUser({ ...currentUser, appearance: app });
          if (room) {
            room.send('INTENT_UPDATE_APPEARANCE', { appearance: app });
          }
        }}
      />

      <RoomListModal
        isOpen={roomListOpen}
        onClose={() => setRoomListOpen(false)}
        onJoinRoom={opts => joinRoom(opts)}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onProfileUpdated={() => checkSession()}
      />

      <SocialModal
        isOpen={socialOpen}
        onClose={() => {
          setSocialOpen(false);
          setContactRecipientId(null);
        }}
        initialRecipientId={contactRecipientId}
      />

      <WardrobeModal
        isOpen={wardrobeOpen}
        onClose={() => setWardrobeOpen(false)}
        onItemEquipped={() => {
          loadLeafBalance();
          checkSession();
        }}
      />

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        isAdmin={!!currentUser?.isAdmin}
      />

      {moderationTarget && (
        <ModerationModal
          isOpen={!!moderationTarget}
          onClose={() => setModerationTarget(null)}
          targetUserId={moderationTarget.userId}
          targetNickname={moderationTarget.nickname}
          roomCode={roomState.roomCode}
        />
      )}
    </div>
  );
}
