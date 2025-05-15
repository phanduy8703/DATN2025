import cloudinary from "@/app/config/cloudinaty";
import prisma from "@/prisma/client";
import { authCustomer } from "@/utils/Auth";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const customer = await authCustomer(req);
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const files = formData.getAll("files") as File[];
  // Lấy thông tin căn cước
  const idCardFile = formData.get("id_card") as File;
  const idCardDataStr = formData.get("id_card_data") as string;

  if (!customer) {
    return NextResponse.json(
      { message: "vui lòng đăng nhập" },
      { status: 400 }
    );
  }

  try {
    // Upload ảnh đại diện
    const uploadPromises = files.map(async (item) => {
      const buffer = await item.arrayBuffer();
      const fileBase64 = Buffer.from(buffer).toString("base64");
      const uploadResult = await cloudinary.uploader.upload(
        `data:${item.type};base64,${fileBase64}`,
        { folder: "Upload" }
      );
      return {
        image_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    });
    const UploadImage = await Promise.all(uploadPromises);
    const firstImageUrl =
      UploadImage.length > 0 ? UploadImage[0].image_url : null;

    // Upload ảnh căn cước nếu có
    let idCardFrontUrl = null;
    if (idCardFile) {
      const buffer = await idCardFile.arrayBuffer();
      const fileBase64 = Buffer.from(buffer).toString("base64");
      const uploadResult = await cloudinary.uploader.upload(
        `data:${idCardFile.type};base64,${fileBase64}`,
        { folder: "IdCards" }
      );
      idCardFrontUrl = uploadResult.secure_url;
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {
      name: name,
      phone: phone,
    };

    // Chỉ cập nhật ảnh đại diện nếu có
    if (firstImageUrl) {
      updateData.image = firstImageUrl;
    }

    // Chỉ cập nhật thông tin căn cước nếu có
    if (idCardFrontUrl) {
      updateData.id_card_front = idCardFrontUrl;
    }

    if (idCardDataStr) {
      updateData.id_card_data = JSON.parse(idCardDataStr);
    }

    // Cập nhật thông tin khách hàng
    await prisma.customer.update({
      where: { customer_id: customer?.customer_id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "cập nhật thành công" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
