# Bảng Ma Trận Nghiệm Thu (Acceptance Matrix) - Trà Duyên v1

| STT | Yêu Cầu / Tính Năng | Module Phụ Trách | Cách Kiểm Chứng | Bằng Chứng / Test Case | Trạng Thái |
|---|---|---|---|---|---|
| 1 | Guest mode nhanh | `identity` | Mở ẩn danh, tự sinh guest ID, reload giữ nguyên | Test `server-integration.spec.ts` (Flow 1) | **ĐÃ KIỂM CHỨNG** |
| 2 | Đăng ký, đăng nhập email & khôi phục | `identity` | Đăng ký, gửi token verify/reset qua mail sandbox, đổi mật khẩu | Test `server-integration.spec.ts` (Flow 2) | **ĐÃ KIỂM CHỨNG** |
| 3 | Nâng cấp guest thành tài khoản | `identity` | Nâng cấp giữ nguyên profile, điểm và vật phẩm trong transaction | Test `server-integration.spec.ts` (Flow 1) | **ĐÃ KIỂM CHỨNG** |
| 4 | Hồ sơ nhân vật vs cá nhân | `profiles` | Client khác gọi API/state chỉ thấy thông tin được cấp phép | Test `server-integration.spec.ts` (Flow 3) | **ĐÃ KIỂM CHỨNG** |
| 5 | Upload ảnh an toàn | `media` | Upload file giả extension, verify strip EXIF, resize WebP | Test `server-integration.spec.ts` (Flow 4) | **ĐÃ KIỂM CHỨNG** |
| 6 | Nhân vật 3D & Animation | `character` | Model khối cổ trang, 14 animation, attachment points | `Character3D.tsx`, `TeaRoomCanvas.tsx`, build test | **ĐÃ KIỂM CHỨNG** |
| 7 | Cảnh phòng trà 3D ấm cúng | `scene` | Phòng trà 3D, quầy, bàn đôi, khu tiệc, bình phong | `TeaRoomEnvironment.tsx`, R3F scene render | **ĐÃ KIỂM CHỨNG** |
| 8 | Tạo/Tìm phòng, Mã vào phòng | `rooms` | Tạo phòng public/private, filter, join bằng mã code 6 ký tự | `TeaRoom.ts`, `RoomListModal.tsx` | **ĐÃ KIỂM CHỨNG** |
| 9 | Chọn ghế atomic & Nhận vai | `rooms` | Hai người tranh 1 ghế cùng lúc; Host/Matchmaker/Guest roles | `seating-and-rewards.spec.ts` | **ĐÃ KIỂM CHỨNG** |
| 10 | Bàn đôi (Duo Table) xuyên suốt | `game-domain` / `rooms` | 9 phase state machine, deadline, skip, kết quả | `duo-table.spec.ts` | **ĐÃ KIỂM CHỨNG** |
| 11 | Xem mắt chung (Group) xoay vòng | `game-domain` / `rooms` | 4-6 khách, Round-Robin 1-1, xử lý khách lẻ, loại trừ block | `group-gathering.spec.ts` | **ĐÃ KIỂM CHỨNG** |
| 12 | Nghi thức trà & Nội dung | `content` / `activities` | 6 danh trà, 12 điểm tâm, 30 câu hỏi, 18 tình huống | `content-schema.spec.ts` | **ĐÃ KIỂM CHỨNG** |
| 13 | Chat theo phạm vi (Scoped) | `rooms` | Kênh phòng vs Kênh cặp vs Kênh bàn riêng, verify quyền | `TeaRoom.ts` (`handleScopedChat`), `ChatPanel.tsx` | **ĐÃ KIỂM CHỨNG** |
| 14 | Thiệp hẹn kín & Ghép đôi 2 chiều | `matching` | Animation giống nhau, chỉ mở bàn riêng khi cả 2 đồng ý | `duo-table.spec.ts`, `group-gathering.spec.ts` | **ĐÃ KIỂM CHỨNG** |
| 15 | Trao & Thu hồi danh thiếp | `social` | Gửi yêu cầu, chọn trường, xem trước, đối phương duyệt, revoke | `server-integration.spec.ts` (Flow 5) | **ĐÃ KIỂM CHỨNG** |
| 16 | Bạn bè & Mời vào phòng | `social` | Gửi lời mời, chấp nhận, từ chối, block gỡ bạn bè & thu hồi thẻ | `server-integration.spec.ts` (Flow 5) | **ĐÃ KIỂM CHỨNG** |
| 17 | Điểm "Lá Trà", Ledger & Shop | `progression` | Nhận thưởng có giới hạn ngày, mua vật phẩm nguyên tử | `server-integration.spec.ts` (Flow 6) | **ĐÃ KIỂM CHỨNG** |
| 18 | Moderation & Admin | `moderation` | Mute, Block, Report (kèm context), Admin gỡ ảnh & khóa user | `server-integration.spec.ts` (Flow 7) | **ĐÃ KIỂM CHỨNG** |
| 19 | Reconnect & Lifecycle phòng | `rooms` / `sessions` | Disconnect trong grace period giữ ghế, reload không chiếm 2 ghế | `TeaRoom.ts` (`allowReconnection`, `onJoin`) | **ĐÃ KIỂM CHỨNG** |
| 20 | Giao diện Tiếng Việt & A11y | `ui` | Design tokens cổ trang, responsive mobile, phím điều hướng | Tailwind tokens, WCAG contrast, labels | **ĐÃ KIỂM CHỨNG** |
| 21 | Build & Production Readiness | Monorepo | `pnpm build` & `pnpm test` chạy thành công toàn bộ | 30 tests passed, Vite + Server build exit code 0 | **ĐÃ KIỂM CHỨNG** |
