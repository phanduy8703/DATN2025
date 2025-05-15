import { NextRequest, NextResponse } from "next/server";
import { verifyPayOSSignature } from "@/lib/payos";
import prisma from "@/prisma/client";

// Cấu hình để nhận raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  console.log("PayOS Webhook called");
  
  // Xử lý body dưới dạng text
  const body = await req.text();
  let data;
  
  try {
    data = JSON.parse(body);
    console.log("Webhook data received:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Lỗi parse JSON:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  
  if (!checksumKey) {
    console.error("Missing PAYOS_CHECKSUM_KEY environment variable");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Lấy signature từ response
  const receivedSignature = data.signature;
  
  if (!receivedSignature) {
    console.error("Missing signature in webhook data");
    // Vẫn trả về 200 để PayOS không gửi lại liên tục
    return NextResponse.json({ received: true, warning: "Missing signature" }, { status: 200 });
  }
  
  // Xóa signature khỏi data để xác thực
  const dataToVerify = { ...data };
  delete dataToVerify.signature;
  
  // Kiểm tra tính hợp lệ của signature
  const isValid = verifyPayOSSignature(receivedSignature, dataToVerify, checksumKey);
  
  if (!isValid) {
    console.error("Invalid PayOS signature");
    // Vẫn trả về 200 để PayOS không gửi lại liên tục
    return NextResponse.json({ received: true, warning: "Invalid signature" }, { status: 200 });
  }

  // Xử lý cập nhật trạng thái thanh toán
  try {
    // Lấy thông tin đơn hàng từ PayOS data
    const paymentData = data.data;
    
    if (!paymentData || !paymentData.orderCode) {
      console.error("Missing order information in webhook data");
      return NextResponse.json({ received: true, error: "Missing order information" }, { status: 200 });
    }

    const orderId = parseInt(paymentData.orderCode);
    const paymentId = paymentData.id; // PayOS payment ID
    const status = paymentData.status; // PAID, CANCELLED, etc.
    
    console.log(`Processing payment for order #${orderId} with status: ${status}`);

    // Tìm bản ghi thanh toán
    const payment = await prisma.payment.findFirst({
      where: {
        order_id: orderId,
        payment_method: "BANK_TRANSFER",
      },
    });

    if (!payment) {
      console.error(`Không tìm thấy thanh toán cho đơn hàng #${orderId}`);
      return NextResponse.json({ received: true, error: "Payment record not found" }, { status: 200 });
    }

    // Cập nhật trạng thái thanh toán dựa trên status từ PayOS
    if (status === "PAID") {
      console.log(`Marking order #${orderId} as COMPLETED`);
      
      // Cập nhật payment status thành COMPLETED
      await prisma.payment.update({
        where: { payment_id: payment.payment_id },
        data: { 
          payment_status: "COMPLETED", 
          updated_at: new Date() 
        },
      });

      // Cập nhật trạng thái đơn hàng
      await prisma.order.update({
        where: { order_id: orderId },
        data: { 
          order_state: "PROCESSING", 
          updated_at: new Date() 
        },
      });
      
      console.log(`Order #${orderId} updated successfully`);
    } else if (status === "CANCELLED" || status === "EXPIRED") {
      console.log(`Marking order #${orderId} as FAILED`);
      
      // Cập nhật payment status thành FAILED
      await prisma.payment.update({
        where: { payment_id: payment.payment_id },
        data: { 
          payment_status: "FAILED", 
          updated_at: new Date() 
        },
      });

      // Cập nhật trạng thái đơn hàng
      await prisma.order.update({
        where: { order_id: orderId },
        data: { 
          order_state: "CANCELLED", 
          updated_at: new Date() 
        },
      });
      
      console.log(`Order #${orderId} marked as cancelled`);
    }

    return NextResponse.json({ received: true, status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Lỗi xử lý webhook PayOS:", error);
    // Vẫn trả về 200 để PayOS không gửi lại liên tục
    return NextResponse.json(
      { received: true, error: `Lỗi xử lý: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 200 }
    );
  }
} 