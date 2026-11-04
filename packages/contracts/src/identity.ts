import { z } from 'zod';

export const GuestRegisterSchema = z.object({
  nickname: z.string().trim().min(2, 'Biệt danh ít nhất 2 ký tự').max(20, 'Biệt danh tối đa 20 ký tự'),
  avatarPresetId: z.string().default('preset_default_1'),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải xác nhận đủ tuổi tham gia trải nghiệm' })
  })
});

export type GuestRegisterInput = z.infer<typeof GuestRegisterSchema>;

export const EmailRegisterSchema = z.object({
  email: z.string().trim().email('Địa chỉ email không hợp lệ').toLowerCase(),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  nickname: z.string().trim().min(2, 'Biệt danh ít nhất 2 ký tự').max(20, 'Biệt danh tối đa 20 ký tự'),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải xác nhận đủ tuổi tham gia' })
  })
});

export type EmailRegisterInput = z.infer<typeof EmailRegisterSchema>;

export const EmailLoginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').toLowerCase(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export type EmailLoginInput = z.infer<typeof EmailLoginSchema>;

export const UpgradeGuestSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').toLowerCase(),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
});

export type UpgradeGuestInput = z.infer<typeof UpgradeGuestSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').toLowerCase()
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ')
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export interface AuthSessionResponse {
  id: string;
  isGuest: boolean;
  email?: string | null;
  isEmailVerified: boolean;
  isAdmin: boolean;
  nickname: string;
  avatarPresetId: string;
  createdAt: string;
}
