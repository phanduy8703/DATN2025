"use client";
import React, { useEffect, useState } from "react";
import PageListOrder from "./components/TableOrder";

const Page = () => {
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  async function FetchApiOrder() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order`);
      const data = await res.json();
      
      if (res.ok && data.manageOrder) {
        setOrder(data.manageOrder);
      } else {
        console.error("Lỗi lấy dữ liệu đơn hàng:", data.message);
        setOrder([]);
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      setOrder([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    FetchApiOrder();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <PageListOrder orders={order || []} reloadData={FetchApiOrder} />
      )}
    </div>
  );
};

export default Page;
