# Trà Duyên (Tea Affinity) - Web Game Multiplayer Cổ Trang v1

Trà Duyên là web game multiplayer giao lưu, kết bạn và nhập vai trong một không gian phòng trà cổ trang Trung Hoa nguyên bản ấm áp, văn nhã. Người chơi hiện diện bằng nhân vật 3D cách điệu, tham gia các tuần trà, đối đáp tình huống, thưởng điểm tâm, trao thiệp hẹn kín và chia sẻ danh thiếp đồng thuận.

---

## 1. Kiến Trúc & Cấu Trúc Monorepo

```
VibeCode/
├── apps/
│   ├── web/                     # React 18 + Vite + Three.js + React Three Fiber + TailwindCSS
│   └── server/                  # Node.js + Colyseus 0.15 + Express + Prisma + Sharp
├── packages/
│   ├── contracts/               # Zod Schemas, DTOs, Event payload types
│   ├── content/                 # Danh trà, điểm tâm, câu hỏi, thẻ tình huống, catalog vật phẩm
│   └── game-domain/             # State Machines, Round-Robin algorithm, Seating, Leaf rewards
├── docs/                        # Tài liệu hợp đồng, kiến trúc, kiểm thử & nghiệm thu
├── Dockerfile                   # Multi-stage production build
└── docker-compose.yml           # Triển khai trọn gói kèm PostgreSQL
```

---

## 2. Hướng Dẫn Chạy Nhanh (Local Quickstart)

Không cần cài đặt dịch vụ trả phí hoặc cấu hình phức tạp:

### Bước 1: Cài đặt dependencies & approve builds
```bash
pnpm install
```

### Bước 2: Khởi tạo database SQLite nội bộ
```bash
pnpm --filter @tra-duyen/server prisma db push
```

### Bước 3: Khởi chạy máy chủ và client
- **Khởi chạy đồng thời cả Backend & Frontend:**
  ```bash
  # Terminal 1: Chạy Backend (HTTP + Colyseus Realtime WebSocket trên cổng 3001)
  pnpm dev:server

  # Terminal 2: Chạy Frontend (Vite dev server trên cổng 5173)
  pnpm dev:web
  ```
- Mở trình duyệt tại: [http://localhost:5173](http://localhost:5173)

---

## 3. Bộ Lệnh Kiểm Thử & Kiểm Tra Toàn Diện

```bash
# Chạy toàn bộ Unit & Integration tests across all packages
pnpm test

# Chạy Production Build kiểm tra typecheck và đóng gói
pnpm build
```

---

## 4. Các Tính Năng Đã Hoàn Thiện & Xác Minh (v1 Scope)

1. **Guest Mode & Email Recovery:** Chơi nhanh không cần đăng ký, tự cấp định danh trong trình duyệt, nâng cấp thành tài khoản có xác minh email mà không mất dữ liệu.
2. **Cảnh 3D Phòng Trà & Nhân Vật:**
   - Phòng trà 3D cổ trang với quầy chủ quán, đèn lồng đung đưa, ấm trà nghi ngút khói, bàn đôi, bàn tiệc chung, bình phong ngăn bàn riêng.
   - Nhân vật 3D hình khối cách điệu hỗ trợ 14 loại animation (chắp tay chào, nâng chén trà, mời điểm tâm, bỏ thiệp vào hộp, vỗ tay, gật đầu, từ chối nhã nhặn...).
3. **Chế Độ Bàn Đôi (Duo Table):** 9 giai đoạn State Machine (Lobby, Khai trà, Đàm đạo, Đồng tâm chọn món, Thẻ tình huống, Thiệp hẹn kín, Kết quả, Bàn riêng sau bình phong).
4. **Chế Độ Xem Mắt Chung (Group Gathering):** 4 đến 6 khách, thuật toán Round-Robin phân cặp 1-1 tối đa 3 lượt (xoay vòng nghỉ công bằng nếu số lẻ, loại trừ người bị block). Bỏ phiếu kín cuối buổi và mở bàn riêng cho cặp chọn nhau 2 chiều.
5. **Chat Theo Phạm Vi (Scoped Chat):** Phân tách tuyệt đối giữa chat toàn phòng, chat cặp đôi trong lượt, và chat bàn riêng sau bình phong.
6. **Bảo Vệ Quyền Riêng Tư & Danh Thiếp:**
   - Thông tin cá nhân (nơi sống, bio) được lọc ở phía máy chủ trước khi trả về client.
   - Thông tin liên lạc (Telegram, Zalo, SĐT) được mã hóa bằng AES-256-GCM qua `CONTACT_ENCRYPTION_KEY`.
   - Trao danh thiếp có chọn lọc từng kênh và có quyền thu hồi bất cứ lúc nào. Khi chặn (block), toàn bộ danh thiếp tự động thu hồi.
7. **Tiến Trình "Lá Trà" & Kỳ Trân Các:** Điểm thưởng kiếm qua việc tham gia buổi trà (tối đa 500 Lá Trà/ngày). Mua sắm vật phẩm cosmetic an toàn bằng giao dịch nguyên tử có khóa idempotency.
8. **Quản Trị Viên (Admin) & Báo Cáo:** Người chơi gửi báo cáo vi phạm kèm trích đoạn tin nhắn. Admin xem xét báo cáo, gỡ ảnh đại diện, hoặc khóa tài khoản vi phạm.

---

## 5. Cấu Hình & Triển Khai Production (Docker & PostgreSQL)

Khi triển khai trên máy chủ production có Docker:
```bash
# 1. Đổi các biến môi trường bí mật trong docker-compose.yml
# 2. Khởi chạy container:
docker-compose up -d --build
```

### Quản lý Khóa Mã Hóa:
- Biến môi trường `CONTACT_ENCRYPTION_KEY` phải là chuỗi ngẫu nhiên tối thiểu 32 ký tự (ví dụ: sinh bằng `openssl rand -hex 16`).
- Máy chủ sẽ báo lỗi an toàn và từ chối khởi động nếu thiếu khóa này, tuyệt đối không lưu trữ thông tin liên lạc dưới dạng plaintext.

### Khởi tạo Tài Khoản Admin Ban Đầu:
Truy cập giao diện Admin trên thanh điều hướng hoặc gọi API:
```bash
curl -X POST http://localhost:3001/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "adminInitToken": "admin_bootstrap_secret_12345",
    "email": "admin@traduyen.vn",
    "password": "AdminSecurePassword123!",
    "nickname": "Tổng Quản Trà Thất"
  }'
```
