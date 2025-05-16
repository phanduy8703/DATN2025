import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderCode");

  if (!orderId) {
    return NextResponse.json(
      { message: "Missing order information" },
      { status: 400 }
    );
  }

  try {
    // Cập nhật trạng thái thanh toán
    if (paymentId) {
      await prisma.payment.updateMany({
        where: {
          order_id: parseInt(orderId),
          payment_method: "BANK_TRANSFER",
        },
        data: {
          payment_status: "FAILED",
          updated_at: new Date(),
        },
      });
    }

    // Cập nhật trạng thái đơn hàng
    await prisma.order.update({
      where: { order_id: parseInt(orderId) },
      data: {
        order_state: "CANCELLED",
        updated_at: new Date(),
      },
    });

    // Chuyển hướng về trang hủy đơn hàng
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_NGROK_URL}/order/cancel?orderCode=${orderId}`),
      302
    );
  } catch (error) {
    console.error("Lỗi xử lý PayOS cancel:", error);
    
    // Chuyển hướng tới trang lỗi
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_NGROK_URL}/order/cancel?orderCode=${orderId}&error=true`),
      302
    );
  }
} 
