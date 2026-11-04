import colyseus, { type Client } from 'colyseus';
const { Room } = colyseus;
import { TeaRoomState, PlayerSchema, PairingSchema, ChatMessageSchema } from './schema/TeaRoomState.js';
import { DuoTableStateMachine } from '@tra-duyen/game-domain';
import { GroupGatheringStateMachine } from '@tra-duyen/game-domain';
import { SeatingManager } from '@tra-duyen/game-domain';
import { TEA_VARIETIES, TEA_QUESTIONS, PASTRY_ITEMS, SCENARIO_CARDS } from '@tra-duyen/content';
import { IdentityService } from '../modules/identity/identity.service.js';
import { ProgressionService } from '../modules/progression/progression.service.js';
import { SocialService } from '../modules/social/social.service.js';
import crypto from 'crypto';

const RECONNECT_GRACE_PERIOD_SEC = 25;

export interface TeaRoomOptions {
  roomCode?: string;
  name?: string;
  mode?: 'DUO_TABLE' | 'GROUP_GATHERING';
  isPrivate?: boolean;
  theme?: 'LANTERN_FESTIVAL' | 'SPRING_TEA' | 'MOON_NIGHT';
  maxGuests?: number;
  hostUserId?: string;
}

export class TeaRoom extends Room<TeaRoomState> {
  maxClients = 8;
  private seatingManager!: SeatingManager;
  private duoStateMachine?: DuoTableStateMachine;
  private groupStateMachine?: GroupGatheringStateMachine;
  private identityService = new IdentityService();
  private progressionService = new ProgressionService();
  private socialService = new SocialService();

  // Server-only private secrets (never placed in public room state)
  private privateDuoDecisions = new Map<string, boolean>();
  private privateGroupSelections = new Map<string, string | null>();
  private privateMenuChoices = new Map<string, string>();
  private privateScenarioChoices = new Map<string, string>();
  private phaseTimerInterval?: NodeJS.Timeout;

  onCreate(options: TeaRoomOptions) {
    const state = new TeaRoomState();
    state.roomCode = options.roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    state.roomName = options.name || 'Trà Thất Tương Ngộ';
    state.mode = options.mode || 'DUO_TABLE';
    state.isPrivate = !!options.isPrivate;
    state.theme = options.theme || 'LANTERN_FESTIVAL';
    state.status = 'LOBBY';
    state.currentPhase = 'LOBBY';

    this.setState(state);
    this.seatingManager = new SeatingManager(state.mode as any);

    if (state.mode === 'DUO_TABLE') {
      this.duoStateMachine = new DuoTableStateMachine(options.hostUserId || '');
    } else {
      this.groupStateMachine = new GroupGatheringStateMachine(options.hostUserId || '');
    }

    this.setupMessageHandlers();
    this.startPhaseTicker();
  }

  async onAuth(client: Client, options: { token?: string }) {
    if (!options.token) {
      throw new Error('Yêu cầu xác thực phiên đăng nhập');
    }
    const session = await this.identityService.validateSession(options.token);
    if (!session) {
      throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    return {
      userId: session.identity.id,
      nickname: session.profile?.nickname || 'Khách bộ hành',
      pronoun: session.profile?.pronoun || 'Các hạ',
      appearanceJson: session.profile?.appearanceJson || '{}',
      isGuest: session.identity.isGuest
    };
  }

  onJoin(client: Client, options: any, auth: any) {
    // Check if user is already connected in another tab
    for (const [existingSessionId, existingPlayer] of this.state.players.entries()) {
      if (existingPlayer.userId === auth.userId) {
        // Disconnect prior tab to enforce 1 connection per identity (Section 19: "Một identity không chiếm nhiều ghế")
        const priorClient = this.clients.find(c => c.sessionId === existingSessionId);
        if (priorClient) {
          priorClient.send('SYSTEM_NOTIFICATION', {
            type: 'INFO',
            text: 'Bạn đã đăng nhập ở một cửa sổ khác. Cửa sổ này đã được ngắt kết nối.'
          });
          priorClient.leave(4001);
        }
        this.state.players.delete(existingSessionId);
        break;
      }
    }

    const isFirstPlayer = this.state.players.size === 0;
    const role = isFirstPlayer ? 'HOST' : 'GUEST';

    if (isFirstPlayer) {
      this.state.hostUserId = auth.userId;
    }

    const player = new PlayerSchema();
    player.sessionId = client.sessionId;
    player.userId = auth.userId;
    player.nickname = auth.nickname;
    player.pronoun = auth.pronoun;
    player.role = role;
    player.appearanceJson = auth.appearanceJson;
    player.isConnected = true;

    // Default entrance coordinate near tea room door
    player.x = 0;
    player.y = 0;
    player.z = 4.5;
    player.animation = 'idle';

    this.state.players.set(client.sessionId, player);

    // Auto-claim Host seat if first player
    if (isFirstPlayer) {
      const seatRes = this.seatingManager.claimSeat(auth.userId, 'SEAT_HOST', 'HOST');
      if (seatRes.success) {
        player.seatId = 'SEAT_HOST';
        const def = this.seatingManager.getSeat('SEAT_HOST');
        if (def) {
          player.x = def.position.x;
          player.y = def.position.y;
          player.z = def.position.z;
          player.animation = 'sit_wait';
        }
      }
    }

    this.broadcastSystemMessage(`${player.nickname} (${player.pronoun}) đã bước vào phòng trà.`);
  }

  private setupMessageHandlers() {
    // 1. Movement intent
    this.onMessage('INTENT_MOVE', (client, data: { x: number; z: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Stand up if currently seated
      if (player.seatId) {
        this.seatingManager.releaseSeat(player.userId);
        player.seatId = '';
      }

      // Bound movement to tea room limits [-5.5, 5.5]
      const clampedX = Math.max(-5.5, Math.min(5.5, data.x));
      const clampedZ = Math.max(-5.5, Math.min(5.5, data.z));

      // Calculate rotation toward target
      const dx = clampedX - player.x;
      const dz = clampedZ - player.z;
      if (Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05) {
        player.rotationY = Math.atan2(dx, dz);
        player.animation = 'walk';
      }

      player.x = clampedX;
      player.z = clampedZ;
    });

    // 2. Sit intent
    this.onMessage('INTENT_SIT', (client, data: { seatId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const res = this.seatingManager.claimSeat(player.userId, data.seatId, player.role as any);
      if (!res.success) {
        client.send('ERROR_MESSAGE', { message: res.error });
        return;
      }

      player.seatId = data.seatId;
      const seatDef = this.seatingManager.getSeat(data.seatId);
      if (seatDef) {
        player.x = seatDef.position.x;
        player.y = seatDef.position.y;
        player.z = seatDef.position.z;
        const dx = seatDef.lookAt.x - seatDef.position.x;
        const dz = seatDef.lookAt.z - seatDef.position.z;
        player.rotationY = Math.atan2(dx, dz);
        player.animation = 'sit_wait';
      }
    });

    // 3. Stand intent
    this.onMessage('INTENT_STAND', client => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !player.seatId) return;

      this.seatingManager.releaseSeat(player.userId);
      player.seatId = '';
      player.y = 0;
      player.animation = 'idle';
    });

    // 4. Set role (LOBBY only)
    this.onMessage('INTENT_SET_ROLE', (client, data: { role: 'HOST' | 'MATCHMAKER' | 'GUEST' }) => {
      if (this.state.status !== 'LOBBY') return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Only current host can transfer host role
      if (data.role === 'HOST' && player.userId !== this.state.hostUserId) {
        client.send('ERROR_MESSAGE', { message: 'Chỉ chủ quán hiện tại mới có thể chuyển quyền chủ quán' });
        return;
      }

      if (player.seatId) {
        this.seatingManager.releaseSeat(player.userId);
        player.seatId = '';
      }

      player.role = data.role;
      if (data.role === 'MATCHMAKER') {
        this.state.matchmakerUserId = player.userId;
      }
    });

    // 5. Toggle ready
    this.onMessage('INTENT_SET_READY', (client, data: { ready: boolean }) => {
      if (this.state.status !== 'LOBBY') return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.isReady = !!data.ready;
    });

    // 6. Start session (Host only)
    this.onMessage('INTENT_START_SESSION', client => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.userId !== this.state.hostUserId) {
        client.send('ERROR_MESSAGE', { message: 'Chỉ chủ quán mới có quyền bắt đầu buổi trà' });
        return;
      }

      this.handleStartSession(client);
    });

    // 7. Advance phase (Host or Matchmaker)
    this.onMessage('INTENT_ADVANCE_PHASE', client => {
      const player = this.state.players.get(client.sessionId);
      if (!player || (player.role !== 'HOST' && player.role !== 'MATCHMAKER')) {
        return;
      }
      this.advanceCurrentPhase();
    });

    // 8. Submit menu choice (Secret)
    this.onMessage('INTENT_SUBMIT_MENU', (client, data: { pastryId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !data.pastryId) return;

      this.privateMenuChoices.set(player.userId, data.pastryId);
      if (this.duoStateMachine) {
        this.duoStateMachine.submitMenuChoice(player.userId, data.pastryId);
        if (this.duoStateMachine.areBothMenuSubmitted()) {
          this.advanceCurrentPhase();
        }
      }
    });

    // 9. Submit scenario choice
    this.onMessage('INTENT_SUBMIT_SCENARIO', (client, data: { choiceId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !data.choiceId) return;

      this.privateScenarioChoices.set(player.userId, data.choiceId);
      if (this.duoStateMachine) {
        this.duoStateMachine.submitScenarioChoice(player.userId, data.choiceId);
      }
    });

    // 10. Submit secret decision (Duo table: meet again)
    this.onMessage('INTENT_SUBMIT_DECISION', (client, data: { wantMeetAgain: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || this.state.currentPhase !== 'PRIVATE_DECISION') return;

      this.privateDuoDecisions.set(player.userId, !!data.wantMeetAgain);
      if (this.duoStateMachine) {
        this.duoStateMachine.submitDecision(player.userId, !!data.wantMeetAgain);
      }

      // Trigger uniform card-placing animation for both yes and no (Section 15: "Animation bỏ thiệp vào hộp giống nhau cho mọi lựa chọn, không rò phiếu qua hiệu ứng")
      player.animation = 'give_card';
      setTimeout(() => {
        if (player.isConnected) player.animation = 'sit_wait';
      }, 2000);

      client.send('SUBMISSION_CONFIRMED', { phase: 'PRIVATE_DECISION' });

      if (this.duoStateMachine && this.duoStateMachine.areBothDecisionsSubmitted()) {
        this.advanceCurrentPhase();
      }
    });

    // 11. Submit secret selection (Group gathering: pick at most 1 person)
    this.onMessage('INTENT_SUBMIT_SELECTION', (client, data: { chosenUserId: string | null }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || this.state.currentPhase !== 'PRIVATE_SELECTION') return;

      this.privateGroupSelections.set(player.userId, data.chosenUserId);
      if (this.groupStateMachine) {
        this.groupStateMachine.submitSelection(player.userId, data.chosenUserId);
      }

      player.animation = 'give_card';
      setTimeout(() => {
        if (player.isConnected) player.animation = 'sit_wait';
      }, 2000);

      client.send('SUBMISSION_CONFIRMED', { phase: 'PRIVATE_SELECTION' });

      if (this.groupStateMachine && this.groupStateMachine.allSelectionsSubmitted()) {
        this.advanceCurrentPhase();
      }
    });

    // 12. Emotes
    this.onMessage('INTENT_EMOTE', (client, data: { emoteName: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const validAnimations = [
        'bow',
        'sip_tea',
        'offer_tea',
        'offer_snack',
        'give_card',
        'receive_card',
        'nod',
        'clap',
        'gentle_decline'
      ];

      const anim = data.emoteName.toLowerCase();
      if (validAnimations.includes(anim)) {
        player.animation = anim;
        setTimeout(() => {
          if (player.isConnected) {
            player.animation = player.seatId ? 'sit_wait' : 'idle';
          }
        }, 3000);
      }
    });

    // 13. Scoped Chat
    this.onMessage('INTENT_CHAT', (client, data: { scope: 'ROOM' | 'PAIR' | 'PRIVATE_TABLE'; text: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const cleanText = (data.text || '').trim().slice(0, 300);
      if (!cleanText) return;

      this.handleScopedChat(player, data.scope, cleanText);
    });
  }

  private handleStartSession(hostClient: Client) {
    if (this.state.mode === 'DUO_TABLE' && this.duoStateMachine) {
      const guests = Array.from(this.state.players.values()).filter(p => p.role === 'GUEST');
      if (guests.length !== 2) {
        hostClient.send('ERROR_MESSAGE', { message: 'Chế độ Bàn Đôi cần chính xác 2 khách tham gia' });
        return;
      }
      if (!guests.every(g => g.isReady)) {
        hostClient.send('ERROR_MESSAGE', { message: 'Cả hai khách cần bấm Sẵn sàng trước khi bắt đầu' });
        return;
      }

      const matchmaker = Array.from(this.state.players.values()).find(p => p.role === 'MATCHMAKER');
      const started = this.duoStateMachine.start(guests[0].userId, guests[1].userId, matchmaker?.userId);
      if (!started) return;

      this.state.status = 'IN_PROGRESS';
      this.state.currentPhase = this.duoStateMachine.currentPhase;
      this.state.phaseDeadline = this.duoStateMachine.getContext().phaseDeadline || 0;

      this.broadcastSystemMessage('Buổi trà bàn đôi chính thức bắt đầu. Chúc nhã khách tương duyên tương tri.');
    } else if (this.state.mode === 'GROUP_GATHERING' && this.groupStateMachine) {
      const guests = Array.from(this.state.players.values()).filter(p => p.role === 'GUEST');
      if (guests.length < 4 || guests.length > 6) {
        hostClient.send('ERROR_MESSAGE', { message: 'Chế độ Xem Mắt Chung cần từ 4 đến 6 khách' });
        return;
      }
      if (!guests.every(g => g.isReady)) {
        hostClient.send('ERROR_MESSAGE', { message: 'Tất cả các khách cần bấm Sẵn sàng' });
        return;
      }

      const guestIds = guests.map(g => g.userId);
      const started = this.groupStateMachine.start(guestIds);
      if (!started) return;

      this.state.status = 'IN_PROGRESS';
      this.state.currentPhase = this.groupStateMachine.currentPhase;
      this.state.phaseDeadline = this.groupStateMachine.getContext().phaseDeadline || 0;
      this.state.totalRounds = 3;

      this.broadcastSystemMessage('Tiệc xem mắt chung khai tiệc. Kính chúc các vị nhã khách tương phùng tao ngộ.');
    }
  }

  private advanceCurrentPhase() {
    if (this.state.mode === 'DUO_TABLE' && this.duoStateMachine) {
      const current = this.duoStateMachine.currentPhase;

      if (current === 'INTRODUCTION') {
        const tea = TEA_VARIETIES[Math.floor(Math.random() * TEA_VARIETIES.length)];
        const question = TEA_QUESTIONS[Math.floor(Math.random() * TEA_QUESTIONS.length)];
        this.duoStateMachine.setTeaAndIcebreaker(tea.id, question.id);
        this.state.selectedTeaId = tea.id;
        this.state.currentQuestionId = question.id;
        this.broadcastSystemMessage(`Khai trà: ${tea.name}. Đàm đạo chủ đề: "${question.text}"`);
      } else if (current === 'TEA_ICEBREAKER') {
        this.duoStateMachine.goToMenuTogether();
        this.broadcastSystemMessage('Đồng tâm chọn món: Hãy chọn một món điểm tâm mà bạn yêu thích.');
      } else if (current === 'MENU_TOGETHER') {
        const scenario = SCENARIO_CARDS[Math.floor(Math.random() * SCENARIO_CARDS.length)];
        this.duoStateMachine.goToScenarioCard(scenario.id);
        this.state.selectedScenarioId = scenario.id;
        this.broadcastSystemMessage(`Thẻ tình huống: ${scenario.title}. "${scenario.context}"`);
      } else if (current === 'SCENARIO_CARD') {
        this.duoStateMachine.goToPrivateDecision();
        this.broadcastSystemMessage('Gửi thiệp hẹn kín: Hãy đưa ra lựa chọn của bạn vào hộp gấm.');
      } else if (current === 'PRIVATE_DECISION') {
        const res = this.duoStateMachine.resolveResult();
        this.state.currentPhase = 'RESULT';
        if (res.isMutualMatch) {
          this.broadcastSystemMessage('Nhị vị tương hợp ý đầu! Bàn trà riêng sau bình phong đã được mở.');
          setTimeout(() => {
            this.duoStateMachine?.enterPrivateTableOrFinish();
            this.state.currentPhase = 'PRIVATE_TABLE';
          }, 3000);
        } else {
          this.broadcastSystemMessage('Hữu duyên tao ngộ, tri kỷ tương phùng. Cảm tạ hai vị đã cùng sẻ chia chén trà ấm.');
          setTimeout(() => {
            this.finishSession();
          }, 4000);
        }
      } else if (current === 'PRIVATE_TABLE') {
        this.finishSession();
      }

      this.state.currentPhase = this.duoStateMachine.currentPhase;
      this.state.phaseDeadline = this.duoStateMachine.getContext().phaseDeadline || 0;
    } else if (this.state.mode === 'GROUP_GATHERING' && this.groupStateMachine) {
      const current = this.groupStateMachine.currentPhase;

      if (current === 'GROUP_INTRODUCTION') {
        this.groupStateMachine.goToGroupIcebreaker();
        const question = TEA_QUESTIONS[Math.floor(Math.random() * TEA_QUESTIONS.length)];
        this.state.currentQuestionId = question.id;
        this.broadcastSystemMessage(`Đàm đạo khai tiệc: "${question.text}"`);
      } else if (current === 'GROUP_ICEBREAKER' || current === 'PAIR_ROTATIONS') {
        const topics = [
          { title: 'Chuyện Cuộc Sống', prompt: 'Điều gì khiến bạn thấy bình yên nhất sau một ngày dài?' },
          { title: 'Sở Thích & Du Ngoạn', prompt: 'Một nơi bạn luôn muốn đến cùng người đặc biệt?' },
          { title: 'Tri Kỷ & Nhân Duyên', prompt: 'Phẩm chất nào bạn trân trọng nhất ở người bạn đời?' }
        ];

        this.groupStateMachine.nextRotation(topics);
        this.state.currentPhase = this.groupStateMachine.currentPhase;
        this.state.currentRound = this.groupStateMachine.getContext().currentRound;

        // Sync pairings to schema
        this.state.pairings.clear();
        for (const p of this.groupStateMachine.getContext().currentPairs) {
          const pairSchema = new PairingSchema();
          pairSchema.pairId = p.pairId;
          pairSchema.user1Id = p.user1Id;
          pairSchema.user2Id = p.user2Id;
          pairSchema.topicTitle = p.topicTitle;
          pairSchema.topicPrompt = p.topicPrompt;
          this.state.pairings.push(pairSchema);
        }

        if (this.state.currentPhase === 'PAIR_ROTATIONS') {
          this.broadcastSystemMessage(`Bắt đầu lượt trò chuyện đôi thứ ${this.state.currentRound}/3.`);
        } else if (this.state.currentPhase === 'PRIVATE_SELECTION') {
          this.broadcastSystemMessage('Chọn duyên kín: Hãy chọn tối đa 1 người bạn muốn gặp lại hoặc chọn không chọn ai.');
        }
      } else if (current === 'PRIVATE_SELECTION') {
        const matches = this.groupStateMachine.resolveResult();
        this.state.currentPhase = 'RESULT';

        if (matches.length > 0) {
          this.broadcastSystemMessage(`Kết quả: Có ${matches.length} cặp đôi đã tương hợp mở bàn riêng sau bình phong!`);
          setTimeout(() => {
            this.groupStateMachine?.enterPrivateTablesOrFinish();
            this.state.currentPhase = 'PRIVATE_TABLES';
          }, 3000);
        } else {
          this.broadcastSystemMessage('Hôm nay hữu duyên tương ngộ, cảm tạ chư vị khách quý đã cùng tề tựu đàm đạo.');
          setTimeout(() => {
            this.finishSession();
          }, 4000);
        }
      } else if (current === 'PRIVATE_TABLES') {
        this.finishSession();
      }

      this.state.currentPhase = this.groupStateMachine.currentPhase;
      this.state.phaseDeadline = this.groupStateMachine.getContext().phaseDeadline || 0;
    }
  }

  private async finishSession() {
    this.state.status = 'FINISHED';
    this.state.currentPhase = 'FINISHED';
    this.broadcastSystemMessage('Buổi thưởng trà đã hoàn thành viên mãn.');

    // Award leaves for participating players
    for (const player of this.state.players.values()) {
      try {
        await this.progressionService.awardSessionCompletion(
          {
            userId: player.userId,
            isHostOrMatchmaker: player.role === 'HOST' || player.role === 'MATCHMAKER',
            completedFullSession: true,
            leftEarlyDueToBlockOrReport: false
          },
          this.state.roomCode
        );
      } catch (err) {
        console.error('Failed to award completion reward to', player.userId, err);
      }
    }
  }

  private handleScopedChat(player: PlayerSchema, scope: 'ROOM' | 'PAIR' | 'PRIVATE_TABLE', text: string) {
    const msgId = crypto.randomUUID();
    const timestamp = Date.now();

    if (scope === 'ROOM') {
      const chatSchema = new ChatMessageSchema();
      chatSchema.id = msgId;
      chatSchema.senderId = player.userId;
      chatSchema.senderNickname = player.nickname;
      chatSchema.senderPronoun = player.pronoun;
      chatSchema.scope = 'ROOM';
      chatSchema.text = text;
      chatSchema.timestamp = timestamp;

      this.state.messages.push(chatSchema);
      // Keep bounded memory chat in state (max 50)
      if (this.state.messages.length > 50) {
        this.state.messages.shift();
      }
    } else if (scope === 'PAIR') {
      // Find pair that contains this player
      const activePairs = this.state.pairings;
      const myPair = activePairs.find(p => p.user1Id === player.userId || p.user2Id === player.userId);
      if (!myPair) return;

      const partnerId = myPair.user1Id === player.userId ? myPair.user2Id : myPair.user1Id;
      const partnerClient = this.clients.find(c => {
        const p = this.state.players.get(c.sessionId);
        return p && p.userId === partnerId;
      });
      const senderClient = this.clients.find(c => c.sessionId === player.sessionId);

      const payload = {
        id: msgId,
        senderId: player.userId,
        senderNickname: player.nickname,
        senderPronoun: player.pronoun,
        scope: 'PAIR',
        pairId: myPair.pairId,
        text,
        timestamp
      };

      senderClient?.send('SCOPED_CHAT_MESSAGE', payload);
      partnerClient?.send('SCOPED_CHAT_MESSAGE', payload);
    } else if (scope === 'PRIVATE_TABLE') {
      // Find partner in mutual match
      let partnerId: string | undefined;

      if (this.duoStateMachine && this.state.currentPhase === 'PRIVATE_TABLE') {
        const ctx = this.duoStateMachine.getContext();
        if (ctx.isMutualMatch) {
          partnerId = player.userId === ctx.guest1UserId ? ctx.guest2UserId : ctx.guest1UserId;
        }
      } else if (this.groupStateMachine && this.state.currentPhase === 'PRIVATE_TABLES') {
        const matches = this.groupStateMachine.getContext().mutualMatches;
        const myMatch = matches.find(([u1, u2]) => u1 === player.userId || u2 === player.userId);
        if (myMatch) {
          partnerId = myMatch[0] === player.userId ? myMatch[1] : myMatch[0];
        }
      }

      if (!partnerId) return;

      const partnerClient = this.clients.find(c => {
        const p = this.state.players.get(c.sessionId);
        return p && p.userId === partnerId;
      });
      const senderClient = this.clients.find(c => c.sessionId === player.sessionId);

      const payload = {
        id: msgId,
        senderId: player.userId,
        senderNickname: player.nickname,
        senderPronoun: player.pronoun,
        scope: 'PRIVATE_TABLE',
        text,
        timestamp
      };

      senderClient?.send('SCOPED_CHAT_MESSAGE', payload);
      partnerClient?.send('SCOPED_CHAT_MESSAGE', payload);
    }
  }

  private broadcastSystemMessage(text: string) {
    const chat = new ChatMessageSchema();
    chat.id = crypto.randomUUID();
    chat.senderId = 'SYSTEM';
    chat.senderNickname = 'Trà Điếm Đồng Tử';
    chat.senderPronoun = 'Hệ Thống';
    chat.scope = 'ROOM';
    chat.text = text;
    chat.timestamp = Date.now();
    this.state.messages.push(chat);
  }

  private startPhaseTicker() {
    this.phaseTimerInterval = setInterval(() => {
      if (this.state.status === 'IN_PROGRESS' && this.state.phaseDeadline > 0) {
        if (Date.now() >= this.state.phaseDeadline) {
          this.advanceCurrentPhase();
        }
      }
    }, 1000);
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.isConnected = false;

    if (consented) {
      // Clean leave
      this.cleanupPlayer(client.sessionId);
    } else {
      // Temporary disconnect with grace period
      try {
        await this.allowReconnection(client, RECONNECT_GRACE_PERIOD_SEC);
        player.isConnected = true;
      } catch {
        this.cleanupPlayer(client.sessionId);
      }
    }
  }

  private cleanupPlayer(sessionId: string) {
    const player = this.state.players.get(sessionId);
    if (!player) return;

    if (player.seatId) {
      this.seatingManager.releaseSeat(player.userId);
    }

    this.state.players.delete(sessionId);
    this.broadcastSystemMessage(`${player.nickname} đã rời khỏi phòng trà.`);

    // If host leaves, transfer host to next player
    if (player.userId === this.state.hostUserId && this.state.players.size > 0) {
      const nextPlayer = Array.from(this.state.players.values())[0];
      this.state.hostUserId = nextPlayer.userId;
      nextPlayer.role = 'HOST';
      this.broadcastSystemMessage(`${nextPlayer.nickname} hiện là chủ quán mới của phòng trà.`);
    }

    if (this.state.players.size === 0) {
      this.disconnect();
    }
  }

  onDispose() {
    if (this.phaseTimerInterval) {
      clearInterval(this.phaseTimerInterval);
    }
  }
}
