import { describe, it, expect } from 'vitest';
import {
  GuestRegisterSchema,
  EmailRegisterSchema,
  UpdateProfileSchema,
  CreateReportSchema,
  ShareContactCardSchema
} from '../src/index.js';

describe('Contracts Zod Schemas Validation', () => {
  it('validates GuestRegisterSchema correctly', () => {
    // Valid input
    const valid = GuestRegisterSchema.safeParse({
      nickname: 'Tiêu Dao Tử',
      avatarPresetId: 'preset_default_1',
      ageConfirmed: true
    });
    expect(valid.success).toBe(true);

    // Short nickname fails
    const shortNick = GuestRegisterSchema.safeParse({
      nickname: 'A',
      ageConfirmed: true
    });
    expect(shortNick.success).toBe(false);

    // Unconfirmed age fails
    const noAge = GuestRegisterSchema.safeParse({
      nickname: 'Hợp Lệ',
      ageConfirmed: false
    });
    expect(noAge.success).toBe(false);
  });

  it('validates EmailRegisterSchema password length and email format', () => {
    // Short password fails
    const shortPass = EmailRegisterSchema.safeParse({
      email: 'valid@example.com',
      password: '123',
      nickname: 'Bạch Lạc',
      ageConfirmed: true
    });
    expect(shortPass.success).toBe(false);

    // Invalid email fails
    const badEmail = EmailRegisterSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
      nickname: 'Bạch Lạc',
      ageConfirmed: true
    });
    expect(badEmail.success).toBe(false);
  });

  it('validates ShareContactCardSchema', () => {
    const card = ShareContactCardSchema.safeParse({
      recipientUserId: 'target_123',
      channelsToShare: {
        telegram: true,
        phone: false,
        email: false,
        zalo: false,
        social: false
      },
      note: 'Hân hạnh làm quen!'
    });
    expect(card.success).toBe(true);
  });

  it('validates CreateReportSchema', () => {
    const rep = CreateReportSchema.safeParse({
      reportedUserId: 'bad_user',
      reason: 'HARASSMENT',
      detail: 'Sử dụng từ ngữ không phù hợp'
    });
    expect(rep.success).toBe(true);
  });
});
