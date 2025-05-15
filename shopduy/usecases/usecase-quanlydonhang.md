# Đặc tả Use Case: Quản lý đơn hàng (Admin)

## 1. Mô tả
Use case này cho phép người quản trị (Admin) xem, xử lý và quản lý tất cả đơn hàng trong hệ thống, bao gồm cập nhật trạng thái, xem chi tiết và xử lý các đơn hàng hoàn trả.

## 2. Tác nhân
- Quản trị viên (Admin)

## 3. Điều kiện tiên quyết
- Admin đã đăng nhập vào hệ thống với quyền quản trị.
- Admin đã truy cập vào trang quản trị.
- Có ít nhất một đơn hàng trong hệ thống (đối với xem danh sách).

## 4. Luồng sự kiện cơ bản
### 4.1. Xem danh sách đơn hàng
1. Use case bắt đầu khi Admin chọn mục "Quản lý đơn hàng" từ menu quản trị.
2. Hệ thống hiển thị trang danh sách đơn hàng với các thông tin:
   - Mã đơn hàng
   - Tên khách hàng
   - Ngày đặt hàng
   - Tổng tiền
   - Phương thức thanh toán
   - Trạng thái đơn hàng (Chờ xử lý, Đang xử lý, Đang giao hàng, Đã giao hàng, Đã hủy)
   - Trạng thái thanh toán
   - Các tùy chọn (Xem chi tiết, Cập nhật trạng thái)
3. Admin có thể tìm kiếm đơn hàng theo mã đơn hàng hoặc tên khách hàng.
4. Admin có thể lọc đơn hàng theo trạng thái, phương thức thanh toán, khoảng thời gian.
5. Admin có thể sắp xếp đơn hàng theo ngày đặt, tổng tiền, trạng thái.

### 4.2. Xem chi tiết đơn hàng
1. Admin nhấn vào "Xem chi tiết" trên dòng đơn hàng cần xem.
2. Hệ thống hiển thị trang chi tiết đơn hàng với các thông tin:
   - Thông tin cơ bản (mã đơn hàng, ngày đặt, tổng tiền)
   - Thông tin khách hàng (tên, email, số điện thoại)
   - Địa chỉ giao hàng
   - Phương thức thanh toán và trạng thái thanh toán
   - Danh sách sản phẩm đã đặt (tên, số lượng, giá, kích cỡ, màu sắc, thành tiền)
   - Tổng tiền hàng, phí vận chuyển, giảm giá (nếu có), tổng thanh toán
   - Lịch sử cập nhật trạng thái đơn hàng
   - Ghi chú của khách hàng (nếu có)

### 4.3. Cập nhật trạng thái đơn hàng
1. Admin nhấn vào "Cập nhật trạng thái" trên dòng đơn hàng hoặc từ trang chi tiết đơn hàng.
2. Hệ thống hiển thị dropdown hoặc form cập nhật trạng thái với các trạng thái có thể chuyển tiếp:
   - Từ "Chờ xử lý" -> "Đang xử lý" hoặc "Đã hủy"
   - Từ "Đang xử lý" -> "Đang giao hàng" hoặc "Đã hủy"
   - Từ "Đang giao hàng" -> "Đã giao hàng" hoặc "Đã hủy"
3. Admin chọn trạng thái mới và có thể nhập ghi chú.
4. Admin nhấn "Cập nhật".
5. Hệ thống cập nhật trạng thái đơn hàng, lưu lịch sử cập nhật và thời gian thay đổi.
6. Hệ thống gửi email thông báo cập nhật trạng thái đến khách hàng.
7. Hệ thống hiển thị thông báo cập nhật thành công.

### 4.4. Xử lý đơn hàng mới
1. Admin xem danh sách đơn hàng với trạng thái "Chờ xử lý".
2. Admin nhấn vào "Xem chi tiết" của đơn hàng cần xử lý.
3. Hệ thống hiển thị trang chi tiết đơn hàng.
4. Admin kiểm tra thông tin đơn hàng, tính khả dụng của sản phẩm.
5. Admin thay đổi trạng thái đơn hàng thành "Đang xử lý".
6. Hệ thống cập nhật trạng thái và gửi email thông báo đến khách hàng.

### 4.5. Quản lý hoàn trả đơn hàng
1. Admin chọn mục "Quản lý hoàn trả đơn hàng" từ menu quản trị.
2. Hệ thống hiển thị danh sách các yêu cầu hoàn trả với các thông tin:
   - Mã yêu cầu hoàn trả
   - Mã đơn hàng gốc
   - Tên khách hàng
   - Ngày yêu cầu
   - Lý do hoàn trả
   - Trạng thái yêu cầu (Đang xử lý, Đã duyệt, Đã từ chối)
3. Admin nhấn vào "Xem chi tiết" của yêu cầu hoàn trả.
4. Hệ thống hiển thị trang chi tiết yêu cầu hoàn trả và đơn hàng gốc.
5. Admin xem xét thông tin và quyết định:
   - Duyệt yêu cầu hoàn trả
   - Từ chối yêu cầu hoàn trả
6. Admin chọn quyết định và nhập ghi chú (nếu cần).
7. Hệ thống cập nhật trạng thái yêu cầu hoàn trả.
8. Nếu duyệt yêu cầu, hệ thống:
   - Cập nhật trạng thái đơn hàng gốc (nếu cần)
   - Xử lý hoàn tiền (nếu áp dụng)
   - Cập nhật số lượng tồn kho (nếu áp dụng)
9. Hệ thống gửi email thông báo kết quả xử lý đến khách hàng.

## 5. Luồng sự kiện thay thế
### 5.1. Không có đơn hàng nào trong hệ thống
Ở bước 2 của xem danh sách, nếu không có đơn hàng nào:
1. Hệ thống hiển thị thông báo "Không có đơn hàng nào" và danh sách trống.

### 5.2. Tìm kiếm không có kết quả
Ở bước 3 của xem danh sách, nếu tìm kiếm không có kết quả:
1. Hệ thống hiển thị thông báo "Không tìm thấy đơn hàng phù hợp" và danh sách trống.
2. Admin có thể thử lại với từ khóa khác hoặc điều chỉnh bộ lọc.

### 5.3. Hủy đơn hàng đã thanh toán
Nếu Admin chọn hủy đơn hàng đã thanh toán:
1. Hệ thống hiển thị cảnh báo về việc đơn hàng đã được thanh toán.
2. Admin xác nhận và có thể nhập lý do hủy đơn.
3. Hệ thống cập nhật trạng thái đơn hàng thành "Đã hủy".
4. Hệ thống tự động tạo một ghi chú về hoàn tiền cho đơn hàng.
5. Admin phải xử lý thủ tục hoàn tiền theo chính sách của cửa hàng.

### 5.4. In hóa đơn/phiếu giao hàng
Admin có thể in hóa đơn hoặc phiếu giao hàng:
1. Admin nhấn "In hóa đơn" hoặc "In phiếu giao hàng" từ trang chi tiết đơn hàng.
2. Hệ thống tạo file PDF chứa thông tin hóa đơn hoặc phiếu giao hàng.
3. Hệ thống hiển thị file PDF cho Admin để in.

## 6. Điều kiện sau
- Thông tin đơn hàng được cập nhật trong cơ sở dữ liệu.
- Khách hàng nhận được thông báo về các thay đổi trạng thái đơn hàng.
- Admin có thể tiếp tục quản lý đơn hàng khác hoặc chuyển sang chức năng quản lý khác.

## 7. Yêu cầu đặc biệt
- Các thay đổi trạng thái đơn hàng phải được ghi lại đầy đủ trong lịch sử.
- Email thông báo phải được gửi đi trong vòng 1 phút sau khi cập nhật trạng thái.
- Việc cập nhật trạng thái phải tuân theo quy trình chuyển tiếp hợp lệ (không thể nhảy từ "Chờ xử lý" sang "Đã giao hàng").
- Phải có cơ chế phòng ngừa lỗi khi xử lý nhiều đơn hàng cùng lúc.

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, trang quản lý đơn hàng được thực hiện trong các thư mục:
- `src/app/(dashboard)/admin/danhmuc/order` - Trang quản lý đơn hàng
- `src/app/(dashboard)/admin/danhmuc/order/components` - Các component liên quan
- `src/app/(dashboard)/admin/danhmuc/hoan-tra-don-hang` - Trang quản lý hoàn trả đơn hàng

## 9. Trình tự hoạt động
### Xem danh sách đơn hàng
1. Admin truy cập trang quản lý đơn hàng
2. Hệ thống gửi request API để lấy danh sách đơn hàng
3. API trả về dữ liệu đơn hàng với phân trang và bộ lọc
4. Hiển thị danh sách đơn hàng trong bảng với các tùy chọn

### Xem chi tiết đơn hàng
1. Admin nhấn "Xem chi tiết" trên đơn hàng cần xem
2. Hệ thống gửi request API để lấy thông tin chi tiết đơn hàng
3. API trả về dữ liệu chi tiết bao gồm:
   - Thông tin đơn hàng
   - Thông tin khách hàng và địa chỉ giao hàng
   - Danh sách sản phẩm trong đơn hàng
   - Lịch sử cập nhật trạng thái
4. Trang hiển thị thông tin chi tiết với các tùy chọn xử lý

### Cập nhật trạng thái đơn hàng
1. Admin chọn trạng thái mới cho đơn hàng
2. Admin nhập ghi chú (nếu cần)
3. Admin nhấn "Cập nhật"
4. Hệ thống gửi request API để cập nhật trạng thái
5. API cập nhật trạng thái trong database, ghi lại lịch sử cập nhật
6. API gửi email thông báo đến khách hàng
7. Client hiển thị thông báo thành công và cập nhật giao diện

### Xử lý hoàn trả đơn hàng
1. Admin truy cập trang quản lý hoàn trả
2. Hệ thống hiển thị danh sách yêu cầu hoàn trả
3. Admin xem chi tiết yêu cầu hoàn trả
4. Admin xem xét thông tin và quyết định duyệt hoặc từ chối
5. Hệ thống gửi request API để xử lý quyết định
6. API cập nhật trạng thái yêu cầu hoàn trả và thực hiện các tác vụ liên quan
7. Hệ thống gửi email thông báo kết quả đến khách hàng
8. Client hiển thị thông báo thành công và cập nhật danh sách 