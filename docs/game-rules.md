# Luật Chơi & Vòng Đời Hoạt Động - Trà Duyên v1

## 1. Nguyên tắc Chung
1. **Lịch thiệp & Đồng thuận:** Mọi tương tác thân mật hơn (như bàn riêng sau bình phong, trao thông tin liên lạc) đều bắt buộc xuất phát từ sự chấp thuận của cả hai phía (Mutual Consent).
2. **Kín đáo:** Các câu trả lời cá nhân, lựa chọn món điểm tâm trong giai đoạn bí mật, và phiếu quyết định kết duyên đều được giữ kín cho đến khi máy chủ công bố theo đúng luật. Lựa chọn từ chối không bao giờ được thông báo công khai để tránh làm bẽ mặt bất kỳ ai.
3. **Bình đẳng:** Không áp đặt ghép cặp dựa trên giới tính sinh học, không ràng buộc vai trò hay trang phục với giới tính.

---

## 2. Chế độ Bàn Đôi (Duo Table)
- **Số lượng người:** 
  - Tiêu chuẩn: 4 người (1 Chủ quán, 1 Mai mối, 2 Khách).
  - Tinh gọn: 3 người (1 Chủ quán kiêm Mai mối, 2 Khách).
- **Luồng trạng thái (State Machine):**
  1. `LOBBY`:
     - Khách chọn ghế ngồi (Ghế Khách 1, Ghế Khách 2).
     - Chủ quán và Mai mối vào đúng vị trí.
     - Cả hai khách bấm "Sẵn sàng" -> Chủ quán bấm "Bắt đầu".
  2. `INTRODUCTION`:
     - Mai mối đọc lời mở đầu và trích các thẻ giới thiệu mà khách đã cho phép công khai.
     - Khách có thể chào hỏi ngắn hoặc xác nhận sẵn sàng. (Thời hạn: 60s hoặc skip khi host/matchmaker chuyển).
  3. `TEA_ICEBREAKER`:
     - Chủ quán dâng trà (chọn 1 trong các danh trà).
     - Mai mối đưa ra 1 câu hỏi mở chủ đề tương ứng. Hai khách lần lượt trả lời hoặc bỏ qua. (Thời hạn: 90s).
  4. `MENU_TOGETHER`:
     - "Đồng tâm chọn món": Hai khách được đưa thực đơn 4 món điểm tâm.
     - Mỗi người chọn 1 món mà mình thích hoặc muốn mời đối phương (chọn kín).
     - Sau khi cả hai chốt hoặc hết giờ: Máy chủ mở kết quả (nếu trùng: "Đồng tâm ý hợp", nếu khác: "Hương vị bổ trợ, phong vị giao hòa", không coi là thất bại). (Thời hạn: 60s).
  5. `SCENARIO_CARD`:
     - Mai mối bốc 1 Thẻ tình huống đời thường/nhập vai cổ trang.
     - Hai khách thảo luận phương án xử lý (hoặc chọn các hướng đối đáp văn nhã). (Thời hạn: 90s).
  6. `PRIVATE_DECISION`:
     - Hai khách nhận Thiệp hẹn kín.
     - Lựa chọn: "Muốn gặp tiếp / Mở bàn riêng" hoặc "Dừng lại tại đây / Hẹn dịp khác".
     - Có thể sửa đổi trước khi bấm "Chốt phiếu".
     - Cả hai nhân vật thực hiện animation bỏ thiệp vào hộp giống hệt nhau (không phân biệt màu sắc hay hiệu ứng). (Thời hạn: 45s).
  7. `RESULT`:
     - Máy chủ đối chiếu kết quả:
       - Nếu **CẢ HAI** chọn gặp tiếp: Mở khóa `PRIVATE_TABLE` (Bàn riêng sau bình phong).
       - Nếu **MỘT HOẶC CẢ HAI** không chọn: Buổi trà kết thúc trong hòa nhã ("Hữu duyên tao ngộ, cảm tạ tương tri"). Không công bố ai từ chối ai.
  8. `PRIVATE_TABLE` (nếu song phương đồng ý):
     - Hai khách bước vào góc bàn trà riêng tư sau bình phong.
     - Kênh chat bàn riêng được mở (chỉ 2 người đọc được).
     - Tùy chọn gửi Danh thiếp liên lạc hoặc Lời mời kết bạn.
     - Có thể rời bàn bất cứ lúc nào.
  9. `FINISHED`:
     - Tổng kết buổi chơi, ghi nhận điểm thưởng "Lá Trà" vào sổ lưu niệm.

---

## 3. Chế độ Xem Mắt Chung (Group Gathering)
- **Số lượng người:** 4 đến 6 Khách, 1 Chủ quán, 1 Mai mối (hoặc kiêm vai). Tối đa 8 người.
- **Luồng trạng thái (State Machine):**
  1. `LOBBY`:
     - Các khách nhận ghế 1..N. Khách sẵn sàng, Chủ quán bắt đầu.
  2. `GROUP_INTRODUCTION`:
     - Mọi người cùng nâng chén khai tiệc. Mai mối giới thiệu tổng quan từng vị khách. (Thời hạn: 90s).
  3. `GROUP_ICEBREAKER`:
     - Câu hỏi chung cho toàn bàn. Khách lần lượt chia sẻ ngắn. (Thời hạn: 120s).
  4. `PAIR_ROTATIONS` (Tối đa 3 lượt xoay vòng 1-1):
     - Thuật toán Round-Robin phân cặp:
       - Tránh người đã bị block nhau.
       - Nếu số khách lẻ: 1 người nghỉ xoay vòng công bằng. Người nghỉ có mini-activity chọn danh trà/thẻ may mắn.
     - Mỗi lượt (Thời hạn: 90s - 120s):
       - Cặp đôi ngồi đối diện nhau hoặc ở bàn con.
       - Chủ đề và thẻ gợi ý trò chuyện riêng cho từng cặp.
       - Kênh chat riêng theo cặp (Scoped Channel). Toàn bộ khách khác và host/mai mối không đọc được.
  5. `PRIVATE_SELECTION`:
     - Mỗi khách được chọn **tối đa 1 người** mà mình đã từng ghép đôi trò chuyện trong buổi muốn gặp lại, hoặc chọn "Không chọn ai".
     - Có thể sửa trước deadline.
  6. `RESULT`:
     - Chỉ những cặp **CHỌN NHAU HAI CHIỀU (Mutual Match)** mới được kích hoạt `PRIVATE_TABLES`.
     - Tuyệt đối không công bố ai bầu cho ai, ai được nhiều phiếu, ai bị từ chối.
  7. `PRIVATE_TABLES`:
     - Các cặp ghép đôi thành công bước vào bàn riêng sau bình phong.
     - Khách không có cặp có thể ở lại thưởng trà tại quầy chính cùng chủ quán hoặc rời phòng với đầy đủ điểm thưởng hoàn thành.
  8. `FINISHED`:
     - Phát điểm thưởng "Lá Trà", cập nhật nhật ký lưu niệm.
