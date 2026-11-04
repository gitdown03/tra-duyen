import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { IdentityService } from '../modules/identity/identity.service.js';
import { ProfileService } from '../modules/profiles/profile.service.js';
import { MediaService } from '../modules/media/media.service.js';
import { SocialService } from '../modules/social/social.service.js';
import { ProgressionService } from '../modules/progression/progression.service.js';
import { ModerationService } from '../modules/moderation/moderation.service.js';
import colyseus from 'colyseus';
const { matchMaker } = colyseus;
import {
  GuestRegisterSchema,
  EmailRegisterSchema,
  EmailLoginSchema,
  UpgradeGuestSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  UpdateProfileSchema,
  CreateReportSchema,
  AdminActionSchema,
  ShareContactCardSchema,
  PurchaseCosmeticSchema
} from '@tra-duyen/contracts';
import { COSMETIC_CATALOG, TEA_VARIETIES, PASTRY_ITEMS, TEA_QUESTIONS, SCENARIO_CARDS, ROOM_THEMES } from '@tra-duyen/content';

const upload = multer({
  limits: { fileSize: 3 * 1024 * 1024 },
  storage: multer.memoryStorage()
});

export function createApiRouter(): express.Router {
  const router = express.Router();
  const identityService = new IdentityService();
  const profileService = new ProfileService();
  const mediaService = new MediaService();
  const socialService = new SocialService();
  const progressionService = new ProgressionService();
  const moderationService = new ModerationService();

  // Auth Middleware
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.td_session || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Yêu cầu đăng nhập' });
      return;
    }
    const validated = await identityService.validateSession(token);
    if (!validated) {
      res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
      return;
    }
    (req as any).user = validated.identity;
    (req as any).profile = validated.profile;
    (req as any).sessionToken = token;
    next();
  };

  const setSessionCookie = (res: Response, token: string) => {
    res.cookie('td_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  };

  // --- IDENTITY & AUTH ---

  router.post('/auth/guest', async (req, res) => {
    try {
      const input = GuestRegisterSchema.parse(req.body);
      const result = await identityService.createGuest(input.nickname, input.avatarPresetId, input.ageConfirmed);
      setSessionCookie(res, result.sessionToken);
      res.json({
        token: result.sessionToken,
        user: {
          id: result.identity.id,
          isGuest: true,
          nickname: result.identity.profile?.nickname,
          isAdmin: false,
          isEmailVerified: false
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/register', async (req, res) => {
    try {
      const input = EmailRegisterSchema.parse(req.body);
      const result = await identityService.registerEmail(
        input.email,
        input.password,
        input.nickname,
        input.ageConfirmed
      );
      setSessionCookie(res, result.sessionToken);
      res.json({
        token: result.sessionToken,
        user: {
          id: result.identity.id,
          isGuest: false,
          email: result.identity.email,
          nickname: result.identity.profile?.nickname,
          isAdmin: false,
          isEmailVerified: false
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const input = EmailLoginSchema.parse(req.body);
      const result = await identityService.loginEmail(input.email, input.password);
      setSessionCookie(res, result.sessionToken);
      res.json({
        token: result.sessionToken,
        user: {
          id: result.identity.id,
          isGuest: false,
          email: result.identity.email,
          nickname: result.identity.profile?.nickname,
          isAdmin: result.identity.isAdmin,
          isEmailVerified: result.identity.isEmailVerified
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/logout', requireAuth, async (req, res) => {
    const token = (req as any).sessionToken;
    await identityService.revokeSession(token);
    res.clearCookie('td_session');
    res.json({ success: true });
  });

  router.get('/auth/me', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const profile = (req as any).profile;
    res.json({
      id: user.id,
      isGuest: user.isGuest,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
      nickname: profile?.nickname || 'Khách bộ hành',
      pronoun: profile?.pronoun || 'Các hạ',
      avatarUrl: profile?.avatarUrl,
      appearance: profile?.appearanceJson ? JSON.parse(profile.appearanceJson) : {}
    });
  });

  router.post('/auth/verify-email', async (req, res) => {
    try {
      const input = VerifyEmailSchema.parse(req.body);
      await identityService.verifyEmail(input.token);
      res.json({ success: true, message: 'Xác thực email thành công' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/forgot-password', async (req, res) => {
    try {
      const input = ForgotPasswordSchema.parse(req.body);
      await identityService.forgotPassword(input.email);
      res.json({ success: true, message: 'Nếu email tồn tại, thư khôi phục đã được gửi' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/reset-password', async (req, res) => {
    try {
      const input = ResetPasswordSchema.parse(req.body);
      await identityService.resetPassword(input.token, input.newPassword);
      res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/auth/upgrade-guest', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const input = UpgradeGuestSchema.parse(req.body);
      const result = await identityService.upgradeGuest(user.id, input.email, input.password);
      res.json({
        success: true,
        user: {
          id: result.identity.id,
          isGuest: false,
          email: result.identity.email,
          isEmailVerified: false
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/auth/account', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      await mediaService.removeAvatar(user.id);
      await identityService.deleteAccount(user.id);
      res.clearCookie('td_session');
      res.json({ success: true, message: 'Tài khoản đã được xóa vĩnh viễn' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- PROFILES & PRIVACY ---

  router.get('/profile/me', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const profile = await profileService.getProfile(user.id);
      const contacts = await socialService.getMyDecryptedContacts(user.id);

      res.json({
        character: {
          id: profile.identityId,
          nickname: profile.nickname,
          pronoun: profile.pronoun,
          appearance: JSON.parse(profile.appearanceJson || '{}'),
          bio: profile.bio,
          interests: JSON.parse(profile.interestsJson || '[]'),
          conversationStyle: profile.conversationStyle,
          purpose: profile.purpose,
          allowedIntroTags: JSON.parse(profile.allowedIntroTagsJson || '[]')
        },
        personal: {
          avatarUrl: profile.avatarUrl,
          cityRegion: profile.cityRegion,
          personalBio: profile.personalBio,
          contacts,
          visibility: {
            cityRegion: profile.cityRegionVisibility,
            personalBio: profile.personalBioVisibility
          }
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/profile/me', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const input = UpdateProfileSchema.parse(req.body);
      const updated = await profileService.updateProfile(user.id, input as any);

      if (input.personal?.contacts) {
        await socialService.savePersonalContacts(user.id, input.personal.contacts);
      }

      res.json({ success: true, profile: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/profile/:id', requireAuth, async (req, res) => {
    try {
      const viewer = (req as any).user;
      const targetId = req.params.id;
      const safeProfile = await profileService.getSafeProfile(viewer.id, targetId, 'PUBLIC');
      res.json(safeProfile);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- MEDIA UPLOAD ---

  router.post('/media/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
    try {
      const user = (req as any).user;
      if (!req.file) {
        res.status(400).json({ error: 'Vui lòng chọn tệp ảnh để tải lên' });
        return;
      }
      const result = await mediaService.uploadAvatar(user.id, req.file.buffer);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/media/avatar', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      await mediaService.removeAvatar(user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- SOCIAL (FRIENDS & CONTACT CARDS) ---

  router.get('/social/friends', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const friends = await socialService.listFriends(user.id);
    res.json(friends);
  });

  router.post('/social/friends/request', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { targetUserId } = req.body;
      const reqRecord = await socialService.sendFriendRequest(user.id, targetUserId);
      res.json({ success: true, request: reqRecord });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/social/friends/respond', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { targetUserId, accept } = req.body;
      await socialService.respondFriendRequest(user.id, targetUserId, !!accept);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/social/friends/:targetUserId', requireAuth, async (req, res) => {
    const user = (req as any).user;
    await socialService.removeFriend(user.id, req.params.targetUserId);
    res.json({ success: true });
  });

  router.post('/social/block', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { targetUserId } = req.body;
      await socialService.blockUser(user.id, targetUserId);
      res.json({ success: true, message: 'Đã chặn người chơi thành công' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/social/block/:targetUserId', requireAuth, async (req, res) => {
    const user = (req as any).user;
    await socialService.unblockUser(user.id, req.params.targetUserId);
    res.json({ success: true });
  });

  router.post('/social/contact-cards/share', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const input = ShareContactCardSchema.parse(req.body);
      const grant = await socialService.shareContactCard(
        user.id,
        input.recipientUserId,
        input.channelsToShare,
        input.note
      );
      res.json({ success: true, grant });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/social/contact-cards/revoke', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { recipientUserId } = req.body;
      await socialService.revokeContactCard(user.id, recipientUserId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/social/contact-cards/received', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const cards = await socialService.getReceivedContactCards(user.id);
    res.json(cards);
  });

  // --- PROGRESSION & SHOP ---

  router.get('/progression/inventory', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const inv = await progressionService.getInventory(user.id);
    res.json(inv);
  });

  router.get('/progression/catalog', (_req, res) => {
    res.json(COSMETIC_CATALOG);
  });

  router.post('/progression/purchase', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const input = PurchaseCosmeticSchema.parse(req.body);
      const result = await progressionService.purchaseCosmetic(user.id, input.itemId, input.idempotencyKey);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- MODERATION & REPORTS ---

  router.post('/moderation/report', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const input = CreateReportSchema.parse(req.body);
      const report = await moderationService.submitReport(
        user.id,
        input.reportedUserId,
        input.reason,
        input.detail,
        input.roomCode,
        input.selectedMessageIds ? input.selectedMessageIds.join(', ') : undefined
      );
      res.json({ success: true, reportId: report.id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/admin/reports', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const reports = await moderationService.listReports(user.id);
      res.json(reports);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  router.post('/admin/action', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const input = AdminActionSchema.parse(req.body);
      const result = await moderationService.takeAdminAction(
        user.id,
        input.action as any,
        input.targetUserId,
        input.reportId,
        input.reason
      );
      res.json(result);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  router.post('/admin/bootstrap', async (req, res) => {
    try {
      const { adminInitToken, email, password, nickname } = req.body;
      const admin = await moderationService.bootstrapInitialAdmin(
        adminInitToken,
        email,
        password,
        nickname || 'Tổng Quản'
      );
      res.json({ success: true, email: admin.email });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- CONTENT ENDPOINT ---

  router.get('/content/tea-lore', (_req, res) => {
    res.json({
      varieties: TEA_VARIETIES,
      pastries: PASTRY_ITEMS,
      questions: TEA_QUESTIONS,
      scenarios: SCENARIO_CARDS,
      themes: ROOM_THEMES
    });
  });

  // --- ROOM LISTING ---

  router.get('/rooms', async (_req, res) => {
    try {
      const rooms = await matchMaker.query({ name: 'tea_room' });
      const publicList = rooms
        .filter(r => !r.metadata?.isPrivate && r.metadata?.status !== 'CLOSED')
        .map(r => ({
          roomId: r.roomId,
          code: r.metadata?.roomCode,
          name: r.metadata?.name,
          mode: r.metadata?.mode,
          theme: r.metadata?.theme,
          currentCount: r.clients,
          maxCapacity: r.maxClients,
          status: r.metadata?.status || 'LOBBY',
          createdAt: r.createdAt
        }));
      res.json(publicList);
    } catch {
      res.json([]);
    }
  });

  return router;
}
