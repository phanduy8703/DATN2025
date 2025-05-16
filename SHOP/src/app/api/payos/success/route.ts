import { NextRequest, NextResponse } from "next/server";
import { getPayOSPaymentInfo } from "@/lib/payos";
import prisma from "@/prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");
  const id = searchParams.get("id");

  if (!paymentId && !orderCode) {
    return NextResponse.json(
      { message: "Missing payment information" },
      { status: 400 }
    );
  }

  try {
    // Lấy orderId từ parameter hoặc thông tin thanh toán
    let orderId: number;
    let paymentStatus: string = "UNKNOWN";
    
    if (paymentId) {
      // Lấy thông tin thanh toán từ PayOS
      const paymentInfo = await getPayOSPaymentInfo(paymentId);
      
      if (!paymentInfo || !paymentInfo.data) {
        return NextResponse.json(
          { message: "Không thể lấy thông tin thanh toán" },
          { status: 400 }
        );
      }

      const paymentData = paymentInfo.data;
      orderId = parseInt(paymentData.orderCode);
      paymentStatus = paymentData.status;
    } else if (orderCode) {
      orderId = parseInt(orderCode);
      
      // Kiểm tra status từ URL trước
      if (status === "PAID") {
        paymentStatus = "PAID";
      } else {
        // Nếu không có status hoặc status không phải PAID, kiểm tra trong database
        const payment = await prisma.payment.findFirst({
          where: {
            order_id: orderId,
            payment_method: "BANK_TRANSFER",
          },
        });
        
        paymentStatus = payment?.payment_status === "COMPLETED" ? "PAID" : "UNKNOWN";
      }
    } else {
      return NextResponse.json(
        { message: "Missing order information" },
        { status: 400 }
      );
    }

    console.log(`Xử lý đơn hàng: ${orderId}, trạng thái: ${paymentStatus}, id: ${id}`);

    // Kiểm tra trạng thái thanh toán
    if (paymentStatus === "PAID" || status === "PAID") {
      // Cập nhật payment record nếu chưa được cập nhật bởi webhook
      await prisma.payment.updateMany({
        where: {
          order_id: orderId,
          payment_method: "BANK_TRANSFER",
          payment_status: { not: "COMPLETED" }
        },
        data: {
          payment_status: "COMPLETED",
          updated_at: new Date(),
        },
      });

      // Cập nhật order status nếu chưa được cập nhật
      await prisma.order.updateMany({
        where: { 
          order_id: orderId,
          order_state: "PENDING"
        },
        data: {
          order_state: "PROCESSING",
          updated_at: new Date(),
        },
      });

      // Chuyển hướng tới trang đơn hàng
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_NGROK_URL}/order/success?orderCode=${orderId}`),
        302
      );
    } else {
      // Thanh toán không thành công, chuyển hướng tới trang thất bại
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_NGROK_URL}/order/cancel?orderCode=${orderId}`),
        302
      );
    }
  } catch (error) {
    console.error("Lỗi xử lý PayOS success:", error);
    
    // Chuyển hướng tới trang lỗi
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_NGROK_URL}/order/cancel`),
      302
    );
  }
} 
