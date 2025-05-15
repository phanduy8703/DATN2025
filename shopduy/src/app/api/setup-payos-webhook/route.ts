import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;

    if (!clientId || !apiKey) {
      return NextResponse.json(
        { error: "Missing PayOS credentials" },
        { status: 500 }
      );
    }

    // Lấy webhook URL từ request body hoặc sử dụng URL từ biến môi trường
    let webhookUrl;

    try {
      const data = await req.json();
      webhookUrl = data.webhookUrl;
    } catch (e) {
      // Không có JSON body, sử dụng URL từ biến môi trường
      webhookUrl = `${process.env.NEXT_PUBLIC_NGROK_URL}/api/payos-webhook`;
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Missing webhook URL" },
        { status: 400 }
      );
    }

    // Gọi API của PayOS để đăng ký webhook URL
    const response = await fetch("https://api-merchant.payos.vn/confirm-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ webhookUrl }),
    });

    const result = await response.json();

    if (result.code !== "00") {
      return NextResponse.json(
        { error: result.desc || "Lỗi cấu hình webhook PayOS" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Đã cấu hình PayOS webhook thành công",
        webhookUrl,
        response: result 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi cấu hình PayOS webhook:", error);
    return NextResponse.json(
      { error: `Lỗi cấu hình: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
} 