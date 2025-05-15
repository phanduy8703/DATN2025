/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import FilterSidebar from "./components/SideBar";
import SelectForm from "./components/SelectForm";
import ProductItem from "../components/ProductItem";
import Title from "../components/Title";
import { trackUserAction } from "@/lib/trackUserAction";

interface IProduct {
  product_id: number;
  product_name: string;
  price: number;
  Images: { image_url: string | any }[];
  ProductPromotion?: { Promotion: { discount: number } }[];
}

const PageProduct = () => {
  const searchParams = useSearchParams();
  const category_Id = searchParams.get("category_id");
  const searchQuery = searchParams.get("search") || "";
  const [product, setProduct] = useState<IProduct[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sortField, setSortField] = useState("price"); // Default sort field
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [isLoading, setIsLoading] = useState(true);

  // Hàm gọi API
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const endpoint = category_Id
        ? `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/categories/${category_Id}?sortField=${sortField}&sortOrder=${sortOrder}${
            maxPrice > 0 ? `&maxPrice=${maxPrice}` : ""
          }`
        : `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/product?search=${searchQuery}&sortField=${sortField}&sortOrder=${sortOrder}${
            maxPrice > 0 ? `&maxPrice=${maxPrice}` : ""
          }`;
      try {
        const req = await fetch(endpoint, {
          next: { revalidate: 60 },
        });
        const data = await req.json();
        if (category_Id) {
          if (data.category?.Products && data.category.Products.length > 0) {
            setProduct(data.category.Products);
            setErrorMessage("");
          } else {
            setProduct([]);
            setErrorMessage("Không có sản phẩm trong danh mục này.");
          }
        } else {
          if (data.product && data.product.length > 0) {
            setProduct(data.product);
            setErrorMessage("");
          } else {
            setProduct(data.product || []);
            setErrorMessage("Không tìm thấy sản phẩm với từ khóa này.");
          }
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        setErrorMessage("Có lỗi xảy ra khi lấy sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [category_Id, maxPrice, searchQuery, sortField, sortOrder]);

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Title title1="" title2="Bộ Sưu Tập Sản Phẩm" />
        {searchQuery !== "" && (
          <p className="text-sm text-gray-600 mt-2">
            Kết quả tìm kiếm cho: "
            <span className="text-base uppercase text-red-500 font-semibold">
              {searchQuery}
            </span>
            "
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4 w-full">
          <FilterSidebar onPriceChange={(price) => setMaxPrice(price)} />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 w-full">
          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <p className="text-gray-700 font-medium">
              {product.length} sản phẩm{category_Id ? " trong danh mục này" : ""}
            </p>
            <SelectForm
              onSortChange={handleSortChange}
              sortField={sortField}
              sortOrder={sortOrder}
            />
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : errorMessage ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {product.map((item) => (
                <ProductItem {...item} key={item.product_id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PageProduct />
    </Suspense>
  );
}
