# Chính Sách Dữ Liệu & Quyền Riêng Tư - Trà Duyên v1

## 1. Nguyên Tắc Cốt Lõi
- **Bảo vệ quyền riêng tư tối thượng:** Game hướng tới kết nối văn minh, thư thái giữa những người trưởng thành. Dữ liệu nhạy cảm ngoài đời thực không bắt buộc và không bị khai thác.
- **Không giả định danh tính thực:** Hồ sơ nhân vật là danh tính ảo trong quán trà. Việc xác minh email chỉ nhằm quản lý tài khoản, chống spam và cho phép khôi phục mật khẩu.

## 2. Phân Tách Dữ Liệu Hồ Sơ
### A. Hồ sơ Nhân vật (Character Profile)
- **Các trường:** Biệt danh (Nickname), Danh xưng (Pronouns/Title: Thiếu hiệp, Cô nương, Các hạ, v.v.), Avatar/Model 3D, Giới thiệu ngắn về phong cách trà/tính cách, Sở thích đàm đạo, Mục đích (Nhập vai / Kết bạn / Tìm hiểu duyên lành), Thẻ giới thiệu cho mai mối.
- **Mức độ hiển thị:** Mặc định hiển thị cho người cùng phòng trà.

### B. Thông tin Cá nhân Tự nguyện (Voluntary Personal Info)
- **Các trường:** Ảnh đại diện thực tế (nếu muốn tải lên), Tỉnh/Thành phố hoặc Vùng đang sống, Giới thiệu cá nhân, Thông tin liên lạc (Zalo / Telegram / SĐT / Email / Mạng xã hội).
- **Mức độ hiển thị mặc định:**
  - Nơi sống & Giới thiệu: `CHỈ MÌNH TÔI` cho đến khi người dùng chủ động mở rộng.
  - Thông tin liên lạc: **Luôn luôn `CHỈ MÌNH TÔI`**; chỉ được chia sẻ có chủ đích thông qua cơ chế Danh Thiếp cụ thể cho từng đối tượng.
- **Thực thi quyền:** Máy chủ lọc toàn bộ dữ liệu trước khi gửi payload về client. Tuyệt đối không gửi đầy đủ rồi ẩn bằng CSS/UI.

## 3. Quản lý Ảnh Đại diện (Media Pipeline)
- Chỉ cho phép 1 ảnh đại diện cho tài khoản đã xác minh email. Không cho phép album hay upload file tùy ý.
- Định dạng hợp lệ: JPEG, PNG, WebP. (Chặn SVG, HTML, GIF, script).
- Quy trình máy chủ:
  1. Kiểm tra kích thước tối đa (ví dụ 2MB).
  2. Magic bytes verification (kiểm tra nội dung thực sự, không tin cậy Content-Type từ client).
  3. Sharp decode & strip toàn bộ metadata (EXIF, GPS, camera model).
  4. Resize về kích thước chuẩn (256x256 / 512x512) và re-encode sang định dạng an toàn (WebP).
  5. Đặt tên bằng UUID ngẫu nhiên do máy chủ cấp.

## 4. Cơ Chế Trao & Thu Hồi Danh Thiếp (Contact Cards)
1. Khách A chủ động bấm "Trao danh thiếp" cho Khách B.
2. Khách A chọn cụ thể các trường muốn chia sẻ (ví dụ: chỉ Telegram, không chia sẻ SĐT).
3. Khách A xem trước và bấm "Xác nhận gửi".
4. Khách B nhận được thông báo xin phép, bấm "Đồng ý xem".
5. Quyền truy cập được lưu dưới dạng `ContactCardGrant` trong CSDL.
6. **Thu hồi (Revoke):** Bất cứ lúc nào, Khách A có thể bấm "Thu hồi danh thiếp" -> Khách B lập tức mất quyền truy cập vào danh thiếp trong ứng dụng. (Ứng dụng giải thích rõ: không thể xóa thông tin nếu đối phương đã chép tay ra ngoài).
7. Khi một bên Block bên kia, toàn bộ danh thiếp liên quan tự động bị thu hồi ngay lập tức.

## 5. Dữ Liệu Trong Bộ Nhớ vs Bền Vững (Memory vs Persistence)
- **Trong bộ nhớ (In-Memory Colyseus State):** Vị trí 3D, ghế ngồi, chat phòng realtime, câu trả lời tạm thời của lượt chơi, phiếu bầu kín. Khi phòng kết thúc hoặc đóng, dữ liệu này tự động giải phóng. Không lưu trữ lịch sử chat riêng và phiếu kín vào CSDL.
- **Bền vững (PostgreSQL / Prisma):** Tài khoản, mật khẩu băm (bcrypt/argon2), hồ sơ nhân vật, quan hệ bạn bè, danh sách block, danh thiếp và quyền truy cập đã cấp, sổ cái điểm thưởng "Lá Trà", vật phẩm sở hữu, báo cáo vi phạm kèm log bằng chứng đã mã hóa.
- **Mã hóa dữ liệu liên lạc:** Các trường thông tin liên lạc được mã hóa đối xứng (AES-256-GCM) ở tầng Persistence trước khi lưu vào CSDL, sử dụng khóa bí mật cấu hình từ biến môi trường (`CONTACT_ENCRYPTION_KEY`).

## 6. Chính Sách Xóa Tài Khoản (Account Deletion)
- Khi người dùng chọn "Xóa tài khoản":
  - Thu hồi toàn bộ session đang đăng nhập.
  - Xóa ảnh đại diện vật lý trên đĩa / storage.
  - Xóa toàn bộ thông tin liên lạc và quyền danh thiếp.
  - Xóa danh sách bạn bè và hồ sơ nhân vật.
  - Giữ lại các bản ghi báo cáo/audit vi phạm nếu người này đang trong diện điều tra quấy rối theo chính sách bảo vệ cộng đồng (lưu trữ ẩn danh không gắn với định danh người dùng).
