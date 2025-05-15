"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // import useRouter
import { FaAngleDown, FaAngleUp, FaFilter, FaTag } from "react-icons/fa6";

interface ICategory {
  category_id: number;
  category_name: string;
}

interface ISideBarProps {
  onPriceChange: (price: number) => void;
}

const SideBar = ({ onPriceChange }: ISideBarProps) => {
  const [price, setPrice] = useState<number>(0);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Chỉ lưu một category_id
  const [isOpen, setIsOpen] = useState(true);
  const [isFillter, setIsFillter] = useState(true);
  const router = useRouter();

  const searchParams = useSearchParams();
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth <= 768) {
      setIsFillter(false);
    } else {
      setIsFillter(true);
    }
  }, [windowWidth]);

  useEffect(() => {
    async function ApiCategories() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          next: { revalidate: 300 },
        }
      );
      const data = await res.json();
      setCategories(data.categories);
    }
    ApiCategories();
  }, []);

  useEffect(() => {
    const categoryId = searchParams.get("category_id");
    if (categoryId) {
      setSelectedCategory(Number(categoryId));
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  // input range
  const handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
    onPriceChange(Number(e.target.value));
  };
  const handleCategoryChange = (categoryId: number) => {
    const newSelect = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelect);

    router.push(newSelect ? `?category_id=${newSelect}` : `/product`);
  };

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  return (
    <div className="w-full">
      {/* Mobile Filter Button */}
      <button 
        onClick={() => setIsFillter(!isFillter)}
        className="flex items-center justify-between w-full p-4 mb-4 bg-white rounded-lg shadow-sm lg:hidden border border-gray-100"
      >
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" />
          <span className="font-medium">Bộ lọc sản phẩm</span>
        </div>
        <span>{isFillter ? <FaAngleUp /> : <FaAngleDown />}</span>
      </button>
      
      {isFillter && (
        <div className="space-y-6">
          {/* Price Filter */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FaTag className="text-indigo-500" />
              <h3 className="font-medium text-gray-800">Khoảng Giá</h3>
            </div>
            
            <div className="px-1 pt-2">
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={50000}
                  value={price}
                  onChange={handleChangePrice}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                
                <div className="relative mt-6 pb-1">
                  <div className="absolute left-0 -top-4 transform -translate-x-1/2">
                    <div className="w-1 h-3 bg-gray-300"></div>
                  </div>
                  <div className="absolute right-0 -top-4 transform translate-x-1/2">
                    <div className="w-1 h-3 bg-gray-300"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>0₫</span>
                    <span>1.000.000₫</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-center">
                <p className="text-sm font-medium text-gray-800">
                  Giá đã chọn: <span className="text-indigo-600">{formatPrice(price)}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Categories Filter */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
            <div 
              onClick={() => setIsOpen(!isOpen)} 
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800">Danh Mục</h3>
              </div>
              <span className="text-lg text-gray-500">{isOpen ? "-" : "+"}</span>
            </div>
            
            {isOpen && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pt-2 px-1">
                {categories.map((item) => (
                  <div 
                    key={item.category_id}
                    onClick={() => handleCategoryChange(item.category_id)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedCategory === item.category_id 
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategory === item.category_id}
                        onChange={() => {}}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {selectedCategory === item.category_id && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-sm">{item.category_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
