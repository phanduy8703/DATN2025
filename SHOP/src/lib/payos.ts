import crypto from 'crypto';

// Hàm tạo signature cho PayOS API
export const createPayOSSignature = (data: Record<string, any>, checksumKey: string): string => {
  // Sắp xếp các trường theo alphabet
  const sortedParams = Object.keys(data)
    .sort()
    .filter(key => data[key] !== undefined && data[key] !== null)
    .map(key => `${key}=${data[key]}`)
    .join('&');

  // Tạo signature bằng HMAC SHA256
  return crypto
    .createHmac('sha256', checksumKey)
    .update(sortedParams)
    .digest('hex');
};

// Hàm xác minh signature từ PayOS
export const verifyPayOSSignature = (
  receivedSignature: string, 
  data: Record<string, any>, 
  checksumKey: string
): boolean => {
  const calculatedSignature = createPayOSSignature(data, checksumKey);
  return receivedSignature === calculatedSignature;
};

// Hàm tạo link thanh toán PayOS
export const createPayOSPaymentLink = async (
  orderCode: number,
  amount: number,
  description: string,
  buyerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  },
  cancelUrl: string,
  returnUrl: string,
  expiredAt?: number
) => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error('Missing PayOS credentials');
  }

  // Chuẩn bị dữ liệu cho request
  const payload = {
    orderCode,
    amount,
    description,
    buyerName: buyerInfo.name,
    buyerEmail: buyerInfo.email,
    buyerPhone: buyerInfo.phone,
    buyerAddress: buyerInfo.address,
    cancelUrl,
    returnUrl,
    expiredAt,
  };

  // Tạo signature
  const signatureData = {
    amount,
    cancelUrl,
    description,
    orderCode,
    returnUrl,
  };
  
  const signature = createPayOSSignature(signatureData, checksumKey);

  // Thêm signature vào payload
  const requestBody = {
    ...payload,
    signature,
  };

  // Gọi API PayOS
  try {
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    // Kiểm tra nếu có lỗi
    if (result.code !== '00') {
      throw new Error(result.desc || 'Lỗi tạo link thanh toán');
    }

    return result;
  } catch (error) {
    console.error('PayOS API Error:', error);
    throw error;
  }
};

// Hàm lấy thông tin link thanh toán
export const getPayOSPaymentInfo = async (paymentId: string) => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error('Missing PayOS credentials');
  }

  try {
    const response = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${paymentId}`, {
      method: 'GET',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
    });

    const result = await response.json();

    // Kiểm tra nếu có lỗi
    if (result.code !== '00') {
      throw new Error(result.desc || 'Lỗi lấy thông tin thanh toán');
    }

    return result;
  } catch (error) {
    console.error('PayOS API Error:', error);
    throw error;
  }
};

// Hàm hủy link thanh toán
export const cancelPayOSPayment = async (paymentId: string, cancelReason?: string) => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error('Missing PayOS credentials');
  }

  try {
    const response = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ cancellationReason: cancelReason }),
    });

    const result = await response.json();

    // Kiểm tra nếu có lỗi
    if (result.code !== '00') {
      throw new Error(result.desc || 'Lỗi hủy thanh toán');
    }

    return result;
  } catch (error) {
    console.error('PayOS API Error:', error);
    throw error;
  }
}; 