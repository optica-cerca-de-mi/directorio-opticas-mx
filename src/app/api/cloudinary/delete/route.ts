import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Se requiere publicId" },
        { status: 400 }
      );
    }

    console.log("🗑️ Eliminando imagen de Cloudinary:", publicId);

    // Eliminar imagen de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    console.log("✅ Resultado de Cloudinary:", result);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      console.error("Error al eliminar:", result);
      return NextResponse.json(
        { success: false, error: "Error al eliminar imagen", result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(" Error interno eliminando imagen:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}