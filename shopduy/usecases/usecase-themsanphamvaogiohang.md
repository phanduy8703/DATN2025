# Đặc tả Use Case: Thêm sản phẩm vào giỏ hàng

## 1. Mô tả
Use case này cho phép người dùng thêm sản phẩm vào giỏ hàng của họ để chuẩn bị mua sau hoặc thanh toán ngay.

## 2. Tác nhân
- Khách hàng (User)

## 3. Điều kiện tiên quyết
- Người dùng đã truy cập vào trang web của cửa hàng.
- Sản phẩm mà người dùng muốn thêm đang có sẵn trong hệ thống và còn hàng.
- Người dùng đang xem trang chi tiết sản phẩm hoặc trang danh sách sản phẩm.

## 4. Luồng sự kiện cơ bản
1. Use case bắt đầu khi người dùng nhấn nút "Thêm vào giỏ hàng" ở trang chi tiết sản phẩm hoặc trang danh sách sản phẩm.
2. Nếu sản phẩm có các tùy chọn (kích cỡ, màu sắc), hệ thống yêu cầu người dùng chọn các tùy chọn này trước khi thêm vào giỏ hàng.
3. Người dùng chọn kích cỡ, màu sắc và số lượng sản phẩm muốn mua.
4. Người dùng nhấn nút "Thêm vào giỏ hàng".
5. Hệ thống kiểm tra tính hợp lệ của yêu cầu:
   - Kiểm tra số lượng sản phẩm còn trong kho
   - Kiểm tra sản phẩm vẫn còn được bán
6. Hệ thống thêm sản phẩm vào giỏ hàng của người dùng:
   - Nếu sản phẩm chưa có trong giỏ hàng, thêm mới với số lượng được chọn
   - Nếu sản phẩm đã có trong giỏ hàng (cùng kích cỡ và màu sắc), tăng số lượng lên
7. Hệ thống hiển thị thông báo xác nhận "Sản phẩm đã được thêm vào giỏ hàng".
8. Hệ thống cập nhật số lượng sản phẩm trong biểu tượng giỏ hàng (thường nằm ở góc trên bên phải của trang).
9. Hệ thống có thể hiển thị popup mini giỏ hàng với các sản phẩm hiện có và tổng tiền tạm tính.
10. Người dùng có thể chọn:
    - Tiếp tục mua sắm
    - Đi đến trang giỏ hàng
11. Use case kết thúc.

## 5. Luồng sự kiện thay thế
### 5.1. Sản phẩm hết hàng hoặc không đủ số lượng
Ở bước 5, nếu sản phẩm đã hết hàng hoặc không đủ số lượng yêu cầu:
1. Hệ thống hiển thị thông báo "Sản phẩm đã hết hàng" hoặc "Chỉ còn X sản phẩm trong kho".
2. Hệ thống không thêm sản phẩm vào giỏ hàng hoặc thêm với số lượng tối đa có thể.
3. Người dùng có thể:
   - Điều chỉnh số lượng sản phẩm
   - Đăng ký nhận thông báo khi có hàng
   - Tiếp tục mua sắm

### 5.2. Người dùng chưa chọn các tùy chọn bắt buộc
Ở bước 2, nếu người dùng chưa chọn các tùy chọn bắt buộc (kích cỡ, màu sắc) và nhấn "Thêm vào giỏ hàng":
1. Hệ thống hiển thị thông báo yêu cầu chọn các tùy chọn bắt buộc.
2. Các trường tùy chọn bắt buộc được đánh dấu.
3. Người dùng phải chọn các tùy chọn này trước khi tiếp tục.

### 5.3. Người dùng chưa đăng nhập
Nếu người dùng chưa đăng nhập:
1. Hệ thống vẫn cho phép thêm sản phẩm vào giỏ hàng tạm thời (lưu trong localStorage hoặc cookie).
2. Khi người dùng đăng nhập sau đó, giỏ hàng tạm thời sẽ được đồng bộ với giỏ hàng của tài khoản.

## 6. Điều kiện sau
- Sản phẩm được thêm vào giỏ hàng của người dùng.
- Tổng tiền trong giỏ hàng được cập nhật.
- Số lượng sản phẩm trong biểu tượng giỏ hàng được tăng lên.

## 7. Yêu cầu đặc biệt
- Quá trình thêm sản phẩm vào giỏ hàng phải được hoàn thành trong vòng 2 giây.
- Giỏ hàng phải được lưu trữ ngay cả khi người dùng đóng trình duyệt (sử dụng localStorage hoặc cookie cho người dùng chưa đăng nhập).
- Nếu người dùng đăng nhập, giỏ hàng phải được đồng bộ giữa các thiết bị.

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, chức năng thêm vào giỏ hàng được thực hiện trong các thư mục:
- `src/app/(client)/product` - Trang chi tiết sản phẩm
- `src/app/(client)/cart` - Trang giỏ hàng
- `src/app/context/Context` - Context API để quản lý state giỏ hàng

## 9. Trình tự hoạt động
1. Người dùng xem chi tiết sản phẩm
2. Người dùng chọn kích cỡ, màu sắc và số lượng sản phẩm
3. Người dùng nhấn nút "Thêm vào giỏ hàng"
4. Client gửi request đến API hoặc cập nhật state local:
   - Nếu đã đăng nhập: gửi request API để lưu sản phẩm vào giỏ hàng trong database
   - Nếu chưa đăng nhập: cập nhật state local và lưu vào localStorage
5. Hệ thống kiểm tra tồn kho thời gian thực
6. Nếu đủ số lượng:
   - Thêm sản phẩm vào giỏ hàng
   - Cập nhật biểu tượng số lượng sản phẩm trong giỏ hàng
   - Hiển thị thông báo thành công
7. Nếu không đủ số lượng:
   - Hiển thị thông báo số lượng có sẵn
   - Cho phép thêm với số lượng tối đa có thể
8. Hiển thị popup mini giỏ hàng với danh sách sản phẩm và tổng tiền
9. Người dùng quyết định tiếp tục mua sắm hoặc đi đến trang giỏ hàng
</rewritten_file> 