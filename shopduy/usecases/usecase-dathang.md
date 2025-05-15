# Đặc tả Use Case: Đặt hàng

## 1. Mô tả
Use case này cho phép người dùng tạo đơn hàng từ sản phẩm trong giỏ hàng, nhập thông tin giao hàng và thanh toán để hoàn tất quá trình mua hàng.

## 2. Tác nhân
- Khách hàng (User)

## 3. Điều kiện tiên quyết
- Người dùng đã đăng nhập vào hệ thống.
- Giỏ hàng của người dùng có ít nhất một sản phẩm.
- Sản phẩm trong giỏ hàng vẫn còn hàng và còn được bán.

## 4. Luồng sự kiện cơ bản
1. Use case bắt đầu khi người dùng nhấn vào nút "Thanh toán" từ trang giỏ hàng.
2. Hệ thống chuyển người dùng đến trang đặt hàng.
3. Hệ thống hiển thị form nhập thông tin giao hàng gồm:
   - Họ tên người nhận
   - Số điện thoại
   - Địa chỉ giao hàng chi tiết (tỉnh/thành phố, quận/huyện, phường/xã, địa chỉ cụ thể)
   - Ghi chú đơn hàng (không bắt buộc)
4. Người dùng nhập thông tin giao hàng hoặc chọn từ danh sách địa chỉ đã lưu trước đó (nếu có).
5. Hệ thống hiển thị danh sách sản phẩm trong giỏ hàng, số lượng, giá tiền và tổng tiền.
6. Hệ thống hiển thị các phương thức thanh toán có sẵn:
   - Thanh toán khi nhận hàng (COD)
   - Thanh toán trực tuyến (thẻ ngân hàng, ví điện tử, chuyển khoản)
7. Người dùng chọn phương thức thanh toán.
8. Người dùng nhấn nút "Đặt hàng".
9. Hệ thống kiểm tra tính hợp lệ của thông tin và tình trạng tồn kho của sản phẩm.
10. Hệ thống tạo đơn hàng mới và lưu vào cơ sở dữ liệu.
11. Hệ thống giảm số lượng tồn kho của sản phẩm.
12. Tùy theo phương thức thanh toán:
    - Nếu là COD: Hệ thống hiển thị trang xác nhận đơn hàng với thông tin chi tiết và mã đơn hàng.
    - Nếu là thanh toán trực tuyến: Hệ thống chuyển hướng người dùng đến trang thanh toán của đối tác cổng thanh toán.
13. Sau khi thanh toán xong hoặc chọn COD, hệ thống:
    - Xóa các sản phẩm đã đặt khỏi giỏ hàng
    - Cập nhật trạng thái đơn hàng
    - Gửi email xác nhận đơn hàng đến người dùng
14. Hệ thống chuyển hướng đến trang xác nhận đơn hàng thành công với thông tin đơn hàng và hướng dẫn tiếp theo.
15. Use case kết thúc.

## 5. Luồng sự kiện thay thế
### 5.1. Sản phẩm hết hàng hoặc thay đổi trạng thái
Ở bước 9, nếu một hoặc nhiều sản phẩm hết hàng hoặc thay đổi trạng thái:
1. Hệ thống hiển thị thông báo về các sản phẩm không còn khả dụng.
2. Người dùng có thể:
   - Quay lại giỏ hàng để xóa các sản phẩm không khả dụng
   - Tiếp tục đặt hàng với các sản phẩm còn khả dụng

### 5.2. Thanh toán trực tuyến thất bại
Ở bước 12, nếu thanh toán trực tuyến thất bại:
1. Hệ thống hiển thị thông báo lỗi từ cổng thanh toán.
2. Hệ thống cập nhật trạng thái đơn hàng thành "Chờ thanh toán".
3. Người dùng có thể:
   - Thử lại với phương thức thanh toán khác
   - Chọn COD
   - Hủy đơn hàng

### 5.3. Người dùng hủy quá trình đặt hàng
Ở bất kỳ bước nào trước khi xác nhận đơn hàng:
1. Người dùng có thể nhấn nút "Quay lại" hoặc "Hủy".
2. Hệ thống chuyển người dùng về trang giỏ hàng.
3. Đơn hàng không được tạo và sản phẩm vẫn nằm trong giỏ hàng.

### 5.4. Áp dụng mã giảm giá
Trước bước 8, người dùng có thể:
1. Nhập mã giảm giá vào ô tương ứng.
2. Hệ thống kiểm tra tính hợp lệ của mã giảm giá.
3. Nếu hợp lệ, hệ thống áp dụng giảm giá và cập nhật tổng tiền.
4. Nếu không hợp lệ, hệ thống hiển thị thông báo lỗi.

## 6. Điều kiện sau
- Đơn hàng mới được tạo trong hệ thống.
- Số lượng tồn kho của sản phẩm được cập nhật.
- Giỏ hàng của người dùng được làm trống hoặc xóa các sản phẩm đã đặt.
- Người dùng nhận được email xác nhận đơn hàng.

## 7. Yêu cầu đặc biệt
- Quá trình tạo đơn hàng phải được thực hiện trong một giao dịch database duy nhất để đảm bảo tính nhất quán.
- Thông tin thanh toán phải được mã hóa khi truyền qua mạng.
- Hệ thống phải xử lý đồng thời nhiều đơn hàng mà không bị xung đột.
- Cần có cơ chế khóa tạm thời sản phẩm trong kho trong quá trình thanh toán để tránh tình trạng hết hàng khi đang thanh toán.

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, trang đặt hàng được thực hiện trong các thư mục:
- `src/app/(client)/placeOrder` - Trang nhập thông tin đặt hàng
- `src/app/(client)/thanhtoan` - Trang thanh toán
- `src/app/(client)/order` - Trang xác nhận đơn hàng

## 9. Trình tự hoạt động
1. Người dùng nhấn "Thanh toán" từ trang giỏ hàng
2. Hệ thống chuyển đến trang đặt hàng với form nhập thông tin
3. Người dùng nhập hoặc chọn thông tin giao hàng
4. Hệ thống hiển thị thông tin giỏ hàng và tính toán:
   - Tổng tiền hàng
   - Phí vận chuyển
   - Giảm giá (nếu có)
   - Tổng thanh toán
5. Người dùng có thể nhập mã giảm giá (nếu có)
6. Người dùng chọn phương thức thanh toán
7. Hệ thống kiểm tra lại tồn kho thời gian thực
8. Người dùng xác nhận đặt hàng
9. Hệ thống tạo đơn hàng trong database với trạng thái "Chờ xử lý"
10. Hệ thống cập nhật số lượng tồn kho
11. Nếu chọn thanh toán trực tuyến:
    - Chuyển hướng đến cổng thanh toán
    - Người dùng hoàn thành thanh toán
    - Cổng thanh toán gửi kết quả về hệ thống
    - Hệ thống cập nhật trạng thái thanh toán
12. Hệ thống gửi email xác nhận đơn hàng
13. Hiển thị trang xác nhận đơn hàng thành công với mã đơn hàng
14. Xóa sản phẩm đã đặt khỏi giỏ hàng 