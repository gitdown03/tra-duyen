import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from '../../persistence/prisma.js';
import { MailService } from './mail.service.js';
import { APPEARANCE_PRESETS } from '@tra-duyen/content';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for email verify / reset

export class IdentityService {
  private prisma = getPrismaClient();
  private mail = MailService.getInstance();

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createGuest(nickname: string, avatarPresetId = 'preset_default_1', ageConfirmed: boolean) {
    if (!ageConfirmed) {
      throw new Error('Bạn cần xác nhận đủ tuổi tham gia');
    }

    const preset = APPEARANCE_PRESETS.find(p => p.id === avatarPresetId) || APPEARANCE_PRESETS[0];
    const sessionToken = this.generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const identity = await this.prisma.identity.create({
      data: {
        isGuest: true,
        sessions: {
          create: {
            token: sessionToken,
            expiresAt
          }
        },
        profile: {
          create: {
            nickname,
            pronoun: 'Các hạ',
            appearanceJson: JSON.stringify({
              genderPresentation: 'neutral',
              hairStyle: preset.hairStyle,
              hairColor: preset.hairColor,
              skinTone: preset.skinTone,
              outfitStyle: preset.outfitStyle,
              outfitPalette: preset.outfitPalette,
              accessory: preset.accessory,
              defaultExpression: preset.defaultExpression
            }),
            bio: 'Khách bộ hành ghé quán trà duyên.',
            interestsJson: JSON.stringify(['Mê đàm đạo trà']),
            conversationStyle: 'Nhã nhặn, lắng nghe',
            purpose: 'FRIENDSHIP'
          }
        },
        leafBalance: {
          create: {
            balance: 50, // Welcome gift
            earnedToday: 0
          }
        }
      },
      include: {
        profile: true
      }
    });

    return {
      identity,
      sessionToken
    };
  }

  async registerEmail(email: string, password: string, nickname: string, ageConfirmed: boolean) {
    if (!ageConfirmed) {
      throw new Error('Bạn cần xác nhận đủ tuổi tham gia');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.prisma.identity.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new Error('Địa chỉ email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = this.generateToken();
    const verificationTokenExpiry = new Date(Date.now() + TOKEN_TTL_MS);
    const sessionToken = this.generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const preset = APPEARANCE_PRESETS[0];

    const identity = await this.prisma.identity.create({
      data: {
        isGuest: false,
        email: normalizedEmail,
        passwordHash,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpiry,
        sessions: {
          create: {
            token: sessionToken,
            expiresAt
          }
        },
        profile: {
          create: {
            nickname,
            pronoun: 'Các hạ',
            appearanceJson: JSON.stringify({
              genderPresentation: 'neutral',
              hairStyle: preset.hairStyle,
              hairColor: preset.hairColor,
              skinTone: preset.skinTone,
              outfitStyle: preset.outfitStyle,
              outfitPalette: preset.outfitPalette,
              accessory: preset.accessory,
              defaultExpression: preset.defaultExpression
            }),
            bio: 'Trà thơm tri kỷ, tìm bạn đàm đạo.',
            interestsJson: JSON.stringify(['Mê đàm đạo trà', 'Yêu sách vở']),
            conversationStyle: 'Nhã nhặn, lắng nghe',
            purpose: 'FRIENDSHIP'
          }
        },
        leafBalance: {
          create: {
            balance: 100,
            earnedToday: 0
          }
        }
      },
      include: {
        profile: true
      }
    });

    await this.mail.sendVerificationEmail(normalizedEmail, verificationToken);

    return {
      identity,
      sessionToken,
      verificationToken
    };
  }

  async verifyEmail(token: string) {
    const identity = await this.prisma.identity.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!identity) {
      throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }

    const updated = await this.prisma.identity.update({
      where: { id: identity.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    return updated;
  }

  async loginEmail(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const identity = await this.prisma.identity.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true }
    });

    if (!identity || !identity.passwordHash) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    if (identity.isBanned) {
      throw new Error(`Tài khoản đã bị tạm khóa: ${identity.banReason || 'Vi phạm điều khoản cộng đồng'}`);
    }

    const isMatch = await bcrypt.compare(password, identity.passwordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const sessionToken = this.generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.prisma.authSession.create({
      data: {
        identityId: identity.id,
        token: sessionToken,
        expiresAt
      }
    });

    return {
      identity,
      sessionToken
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const identity = await this.prisma.identity.findUnique({
      where: { email: normalizedEmail }
    });

    // Do not reveal account existence
    if (!identity) {
      return { success: true };
    }

    const resetPasswordToken = this.generateToken();
    const resetPasswordExpiry = new Date(Date.now() + TOKEN_TTL_MS);

    await this.prisma.identity.update({
      where: { id: identity.id },
      data: {
        resetPasswordToken,
        resetPasswordExpiry
      }
    });

    await this.mail.sendPasswordResetEmail(normalizedEmail, resetPasswordToken);
    return { success: true, token: resetPasswordToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const identity = await this.prisma.identity.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date()
        }
      }
    });

    if (!identity) {
      throw new Error('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.identity.update({
        where: { id: identity.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpiry: null
        }
      }),
      // Revoke all prior sessions for security
      this.prisma.authSession.updateMany({
        where: { identityId: identity.id },
        data: { isRevoked: true }
      })
    ]);

    return { success: true };
  }

  async upgradeGuest(guestIdentityId: string, email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await this.prisma.identity.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingEmail) {
      throw new Error('Địa chỉ email này đã được sử dụng bởi một tài khoản khác');
    }

    const guest = await this.prisma.identity.findUnique({
      where: { id: guestIdentityId }
    });

    if (!guest || !guest.isGuest) {
      throw new Error('Tài khoản khách không tồn tại hoặc đã được nâng cấp');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = this.generateToken();
    const verificationTokenExpiry = new Date(Date.now() + TOKEN_TTL_MS);

    const updated = await this.prisma.identity.update({
      where: { id: guestIdentityId },
      data: {
        isGuest: false,
        email: normalizedEmail,
        passwordHash,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpiry
      },
      include: {
        profile: true,
        leafBalance: true
      }
    });

    await this.mail.sendVerificationEmail(normalizedEmail, verificationToken);
    return {
      identity: updated,
      verificationToken
    };
  }

  async validateSession(token: string) {
    if (!token) return null;

    const session = await this.prisma.authSession.findUnique({
      where: { token },
      include: {
        identity: {
          include: { profile: true }
        }
      }
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return null;
    }

    if (session.identity.isBanned) {
      return null;
    }

    return {
      session,
      identity: session.identity,
      profile: session.identity.profile
    };
  }

  async revokeSession(token: string) {
    if (!token) return;
    await this.prisma.authSession.updateMany({
      where: { token },
      data: { isRevoked: true }
    });
  }

  async deleteAccount(identityId: string) {
    await this.prisma.identity.delete({
      where: { id: identityId }
    });
  }
}
