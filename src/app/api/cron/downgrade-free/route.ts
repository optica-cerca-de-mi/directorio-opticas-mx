import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  // 1. Verificar el secreto del Cron Job de Vercel (Seguridad)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('⚠️ Intento de acceso no autorizado al Cron Job');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date();
    
    // 2. Buscar ópticas que tengan planes de pago activos
    // Usamos 'in' porque Firestore permite hasta 10 valores en esta cláusula
    const snapshot = await db.collection('opticas')
      .where('plan', 'in', ['premium', 'premium_plus'])
      .get();

    const batch = db.batch();
    let downgradeCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // 3. Verificar si la fecha de vencimiento ya pasó
      if (data.fechaVencimiento) {
        const fechaVenc = new Date(data.fechaVencimiento);
        if (fechaVenc < today) {
          // 4. Preparar la actualización a Free
          batch.update(doc.ref, {
            plan: 'free',
            billingCycle: null,
            polizaActiva: false,
            polizaVencimiento: null,
            fechaDowngrade: today.toISOString(),
            // Mantenemos estado: 'activa' para que siga en el directorio como Free
          });
          downgradeCount++;
        }
      }
    });

    // 5. Ejecutar todas las actualizaciones en un solo lote (Batch)
    if (downgradeCount > 0) {
      await batch.commit();
      console.log(`✅ Cron Job: ${downgradeCount} óptica(s) downgradadas a Free exitosamente.`);
      return NextResponse.json({ 
        success: true, 
        message: `${downgradeCount} óptica(s) actualizadas a Free.` 
      });
    }

    console.log('✅ Cron Job: No se encontraron ópticas vencidas para downgradear.');
    return NextResponse.json({ 
      success: true, 
      message: 'No hay ópticas vencidas para actualizar.' 
    });

  } catch (error) {
    console.error('❌ Error en el Cron Job de downgrade:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}