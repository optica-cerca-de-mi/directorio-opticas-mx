import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "No se proporcionó la URL de la imagen" },
        { status: 400 }
      );
    }

    // Extraer el public_id de la URL de Cloudinary
    // URL ejemplo: https://res.cloudinary.com/heh7sl0h/image/upload/v1234567890/opticas-directorio/abc123.png
    const urlParts = url.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileNameWithExtension.split(".")[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${fileName}`;

    // Borrar de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "No se pudo borrar la imagen de Cloudinary" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al borrar imagen:", error);
    return NextResponse.json(
      { error: "Error al borrar la imagen" },
      { status: 500 }
    );
  }
}