/**
 * Elimina una imagen de Cloudinary usando su publicId
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();
    
    if (!data.success) {
      console.error("Error eliminando imagen:", data.error);
    }
    
    return data.success;
  } catch (error) {
    console.error("Error de red eliminando imagen:", error);
    return false;
  }
}

/**
 * Extrae el publicId de una URL de Cloudinary
 * Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234/opticas/foto.jpg → opticas/foto
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  
  // Patrón: /upload/[version]/[publicId].[extensión]
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}
/**
 * Extrae el publicId de una URL de video de Cloudinary
 */
export function extractVideoPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  
  // Patrón: /upload/v1234/opticas/video.mp4
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}