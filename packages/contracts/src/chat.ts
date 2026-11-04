import { z } from 'zod';

export const ChatScopeEnum = z.enum(['ROOM', 'PAIR', 'PRIVATE_TABLE']);
export type ChatScope = z.infer<typeof ChatScopeEnum>;

export const SendChatMessageSchema = z.object({
  scope: ChatScopeEnum,
  text: z.string().trim().min(1, 'Nội dung tin nhắn không được rỗng').max(300, 'Tin nhắn tối đa 300 ký tự')
});

export type SendChatMessageInput = z.infer<typeof SendChatMessageSchema>;

export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderNickname: string;
  senderPronoun: string;
  scope: ChatScope;
  pairId?: string;
  text: string;
  timestamp: number;
}
