import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

export class PlayerSchema extends Schema {
  @type('string') sessionId: string = '';
  @type('string') userId: string = '';
  @type('string') nickname: string = '';
  @type('string') pronoun: string = 'Các hạ';
  @type('string') role: string = 'GUEST';
  @type('string') seatId: string = '';
  @type('boolean') isReady: boolean = false;
  @type('boolean') isConnected: boolean = true;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;
  @type('number') rotationY: number = 0;
  @type('string') animation: string = 'idle';
  @type('string') appearanceJson: string = '{}';
}

export class PairingSchema extends Schema {
  @type('string') pairId: string = '';
  @type('string') user1Id: string = '';
  @type('string') user2Id: string = '';
  @type('string') topicTitle: string = '';
  @type('string') topicPrompt: string = '';
}

export class ChatMessageSchema extends Schema {
  @type('string') id: string = '';
  @type('string') senderId: string = '';
  @type('string') senderNickname: string = '';
  @type('string') senderPronoun: string = '';
  @type('string') scope: string = 'ROOM';
  @type('string') pairId: string = '';
  @type('string') text: string = '';
  @type('number') timestamp: number = 0;
}

export class TeaRoomState extends Schema {
  @type('string') roomCode: string = '';
  @type('string') roomName: string = '';
  @type('string') mode: string = 'DUO_TABLE';
  @type('boolean') isPrivate: boolean = false;
  @type('string') status: string = 'LOBBY';
  @type('string') theme: string = 'LANTERN_FESTIVAL';
  @type('string') hostUserId: string = '';
  @type('string') matchmakerUserId: string = '';
  @type('string') currentPhase: string = 'LOBBY';
  @type('number') phaseDeadline: number = 0;
  @type('string') selectedTeaId: string = '';
  @type('string') currentQuestionId: string = '';
  @type('string') selectedScenarioId: string = '';
  @type('number') currentRound: number = 0;
  @type('number') totalRounds: number = 0;

  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type([PairingSchema]) pairings = new ArraySchema<PairingSchema>();
  @type([ChatMessageSchema]) messages = new ArraySchema<ChatMessageSchema>();
}
