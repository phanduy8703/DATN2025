# 🛍️ E-Commerce Fashion Platform

Một nền tảng thương mại điện tử hiện đại chuyên về bán quần áo, được xây dựng với Next.js & công nghệ hiện đại — nơi trải nghiệm mua sắm trở nên thông minh, nhanh chóng và thú vị.

---

## 🚀 Tính năng nổi bật

- ⚡️ Giao diện tốc độ cao với **Next.js 15**, hỗ trợ SSR & tối ưu SEO
- 🧠 Chatbot AI hỗ trợ tư vấn sản phẩm (OpenAI API)
- 💳 Tích hợp thanh toán qua **Stripe** và **PayPal**
- 📦 Quản lý đơn hàng, tồn kho & giao vận dễ dàng
- 📸 Upload ảnh sản phẩm với **UploadThing**
- 🔐 Đăng nhập bảo mật (OAuth + JWT)
- 🔔 Thông báo đơn hàng qua Email (NodeMailer)
- 📊 Hệ thống dashboard quản lý đơn, doanh thu & thống kê real-time
- 🧠 Gợi ý sản phẩm bằng AI (từ hành vi khách hàng)
- 🧾 Ghi log, bắt lỗi & monitor qua middleware + hệ thống logger

---

## 🧱 Công nghệ sử dụng

| Stack        | Công cụ                |
|--------------|------------------------|
| Frontend     | Next.js 15, Tailwind CSS |
| Backend      | Node.js, Express.js     |
| Cơ sở dữ liệu| MySQL + Prisma ORM      |
| AI           | OpenAI API              |
| Thanh toán   | Stripe, PayPal          |
| Ảnh          | UploadThing             |
| Email        | NodeMailer              |
| Auth         | NextAuth + JWT          |

---

# Tích hợp thanh toán PayOS vào dự án

Dự án đã được tích hợp PayOS cho phương thức thanh toán nội địa. Dưới đây là các hướng dẫn cấu hình và sử dụng.

## Cấu hình môi trường

Thêm các biến môi trường vào file `.env`:

```
# PayOS config
PAYOS_CLIENT_ID=0f6b31f2-ffc2-4169-a686-3705c0c83710
PAYOS_API_KEY=8b48f1a6-5312-4322-bb80-e7d53e1955db
PAYOS_CHECKSUM_KEY=b256fd4dac51301eafb0ab8f8e03882ac26d08d3c8378f83deb4cbdd7830f9af
NEXT_PUBLIC_NGROK_URL=https://your-ngrok-domain.ngrok-free.app
```

## Cấu hình Webhook

### Cách 1: Sử dụng trang cấu hình có sẵn
1. Sử dụng ngrok để tạo URL public cho localhost: `ngrok http 3000`
2. Truy cập vào trang cấu hình webhook: `https://your-domain.com/payos-setup`
3. Nhấn nút "Cấu hình Webhook" để đăng ký webhook URL với PayOS

### Cách 2: Sử dụng Postman (hoặc công cụ API tương tự)
1. Tạo request POST mới tới API của PayOS: `https://api-merchant.payos.vn/confirm-webhook`
2. Thêm các headers:
   ```
   Content-Type: application/json
   x-client-id: [PayOS Client ID]
   x-api-key: [PayOS API Key]
   ```
3. Thêm body dạng JSON:
   ```json
   {
     "webhookUrl": "https://your-domain.com/api/payos-webhook"
   }
   ```
4. Gửi request và kiểm tra kết quả. Nếu thành công, bạn sẽ nhận được response có `code: "00"`

### Cách 3: Sử dụng API của dự án
1. Gửi request POST tới endpoint: `https://your-domain.com/api/setup-payos-webhook`
2. Thêm body dạng JSON:
   ```json
   {
     "webhookUrl": "https://your-domain.com/api/payos-webhook"
   }
   ```
3. Kiểm tra kết quả trả về

## Quy trình thanh toán

1. Người dùng chọn phương thức thanh toán "BANK_TRANSFER" trên trang thanh toán
2. Khi nhấn "Đặt hàng", hệ thống sẽ:
   - Tạo đơn hàng trong database với trạng thái "PENDING"
   - Tạo bản ghi thanh toán với trạng thái "PENDING"
   - Chuyển hướng người dùng tới trang thanh toán của PayOS

3. Sau khi thanh toán:
   - Nếu thành công: Người dùng được chuyển hướng về trang xác nhận đơn hàng thành công
   - Nếu bị hủy: Người dùng được chuyển hướng về trang thông báo hủy đơn hàng
   - Trong cả hai trường hợp, PayOS sẽ gửi webhook để cập nhật trạng thái đơn hàng

## Các API và Routes

1. **API thanh toán**:
   - `POST /api/order`: Tạo đơn hàng và tạo link thanh toán PayOS
   - `GET /api/payos/success`: Xử lý khi thanh toán thành công
   - `GET /api/payos/cancel`: Xử lý khi thanh toán bị hủy
   - `POST /api/payos-webhook`: Nhận webhook từ PayOS
   - `POST /api/setup-payos-webhook`: Cấu hình webhook với PayOS

2. **Trang UI**:
   - `/payos-setup`: Trang cấu hình webhook PayOS

## Lưu ý

- Trong môi trường development, cần sử dụng ngrok để tạo URL public
- Mỗi khi ngrok URL thay đổi, cần cập nhật lại webhook trong dashboard của PayOS
- Kiểm tra logs ở server để theo dõi webhook và xử lý thanh toán

## Tài liệu PayOS

- [Tài liệu API PayOS](https://developer.payos.vn/docs/api/payment-requests)
- [Dashboard PayOS](https://my.payos.vn)




