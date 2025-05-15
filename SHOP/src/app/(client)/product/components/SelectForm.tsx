import React from "react";
import { FaSortAmountDown } from "react-icons/fa";

interface SelectFormProps {
  sortField: string;
  sortOrder: string;
  onSortChange: (sortField: string, sortOrder: string) => void;
}

const SelectForm = ({
  sortField,
  sortOrder,
  onSortChange,
}: SelectFormProps) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <FaSortAmountDown className="text-gray-500" />
        <select
          className="appearance-none bg-white border border-gray-200 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-all duration-200"
          value={sortField && sortOrder ? `${sortField}-${sortOrder}` : ""}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            if (field && order) {
              onSortChange(field, order);
            }
          }}
        >
          <option value="created_at-desc">Mới Nhất</option>
          <option value="price-asc">Giá Tăng Dần</option>
          <option value="price-desc">Giá Giảm Dần</option>
          <option value="product_name-asc">Từ A đến Z</option>
          <option value="product_name-desc">Từ Z đến A</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectForm;
