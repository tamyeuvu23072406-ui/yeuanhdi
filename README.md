# Dành cho vợ yêu ♥

Web tặng Phan Thị Thanh Tâm – từ Nguyễn Tiến Vũ.

Phiên bản nâng cấp: UI cực xịn, nhạc nền tình yêu không lời (piano êm dịu tổng hợp bằng Web Audio), trò chơi mới **"Khoảnh khắc yêu"** thay thế trò lật hình cũ.

## Đưa lên GitHub Pages
1. Tạo repo mới trên GitHub (ví dụ `for-tam`), để **Public**.
2. Giải nén file zip, upload TOÀN BỘ file/thư mục (index.html, style.css, game.js, images/, .nojekyll) vào repo.
3. Vào **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, thư mục `/ (root)` → Save.
4. Đợi 1–2 phút, link sẽ có dạng `https://<tên-github>.github.io/for-tam/`.

**Mật khẩu vào:** **2305** (ngày 23 tháng 5).

## Tùy chỉnh
- Ngày yêu, mật khẩu: đầu file `game.js`.
- Câu hỏi quiz: hàm `quizData()`; phiếu quà: mảng `COUPONS`; nội dung thư: hàm `letterBody()`.
- Lời nhắn trong trò Khoảnh khắc yêu: mảng `MOMENTS`.
- Ảnh: thư mục `images/` (c1–c8 dùng cho trò Khoảnh khắc yêu).

## Tính năng mới
- Nhạc nền lãng mạn không lời (tự động phát sau khi mở khóa, có nút 🔊/🔇).
- Trò **Khoảnh khắc yêu**: mở từng tấm ảnh để đọc lời nhắn chân thành.
- Giao diện mượt hơn, animation đẹp hơn, hiệu ứng pháo hoa & cánh hoa phong phú.
