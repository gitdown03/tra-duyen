import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { X, Shield, Ban, CheckCircle, Trash2, Key } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin
}) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Bootstrap state
  const [adminToken, setAdminToken] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadReports();
    }
  }, [isOpen, isAdmin]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/reports');
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAction = async (action: string, targetUserId?: string, reportId?: string) => {
    const reason = prompt('Nhập lý do thực hiện hành động này:');
    if (!reason) return;

    try {
      await apiRequest('/admin/action', {
        method: 'POST',
        body: JSON.stringify({
          action,
          targetUserId,
          reportId,
          reason
        })
      });
      alert('Đã thực hiện hành động quản trị viên thành công!');
      loadReports();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapping(true);
    try {
      await apiRequest('/admin/bootstrap', {
        method: 'POST',
        body: JSON.stringify({
          adminInitToken: adminToken,
          email: adminEmail,
          password: adminPassword,
          nickname: 'Tổng Quản Trà Thất'
        })
      });
      alert('Khởi tạo tài khoản quản trị viên ban đầu thành công! Hãy đăng nhập lại.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#26140b] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f7f2e7] max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#381e13] px-6 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-oriental text-amber-200">Bảng Điều Khiển Quản Trị Viên</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-300/70 hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!isAdmin ? (
            /* BOOTSTRAP INITIAL ADMIN */
            <form onSubmit={handleBootstrap} className="space-y-4 max-w-md mx-auto py-6">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 mb-2">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-amber-200 font-oriental">Khởi Tạo Quản Trị Viên Ban Đầu</h3>
                <p className="text-xs text-stone-400">
                  Nhập mã bí mật ADMIN_INIT_TOKEN được cấu hình trên máy chủ để cấp quyền quản trị.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Mã Token Bootstrap</label>
                <input
                  type="password"
                  required
                  value={adminToken}
                  onChange={e => setAdminToken(e.target.value)}
                  placeholder="Nhập ADMIN_INIT_TOKEN..."
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Email Quản Trị Viên</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin@traduyen.vn"
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1b0d06] border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={bootstrapping}
                className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-bold rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {bootstrapping ? 'Đang cấp quyền...' : 'Khởi Tạo Quản Trị'}
              </button>
            </form>
          ) : (
            /* ADMIN REPORTS LIST */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
                <span>Danh sách báo cáo vi phạm ({reports.length})</span>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs italic">
                  Không có báo cáo vi phạm nào đang chờ xử lý.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(r => (
                    <div
                      key={r.id}
                      className="bg-[#1e1008] border border-amber-900/40 p-4 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="space-x-1.5">
                          <span className="text-stone-400">Người báo cáo: </span>
                          <span className="font-semibold text-amber-200">{r.reporterNickname}</span>
                          <span className="text-stone-500">• Báo cáo: </span>
                          <span className="font-bold text-red-300">{r.reportedNickname}</span>
                        </div>
                        <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded text-amber-400">
                          {r.reason}
                        </span>
                      </div>

                      <p className="text-xs text-stone-300 bg-[#180a04] p-2.5 rounded-lg border border-amber-950">
                        "{r.detail}"
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleAction('REMOVE_AVATAR', r.reportedUserId)}
                          className="px-2.5 py-1 bg-amber-900/40 hover:bg-amber-900 text-amber-200 rounded-lg text-xs flex items-center gap-1 border border-amber-800/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Gỡ Ảnh</span>
                        </button>

                        <button
                          onClick={() => handleAction('BAN_USER', r.reportedUserId, r.id)}
                          className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-lg text-xs flex items-center gap-1 border border-red-800/60"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Khóa Tài Khoản</span>
                        </button>

                        <button
                          onClick={() => handleAction('RESOLVE_REPORT', undefined, r.id)}
                          className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded-lg text-xs flex items-center gap-1 border border-emerald-800/60"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Đã Xử Lý</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
