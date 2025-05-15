# Đặc tả Use Case: Đăng ký tài khoản

## 1. Mô tả
Use case này cho phép người dùng tạo tài khoản mới để sử dụng hệ thống cửa hàng thời trang online.

## 2. Tác nhân
- Khách hàng (User)

## 3. Điều kiện tiên quyết
- Người dùng chưa có tài khoản trong hệ thống.
- Người dùng có kết nối internet.

## 4. Luồng sự kiện cơ bản
1. Use case bắt đầu khi người dùng truy cập vào trang đăng ký hoặc nhấn vào nút "Đăng ký" từ trang đăng nhập.
2. Hệ thống hiển thị form đăng ký với các trường:
   - Họ tên
   - Email
   - Số điện thoại
   - Mật khẩu
   - Xác nhận mật khẩu
   - Nút "Đăng ký"
   - Liên kết quay lại trang đăng nhập
3. Người dùng nhập đầy đủ thông tin vào form.
4. Người dùng nhấn nút "Đăng ký".
5. Hệ thống kiểm tra tính hợp lệ của thông tin:
   - Email chưa được sử dụng bởi tài khoản khác
   - Mật khẩu đáp ứng yêu cầu về độ phức tạp
   - Mật khẩu và xác nhận mật khẩu trùng khớp
   - Số điện thoại hợp lệ và chưa được sử dụng
6. Hệ thống tạo tài khoản mới và lưu thông tin người dùng vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo đăng ký thành công.
8. Hệ thống gửi email xác nhận đến địa chỉ email của người dùng.
9. Hệ thống chuyển hướng người dùng đến trang đăng nhập.
10. Use case kết thúc.

## 5. Luồng sự kiện thay thế
### 5.1. Thông tin không hợp lệ
Ở bước 5, nếu thông tin không hợp lệ:
1. Hệ thống hiển thị thông báo lỗi tương ứng với trường thông tin không hợp lệ.
2. Người dùng sửa lại thông tin không hợp lệ.
3. Quay lại bước 4.

### 5.2. Email đã tồn tại
Ở bước 5, nếu email đã tồn tại trong hệ thống:
1. Hệ thống hiển thị thông báo "Email đã được sử dụng".
2. Người dùng có thể:
   - Nhập email khác
   - Chọn liên kết "Quên mật khẩu" nếu đã có tài khoản nhưng quên mật khẩu
   - Chọn liên kết quay lại trang đăng nhập

### 5.3. Người dùng hủy đăng ký
Ở bất kỳ bước nào, người dùng có thể:
1. Nhấn nút "Quay lại" hoặc "Đăng nhập" để hủy việc đăng ký.
2. Hệ thống chuyển hướng người dùng đến trang đăng nhập.
3. Use case kết thúc.

## 6. Điều kiện sau
- Một tài khoản mới được tạo trong hệ thống.
- Người dùng nhận được email xác nhận.

## 7. Yêu cầu đặc biệt
- Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
- Thông tin người dùng phải được mã hóa khi lưu vào cơ sở dữ liệu.
- Quá trình đăng ký không được mất quá 30 giây để hoàn thành.

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, trang đăng ký được thực hiện trong thư mục:
- `src/app/(client)/signUp`

## 9. Trình tự hoạt động
1. Người dùng truy cập trang đăng ký
2. Hiển thị form đăng ký
3. Người dùng nhập thông tin cá nhân và tạo mật khẩu
4. Khi người dùng nhập, hệ thống kiểm tra sự hợp lệ theo thời gian thực:
   - Kiểm tra định dạng email
   - Kiểm tra độ phức tạp của mật khẩu
   - Kiểm tra sự trùng khớp giữa mật khẩu và xác nhận mật khẩu
5. Người dùng nhấn nút "Đăng ký"
6. Hệ thống gửi thông tin đăng ký đến API
7. API kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
8. Nếu thông tin hợp lệ, API tạo tài khoản mới và lưu vào database
9. API trả về kết quả (thành công hoặc thất bại)
10. Trang hiển thị thông báo kết quả đăng ký
11. Nếu thành công, hệ thống chuyển hướng người dùng đến trang đăng nhập sau vài giây 