/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import AddToCart from "../../cart/components/Addcart";
import RelatedProduct from "./RelatedProduct";
import TextCompact from "./TextCompact";
import { ForMatPrice } from "@/lib/FormPrice";
import ReViewProduct from "./ReViewProduct";
import Image from "next/image";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingBag, FaTags, FaRuler } from "react-icons/fa";

interface Size {
  stock_quantity: number;
  Size: {
    size_id: number;
    name_size: string;
  };
}

interface IProduct {
  product_id: number;
  product_name: string;
  description: string;
  price: string;
  stock_quantity: number;
  color: string;
  Category: { category_name: string };
  Images: { image_url: string }[];
  ProductSizes: Size[];
  sizes: { size_id: number; name_size: string; stock_quantity: number }[];
  Review: {
    review_id: number;
    comment_review: string;
    image_url: string;
    rating: number;
    review_date: string;
    seller_response: string;
    Customer: { name: string; image: string };
  }[];
}

interface IProps {
  productDetail: IProduct | null;
  originalPrice: number;
  countReview: number;
}

const ProductDetail = ({
  productDetail,
  originalPrice,
  countReview,
}: IProps) => {
  if (!productDetail) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const [sizeId, setSizeId] = useState<number | null>(null);

  const [selectImage, setSelectImage] = useState<string | null>(
    productDetail.Images[0]?.image_url || null
  );
  
  const handleSizeSelect = (size_id: number) => {
    setSizeId(size_id);
  };

  // Rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (productDetail.Review.length === 0) return 0;
    const totalRating = productDetail.Review.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / productDetail.Review.length;
  };

  const averageRating = calculateAverageRating();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-8 text-gray-500">
        <a href="/" className="hover:text-indigo-600 transition-colors">Trang chủ</a>
        <span className="mx-2">/</span>
        <a href="/product" className="hover:text-indigo-600 transition-colors">Sản phẩm</a>
        <span className="mx-2">/</span>
        <a href={`/product?category_id=${productDetail.Category?.category_name}`} className="hover:text-indigo-600 transition-colors">
          {productDetail.Category?.category_name}
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{productDetail.product_name}</span>
      </nav>
      
      {/* Product Section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Left: Images */}
        <div className="lg:w-3/5">
          <div className="flex flex-col-reverse gap-4 lg:flex-row">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto py-2">
              {productDetail.Images.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectImage(item.image_url)}
                  className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden
                    ${selectImage === item.image_url 
                      ? 'ring-2 ring-indigo-500 shadow-md transform scale-105 transition-all duration-300'
                      : 'border border-gray-200 opacity-80 hover:opacity-100 transition-all duration-200'
                    }`}
                  style={{ width: '80px', height: '80px' }}
                >
                  <Image
                    src={item.image_url}
                    alt={`${productDetail.product_name} - ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 relative bg-gray-50 rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
              <Image
                src={selectImage || productDetail.Images[0]?.image_url}
                alt={productDetail.product_name}
                className="object-contain transition-opacity duration-300"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                data-aos="fade-up" 
                data-aos-duration="800"
              />
              
              {originalPrice > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  -{Math.round(100 - (Number(productDetail.price) / originalPrice) * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right: Product Info */}
        <div className="lg:w-2/5">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {productDetail.product_name}
          </h1>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {renderRatingStars(averageRating)}
            </div>
            <span className="text-sm text-gray-500">
              ({productDetail.Review.length} đánh giá)
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-sm text-gray-500">
              Đã bán: {productDetail.stock_quantity}
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {ForMatPrice(Number(productDetail.price))}
            </span>
            {originalPrice > 0 && (
              <span className="text-xl text-gray-500 line-through">
                {ForMatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <TextCompact>{productDetail.description}</TextCompact>
          </div>
          
          {/* Colors */}
          {productDetail.color && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FaTags className="text-gray-500" />
                <span className="font-medium">Màu sắc:</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full border shadow-sm"
                  style={{ backgroundColor: productDetail.color }}
                ></div>
                <span className="text-sm text-gray-700 capitalize">{productDetail.color}</span>
              </div>
            </div>
          )}
          
          {/* Sizes */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FaRuler className="text-gray-500" />
              <span className="font-medium">Kích thước:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {productDetail.ProductSizes.map((item) => (
                <button
                  key={item.Size.size_id}
                  onClick={() => handleSizeSelect(item.Size.size_id)}
                  disabled={item.stock_quantity === 0}
                  className={`
                    py-2 px-4 rounded-md transition-all duration-200
                    ${item.Size.size_id === sizeId 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-500'}
                    ${item.stock_quantity === 0 
                      ? 'opacity-50 cursor-not-allowed line-through' 
                      : 'cursor-pointer'}
                  `}
                >
                  {item.Size.name_size}
                  {item.stock_quantity > 0 && (
                    <span className="text-xs block mt-1">
                      Còn {item.stock_quantity}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Add to Cart */}
          <div className="mb-8">
            <AddToCart
              product={productDetail}
              selectedSizeId={sizeId}
              stockQuantity={
                productDetail?.ProductSizes.find(
                  (item) => item.Size.size_id === sizeId
                )?.stock_quantity || 0
              }
            />
          </div>
          
          {/* Policy Info */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">Chính sách mua hàng:</h3>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Sản phẩm sale không hỗ trợ đổi - trả.</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Sản phẩm nguyên giá được đổi trong 3 ngày.</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Sản phẩm còn đủ tem mác, chưa qua sử dụng.</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="mt-0.5 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Sản phẩm được đổi 1 lần duy nhất, không hỗ trợ trả.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <div className="mb-16">
        <RelatedProduct
          category_name={productDetail.Category.category_name}
          currentProductId={productDetail.product_id}
        />
      </div>
      
      {/* Reviews Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaStar className="text-yellow-400" />
          Đánh Giá Sản Phẩm ({countReview})
        </h2>
        
        {productDetail.Review.length > 0 ? (
          <div className="space-y-6">
            {productDetail.Review.map((item) => (
              <ReViewProduct
                review={item}
                countReview={countReview}
                key={item.review_id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg py-10 text-center">
            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
            <p className="text-sm text-gray-400 mt-2">Hãy là người đầu tiên đánh giá!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
