import React, { useState } from "react";
import UpdateProduct from "./UpdateProduct";
import DeleteProduct from "./DeleteProduct";
import { ForMatPrice } from "@/lib/FormPrice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  description: string;
  category_id: number;
  brand_id: number;
  stock_quantity: number;
  color: string;
  season_id: number;
  sizes: any[];
  ProductSizes: {
    stock_quantity: number;
    Size?: {
      size_id: number;
      name_size: string;
    };
  }[];
  Images: {
    image_id: number;
    image_url: string;
  }[];
}
interface ICategory {
  category_id: number;
  category_name: string;
}

interface IBrand {
  brand_id: number;
  brand_name: string;
}
interface ISeason {
  season_id: number;
  season_name: string;
}
interface ISize {
  size_id: number;
  name_size: string;
}

interface ITable {
  productData: Product[];
  reloadData: () => void;
  searchTerm: string;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  category: ICategory[];
  brand: IBrand[];
  season: ISeason[];
  size: ISize[];
}

const TableProduct = (props: ITable) => {
  const [showAllImages, setShowAllImages] = useState<number | null>(null);

  const toggleShowAllImages = (id: number) => {
    setShowAllImages(showAllImages === id ? null : id);
  };

  return (
    <Table className="w-full table-auto bg-white shadow-md rounded-lg ">
      <TableHeader className="p-5">
        <TableRow className="bg-gray-950 border-b border-gray-300 text-black">
          <TableHead className="px-4 py-2 flex items-center gap-2 text-black">
            <div>Tên sản phẩm</div>
            <div
              className="cursor-pointer"
              onClick={() =>
                props.setSortOrder(props.sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {props.sortOrder === "asc" ? (
                <p className="text-lg">↓</p>
              ) : (
                <p className="text-lg">↑</p>
              )}
            </div>
          </TableHead>
          <TableHead className="py-2 pl-10 text-black">Giá</TableHead>
          <TableHead className="px-4 py-2 text-black">Tổng số lượng</TableHead>
          <TableHead className="px-4 py-2 hidden md:block ml-3 text-black">
            Kích Thước
          </TableHead>
          <TableHead className="pl-10 py-2 text-black">Hình ảnh</TableHead>
          <TableHead className="px-4 py-2 text-black">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      {props.productData.length ? (
        <TableBody>
          {props.productData.map((product, index) => (
            <TableRow
              key={product.product_id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-300"
            >
              <TableCell className="px-4 py-2 text-black">
                {product.product_name}
              </TableCell>
              <TableCell className="px-4 py-2 text-lg font-semibold text-gray-800">
                {ForMatPrice(product.price)}
              </TableCell>
              <TableCell className="px-4 py-2 text-center text-black">
                {product.stock_quantity || 'N/A'} {product.stock_quantity ? 'số lượng' : ''}
              </TableCell>
              <TableCell className="px-4 py-2 hidden md:block text-black">
                <div className="flex gap-1 mt-6">
                  {product.ProductSizes?.map ? product.ProductSizes.map((size, index) => (
                    <p
                      key={index}
                      className="border border-gray-700 py-1 px-2 hover:bg-slate-200 text-black"
                      title={`số lượng còn ${size.stock_quantity || 0} `}
                    >
                      {size.Size?.name_size || 'N/A'}
                    </p>
                  )) : <p className="text-gray-400">Không có kích thước</p>}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2 relative text-black">
                <div className="flex items-center justify-center">
                  {product.Images && product.Images[0]?.image_url ? (
                    <Image
                      width={200}
                      height={200}
                      src={product.Images[0]?.image_url}
                      alt={`Hình ảnh sản phẩm ${index}`}
                      className="w-20 h-20 object-cover rounded-md shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-md">
                      Không có ảnh
                    </div>
                  )}
                  {product.Images && product.Images.length > 1 && (
                    <button
                      className="ml-2 text-black hover:text-gray-600 focus:outline-none"
                      onClick={() => toggleShowAllImages(product.product_id)}
                    >
                      {showAllImages === product.product_id ? "▲" : "▼"}
                    </button>
                  )}
                </div>
                {showAllImages === product.product_id && (
                  <div className="absolute z-10 bg-white mt-2 cursor-pointer w-full">
                    <div className="flex space-x-2 justify-center">
                      {product.Images?.map((image, imageIndex) => (
                        <Image
                          width={200}
                          height={200}
                          key={imageIndex}
                          src={image.image_url}
                          alt={`Hình ảnh sản phẩm ${index}-${imageIndex}`}
                          className="w-20 h-20 object-cover border border-gray-700 rounded-md shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell className="px-4 py-2 text-center text-black">
                <div className="flex space-x-4 ">
                  <DeleteProduct
                    product_id={product.product_id}
                    reloadData={props.reloadData}
                  />
                  {!showAllImages && (
                    <UpdateProduct
                      {...product}
                      reloadData={props.reloadData}
                      brand={props.brand}
                      category={props.category}
                      season={props.season}
                      size={props.size}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      ) : (
        <TableBody className="mt-5">
          <TableRow>
            <TableCell colSpan={6} className="text-center text-black">
              không tìm thấy sản phẩm có tên này{" "}
              <span className="text-2xl text-red-600 font-semibold">
                {props.searchTerm}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      )}
    </Table>
  );
};

export default TableProduct;
