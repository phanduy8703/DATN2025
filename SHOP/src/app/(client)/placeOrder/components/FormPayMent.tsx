"use client";
import { ShopConText } from "@/app/context/Context";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { trackUserAction } from "@/lib/trackUserAction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreditCard, Banknote, Wallet, CheckCircle, Clock, CreditCardIcon } from "lucide-react";
import { ForMatPrice } from "@/lib/FormPrice";

interface CartItem {
  cartitem_id: number;
  product_id: number;
  quantity: number;
  selectedSize: string;
  product: {
    product_name: string;
    price: string;
    Images: { image_url: string }[];
  };
}

interface CartData {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface OrderResponse {
  message?: string;
  order?: any;
  paymentIntentClientSecret?: string;
  links?: any[];
  paymentUrl?: string; // Thêm paymentUrl cho PayOS
}

const PaymentMethodForm = ({
  addressId,
  cart,
}: {
  addressId: number;
  cart: CartData;
}) => {
  const { finalTotal } = useContext(ShopConText)!;
  console.log("endgame", finalTotal);

  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CREDIT_CARD" | "E_WALLET" | "BANK_TRANSFER"
  >("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    clientSecret?: string;
    paymentUrl?: string;
    cart?: CartData;
  }>({});
  const router = useRouter();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsProcessing(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Gửi cookie nếu cần
          body: JSON.stringify({
            addressId,
            paymentMethod,
            finalTotal,
          }),
        }
      );

      const data: OrderResponse = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Đã xảy ra lỗi khi đặt hàng");
        setIsProcessing(false);
        return;
      }

      // Xử lý từng phương thức thanh toán
      if (paymentMethod === "CREDIT_CARD" && data.paymentIntentClientSecret) {
        // Thanh toán bằng Stripe
        setPaymentDetails({
          clientSecret: data.paymentIntentClientSecret,
          cart,
        });
        setIsModalOpen(true);
      } else if (paymentMethod === "E_WALLET" && data.links) {
        // Thanh toán bằng PayPal
        const approvalUrl = data.links.find(
          (link: any) => link.rel === "approve"
        )?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        }
      } else if (paymentMethod === "BANK_TRANSFER" && data.paymentUrl) {
        // Thanh toán bằng PayOS
        window.location.href = data.paymentUrl;
      } else if (paymentMethod === "CASH") {
        // Thanh toán khi nhận hàng
        toast.success("Đã đặt thành công đơn hàng");
        await Promise.all(
          cart.items.map((item) => trackUserAction(item.product_id, "purchase"))
        );
        router.push("/profile/listorder");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Đã xảy ra lỗi mạng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreditCardPayment = () => {
    if (paymentDetails.clientSecret && paymentDetails.cart) {
      router.push(
        `/thanhtoan?paymentIntentClientSecret=${encodeURIComponent(
          paymentDetails.clientSecret
        )}&cart=${encodeURIComponent(JSON.stringify(paymentDetails.cart))}`
      );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md mb-6 p-4">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Phương Thức Thanh Toán
        </h2>
        <p className="text-gray-600">
          Chọn phương thức thanh toán bạn muốn sử dụng
        </p>
      </div>

      <div>
        <form onSubmit={handlePaymentSubmit}>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="CASH"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
                className="form-radio text-blue-600"
                disabled={isProcessing}
              />
              <div className="flex items-center space-x-3">
                <Banknote className="text-green-600" size={24} />
                <span className="text-gray-700">Thanh toán khi nhận hàng</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="CREDIT_CARD"
                checked={paymentMethod === "CREDIT_CARD"}
                onChange={() => setPaymentMethod("CREDIT_CARD")}
                className="form-radio text-blue-600"
                disabled={isProcessing}
              />
              <div className="flex items-center space-x-3">
                <CreditCard className="text-blue-600" size={24} />
                <span className="text-gray-700">Thẻ tín dụng/Ghi nợ</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="E_WALLET"
                checked={paymentMethod === "E_WALLET"}
                onChange={() => setPaymentMethod("E_WALLET")}
                className="form-radio text-blue-600"
                disabled={isProcessing}
              />
              <div className="flex items-center space-x-3">
                <Wallet className="text-purple-600" size={24} />
                <span className="text-gray-700">PayPal</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="BANK_TRANSFER"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                className="form-radio text-blue-600"
                disabled={isProcessing}
              />
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="text-red-600" size={24} />
                <span className="text-gray-700">PayOS (Thanh toán nội địa)</span>
              </div>
            </label>
          </div>

          <hr className="border-t border-gray-200 my-4" />

          <button
            type="submit"
            className="w-full py-3 px-4 
              bg-blue-600 text-white 
              rounded-lg 
              hover:bg-blue-700 
              transition-colors 
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Clock className="mr-2 animate-spin" size={20} />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" size={20} />
                Đặt Hàng
              </>
            )}
          </button>
        </form>
      </div>

      {/* Modal xác nhận thanh toán Stripe */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Bạn sẽ được chuyển đến trang thanh toán của Stripe để hoàn tất
              thanh toán.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3">
            <p className="text-sm text-gray-600">
              Tổng tiền thanh toán:{" "}
              <span className="font-semibold">
                {ForMatPrice(finalTotal)} VNĐ
              </span>
            </p>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              onClick={handleCreditCardPayment}
            >
              Tiếp tục thanh toán
            </button>
            <button
              className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodForm;
