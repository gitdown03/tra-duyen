import { describe, it, expect, beforeAll } from 'vitest';
import { IdentityService } from '../src/modules/identity/identity.service.js';
import { ProfileService } from '../src/modules/profiles/profile.service.js';
import { MediaService } from '../src/modules/media/media.service.js';
import { SocialService } from '../src/modules/social/social.service.js';
import { ProgressionService } from '../src/modules/progression/progression.service.js';
import { ModerationService } from '../src/modules/moderation/moderation.service.js';
import { MailService } from '../src/modules/identity/mail.service.js';
import { getPrismaClient } from '../src/persistence/prisma.js';

describe('Server Integration Tests (Real Persistence)', () => {
  const prisma = getPrismaClient();
  const identityService = new IdentityService();
  const profileService = new ProfileService();
  const mediaService = new MediaService();
  const socialService = new SocialService();
  const progressionService = new ProgressionService();
  const moderationService = new ModerationService();
  const mailService = MailService.getInstance();

  beforeAll(async () => {
    // Ensure clean test environment
    process.env.CONTACT_ENCRYPTION_KEY = 'test_encryption_key_32_characters_long_ok!';
    process.env.ADMIN_INIT_TOKEN = 'test_admin_token_123';
  });

  it('Flow 1: Guest creation, reload verification and guest upgrade', async () => {
    // 1. Create Guest
    const guestRes = await identityService.createGuest('Khách Tiêu Dao', 'preset_default_1', true);
    expect(guestRes.identity.isGuest).toBe(true);
    expect(guestRes.sessionToken).toBeDefined();

    // 2. Validate session (simulating reload)
    const valid = await identityService.validateSession(guestRes.sessionToken);
    expect(valid).not.toBeNull();
    expect(valid?.identity.id).toBe(guestRes.identity.id);

    // 3. Upgrade Guest to Email account
    const upgradeEmail = `guest_${Date.now()}@example.com`;
    const upgraded = await identityService.upgradeGuest(guestRes.identity.id, upgradeEmail, 'SecurePass123!');
    expect(upgraded.identity.isGuest).toBe(false);
    expect(upgraded.identity.email).toBe(upgradeEmail);
    expect(upgraded.identity.isEmailVerified).toBe(false);

    // Verify verification email was sent
    const lastMail = mailService.getLastEmail(upgradeEmail);
    expect(lastMail).toBeDefined();
    expect(lastMail?.token).toBe(upgraded.verificationToken);

    // 4. Verify email
    await identityService.verifyEmail(upgraded.verificationToken!);
    const verifiedUser = await prisma.identity.findUnique({ where: { id: guestRes.identity.id } });
    expect(verifiedUser?.isEmailVerified).toBe(true);
  });

  it('Flow 2: Email register, password reset and login', async () => {
    const email = `user_${Date.now()}@example.com`;
    const regRes = await identityService.registerEmail(email, 'MyPassword123!', 'Trúc Diệp', true);
    expect(regRes.identity.email).toBe(email);

    // Verify email
    await identityService.verifyEmail(regRes.verificationToken);

    // Login
    const loginRes = await identityService.loginEmail(email, 'MyPassword123!');
    expect(loginRes.sessionToken).toBeDefined();

    // Forgot password flow
    const forgotRes = await identityService.forgotPassword(email);
    expect(forgotRes.token).toBeDefined();

    // Reset password
    await identityService.resetPassword(forgotRes.token!, 'NewPassword456!');

    // Old password fails
    await expect(identityService.loginEmail(email, 'MyPassword123!')).rejects.toThrow();

    // New password succeeds
    const newLogin = await identityService.loginEmail(email, 'NewPassword456!');
    expect(newLogin.sessionToken).toBeDefined();
  });

  it('Flow 3: Profile visibility filtering strictly enforced at server level', async () => {
    // Create User A
    const userA = await identityService.registerEmail(`a_${Date.now()}@example.com`, 'Pass12345!', 'Người A', true);
    // Create User B
    const userB = await identityService.registerEmail(`b_${Date.now()}@example.com`, 'Pass12345!', 'Người B', true);

    // User A sets personal bio to ONLY_ME
    await profileService.updateProfile(userA.identity.id, {
      personal: {
        cityRegion: 'Hà Nội',
        personalBio: 'Tâm sự bí mật của người A',
        visibility: {
          cityRegion: 'ONLY_ME',
          personalBio: 'ONLY_ME'
        }
      }
    });

    // User B views User A as PUBLIC
    const safeView = await profileService.getSafeProfile(userB.identity.id, userA.identity.id, 'PUBLIC');
    // Secret fields MUST be filtered to null
    expect(safeView.cityRegion).toBeNull();
    expect(safeView.personalBio).toBeNull();

    // User A views self
    const selfView = await profileService.getSafeProfile(userA.identity.id, userA.identity.id, 'SELF');
    expect(selfView.cityRegion).toBe('Hà Nội');
    expect(selfView.personalBio).toBe('Tâm sự bí mật của người A');
  });

  it('Flow 4: Media upload magic bytes verification and size limits', async () => {
    const user = await identityService.registerEmail(`upload_${Date.now()}@example.com`, 'Pass12345!', 'Nhiếp Ảnh', true);
    // Must be email verified
    await identityService.verifyEmail(user.verificationToken);

    // Fake invalid text file masquerading as image
    const fakeBuffer = Buffer.from('<html><script>alert("hack")</script></html>');
    await expect(mediaService.uploadAvatar(user.identity.id, fakeBuffer)).rejects.toThrow(
      'Định dạng tệp không hợp lệ'
    );

    // Valid small 1x1 PNG image buffer
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const validPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const res = await mediaService.uploadAvatar(user.identity.id, validPng);
    expect(res.avatarUrl).toContain('/uploads/avatar_');

    // Remove avatar
    await mediaService.removeAvatar(user.identity.id);
    const updated = await profileService.getProfile(user.identity.id);
    expect(updated.avatarUrl).toBeNull();
  });

  it('Flow 5: Contact card encrypted sharing and automatic revocation on block', async () => {
    const userA = await identityService.registerEmail(`c1_${Date.now()}@example.com`, 'Pass12345!', 'Khách A', true);
    await identityService.verifyEmail(userA.verificationToken);

    const userB = await identityService.registerEmail(`c2_${Date.now()}@example.com`, 'Pass12345!', 'Khách B', true);
    await identityService.verifyEmail(userB.verificationToken);

    // User A sets personal contacts
    await socialService.savePersonalContacts(userA.identity.id, {
      phone: '0901234567',
      telegram: '@khach_a',
      email: 'secret_a@example.com'
    });

    // User A shares only telegram and phone with User B
    await socialService.shareContactCard(userA.identity.id, userB.identity.id, {
      phone: true,
      telegram: true,
      email: false,
      zalo: false,
      social: false
    });

    // User B views received cards
    const received = await socialService.getReceivedContactCards(userB.identity.id);
    expect(received.length).toBeGreaterThan(0);
    const card = received.find(c => c.ownerUserId === userA.identity.id);
    expect(card).toBeDefined();
    expect(card?.sharedChannels.phone).toBe('0901234567');
    expect(card?.sharedChannels.telegram).toBe('@khach_a');
    expect(card?.sharedChannels.email).toBeUndefined(); // strictly unshared channel is omitted

    // User B blocks User A -> contact grant MUST be automatically revoked!
    await socialService.blockUser(userB.identity.id, userA.identity.id);

    const receivedAfterBlock = await socialService.getReceivedContactCards(userB.identity.id);
    expect(receivedAfterBlock.find(c => c.ownerUserId === userA.identity.id)).toBeUndefined();
  });

  it('Flow 6: Progression leaves, daily cap and idempotent cosmetic purchase', async () => {
    const user = await identityService.registerEmail(`prog_${Date.now()}@example.com`, 'Pass12345!', 'Tích Điểm', true);

    // Initial balance
    const initBal = await progressionService.getBalance(user.identity.id);
    expect(initBal.balance).toBe(100);

    // Award session completion
    const earned = await progressionService.awardSessionCompletion(
      {
        userId: user.identity.id,
        isHostOrMatchmaker: false,
        completedFullSession: true,
        leftEarlyDueToBlockOrReport: false
      },
      'TEST_ROOM_1'
    );
    expect(earned).toBe(50);

    // Duplicate award for same session is rejected (idempotent)
    const dup = await progressionService.awardSessionCompletion(
      {
        userId: user.identity.id,
        isHostOrMatchmaker: false,
        completedFullSession: true,
        leftEarlyDueToBlockOrReport: false
      },
      'TEST_ROOM_1'
    );
    expect(dup).toBe(0);

    // Purchase cosmetic item with idempotency key
    const idemKey = `idem_${Date.now()}`;
    const pRes = await progressionService.purchaseCosmetic(user.identity.id, 'cos_acc_jade_pendant', idemKey);
    expect(pRes.success).toBe(true);

    // Repeating exact same call with same idempotency key returns success without re-deducting
    const repeatRes = await progressionService.purchaseCosmetic(user.identity.id, 'cos_acc_jade_pendant', idemKey);
    expect(repeatRes.success).toBe(true);

    const inventory = await progressionService.getInventory(user.identity.id);
    expect(inventory.ownedItemIds).toContain('cos_acc_jade_pendant');
  });

  it('Flow 7: Moderation report, admin bootstrap, ban and audit log', async () => {
    const user = await identityService.registerEmail(`mod_${Date.now()}@example.com`, 'Pass12345!', 'Người Dùng', true);
    const badUser = await identityService.registerEmail(`bad_${Date.now()}@example.com`, 'Pass12345!', 'Quấy Rối', true);

    // File report
    const rep = await moderationService.submitReport(
      user.identity.id,
      badUser.identity.id,
      'HARASSMENT',
      'Người này dùng lời lẽ không phù hợp tại phòng trà'
    );
    expect(rep.id).toBeDefined();

    // Bootstrap admin
    const admin = await moderationService.bootstrapInitialAdmin(
      'test_admin_token_123',
      'admin@traduyen.vn',
      'AdminPass123!',
      'Tổng Quản Trà Thất'
    );
    expect(admin.isAdmin).toBe(true);

    // Admin lists reports
    const reports = await moderationService.listReports(admin.id);
    expect(reports.some(r => r.id === rep.id)).toBe(true);

    // Admin bans bad user
    await moderationService.takeAdminAction(admin.id, 'BAN_USER', badUser.identity.id, rep.id, 'Vi phạm quy tắc');

    // Banned user cannot log in
    await expect(identityService.loginEmail(badUser.identity.email!, 'Pass12345!')).rejects.toThrow('Tài khoản đã bị tạm khóa');
  });
});
