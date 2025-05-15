"use client";
import { FaUserShield } from "react-icons/fa";
import React, { useState } from "react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Title from "@/app/(client)/components/Title";
import Image from "next/image";

interface ICustomer {
  customer_id: number;
  name: string;
  email: string;
  phone: number;
  roleId: number;
  id_card_front?: string;
  id_card_data?: any;
}

interface Iprop {
  customer: ICustomer;
  reloadData: () => void;
}

const UpdateCustomer = ({ customer, reloadData }: Iprop) => {
  const MySwal = withReactContent(Swal);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState<string>(customer.email);
  const [email, setEmail] = useState<string>(customer.email);
  const [phone, setPhone] = useState<number | string>(customer.phone);
  const [roleId, setRoleId] = useState<number>(customer.roleId);
  const [idCardFront] = useState<string | undefined>(customer.id_card_front);
  const [idCardData] = useState<any>(customer.id_card_data);

  async function UpdateCustomerHandle(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/customer/${customer.customer_id}`,
      {
        method: "PUT",
        headers: { "content-Type": "aplication/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          phone, 
          roleId,
          id_card_front: idCardFront,
          id_card_data: idCardData
        }),
      }
    );

    if (res.ok) {
      setIsOpen(false);
      const data = await res.json();
      reloadData();
      MySwal.fire({
        position: "center",
        icon: "success",
        title: "Thay Đổi Thành Công",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      const dataError = await res.json();
      setIsOpen(false);
      console.log(dataError);
      MySwal.fire({
        position: "center",
        icon: "error",
        title: "bạn không có quyền thay đổi ",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  return (
    <div>
      <div
        className="p-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded text-xl"
        onClick={() => setIsOpen(true)}
      >
        <FaUserShield />
      </div>
      <div>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            ariaHideApp={false}
            onRequestClose={() => setIsOpen(false)}
            contentLabel="Thêm Khách Hàng"
            className="fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 backdrop-blue-md"
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              <Title title1="Phân Quyền" title2="Người Dùng" />
            </h2>
            <form className="space-y-4" onSubmit={UpdateCustomerHandle}>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tên Khách Hàng
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên khách hàng..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:border-blue-400"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nhập địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:border-blue-400"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:border-blue-400"
                  disabled
                />
              </div>

              {/* Thông tin căn cước */}
              {customer.id_card_data && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <h3 className="font-medium mb-3 text-gray-700">Thông tin căn cước</h3>
                  
                  {customer.id_card_front && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Ảnh căn cước:</p>
                      <div className="w-48 h-28 relative border rounded overflow-hidden">
                        <Image 
                          src={customer.id_card_front}
                          alt="Ảnh căn cước"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Số CCCD:</p>
                      <p className="font-medium">{customer.id_card_data?.ID || "Không có"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Họ tên (CCCD):</p>
                      <p className="font-medium">{customer.id_card_data?.Name || "Không có"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày sinh:</p>
                      <p className="font-medium">{customer.id_card_data?.["Date of Birth"] || "Không có"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày hết hạn:</p>
                      <p className="font-medium">{customer.id_card_data?.Expiry || "Không có"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Nơi cư trú:</p>
                      <p className="font-medium">{customer.id_card_data?.["Place of Residence"] || "Không có"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Khách hàng : 1 | Nhân Viên : 2 | Quản trị Viên : 3{" "}
                </label>
                <select
                  value={roleId}
                  className="p-3 rounded-lg border border-gray-300 w-full focus:outline-none focus:border-blue-400"
                  onChange={(e) => setRoleId(Number(e.target.value))}
                >
                  <option value="1"> Khách hàng</option>
                  <option value="2">Nhân Viên</option>
                  {/* <option value="3" disabled>
                    Quản trị Viên
                  </option> */}
                </select>
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 focus:outline-none transition duration-150"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 focus:outline-none transition duration-150"
                >
                  Lưu
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UpdateCustomer;
