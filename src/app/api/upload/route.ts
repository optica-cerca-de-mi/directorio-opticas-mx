import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Faltan variables de entorno de Cloudinary');
      return NextResponse.json(
        { success: false, error: 'Cloudinary no está configurado correctamente' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceType = (formData.get('resource_type') as string) || 'image';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Límites de tamaño según tipo
    const maxSize = resourceType === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB video, 5MB imagen
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `El archivo es demasiado grande. Máximo ${resourceType === 'video' ? '100MB' : '5MB'} permitido.` 
        },
        { status: 400 }
      );
    }

    console.log(`📤 Subiendo ${resourceType}:`, file.name, 'Tamaño:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'opticas',
          resource_type: resourceType,
          ...(resourceType === 'video' ? {
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
              { width: 1280, crop: 'limit' }
            ]
          } : {
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          })
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error de Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Subida exitosa:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      duration: result.duration || null, // Solo para videos
    });
  } catch (error) {
    console.error('❌ Error uploading:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload' },
      { status: 500 }
    );
  }
}