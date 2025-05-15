# Đặc tả Use Case: Đăng nhập

## 1. Mô tả
Use case này cho phép người dùng đăng nhập vào hệ thống bằng tài khoản đã đăng ký trước đó.

## 2. Tác nhân
- Khách hàng (User)
- Quản trị viên (Admin)

## 3. Điều kiện tiên quyết
- Người dùng đã đăng ký tài khoản trong hệ thống.
- Người dùng chưa đăng nhập vào hệ thống.

## 4. Luồng sự kiện cơ bản
1. Use case bắt đầu khi người dùng truy cập vào trang đăng nhập hoặc nhấn vào nút "Đăng nhập" từ trang chủ.
2. Hệ thống hiển thị form đăng nhập với các trường: 
   - Email/tên đăng nhập
   - Mật khẩu
   - Nút "Đăng nhập"
   - Liên kết "Quên mật khẩu"
   - Liên kết "Đăng ký" (nếu chưa có tài khoản)
3. Người dùng nhập email/tên đăng nhập và mật khẩu.
4. Người dùng nhấn nút "Đăng nhập".
5. Hệ thống xác thực thông tin đăng nhập.
6. Nếu thông tin chính xác, hệ thống đăng nhập người dùng vào hệ thống.
7. Hệ thống chuyển hướng người dùng:
   - Đến trang chủ dành cho khách hàng (nếu là tài khoản người dùng thông thường).
   - Đến trang quản trị (nếu là tài khoản admin).
8. Use case kết thúc.

## 5. Luồng sự kiện thay thế
### 5.1. Đăng nhập thất bại
Ở bước 5, nếu thông tin đăng nhập không chính xác:
1. Hệ thống hiển thị thông báo lỗi "Email/tên đăng nhập hoặc mật khẩu không chính xác".
2. Người dùng có thể thử lại hoặc chọn "Quên mật khẩu".

### 5.2. Quên mật khẩu
Ở bước 3, người dùng có thể chọn liên kết "Quên mật khẩu":
1. Hệ thống chuyển hướng đến trang quên mật khẩu.
2. Use case "Quên mật khẩu" được kích hoạt.

### 5.3. Đăng ký tài khoản mới
Ở bước 3, người dùng có thể chọn liên kết "Đăng ký":
1. Hệ thống chuyển hướng đến trang đăng ký.
2. Use case "Đăng ký tài khoản" được kích hoạt.

## 6. Điều kiện sau
- Người dùng đã đăng nhập vào hệ thống.
- Hệ thống lưu trữ phiên đăng nhập của người dùng.

## 7. Yêu cầu đặc biệt
- Thời gian phản hồi cho việc xác thực đăng nhập không quá 3 giây.
- Mật khẩu phải được mã hóa khi truyền qua mạng.
- Sau 3 lần đăng nhập thất bại liên tiếp, tài khoản sẽ bị tạm khóa trong 15 phút.

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, trang đăng nhập được thực hiện trong thư mục:
- `src/app/(client)/login`

## 9. Trình tự hoạt động
1. Người dùng truy cập trang đăng nhập
2. Hiển thị form đăng nhập
3. Người dùng nhập thông tin đăng nhập (email và mật khẩu)
4. Hệ thống gửi request đến API xác thực
5. API xác thực kiểm tra thông tin đăng nhập trong database
6. Nếu hợp lệ, hệ thống tạo token xác thực và gửi về client
7. Client lưu token và chuyển hướng người dùng đến trang phù hợp
8. Nếu không hợp lệ, hiển thị thông báo lỗi và cho phép người dùng thử lại 