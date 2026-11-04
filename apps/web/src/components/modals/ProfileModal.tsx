import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { INTRO_TAGS } from '@tra-duyen/content';
import { X, User, Upload, Trash2, Eye, Shield, Lock } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [tab, setTab] = useState<'character' | 'personal' | 'preview'>('character');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Character Profile State
  const [nickname, setNickname] = useState('');
  const [pronoun, setPronoun] = useState('Các hạ');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [conversationStyle, setConversationStyle] = useState('Nhã nhặn, lắng nghe');
  const [purpose, setPurpose] = useState<'ROLEPLAY' | 'FRIENDSHIP' | 'DATING'>('FRIENDSHIP');
  const [allowedIntroTags, setAllowedIntroTags] = useState<string[]>([]);

  // Personal Info & Privacy State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cityRegion, setCityRegion] = useState('');
  const [personalBio, setPersonalBio] = useState('');
  const [cityRegionVis, setCityRegionVis] = useState('ONLY_ME');
  const [personalBioVis, setPersonalBioVis] = useState('ONLY_ME');

  // Preview Mode State
  const [previewRole, setPreviewRole] = useState<'PUBLIC' | 'FRIEND' | 'ROOM'>('PUBLIC');

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/profile/me');
      setNickname(data.character?.nickname || '');
      setPronoun(data.character?.pronoun || 'Các hạ');
      setBio(data.character?.bio || '');
      setInterests(data.character?.interests || []);
      setConversationStyle(data.character?.conversationStyle || 'Nhã nhặn, lắng nghe');
      setPurpose(data.character?.purpose || 'FRIENDSHIP');
      setAllowedIntroTags(data.character?.allowedIntroTags || []);

      setAvatarUrl(data.personal?.avatarUrl || null);
      setCityRegion(data.personal?.cityRegion || '');
      setPersonalBio(data.personal?.personalBio || '');
      setCityRegionVis(data.personal?.visibility?.cityRegion || 'ONLY_ME');
      setPersonalBioVis(data.personal?.visibility?.personalBio || 'ONLY_ME');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          character: {
            nickname,
            pronoun,
            bio,
            interests,
            conversationStyle,
            purpose,
            allowedIntroTags
          }
        })
      });
      alert('Đã lưu thông tin hồ sơ nhân vật!');
      onProfileUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          personal: {
            cityRegion,
            personalBio,
            visibility: {
              cityRegion: cityRegionVis,
              personalBio: personalBioVis
            }
          }
        })
      });
      alert('Đã lưu thông tin cá nhân và cài đặt quyền riêng tư!');
      onProfileUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/media/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvatarUrl(data.avatarUrl);
      onProfileUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh đại diện này không?')) return;
    setSaving(true);
    try {
      await apiRequest('/media/avatar', { method: 'DELETE' });
      setAvatarUrl(null);
      onProfileUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn tài khoản, ảnh, danh thiếp và lịch sử kết bạn của bạn. Bạn có muốn tiếp tục không?')) {
      try {
        await apiRequest('/auth/account', { method: 'DELETE' });
        alert('Tài khoản đã được xóa vĩnh viễn.');
        window.location.reload();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-oriental text-amber-200">Hồ Sơ & Quyền Riêng Tư</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 bg-[#1e1008] text-xs font-medium border-b border-amber-900/40 text-center">
          <button
            onClick={() => setTab('character')}
            className={`py-3 transition-colors ${tab === 'character' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Hồ Sơ Nhân Vật
          </button>
          <button
            onClick={() => setTab('personal')}
            className={`py-3 transition-colors ${tab === 'personal' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Thông Tin Cá Nhân & Riêng Tư
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`py-3 transition-colors ${tab === 'preview' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Xem Dưới Góc Nhìn Người Khác
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-200 leading-relaxed">
              {error}
            </div>
          )}

          {/* TAB 1: CHARACTER PROFILE */}
          {tab === 'character' && (
            <form onSubmit={handleSaveCharacter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">Biệt danh nhân vật</label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">Danh xưng</label>
                  <select
                    value={pronoun}
                    onChange={e => setPronoun(e.target.value)}
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Các hạ">Các hạ</option>
                    <option value="Thiếu hiệp">Thiếu hiệp</option>
                    <option value="Cô nương">Cô nương</option>
                    <option value="Công tử">Công tử</option>
                    <option value="Nhã khách">Nhã khách</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Giới thiệu ngắn (Bio)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Một câu đối hay một lời đề từ phong nhã..."
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Mục đích tham gia</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ROLEPLAY', name: 'Nhập Vai' },
                    { id: 'FRIENDSHIP', name: 'Kết Bạn Tri Kỷ' },
                    { id: 'DATING', name: 'Tìm Hiểu Nhân Duyên' }
                  ].map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPurpose(p.id as any)}
                      className={`p-2 rounded-xl border text-xs text-center transition-all ${
                        purpose === p.id
                          ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                          : 'border-amber-950/40 bg-[#1e1008] text-stone-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Thẻ giới thiệu mai mối (Được phép sử dụng khi dẫn chuyện)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {INTRO_TAGS.map(tag => {
                    const active = allowedIntroTags.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => {
                          if (active) {
                            setAllowedIntroTags(allowedIntroTags.filter(t => t !== tag.id));
                          } else {
                            setAllowedIntroTags([...allowedIntroTags, tag.id]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-xs text-left transition-all ${
                          active
                            ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-semibold'
                            : 'border-amber-950/40 bg-[#1b0d06] text-stone-400'
                        }`}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ Nhân Vật'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PERSONAL INFO & PRIVACY */}
          {tab === 'personal' && (
            <form onSubmit={handleSavePersonal} className="space-y-4">
              {/* Avatar Upload */}
              <div className="bg-[#1b0d06] p-4 rounded-xl border border-amber-900/40 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-stone-800 border-2 border-amber-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-stone-500" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-semibold text-amber-200">Ảnh đại diện cá nhân</div>
                  <p className="text-[11px] text-stone-400">
                    Chỉ cho phép tài khoản đã xác minh email. Hỗ trợ JPEG, PNG, WebP (tối đa 2.5MB). Ảnh được lọc bỏ toàn bộ EXIF vị trí an toàn.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <label className="cursor-pointer px-3 py-1 bg-amber-800/50 hover:bg-amber-800 text-amber-200 rounded-lg text-xs font-medium flex items-center gap-1 border border-amber-700/50">
                      <Upload className="w-3 h-3" />
                      <span>Tải ảnh lên</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadAvatar} className="hidden" />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-200 rounded-lg text-xs font-medium flex items-center gap-1 border border-red-800/50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Gỡ ảnh</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* City / Region + Visibility */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-amber-200/90">Vùng / Tỉnh thành đang sinh sống</label>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400">
                    <Shield className="w-3 h-3" />
                    <span>Quyền xem:</span>
                    <select
                      value={cityRegionVis}
                      onChange={e => setCityRegionVis(e.target.value)}
                      className="bg-[#1b0d06] border border-amber-900/40 rounded px-1.5 py-0.5 text-[11px]"
                    >
                      <option value="ONLY_ME">Chỉ mình tôi</option>
                      <option value="FRIENDS">Bạn bè</option>
                      <option value="ROOM">Người cùng phòng</option>
                      <option value="PUBLIC">Công khai</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  value={cityRegion}
                  onChange={e => setCityRegion(e.target.value)}
                  placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..."
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Personal Bio + Visibility */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-amber-200/90">Giới thiệu đời thực tự nguyện</label>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400">
                    <Shield className="w-3 h-3" />
                    <span>Quyền xem:</span>
                    <select
                      value={personalBioVis}
                      onChange={e => setPersonalBioVis(e.target.value)}
                      className="bg-[#1b0d06] border border-amber-900/40 rounded px-1.5 py-0.5 text-[11px]"
                    >
                      <option value="ONLY_ME">Chỉ mình tôi</option>
                      <option value="FRIENDS">Bạn bè</option>
                      <option value="ROOM">Người cùng phòng</option>
                      <option value="PUBLIC">Công khai</option>
                    </select>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={personalBio}
                  onChange={e => setPersonalBio(e.target.value)}
                  placeholder="Đôi điều tâm sự chân thật về cuộc sống ngoài đời nếu muốn chia sẻ..."
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="text-red-400/80 hover:text-red-300 text-xs underline"
                >
                  Xóa tài khoản vĩnh viễn
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Thông Tin & Quyền'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PREVIEW AS OTHERS */}
          {tab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#1e1008] p-3 rounded-xl border border-amber-900/40">
                <span className="text-xs text-stone-300">Góc nhìn người xem:</span>
                <div className="flex gap-1.5">
                  {(['PUBLIC', 'ROOM', 'FRIEND'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setPreviewRole(role)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        previewRole === role
                          ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                          : 'border-amber-950/40 bg-[#1b0d06] text-stone-400'
                      }`}
                    >
                      {role === 'PUBLIC' && 'Người Lạ (Public)'}
                      {role === 'ROOM' && 'Người Cùng Phòng'}
                      {role === 'FRIEND' && 'Bạn Bè Đã Chấp Nhận'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-[#1b0d06] p-5 rounded-2xl border border-amber-900/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-800 border border-amber-700/60 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-stone-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold font-oriental text-amber-200 text-sm">
                      {nickname} ({pronoun})
                    </div>
                    <div className="text-[11px] text-stone-400 italic">"{bio || 'Chưa cập nhật'}"</div>
                  </div>
                </div>

                <div className="border-t border-amber-950/60 pt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-stone-400">Nơi sống: </span>
                    <span className="text-stone-200">
                      {cityRegionVis === 'PUBLIC' ||
                      (cityRegionVis === 'ROOM' && (previewRole === 'ROOM' || previewRole === 'FRIEND')) ||
                      (cityRegionVis === 'FRIENDS' && previewRole === 'FRIEND')
                        ? cityRegion || 'Chưa cập nhật'
                        : '(Đã ẩn theo cài đặt quyền riêng tư)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400">Giới thiệu đời thực: </span>
                    <span className="text-stone-200">
                      {personalBioVis === 'PUBLIC' ||
                      (personalBioVis === 'ROOM' && (previewRole === 'ROOM' || previewRole === 'FRIEND')) ||
                      (personalBioVis === 'FRIENDS' && previewRole === 'FRIEND')
                        ? personalBio || 'Chưa cập nhật'
                        : '(Đã ẩn theo cài đặt quyền riêng tư)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400">Thông tin liên lạc: </span>
                    <span className="text-amber-400/90 font-medium">
                      (Chỉ hiển thị khi bạn chủ động trao Danh Thiếp có xác nhận)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
