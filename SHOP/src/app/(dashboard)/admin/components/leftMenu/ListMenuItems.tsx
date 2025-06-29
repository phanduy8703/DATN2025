import React from "react";
import { AiOutlineProduct } from "react-icons/ai";
import MenuItems from "./MenuItem";
import { TbCategory } from "react-icons/tb";
import { MdOutlineCategory } from "react-icons/md";
import {
  FaTruck,
  FaLinkedin,
  FaCloudSun,
  FaUser,
  FaGift,
  FaUndoAlt,
} from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import { MdOutlineRateReview } from "react-icons/md";
import { RiCoupon2Fill, RiCoupon3Fill } from "react-icons/ri";
import { RiLogoutCircleLine } from "react-icons/ri";
import { PiUsersThree } from "react-icons/pi";

const MenuItem = [
  {
    id: 1,
    icon: <TbCategory />,
    title: "Quản Lý Sản Phẩm",
    link: "#",
    submenu: [
      {
        id: 1,
        icon: <MdOutlineCategory />,
        title: "Danh Mục",
        link: "/admin/danhmuc/categories",
      },
      {
        id: 2,
        icon: <AiOutlineProduct />,
        title: "Sản Phẩm",
        link: "/admin/danhmuc/product",
      },
      {
        id: 3,
        icon: <FaTruck />,
        title: "Nhà Cung Cấp",
        link: "/admin/danhmuc/suppliers",
      },
      {
        id: 4,
        icon: <FaLinkedin />,
        title: "Thương Hiệu",
        link: "/admin/danhmuc/brand",
      },
      {
        id: 5,
        icon: <FaCloudSun />,
        title: "Xu Hướng",
        link: "/admin/danhmuc/season",
      },
    ],
  },
  {
    id: 2,
    icon: <FaUser />,
    title: "Quản Lý Khách Hàng",
    link: "#",
    submenu: [
      {
        id: 1,
        icon: <PiUsersThree />,
        title: "Khách Hàng",
        link: "/admin/danhmuc/customer",
      },

      {
        id: 2,
        icon: <FiPackage />,
        title: "Đơn Hàng",
        link: "/admin/danhmuc/order",
      },
      {
        id: 3,
        icon: <FaUndoAlt />, // hoặc <FaExchangeAlt />
        title: "Hoàn Trả ",
        link: "/admin/danhmuc/hoan-tra-don-hang", // nên là đường dẫn thật nếu có
      },

      {
        id: 4,
        icon: <MdOutlineRateReview />,
        title: "Đánh Giá ",
        link: "/admin/danhmuc/review",
      },
    ],
  },
  {
    id: 4,
    icon: <RiCoupon2Fill />,
    title: "Quản Lý Khuyến Mãi",
    link: "#",
    submenu: [
      {
        id: 1,
        icon: <FaGift />,
        title: " Khuyến Mãi",
        link: "/admin/danhmuc/promotion",
      },
      {
        id: 2,
        icon: <RiCoupon3Fill />,
        title: "Mã Giảm Giá",
        link: "/admin/danhmuc/coupon",
      },
    ],
  },
  {
    id: 5,
    icon: <RiLogoutCircleLine />,
    title: "Đăng Xuất",
    link: "/",
  },
];

const ListMenu = () => {
  return (
    <div>
      <ul>
        {MenuItem.map((menu) => (
          <li key={menu.id} className="mb-3 ">
            <MenuItems menuItem={menu} key={menu.id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListMenu;