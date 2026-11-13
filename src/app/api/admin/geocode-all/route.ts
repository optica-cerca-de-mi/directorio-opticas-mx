import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 [DIAGNÓSTICO] Iniciando endpoint geocode-all...');
    
    const authHeader = req.headers.get('authorization');
    console.log('🔑 Auth Header recibido:', authHeader);
    console.log('🔑 ADMIN_SECRET en entorno:', process.env.ADMIN_SECRET ? '✅ Definido' : '❌ NO Definido');
    
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ 
        error: 'No autorizado', 
        recibido: authHeader, 
        esperado: `Bearer ${process.env.ADMIN_SECRET}` 
      }, { status: 401 });
    }

    console.log('✅ Autorización exitosa. Consultando Firestore...');
    const snapshot = await getDocs(collection(db, 'opticas'));
    console.log(`📦 Documentos encontrados en colección 'opticas': ${snapshot.size}`);

    // Si llegamos aquí, Firebase funciona. Probemos un documento.
    const primerDoc = snapshot.docs[0];
    console.log('📄 Primer documento ID:', primerDoc?.id);
    console.log('📄 Datos del primer doc:', primerDoc?.data());

    return NextResponse.json({
      success: true,
      mensaje: 'Conexión a Firestore exitosa',
      totalOpticas: snapshot.size,
      ejemploPrimerDoc: primerDoc?.id
    });
    
  } catch (error: any) {
    console.error('❌ ERROR DETALLADO EN GEOCODE-ALL:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      detalle: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : 'No stack'
    }, { status: 500 });
  }
}