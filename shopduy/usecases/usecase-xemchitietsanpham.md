# Đặc tả Use Case: Xem chi tiết sản phẩm

## 1. Mô tả
Use case này cho phép người dùng xem thông tin chi tiết của một sản phẩm cụ thể trong cửa hàng thời trang, bao gồm hình ảnh, mô tả, giá cả, kích cỡ, màu sắc và các thông tin liên quan khác.

## 2. Tác nhân
- Khách hàng (User)

## 3. Điều kiện tiên quyết
- Người dùng đã truy cập vào trang web của cửa hàng.
- Sản phẩm đã được đăng tải trên hệ thống.

## 4. Luồng sự kiện cơ bản
1. Use case bắt đầu khi người dùng nhấn vào một sản phẩm từ trang danh sách sản phẩm hoặc trang chủ.
2. Hệ thống hiển thị trang chi tiết sản phẩm với các thông tin:
   - Tên sản phẩm
   - Hình ảnh sản phẩm (có thể xem nhiều hình ảnh khác nhau)
   - Giá bán và giá khuyến mãi (nếu có)
   - Mô tả sản phẩm
   - Thông tin về chất liệu và hướng dẫn bảo quản
   - Các kích cỡ có sẵn
   - Các màu sắc có sẵn
   - Số lượng còn trong kho
   - Đánh giá và nhận xét từ khách hàng khác
   - Sản phẩm liên quan
3. Người dùng có thể xem các hình ảnh khác của sản phẩm bằng cách nhấn vào các hình ảnh thu nhỏ hoặc sử dụng nút điều hướng.
4. Người dùng có thể chọn kích cỡ và màu sắc của sản phẩm.
5. Người dùng có thể đọc các đánh giá và nhận xét về sản phẩm.
6. Use case kết thúc khi người dùng:
   - Thêm sản phẩm vào giỏ hàng (kích hoạt use case "Thêm sản phẩm vào giỏ hàng")
   - Rời khỏi trang chi tiết sản phẩm

## 5. Luồng sự kiện thay thế
### 5.1. Sản phẩm hết hàng
Ở bước 2, nếu sản phẩm đã hết hàng:
1. Hệ thống hiển thị thông báo "Sản phẩm hiện đang hết hàng".
2. Nút "Thêm vào giỏ hàng" bị vô hiệu hóa hoặc được thay thế bằng nút "Thông báo khi có hàng".
3. Người dùng có thể:
   - Đăng ký nhận thông báo khi sản phẩm có hàng trở lại
   - Xem các sản phẩm liên quan
   - Quay lại trang danh sách sản phẩm

### 5.2. Xem đánh giá chi tiết
Ở bước 5, người dùng có thể nhấn vào nút "Xem tất cả đánh giá":
1. Hệ thống hiển thị trang đánh giá chi tiết với tất cả đánh giá về sản phẩm.
2. Người dùng có thể lọc đánh giá theo số sao hoặc sắp xếp theo thời gian.
3. Sau khi xem xong, người dùng có thể quay lại trang chi tiết sản phẩm.

### 5.3. Viết đánh giá sản phẩm
Nếu người dùng đã mua sản phẩm trước đó:
1. Người dùng có thể nhấn vào nút "Viết đánh giá".
2. Hệ thống hiển thị form đánh giá sản phẩm.
3. Người dùng nhập nội dung đánh giá và chọn số sao.
4. Người dùng gửi đánh giá.
5. Hệ thống lưu đánh giá và cập nhật hiển thị.

## 6. Điều kiện sau
- Người dùng đã xem được thông tin chi tiết về sản phẩm.
- Người dùng có thể quyết định mua sản phẩm hoặc tiếp tục xem các sản phẩm khác.

## 7. Yêu cầu đặc biệt
- Hình ảnh sản phẩm phải được hiển thị với chất lượng cao và có thể phóng to để xem chi tiết.
- Thông tin về kích cỡ và số lượng hàng còn lại phải được cập nhật theo thời gian thực.
- Trang chi tiết sản phẩm phải tải trong vòng 3 giây.
- Chức năng xem trước sản phẩm với các màu sắc khác nhau (nếu có).

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, trang chi tiết sản phẩm được thực hiện trong thư mục:
- `src/app/(client)/product`

## 9. Trình tự hoạt động
1. Người dùng nhấn vào sản phẩm từ trang danh sách sản phẩm hoặc trang chủ
2. Hệ thống gửi request lấy thông tin chi tiết sản phẩm theo ID
3. API trả về dữ liệu chi tiết sản phẩm, bao gồm:
   - Thông tin cơ bản (tên, giá, mô tả)
   - Danh sách hình ảnh
   - Các biến thể sản phẩm (kích cỡ, màu sắc)
   - Thông tin tồn kho
   - Đánh giá và bình luận
   - Sản phẩm liên quan
4. Trang hiển thị các thông tin chi tiết sản phẩm
5. Người dùng tương tác với trang:
   - Xem các hình ảnh khác nhau
   - Chọn kích cỡ, màu sắc
   - Đọc đánh giá
   - Xem sản phẩm liên quan
6. Nếu người dùng chọn mua, họ nhấn "Thêm vào giỏ hàng" và chọn số lượng
7. Hệ thống kiểm tra tồn kho và thêm sản phẩm vào giỏ hàng của người dùng
8. Hiển thị thông báo xác nhận đã thêm vào giỏ hàng 