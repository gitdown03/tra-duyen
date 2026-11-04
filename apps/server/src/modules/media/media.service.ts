import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { getPrismaClient } from '../../persistence/prisma.js';

export class MediaService {
  private prisma = getPrismaClient();
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Sniff real image magic bytes
   */
  isValidImageBuffer(buffer: Buffer): { valid: boolean; format?: 'jpeg' | 'png' | 'webp' } {
    if (buffer.length < 12) return { valid: false };

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: true, format: 'jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { valid: true, format: 'png' };
    }

    // WebP: RIFF ... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { valid: true, format: 'webp' };
    }

    return { valid: false };
  }

  async uploadAvatar(identityId: string, fileBuffer: Buffer): Promise<{ avatarUrl: string }> {
    // 1. Identity must have verified email
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { profile: true }
    });

    if (!identity) {
      throw new Error('Người dùng không tồn tại');
    }

    if (identity.isGuest || !identity.isEmailVerified) {
      throw new Error('Bạn cần đăng ký tài khoản và xác minh email trước khi tải lên ảnh đại diện');
    }

    // 2. Validate size (< 2.5MB)
    if (fileBuffer.length > 2.5 * 1024 * 1024) {
      throw new Error('Kích thước ảnh tối đa là 2.5MB');
    }

    // 3. Sniff magic bytes
    const check = this.isValidImageBuffer(fileBuffer);
    if (!check.valid) {
      throw new Error('Định dạng tệp không hợp lệ. Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP hợp lệ.');
    }

    // 4. Decode, strip metadata, resize, re-encode as WebP
    const safeBuffer = await sharp(fileBuffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .rotate() // Auto-orient based on EXIF before stripping
      .withMetadata({
        // Strip EXIF, GPS and personal metadata
        exif: {}
      })
      .webp({ quality: 85 })
      .toBuffer();

    // 5. Generate secure random filename
    const filename = `avatar_${crypto.randomUUID()}.webp`;
    const destPath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(destPath, safeBuffer);

    // 6. Delete old avatar if present
    if (identity.profile?.avatarUrl) {
      const oldFilename = path.basename(identity.profile.avatarUrl);
      const oldPath = path.join(this.uploadDir, oldFilename);
      if (fs.existsSync(oldPath)) {
        try {
          await fs.promises.unlink(oldPath);
        } catch {
          // ignore unlink error
        }
      }
    }

    // 7. Update profile
    const avatarUrl = `/uploads/${filename}`;
    await this.prisma.playerProfile.update({
      where: { identityId },
      data: { avatarUrl }
    });

    return { avatarUrl };
  }

  async removeAvatar(identityId: string): Promise<void> {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { identityId }
    });

    if (profile?.avatarUrl) {
      const oldFilename = path.basename(profile.avatarUrl);
      const oldPath = path.join(this.uploadDir, oldFilename);
      if (fs.existsSync(oldPath)) {
        try {
          await fs.promises.unlink(oldPath);
        } catch {
          // ignore
        }
      }
      await this.prisma.playerProfile.update({
        where: { identityId },
        data: { avatarUrl: null }
      });
    }
  }

  getUploadDir(): string {
    return this.uploadDir;
  }
}
