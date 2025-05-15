"use client";
import { ShopConText } from "@/app/context/Context";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface IUpdate {
  name: string;
  phone: string;
  username: string;
  image: string;
  email: string;
  id_card_front?: string; // Đường dẫn ảnh CCCD
  id_card_data?: any; // Dữ liệu CCCD đã quét
}

const ProfileUsername = () => {
  const { user, setUser } = useContext(ShopConText)!;
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // State cho quét căn cước công dân mặt trước
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [idCardData, setIdCardData] = useState<any>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Đường dẫn tới API quét CCCD từ biến môi trường client
  const OCR_API_URL = process.env.NEXT_PUBLIC_CCCD_OCR_API_URL;
  const API_URL = process.env.NEXT_PUBLIC_API_URL; // API server URL

  useEffect(() => {
    if (user as IUpdate) setLoading(false);
    // Nếu người dùng đã có dữ liệu căn cước, cập nhật state
    if (user && user.id_card_data) {
      console.log("Dữ liệu căn cước từ context:", user.id_card_data);
      console.log("Ảnh căn cước từ context:", user.id_card_front);
      setIdCardData(user.id_card_data);
    }
  }, [user]);

  const MySwal = withReactContent(Swal);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File quá lớn! Vui lòng chọn ảnh nhỏ hơn 1MB.");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Hàm xử lý upload và quét căn cước
  const handleIdCardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFile(file);
      setIdCardPreview(URL.createObjectURL(file));
      setScanning(true);
      setScanError(null);
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${OCR_API_URL}/predict`, { method: 'POST', body: form });
        if (!res.ok) throw new Error('Không quét được căn cước');
        const data = await res.json();
        if (data.result) {
          setIdCardData(data.result);
          // Tự động lưu thông tin căn cước lên server
          const saveForm = new FormData();
          saveForm.append('id_card', file);
          saveForm.append('id_card_data', JSON.stringify(data.result));
        }
        else throw new Error('Dữ liệu căn cước không hợp lệ');
      } catch (err: any) {
        setScanError(err.message || 'Lỗi quét căn cước');
        setIdCardData(null);
        setIdCardFile(null);
        setIdCardPreview(null);
      } finally {
        setScanning(false);
      }
    }
  };

  async function UpdateHandle(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("phone", user.phone as string);
    if (image) formData.append("files", image);
    // Gửi dữ liệu căn cước nếu đã quét thành công
    if (idCardData && idCardFile) {
      formData.append("id_card", idCardFile);
      formData.append("id_card_data", JSON.stringify(idCardData));
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-information`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();

    if (res.ok) {
      MySwal.fire({
        title: "<strong>Cập Nhật Thành Công</strong>",
        html: "Thông tin của bạn đã được cập nhật thành công!",
        icon: "success",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 2500,
        timerProgressBar: true,
      });
    } else {
      setSuccessMessage("Cập nhật thất bại. Vui lòng thử lại.");
    }
  }

  return (
    <div className="max-w-7xl h-screen overflow-hidden  border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
        <h2 className="text-center text-2xl font-bold">Thông Tin Cá Nhân</h2>
        <p className="mt-2 text-center text-white/80">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {successMessage && (
            <div className="mx-6 my-4 rounded border-l-4 border-green-500 bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <p>{successMessage}</p>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col gap-8 md:flex-row">
              {/* Profile Image Section */}
              <div className="flex w-full flex-col items-center rounded-lg bg-gray-50 p-6 dark:bg-slate-700/50 md:w-1/3">
                <div className="group relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-500 shadow-md">
                    <Image
                      width={200}
                      height={200}
                      src={preview || user.image || "/Image/anhdaidien.jpg"}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-sm text-white"
                    >
                      Thay đổi
                    </label>
                  </div>
                </div>

                <label
                  htmlFor="image-upload"
                  className="mt-4 cursor-pointer rounded-full bg-emerald-500 px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-emerald-600"
                >
                  Chọn ảnh
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    name="image"
                    accept=".jpeg,.jpg,.png"
                    onChange={handleImageChange}
                  />
                </label>

                <div className="mt-4 space-y-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>Dụng lượng file tối đa 1 MB</p>
                  <p>Định dạng: .JPEG, .PNG</p>
                </div>
              </div>

              {/* Form Section */}
              <div className="w-full md:w-2/3">
                <form onSubmit={UpdateHandle} className="space-y-6">
                  {/* Phần upload Căn cước */}
                  <div className="mb-4">
                    
                    {!idCardData && !user.id_card_data ? (
                      <>
                        <label className="block text-sm font-semibold uppercase">Căn cước công dân</label>
                        <input type="file" accept="image/*" onChange={handleIdCardChange} disabled={scanning} />
                        {scanning && <p>Đang quét căn cước, vui lòng chờ...</p>}
                        {scanError && <p className="text-red-500">{scanError}</p>}
                      </>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bạn đã xác minh nội dung căn cước công dân.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Họ Và Tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={user?.name || ""}
                          onChange={(e) =>
                            setUser({
                              ...user,
                              name: e.target.value.trim(),
                            })
                          }
                          className="w-full  rounded-md border border-gray-300 bg-gray-50 px-3 py-2 transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Số Điện Thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={user?.phone || ""}
                          onChange={(e) =>
                            setUser({ ...user, phone: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      {(idCardData || user.id_card_data) && (
                        <>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Số CCCD
                            </label>
                            <input
                              type="text"
                              disabled
                              value={(idCardData || user.id_card_data)?.ID || ""}
                              className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Họ và tên (theo CCCD)
                            </label>
                            <input
                              type="text"
                              disabled
                              value={(idCardData || user.id_card_data)?.Name || ""}
                              className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tài Khoản
                        </label>
                        <input
                          type="text"
                          disabled
                          value={user.username || ""}
                          className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                          placeholder="Vô hiệu hóa"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="text"
                          disabled
                          value={user.email || ""}
                          className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                          placeholder="Vô hiệu hóa"
                        />
                      </div>

                      {(idCardData || user.id_card_data) && (
                        <>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Ngày sinh
                            </label>
                            <input
                              type="text"
                              disabled
                              value={(idCardData || user.id_card_data)?.["Date of Birth"] || ""}
                              className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Ngày hết hạn
                            </label>
                            <input
                              type="text"
                              disabled
                              value={(idCardData || user.id_card_data)?.Expiry || ""}
                              className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Nơi cư trú
                            </label>
                            <input
                              type="text"
                              disabled
                              value={(idCardData || user.id_card_data)?.["Place of Residence"] || ""}
                              className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 dark:border-slate-700 dark:bg-slate-600 dark:text-gray-400"
                            />
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-md bg-emerald-500 px-6 py-2 text-white transition-all duration-300 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Lưu thông tin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileUsername;
