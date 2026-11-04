# Hợp đồng Sản phẩm - Trà Duyên v1

## 1. Tầm nhìn & Mục tiêu
- **Tên game:** Trà Duyên (Tea Affinity / Serendipity Tea House).
- **Thể loại:** Web game multiplayer giao lưu, kết bạn và nhập vai phong cách quán trà cổ trang Trung Hoa nguyên bản.
- **Đối tượng:** Người chơi trưởng thành tìm kiếm không gian trò chuyện thư thái, kết bạn hoặc tìm hiểu nhân duyên qua các nghi thức thưởng trà và hoạt động xem mắt lịch thiệp.

## 2. Bản chất và Định vị Đạo đức
- Trải nghiệm xã hội hư cấu, lịch sự, không ép buộc định kiến giới tính hay xu hướng.
- Không cam kết hồ sơ là danh tính thật ngoài đời. Xác minh email chỉ để khôi phục và bảo vệ tài khoản, không phải xác minh độ tuổi hay nhân thân.
- Không có thuật toán chấm điểm "tương hợp tình yêu".
- Không thu thập dữ liệu nhạy cảm: không GPS, không địa chỉ nhà, không danh bạ, không tên thật, không sao lưu chat riêng tư lâu dài.

## 3. Các Vai trò
1. **Chủ quán (Host):** Đón khách, điều phối sảnh, bắt đầu hoạt động, kick người quấy rối, đóng phòng hoặc chuyển quyền. Kiêm mai mối khi phòng có 3 người.
2. **Người mai mối (Matchmaker):** Dẫn dắt nghi thức trà, đọc thông tin giới thiệu được khách cho phép, điều phối lượt trò chuyện. Không chọn ghép đôi thay khách.
3. **Khách xem mắt (Guest/Dating Participant):** Chọn ghế, tham gia các hoạt động chọn món, đối đáp, bỏ thiệp hẹn kín, trao danh thiếp đồng thuận.

## 4. Chế độ Chơi
1. **Bàn đôi (Duo Table):** 2 khách + 1 chủ quán + 1 mai mối (hoặc 3 người nếu chủ quán kiêm mai mối).
2. **Xem mắt chung (Group Gathering):** 4 đến 6 khách + 1 chủ quán + 1 mai mối. Tối đa 8 người. Xoay vòng trò chuyện 1-1 (tối đa 3 lượt round-robin).

## 5. Ranh giới Phạm vi v1 (Scope Boundary)
- **CÓ:** Guest mode, Email Auth, Profile + Avatar Upload, 3D Tea Room (Three.js/R3F), Character Customization & Animation, Realtime Colyseus Server, Bàn Đôi & Xem Mắt Chung, Chat scoped (toàn phòng / cặp / bàn riêng), Thiệp hẹn kín, Danh thiếp đồng thuận bảo mật, Bạn bè, Lá Trà (progression/shop), Moderation & Admin, Reconnect & Lifecycle.
- **KHÔNG CÓ:** Voice/video, file upload ngoài avatar, AI bot đóng giả người chơi, thuật toán AI mai mối, nạp tiền / premium currency, chat ngoài phòng, đa bản đồ, microservices.
