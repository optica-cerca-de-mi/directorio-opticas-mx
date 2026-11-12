import { NextResponse } from "next/server";
import { obtenerSugerenciasDiccionario } from "@/lib/diccionario-sugerencias";

export async function GET() {
  try {
    const sugerencias = await obtenerSugerenciasDiccionario();
    return NextResponse.json({
      success: true,
      data: sugerencias,
    });
  } catch (error) {
    console.error("Error al obtener sugerencias:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener sugerencias" },
      { status: 500 }
    );
  }
}