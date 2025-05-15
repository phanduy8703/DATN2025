"use client";

import { useState } from "react";

export default function PayOSSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const setupWebhook = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/setup-payos-webhook", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Lỗi cấu hình webhook");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Cấu hình PayOS Webhook</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="mb-4">
          Webhook URL: <code className="bg-gray-100 p-1 rounded">
            https://1ba2-2405-4802-1fa-f70-5403-2fbb-6e5a-85ab.ngrok-free.app/api/payos-webhook
          </code>
        </p>
        
        <button
          onClick={setupWebhook}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Đang cấu hình..." : "Cấu hình Webhook"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Lỗi:</strong> {error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p><strong>Trạng thái:</strong> {result.success ? "Thành công" : "Thất bại"}</p>
          <p><strong>Thông báo:</strong> {result.message}</p>
          
          <div className="mt-4">
            <h3 className="font-bold">Chi tiết phản hồi:</h3>
            <pre className="bg-gray-100 p-3 mt-2 rounded overflow-auto max-h-40">
              {JSON.stringify(result.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <h2 className="font-bold mb-2">Hướng dẫn</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Đảm bảo server đang chạy và ngrok đã được khởi động</li>
          <li>Nhấn nút "Cấu hình Webhook" để đăng ký webhook URL với PayOS</li>
          <li>Kiểm tra kết quả từ phản hồi của PayOS</li>
          <li>Nếu thành công, bạn đã sẵn sàng nhận callback từ PayOS</li>
        </ol>
      </div>
    </div>
  );
} 