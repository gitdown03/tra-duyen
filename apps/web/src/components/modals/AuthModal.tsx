import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { APPEARANCE_PRESETS } from '@tra-duyen/content';
import { X, User, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, token: string) => void;
  initialTab?: 'guest' | 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'guest'
}) => {
  const [tab, setTab] = useState<'guest' | 'login' | 'register' | 'forgot'>(initialTab);
  const [nickname, setNickname] = useState('');
  const [avatarPresetId, setAvatarPresetId] = useState('preset_default_1');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ageConfirmed) {
      setError('Vui lòng xác nhận bạn đủ tuổi tham gia trải nghiệm');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest('/auth/guest', {
        method: 'POST',
        body: JSON.stringify({ nickname, avatarPresetId, ageConfirmed })
      });
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ageConfirmed) {
      setError('Vui lòng xác nhận bạn đủ tuổi tham gia');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, nickname, ageConfirmed })
      });
      setInfoMessage('Đăng ký thành công! Hãy kiểm tra hòm thư để xác thực email.');
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setInfoMessage('Nếu email của bạn tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍵</span>
            <h2 className="text-lg font-bold font-oriental text-amber-200">Trà Duyên - Tương Ngộ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200 hover:bg-amber-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 bg-[#1e1008] text-xs font-medium border-b border-amber-900/40 text-center">
          <button
            onClick={() => { setTab('guest'); setError(null); setInfoMessage(null); }}
            className={`py-3 transition-colors ${tab === 'guest' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Chơi Nhanh
          </button>
          <button
            onClick={() => { setTab('login'); setError(null); setInfoMessage(null); }}
            className={`py-3 transition-colors ${tab === 'login' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); setInfoMessage(null); }}
            className={`py-3 transition-colors ${tab === 'register' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Đăng Ký
          </button>
          <button
            onClick={() => { setTab('forgot'); setError(null); setInfoMessage(null); }}
            className={`py-3 transition-colors ${tab === 'forgot' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Khôi Phục
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-200 leading-relaxed">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 leading-relaxed">
              {infoMessage}
            </div>
          )}

          {/* TAB: GUEST */}
          {tab === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Biệt danh của bạn</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="Ví dụ: Bạch Lạc Thiên, Thanh Phong..."
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Diện mạo khởi đầu</label>
                <div className="grid grid-cols-2 gap-2">
                  {APPEARANCE_PRESETS.slice(0, 4).map(preset => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setAvatarPresetId(preset.id)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center gap-2 ${
                        avatarPresetId === preset.id
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-semibold'
                          : 'border-amber-950/40 bg-[#1e1008] text-stone-300 hover:border-amber-900/50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={e => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>
                    Tôi xác nhận đã đủ độ tuổi tham gia trải nghiệm giao lưu xã hội dành cho người trưởng thành.
                  </span>
                </label>
              </div>

              <div className="bg-[#180a04] p-3 rounded-xl border border-amber-950/50 text-[11px] text-amber-300/70 leading-relaxed">
                ℹ️ Lưu ý: Chế độ Khách lưu danh tính trong trình duyệt hiện tại. Xóa dữ liệu trình duyệt có thể mất quyền truy cập. Bạn có thể nâng cấp tài khoản email bất kỳ lúc nào để bảo lưu tiến trình.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {loading ? 'Đang vào quán...' : 'Bước Vào Quán Trà'}
              </button>
            </form>
          )}

          {/* TAB: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
          )}

          {/* TAB: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Biệt danh nhân vật</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="Ví dụ: Tử Sa Ẩn Sĩ"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Mật khẩu (ít nhất 8 ký tự)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={e => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>
                    Tôi xác nhận đủ độ tuổi tham gia trải nghiệm và đồng ý với quy tắc ứng xử văn minh tại quán trà.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {loading ? 'Đang khởi tạo...' : 'Tạo Tài Khoản Trà Duyên'}
              </button>
            </form>
          )}

          {/* TAB: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu đến hòm thư của bạn.
              </p>
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {loading ? 'Đang gửi yêu cầu...' : 'Gửi Thư Khôi Phục'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
