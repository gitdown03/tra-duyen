import { getPrismaClient } from '../../persistence/prisma.js';
import { MediaService } from '../media/media.service.js';
import { ReportReason, ModerationReportDto } from '@tra-duyen/contracts';
import bcrypt from 'bcryptjs';

export class ModerationService {
  private prisma = getPrismaClient();
  private media = new MediaService();

  async submitReport(
    reporterId: string,
    reportedId: string,
    reason: ReportReason,
    detail: string,
    roomCode?: string,
    evidenceSnippet?: string
  ) {
    if (reporterId === reportedId) {
      throw new Error('Không thể tự báo cáo chính mình');
    }

    const report = await this.prisma.moderationReport.create({
      data: {
        reporterId,
        reportedId,
        roomCode: roomCode || null,
        reason,
        detail,
        evidenceSnippet: evidenceSnippet || null,
        status: 'PENDING'
      }
    });

    return report;
  }

  async verifyAdmin(adminIdentityId: string): Promise<boolean> {
    const identity = await this.prisma.identity.findUnique({
      where: { id: adminIdentityId }
    });
    return !!(identity && identity.isAdmin && !identity.isBanned);
  }

  async listReports(adminIdentityId: string): Promise<ModerationReportDto[]> {
    if (!(await this.verifyAdmin(adminIdentityId))) {
      throw new Error('Truy cập bị từ chối: Yêu cầu quyền quản trị viên');
    }

    const reports = await this.prisma.moderationReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { include: { profile: true } },
        reported: { include: { profile: true } }
      }
    });

    return reports.map(r => ({
      id: r.id,
      reporterUserId: r.reporterId,
      reporterNickname: r.reporter.profile?.nickname || 'Người chơi',
      reportedUserId: r.reportedId,
      reportedNickname: r.reported.profile?.nickname || 'Người chơi',
      roomCode: r.roomCode,
      reason: r.reason as ReportReason,
      detail: r.detail,
      evidenceSnippet: r.evidenceSnippet,
      status: r.status as any,
      createdAt: r.createdAt.toISOString()
    }));
  }

  async takeAdminAction(
    adminIdentityId: string,
    action: 'BAN_USER' | 'UNBAN_USER' | 'REMOVE_AVATAR' | 'RESOLVE_REPORT',
    targetUserId?: string,
    reportId?: string,
    reason?: string
  ) {
    if (!(await this.verifyAdmin(adminIdentityId))) {
      throw new Error('Truy cập bị từ chối: Yêu cầu quyền quản trị viên');
    }

    const actionReason = reason || 'Quản trị viên xử lý';

    if (action === 'BAN_USER' && targetUserId) {
      await this.prisma.identity.update({
        where: { id: targetUserId },
        data: {
          isBanned: true,
          banReason: actionReason
        }
      });
      // Revoke all sessions
      await this.prisma.authSession.updateMany({
        where: { identityId: targetUserId },
        data: { isRevoked: true }
      });
    } else if (action === 'UNBAN_USER' && targetUserId) {
      await this.prisma.identity.update({
        where: { id: targetUserId },
        data: {
          isBanned: false,
          banReason: null
        }
      });
    } else if (action === 'REMOVE_AVATAR' && targetUserId) {
      await this.media.removeAvatar(targetUserId);
    } else if (action === 'RESOLVE_REPORT' && reportId) {
      await this.prisma.moderationReport.update({
        where: { id: reportId },
        data: { status: 'RESOLVED' }
      });
    }

    await this.prisma.adminAuditLog.create({
      data: {
        adminIdentityId,
        action,
        targetId: targetUserId || reportId || null,
        reason: actionReason
      }
    });

    return { success: true };
  }

  async bootstrapInitialAdmin(adminInitToken: string, email: string, password: string, nickname: string) {
    const requiredToken = process.env.ADMIN_INIT_TOKEN;
    if (!requiredToken || adminInitToken !== requiredToken) {
      throw new Error('Mã bootstrap quản trị viên không chính xác');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await this.prisma.identity.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return this.prisma.identity.update({
        where: { id: existing.id },
        data: {
          isAdmin: true,
          isEmailVerified: true
        }
      });
    }

    return this.prisma.identity.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        isAdmin: true,
        isEmailVerified: true,
        isGuest: false,
        profile: {
          create: {
            nickname,
            pronoun: 'Tổng Quản',
            appearanceJson: JSON.stringify({
              genderPresentation: 'neutral',
              hairStyle: 'hair_scholar_1',
              hairColor: '#2b201a',
              skinTone: '#f5deb3',
              outfitStyle: 'robe_hanfu_4',
              outfitPalette: 'palette_charcoal',
              accessory: 'acc_jade_pendant',
              defaultExpression: 'composed'
            }),
            bio: 'Quản trị viên phòng trà Trà Duyên.'
          }
        },
        leafBalance: {
          create: { balance: 1000 }
        }
      }
    });
  }
}
