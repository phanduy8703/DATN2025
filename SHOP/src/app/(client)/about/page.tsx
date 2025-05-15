/* eslint-disable @next/next/no-img-element */
"use client";
import { assets } from "@/app/assets/frontend_assets/assets";
import React, { useEffect } from "react";
import Title from "../components/Title";
import Aos from "aos";
import Image from "next/image";

const Page = () => {
  useEffect(() => {
    Aos.init();
  }, []);
  return (
    <div>
      {/* Phần tiêu đề */}

      <div className="text-2xl text-center pt-8 border-t uppercase my-4 ">
        <div className="">
          {" "}
          <Title title1="" title2="phần giới thiệu" />
        </div>
      </div>
      <div className="my-10 flex flex-col sm:flex-row gap-16">
        <Image
          width={200}
          height={200}
          src={assets.about_img.src}
          alt=""
          className="w-full md:max-w-[450px] "
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-easing="ease-in-out"
        />
        <div
          className="flex flex-col justify-center gap-6 md:w-2/4  "
          data-aos="fade-up-left"
          data-aos-duration="1000"
          data-aos-easing="ease-in-out"
        >
          <p>
            HaUI-Shop là một thương hiệu Công nghệ hàng đầu, cam kết cung cấp
            những sản phẩm Công nghệ chất lượng cao với thiết kế hiện đại và
            phong cách độc đáo. Chúng tôi tin rằng Công nghệ không chỉ là trang
            phục, mà là cách để bạn thể hiện cá tính và phong cách riêng của
            mình.
          </p>
          <p>
            {" "}
            Tại HaUI-Shop, chúng tôi không ngừng đổi mới để đáp ứng nhu cầu của
            khách hàng và tạo ra những sản phẩm không chỉ đẹp mà còn chất lượng.
            Chúng tôi hướng tới việc trở thành lựa chọn hàng đầu cho những ai
            yêu thích Công nghệ và muốn thể hiện phong cách cá nhân của mình.
          </p>
          <b className="text-3xl font-medium">Sứ mệnh</b>
          <p className="lowercase">
            Cung cấp sản phẩm công nghệ chất lượng cao với thiết kế hiện đại và
            phong cách độc đáo.
          </p>
        </div>
      </div>
      <div className="text-4xl py-4 text">
        <Title title1="" title2="Tại Sao Chọn Chúng Tôi" />
      </div>
      <div className="flex flex-col md:flex-row text-sm mb-5 ">
        <div
          className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5"
          data-aos="fade-right"
          data-aos-duration="1500"
          data-aos-easing="ease-in-out"
        >
          <b>Chất Lượng</b>
          <p>
            Chất lượng đạt chuẩn ISO
          </p>
        </div>
        <div
          className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5"
          data-aos="fade-left"
          data-aos-duration="1500"
          data-aos-easing="ease-in-out"
        >
          <b>Uy tín</b>
          <p>
            Uy tín tạo nên thương hiệu
          </p>
        </div>
        <div
          className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5"
          data-aos="fade-left"
          data-aos-duration="1500"
          data-aos-easing="ease-in-out"
        >
          <b>Thương hiệu</b>
          <p>
            Thương hiệu được tin dùng
          </p>
        </div>
        <div
          className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5"
          data-aos="fade-left"
          data-aos-duration="1500"
          data-aos-easing="ease-in-out"
        >
          <b>Công nghệ</b>
          <p>
            Công nghệ mới nhất 5/2025
          </p>
        </div>
        <div
          className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5"
          data-aos="fade-left"
          data-aos-duration="1500"
          data-aos-easing="ease-in-out"
        >
          <b>Bảo hành</b>
          <p>
            Luôn bảo hành chỉnh hãng
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
