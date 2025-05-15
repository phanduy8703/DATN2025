import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { webhookUrl } = await req.json();
  
  // PayOS sẽ gửi một request đến webhookUrl này để kiểm tra xem nó có hợp lệ không
  // Chúng ta cần trả về status 200 và code "00" để xác nhận webhook hoạt động
  
  try {
    if (!webhookUrl) {
      return NextResponse.json(
        { code: "01", desc: "Missing webhook URL" },
        { status: 400 }
      );
    }
    
    // Kiểm tra xem webhookUrl có trỏ đến endpoint webhook của chúng ta không
    const expectedWebhookPath = "/api/payos-webhook";
    if (!webhookUrl.includes(expectedWebhookPath)) {
      console.warn(`Webhook URL ${webhookUrl} không chứa đường dẫn ${expectedWebhookPath}`);
    }
    
    // Trả về phản hồi thành công theo yêu cầu của PayOS
    return NextResponse.json(
      { code: "00", desc: "success" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi xác nhận webhook:", error);
    return NextResponse.json(
      { code: "99", desc: "Server error" },
      { status: 500 }
    );
  }
} 