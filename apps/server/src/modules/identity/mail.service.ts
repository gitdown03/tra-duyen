export interface SentEmail {
  to: string;
  subject: string;
  token?: string;
  text: string;
  sentAt: Date;
}

export class MailService {
  private static instance: MailService;
  private outbox: SentEmail[] = [];

  static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const email: SentEmail = {
      to,
      subject: 'Trà Duyên - Xác thực địa chỉ email',
      token,
      text: `Chào mừng bạn đến với Trà Duyên! Mã xác thực email của bạn là: ${token}`,
      sentAt: new Date()
    };
    this.outbox.push(email);
    console.log(`[MailService Sandbox] Sent verification email to ${to}: token=${token}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const email: SentEmail = {
      to,
      subject: 'Trà Duyên - Yêu cầu khôi phục mật khẩu',
      token,
      text: `Mã khôi phục mật khẩu Trà Duyên của bạn là: ${token}`,
      sentAt: new Date()
    };
    this.outbox.push(email);
    console.log(`[MailService Sandbox] Sent password reset email to ${to}: token=${token}`);
  }

  getLastEmail(to?: string): SentEmail | undefined {
    if (!to) return this.outbox[this.outbox.length - 1];
    return [...this.outbox].reverse().find(e => e.to.toLowerCase() === to.toLowerCase());
  }

  clearOutbox(): void {
    this.outbox = [];
  }
}
