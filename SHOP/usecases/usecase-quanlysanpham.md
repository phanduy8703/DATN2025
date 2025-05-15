# Đặc tả Use Case: Quản lý sản phẩm (Admin)

## 1. Mô tả
Use case này cho phép người quản trị (Admin) xem, thêm, sửa, xóa và quản lý thông tin sản phẩm trong hệ thống cửa hàng thời trang.

## 2. Tác nhân
- Quản trị viên (Admin)

## 3. Điều kiện tiên quyết
- Admin đã đăng nhập vào hệ thống với quyền quản trị.
- Admin đã truy cập vào trang quản trị.

## 4. Luồng sự kiện cơ bản
### 4.1. Xem danh sách sản phẩm
1. Use case bắt đầu khi Admin chọn mục "Quản lý sản phẩm" từ menu quản trị.
2. Hệ thống hiển thị trang danh sách sản phẩm với các thông tin:
   - ID sản phẩm
   - Tên sản phẩm
   - Hình ảnh
   - Giá bán
   - Số lượng tồn kho
   - Danh mục
   - Thương hiệu
   - Mùa
   - Trạng thái
   - Các tùy chọn (Sửa, Xóa)
3. Admin có thể tìm kiếm sản phẩm theo tên.
4. Admin có thể lọc sản phẩm theo danh mục, thương hiệu, mùa.
5. Admin có thể sắp xếp sản phẩm theo giá, tên, số lượng tồn kho.
6. Admin có thể chọn số lượng sản phẩm hiển thị trên mỗi trang và điều hướng giữa các trang.

### 4.2. Thêm sản phẩm mới
1. Admin nhấn nút "Thêm sản phẩm mới".
2. Hệ thống hiển thị form thêm sản phẩm với các trường:
   - Tên sản phẩm
   - Mô tả
   - Giá bán
   - Danh mục (dropdown)
   - Thương hiệu (dropdown)
   - Mùa (dropdown)
   - Màu sắc
   - Kích cỡ và số lượng tồn kho tương ứng
   - Nút tải lên hình ảnh
3. Admin nhập thông tin sản phẩm và tải lên hình ảnh.
4. Admin nhấn nút "Lưu" hoặc "Thêm sản phẩm".
5. Hệ thống kiểm tra tính hợp lệ của dữ liệu:
   - Tên sản phẩm không được trùng
   - Giá bán phải là số dương
   - Các trường bắt buộc phải được điền đầy đủ
6. Hệ thống lưu thông tin sản phẩm vào cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo thêm sản phẩm thành công và cập nhật danh sách sản phẩm.

### 4.3. Chỉnh sửa sản phẩm
1. Admin nhấn nút "Sửa" trên dòng sản phẩm cần chỉnh sửa.
2. Hệ thống hiển thị form chỉnh sửa sản phẩm với thông tin hiện tại của sản phẩm.
3. Admin cập nhật thông tin sản phẩm.
4. Admin nhấn nút "Lưu" hoặc "Cập nhật".
5. Hệ thống kiểm tra tính hợp lệ của dữ liệu.
6. Hệ thống cập nhật thông tin sản phẩm trong cơ sở dữ liệu.
7. Hệ thống hiển thị thông báo cập nhật thành công và cập nhật danh sách sản phẩm.

### 4.4. Xóa sản phẩm
1. Admin nhấn nút "Xóa" trên dòng sản phẩm cần xóa.
2. Hệ thống hiển thị hộp thoại xác nhận xóa.
3. Admin xác nhận xóa.
4. Hệ thống kiểm tra xem sản phẩm có đang liên kết với đơn hàng nào không.
5. Hệ thống xóa sản phẩm khỏi cơ sở dữ liệu hoặc đánh dấu là không còn bán.
6. Hệ thống hiển thị thông báo xóa thành công và cập nhật danh sách sản phẩm.

### 4.5. Quản lý hình ảnh sản phẩm
1. Admin nhấn vào "Quản lý hình ảnh" trên dòng sản phẩm.
2. Hệ thống hiển thị trang quản lý hình ảnh với danh sách hình ảnh hiện tại của sản phẩm.
3. Admin có thể:
   - Tải lên hình ảnh mới
   - Xóa hình ảnh hiện có
   - Sắp xếp thứ tự hiển thị của hình ảnh
4. Admin nhấn "Lưu" để cập nhật thay đổi.
5. Hệ thống cập nhật thông tin hình ảnh trong cơ sở dữ liệu.

### 4.6. Xuất Excel danh sách sản phẩm
1. Admin nhấn nút "Xuất Excel".
2. Hệ thống tạo file Excel chứa danh sách sản phẩm theo các tiêu chí lọc hiện tại.
3. Hệ thống tải xuống file Excel cho Admin.

## 5. Luồng sự kiện thay thế
### 5.1. Dữ liệu không hợp lệ khi thêm/sửa sản phẩm
Ở bước 5 của thêm sản phẩm hoặc bước 5 của sửa sản phẩm, nếu dữ liệu không hợp lệ:
1. Hệ thống hiển thị thông báo lỗi tương ứng.
2. Admin sửa lại thông tin không hợp lệ.
3. Quay lại bước 4 của thêm/sửa sản phẩm.

### 5.2. Sản phẩm đang liên kết với đơn hàng khi xóa
Ở bước 4 của xóa sản phẩm, nếu sản phẩm đang liên kết với đơn hàng:
1. Hệ thống hiển thị thông báo cảnh báo và các tùy chọn:
   - Đánh dấu sản phẩm không còn bán (thay vì xóa hoàn toàn)
   - Hủy thao tác xóa
2. Admin chọn một tùy chọn.
3. Hệ thống thực hiện theo tùy chọn đã chọn.

### 5.3. Tìm kiếm không có kết quả
Ở bước 3 của xem danh sách, nếu tìm kiếm không có kết quả:
1. Hệ thống hiển thị thông báo "Không tìm thấy sản phẩm" và danh sách sản phẩm trống.
2. Admin có thể:
   - Thử lại với từ khóa khác
   - Xóa bộ lọc để xem tất cả sản phẩm

### 5.4. Nhập hàng / Cập nhật số lượng
Admin có thể cập nhật số lượng tồn kho:
1. Admin nhấn "Cập nhật số lượng" trên dòng sản phẩm.
2. Hệ thống hiển thị form cập nhật số lượng theo kích cỡ.
3. Admin nhập số lượng mới cho mỗi kích cỡ.
4. Admin nhấn "Lưu".
5. Hệ thống cập nhật số lượng tồn kho trong cơ sở dữ liệu.

## 6. Điều kiện sau
- Thông tin sản phẩm được cập nhật trong cơ sở dữ liệu.
- Admin có thể tiếp tục quản lý sản phẩm hoặc chuyển sang chức năng quản lý khác.

## 7. Yêu cầu đặc biệt
- Hệ thống phải hỗ trợ tải lên nhiều hình ảnh cùng lúc.
- Hình ảnh sản phẩm phải được tối ưu hóa trước khi lưu trữ.
- Quá trình tải lên hình ảnh phải hiển thị thanh tiến trình.
- Cần có cơ chế sao lưu thông tin sản phẩm trước khi xóa hoàn toàn.

## 8. Giao diện liên quan
Dựa trên cấu trúc của dự án, trang quản lý sản phẩm được thực hiện trong các thư mục:
- `src/app/(dashboard)/admin/danhmuc/product` - Trang quản lý sản phẩm
- `src/app/(dashboard)/admin/danhmuc/product/components` - Các component liên quan

## 9. Trình tự hoạt động
### Xem danh sách sản phẩm
1. Admin truy cập trang quản lý sản phẩm
2. Hệ thống gửi request API để lấy danh sách sản phẩm
3. API trả về dữ liệu sản phẩm với phân trang
4. Hiển thị danh sách sản phẩm trong bảng với các tùy chọn

### Thêm sản phẩm mới
1. Admin nhấn nút "Thêm sản phẩm"
2. Hiển thị modal/form thêm sản phẩm
3. Admin nhập thông tin sản phẩm và tải lên hình ảnh
4. Admin nhấn "Lưu"
5. Client kiểm tra tính hợp lệ của form
6. Gửi request API để lưu sản phẩm mới
7. API tạo sản phẩm trong database và trả về kết quả
8. Client hiển thị thông báo thành công và cập nhật lại danh sách

### Sửa sản phẩm
1. Admin nhấn nút "Sửa" trên sản phẩm cần chỉnh sửa
2. Hệ thống gửi request API để lấy thông tin chi tiết sản phẩm
3. Hiển thị form chỉnh sửa với dữ liệu sản phẩm hiện tại
4. Admin cập nhật thông tin
5. Admin nhấn "Lưu"
6. Client kiểm tra tính hợp lệ của form
7. Gửi request API để cập nhật sản phẩm
8. API cập nhật thông tin trong database và trả về kết quả
9. Client hiển thị thông báo thành công và cập nhật lại danh sách

### Xóa sản phẩm
1. Admin nhấn nút "Xóa" trên sản phẩm cần xóa
2. Hiển thị dialog xác nhận xóa
3. Admin xác nhận xóa
4. Gửi request API để xóa sản phẩm
5. API xóa hoặc đánh dấu sản phẩm là không còn bán
6. Client hiển thị thông báo thành công và cập nhật lại danh sách

### Xuất Excel
1. Admin nhấn nút "Xuất Excel"
2. Gửi request API để tạo file Excel
3. API tạo file Excel với dữ liệu sản phẩm hiện tại
4. Browser tải xuống file Excel 