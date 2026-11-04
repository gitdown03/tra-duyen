import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { X, Users, CreditCard, Send, ShieldAlert, Check, Trash2, Lock } from 'lucide-react';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipientId?: string | null;
}

export const SocialModal: React.FC<SocialModalProps> = ({
  isOpen,
  onClose,
  initialRecipientId
}) => {
  const [tab, setTab] = useState<'friends' | 'my_contacts' | 'share_card' | 'received_cards'>(
    initialRecipientId ? 'share_card' : 'friends'
  );

  const [friends, setFriends] = useState<any[]>([]);
  const [receivedCards, setReceivedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // My Contacts Form
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [zalo, setZalo] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [savingContacts, setSavingContacts] = useState(false);

  // Share Card Form
  const [recipientId, setRecipientId] = useState(initialRecipientId || '');
  const [sharePhone, setSharePhone] = useState(false);
  const [shareTelegram, setShareTelegram] = useState(true);
  const [shareZalo, setShareZalo] = useState(false);
  const [shareEmail, setShareEmail] = useState(false);
  const [shareSocial, setShareSocial] = useState(false);
  const [cardNote, setCardNote] = useState('Hân hạnh được tương ngộ cùng bạn!');
  const [sendingCard, setSendingCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, cData, rData] = await Promise.all([
        apiRequest('/social/friends'),
        apiRequest('/profile/me'),
        apiRequest('/social/contact-cards/received')
      ]);

      setFriends(fData);
      setReceivedCards(rData);

      const savedContacts = cData.personal?.contacts || {};
      setPhone(savedContacts.phone || '');
      setTelegram(savedContacts.telegram || '');
      setZalo(savedContacts.zalo || '');
      setEmailContact(savedContacts.email || '');
      setSocialLink(savedContacts.social || '');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContacts(true);
    try {
      await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          personal: {
            contacts: {
              phone,
              telegram,
              zalo,
              email: emailContact,
              social: socialLink
            }
          }
        })
      });
      alert('Đã lưu thông tin liên lạc cá nhân được mã hóa an toàn!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingContacts(false);
    }
  };

  const handleShareCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId) {
      alert('Vui lòng chọn người nhận danh thiếp');
      return;
    }
    setSendingCard(true);
    try {
      await apiRequest('/social/contact-cards/share', {
        method: 'POST',
        body: JSON.stringify({
          recipientUserId: recipientId,
          channelsToShare: {
            phone: sharePhone,
            telegram: shareTelegram,
            zalo: shareZalo,
            email: shareEmail,
            social: shareSocial
          },
          note: cardNote
        })
      });
      alert('Đã trao danh thiếp thành công!');
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingCard(false);
    }
  };

  const handleRevokeCard = async (ownerUserId: string) => {
    if (!confirm('Bạn có chắc chắn muốn thu hồi danh thiếp đã trao cho người này không?')) return;
    try {
      await apiRequest('/social/contact-cards/revoke', {
        method: 'POST',
        body: JSON.stringify({ recipientUserId: ownerUserId })
      });
      alert('Đã thu hồi danh thiếp thành công!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRespondFriend = async (targetUserId: string, accept: boolean) => {
    try {
      await apiRequest('/social/friends/respond', {
        method: 'POST',
        body: JSON.stringify({ targetUserId, accept })
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    if (!confirm('Chặn người chơi này sẽ hủy kết bạn, thu hồi toàn bộ danh thiếp và ngăn ghép đôi trong tương lai. Bạn có chắc không?')) return;
    try {
      await apiRequest('/social/block', {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      });
      alert('Đã chặn người chơi!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-oriental text-amber-200">Bạn Bè & Danh Thiếp</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 bg-[#1e1008] text-xs font-medium border-b border-amber-900/40 text-center">
          <button
            onClick={() => setTab('friends')}
            className={`py-3 transition-colors ${tab === 'friends' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Bạn Bè ({friends.filter(f => f.status === 'ACCEPTED').length})
          </button>
          <button
            onClick={() => setTab('received_cards')}
            className={`py-3 transition-colors ${tab === 'received_cards' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Hộp Danh Thiếp ({receivedCards.length})
          </button>
          <button
            onClick={() => setTab('my_contacts')}
            className={`py-3 transition-colors ${tab === 'my_contacts' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Thông Tin Cá Nhân
          </button>
          <button
            onClick={() => setTab('share_card')}
            className={`py-3 transition-colors ${tab === 'share_card' ? 'bg-[#26140b] text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Trao Danh Thiếp
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: FRIENDS */}
          {tab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs italic">
                  Chưa có bạn bè nào. Sau các buổi đàm đạo ăn ý, hãy gửi lời mời kết bạn!
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map(f => (
                    <div
                      key={f.id}
                      className="bg-[#1e1008] border border-amber-900/40 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-amber-200 text-xs font-oriental">
                          {f.nickname} <span className="text-[10px] text-stone-400">({f.pronoun})</span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {f.status === 'ACCEPTED' && 'Bạn bè'}
                          {f.status === 'PENDING_SENT' && 'Đã gửi lời mời kết bạn'}
                          {f.status === 'PENDING_RECEIVED' && 'Lời mời kết bạn đang chờ duyệt'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {f.status === 'PENDING_RECEIVED' && (
                          <>
                            <button
                              onClick={() => handleRespondFriend(f.userId, true)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium"
                            >
                              Đồng ý
                            </button>
                            <button
                              onClick={() => handleRespondFriend(f.userId, false)}
                              className="px-2.5 py-1 bg-[#1b0d06] border border-stone-700 hover:bg-stone-800 text-stone-300 rounded-lg text-xs"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleBlockUser(f.userId)}
                          className="p-1 text-stone-500 hover:text-red-400"
                          title="Chặn người chơi"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIVED CONTACT CARDS */}
          {tab === 'received_cards' && (
            <div className="space-y-3">
              <div className="bg-[#1b0d06] p-3 rounded-xl border border-amber-950/60 text-[11px] text-amber-300/80 leading-relaxed">
                ℹ️ Đây là nơi lưu giữ những danh thiếp người khác đã đồng thuận trao cho bạn. Bạn có thể xem lại thông tin liên lạc được chia sẻ tại đây bất cứ lúc nào.
              </div>

              {receivedCards.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs italic">
                  Hộp danh thiếp đang trống.
                </div>
              ) : (
                <div className="grid gap-3">
                  {receivedCards.map(c => (
                    <div
                      key={c.grantId}
                      className="bg-[#1e1008] border border-amber-900/50 p-4 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-amber-950/60 pb-2">
                        <div className="font-bold text-amber-200 text-xs font-oriental">
                          Danh Thiếp Của: {c.ownerNickname}
                        </div>
                        <span className="text-[10px] text-stone-500">{new Date(c.grantedAt).toLocaleDateString()}</span>
                      </div>

                      {c.note && (
                        <p className="text-xs text-stone-300 italic">"{c.note}"</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#1b0d06] p-2.5 rounded-lg border border-amber-950">
                        {c.sharedChannels.telegram && (
                          <div>
                            <span className="text-stone-400">Telegram: </span>
                            <span className="text-amber-300 font-mono font-medium">{c.sharedChannels.telegram}</span>
                          </div>
                        )}
                        {c.sharedChannels.phone && (
                          <div>
                            <span className="text-stone-400">Số ĐT: </span>
                            <span className="text-amber-300 font-mono font-medium">{c.sharedChannels.phone}</span>
                          </div>
                        )}
                        {c.sharedChannels.zalo && (
                          <div>
                            <span className="text-stone-400">Zalo: </span>
                            <span className="text-amber-300 font-mono font-medium">{c.sharedChannels.zalo}</span>
                          </div>
                        )}
                        {c.sharedChannels.email && (
                          <div>
                            <span className="text-stone-400">Email: </span>
                            <span className="text-amber-300 font-mono font-medium">{c.sharedChannels.email}</span>
                          </div>
                        )}
                        {c.sharedChannels.social && (
                          <div className="col-span-2">
                            <span className="text-stone-400">Liên kết: </span>
                            <span className="text-amber-300 font-mono font-medium break-all">{c.sharedChannels.social}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY CONTACTS (ENCRYPTED) */}
          {tab === 'my_contacts' && (
            <form onSubmit={handleSaveContacts} className="space-y-4">
              <div className="bg-[#1b0d06] p-3 rounded-xl border border-amber-950/60 text-[11px] text-stone-300 leading-relaxed flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Toàn bộ thông tin liên lạc được mã hóa AES-256-GCM. Không bao giờ hiển thị công khai và chỉ được gửi khi bạn chủ động xác nhận trao danh thiếp.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">Telegram (Ưu tiên)</label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={e => setTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">Zalo</label>
                  <input
                    type="text"
                    value={zalo}
                    onChange={e => setZalo(e.target.value)}
                    placeholder="Số điện thoại hoặc tên Zalo"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    value={emailContact}
                    onChange={e => setEmailContact(e.target.value)}
                    placeholder="lienhe@example.com"
                    className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Mạng xã hội / Kênh khác</label>
                <input
                  type="text"
                  value={socialLink}
                  onChange={e => setSocialLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingContacts}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-stone-900 font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {savingContacts ? 'Đang lưu...' : 'Lưu Danh Thiếp An Toàn'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SHARE CARD */}
          {tab === 'share_card' && (
            <form onSubmit={handleShareCard} className="space-y-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                Chọn các kênh liên lạc cụ thể mà bạn muốn chia sẻ trong danh thiếp lần này:
              </p>

              <div className="space-y-2 bg-[#1b0d06] p-4 rounded-xl border border-amber-950/60">
                <label className="flex items-center gap-2.5 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareTelegram}
                    onChange={e => setShareTelegram(e.target.checked)}
                    className="rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>Telegram ({telegram || 'Chưa thiết lập'})</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareZalo}
                    onChange={e => setShareZalo(e.target.checked)}
                    className="rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>Zalo ({zalo || 'Chưa thiết lập'})</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharePhone}
                    onChange={e => setSharePhone(e.target.checked)}
                    className="rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>Số điện thoại ({phone || 'Chưa thiết lập'})</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareEmail}
                    onChange={e => setShareEmail(e.target.checked)}
                    className="rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>Email ({emailContact || 'Chưa thiết lập'})</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareSocial}
                    onChange={e => setShareSocial(e.target.checked)}
                    className="rounded border-amber-800 text-amber-600 focus:ring-amber-500 bg-stone-900"
                  />
                  <span>Mạng xã hội / Kênh khác ({socialLink || 'Chưa thiết lập'})</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Lời nhắn kèm danh thiếp</label>
                <input
                  type="text"
                  value={cardNote}
                  onChange={e => setCardNote(e.target.value)}
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={sendingCard}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingCard ? 'Đang gửi...' : 'Xác Nhận Trao Danh Thiếp'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
