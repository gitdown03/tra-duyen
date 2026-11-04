# Kế Hoạch Thực Thi (Execution Plan) - Trà Duyên v1

## Giai đoạn 1: Khởi tạo Workspace & Nền tảng Monorepo
- Khởi tạo pnpm workspace với các package:
  - `packages/contracts`: Zod schemas & DTOs
  - `packages/content`: Nội dung trà, điểm tâm, câu hỏi, thẻ tình huống, catalog vật phẩm
  - `packages/game-domain`: State machines & matchmaking logic
  - `apps/server`: Colyseus + Express/Node + Prisma + Sharp
  - `apps/web`: React + Vite + Three.js / React Three Fiber + TailwindCSS/Design tokens
- Thiết lập Prisma schema, SQLite / PostgreSQL client & migration.

## Giai đoạn 2: Lát Cắt Chạy Được Đầu Tiên (First Playable Slice - 3D & Movement)
- Xây dựng Tea Room 3D scene (phòng trà ấm áp, đèn lồng, quầy chủ quán, bàn đôi, khu tiệc, bình phong).
- Nhân vật 3D hình khối cách điệu cổ trang với đầy đủ animations (idle, walk, bow, sit, sit_wait, stand, sip_tea, offer_tea, offer_snack, give_card, receive_card, nod).
- Hệ thống ghế ngồi atomic và di chuyển click-to-move / touch-to-move đồng bộ qua Colyseus room.

## Giai đoạn 3: Phòng & Vai Trò (Rooms & Roles)
- Tạo phòng Public / Private, tìm phòng, tham gia bằng mã / link.
- Vai trò: Chủ quán (Host), Mai mối (Matchmaker), Khách xem mắt (Guests).
- Cơ chế sẵn sàng, phân ghế, ngăn chen ngang khi buổi trà đang diễn ra.

## Giai đoạn 4: Chế Độ Bàn Đôi Hoàn Chỉnh (Duo Table Flow)
- Thực hiện đầy đủ 9 bước State Machine:
  - Lobby -> Introduction -> Tea Icebreaker -> Menu Together (Đồng tâm chọn món) -> Scenario Card -> Private Decision (Hộp bỏ thiệp kín) -> Result -> Private Table (Bàn riêng sau bình phong) -> Finished.
- Chat theo phạm vi (Toàn phòng vs Bàn riêng).

## Giai đoạn 5: Chế Độ Xem Mắt Chung (Group Gathering Flow)
- Thực hiện State Machine tiệc chung 4-6 khách.
- Xoay vòng Round-Robin 1-1 ghép cặp tối đa 3 lượt (xử lý khách lẻ nghỉ công bằng, loại trừ người bị block).
- Kênh chat riêng từng cặp trong lượt.
- Bỏ phiếu chọn tối đa 1 người cuối buổi, mở bàn riêng cho cặp chọn nhau 2 chiều.

## Giai đoạn 6: Danh Tính, Tài Khoản, Hồ Sơ & Quyền Riêng Tư
- Guest mode với nhận diện trình duyệt.
- Đăng ký/đăng nhập email, khôi phục mật khẩu, nâng cấp Guest thành tài khoản.
- Tách bạch Hồ sơ nhân vật vs Thông tin cá nhân.
- Pipeline upload ảnh đại diện an toàn (magic bytes, resize, strip EXIF, mã hóa tên).
- Server-side visibility filtering.

## Giai đoạn 7: Xã Hội, Danh Thiếp, Tiến Trình & Shop
- Hệ thống bạn bè, mời vào phòng, block.
- Quy trình trao & thu hồi danh thiếp bảo mật (Contact Card Grants, AES-256 mã hóa).
- Điểm thưởng "Lá Trà", giới hạn nhận thưởng mỗi ngày, giao dịch mua vật phẩm nguyên tử (idempotent transactions).
- Tủ đồ (Wardrobe) hiển thị và trang bị phụ kiện.

## Giai đoạn 8: Quản Trị, Moderation, Lifecycle & Reconnect
- Mute, Block, Report (kèm snapshot ngữ cảnh có giới hạn).
- Bảng điều khiển Admin (xem báo cáo, gỡ ảnh, khóa tài khoản, audit logs).
- Reconnect với grace period, xử lý reload không chiếm 2 ghế, dọn dẹp phòng rỗng.

## Giai đoạn 9: Kiểm Thử, Tối Ưu Hóa & Bàn Giao
- Bộ kiểm thử tự động: Unit tests (Domain/State Machine), Integration tests (Auth/Prisma/Upload/Privacy), E2E flows.
- Kiểm tra hiệu năng 3D, responsive mobile, accessibility (phím, contrast, labels).
- Cập nhật Acceptance Matrix và tài liệu hướng dẫn vận hành.
