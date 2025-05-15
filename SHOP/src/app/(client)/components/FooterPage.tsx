import Link from "next/link";
import React from "react";
import { RiStore3Line } from "react-icons/ri";
import Image from "next/image";
import { FaDownload, FaHeadset, FaFileAlt, FaLaptopCode } from "react-icons/fa";

const FooterPage = () => {
  return (
    <div className="flex flex-col sm:flex-row mt-32 mb-5  ">
      <div
        className="w-full md:w-1/4 sm:w-1/4 p-2  "
        data-aos="fade-down"
        data-aos-easing="ease-out-back"
        data-aos-duration="1300"
      >
        <div className=" flex flex-col items-center border p-4 rounded-md ">
          <div className="icon ">
            <Link href="/">
              <FaDownload className="text-5xl bg-blue-600/80 rounded-full p-2 hover:rounded-md transform transition-transform duration-500 hover:rotate-360 text-white" />
            </Link>
          </div>
          <div className=" text-center">
            <h3 className="text-lg font-semibold text-blue-600/80">
              TẢI XUỐNG NGAY
            </h3>
            <p className="">
              Tải xuống sau{" "}
              <span className="dark:text-blue-500 text-black font-bold text-xl">
                5 phút
              </span>
            </p>
          </div>
        </div>
      </div>
      <div
        className="w-full md:w-1/4 sm:w-1/4 p-2 "
        data-aos="fade-down"
        data-aos-easing="ease-out-back"
        data-aos-duration="1450"
      >
        <div className=" flex flex-col items-center border p-4 rounded-md ">
          <div className="icon ">
            <Link href="/">
              <FaFileAlt className="text-5xl bg-blue-600/80 rounded-full p-2 hover:rounded-md transform transition-transform duration-500 hover:rotate-360 text-white" />
            </Link>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-600/80">
              CẬP NHẬT MIỄN PHÍ
            </h3>
            <p className="">
              Cập nhật trong{" "}
              <span className="dark:text-blue-500 text-black font-bold text-xl">
                6 tháng
              </span>
            </p>
          </div>
        </div>
      </div>
      <div
        className="w-full md:w-1/4 sm:w-1/4 p-2 "
        data-aos="fade-down"
        data-aos-easing="ease-out-back"
        data-aos-duration="1600"
      >
        <div className=" flex flex-col items-center border p-4 rounded-md ">
          <div className="icon ">
            <Link href="/">
              <FaHeadset className="text-5xl bg-blue-600/80 rounded-full p-2 hover:rounded-md transform transition-transform duration-500 hover:rotate-360 text-white" />
            </Link>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-600/80">HỖ TRỢ KỸ THUẬT</h3>
            <p className="">
              <span className="dark:text-blue-500 text-black font-bold text-xl">
                0000.123.456
              </span>
            </p>
          </div>
        </div>
      </div>
      <div
        className="w-full md:w-1/4 sm:w-1/4 p-2 "
        data-aos="fade-down"
        data-aos-easing="ease-out-back"
        data-aos-duration="1700"
      >
        <div className=" flex flex-col items-center border p-4 rounded-md ">
          <div className="STORE">
            <Link href="/hethongcuahang">
              <FaLaptopCode className="text-5xl bg-blue-600/80 rounded-full p-2 hover:rounded-md transform transition-transform duration-500 hover:rotate-360 text-white" />
            </Link>
          </div>
          <div className="detail-sv text-center">
            <h3 className="text-lg font-semibold text-blue-600/80">
              TRUY CẬP 24/7
            </h3>
            <p className="">
              <span className="dark:text-blue-500 text-black font-bold text-xl">
                {" "}
                Mọi lúc, mọi nơi{" "}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterPage;
