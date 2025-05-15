/* eslint-disable @next/next/no-img-element */
import { ForMatPrice } from "@/lib/FormPrice";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaShoppingBag, FaEye } from "react-icons/fa";

interface IProduct {
  product_id: number;
  product_name: string;
  price: number;
  Images: { image_url: string | any }[];
  ProductPromotion?: { Promotion: { discount: number } }[];
}

const ProductItem = ({
  product_id,
  Images,
  price,
  product_name,
  ProductPromotion,
}: IProduct) => {
  const hasDiscount =
    ProductPromotion && ProductPromotion[0]?.Promotion.discount > 0;
  
  const discountPercentage = hasDiscount 
    ? ProductPromotion[0]?.Promotion.discount 
    : 0;
  
  const originalPrice = hasDiscount 
    ? price / (1 - discountPercentage/100) 
    : 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <Link
        href={`/product/${product_id}`}
        className="flex h-full flex-col"
      >
        {/* Product Image Container */}
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          {/* Primary Image */}
          <div className="absolute inset-0 transition-transform duration-500 transform group-hover:scale-105">
            <Image
              src={Images[0]?.image_url || "/placeholder.svg"}
              alt={product_name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
          
          {/* Overlay with second image on hover */}
          {Images[1] && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Image
                src={Images[1].image_url || "/placeholder.svg"}
                alt={`${product_name} - alternate view`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
              <FaEye className="w-4 h-4 text-gray-700" />
            </span>
            <span className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
              <FaShoppingBag className="w-4 h-4 text-gray-700" />
            </span>
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col p-4">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] mb-2">
            {product_name}
          </h3>
          
          <div className="flex justify-between items-end mt-auto">
            <div className="flex flex-col">
              <div className="flex items-center">
                {hasDiscount && (
                  <span className="text-xs text-gray-500 line-through mr-2">
                    {ForMatPrice(Math.round(originalPrice))}
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {ForMatPrice(price)}
                </span>
              </div>
              
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star} 
                    className="w-3 h-3 text-yellow-400"
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">(5.0)</span>
              </div>
            </div>
            
            <div className="text-xs text-white bg-indigo-500 rounded-full px-2 py-1 font-medium">
              Mới
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
