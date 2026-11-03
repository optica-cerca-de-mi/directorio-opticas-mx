"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan');
  const opticaId = searchParams.get('opticaId');

  useEffect(() => {
    // Simular un pequeño delay para que el webhook procese
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    if (opticaId) {
      router.push(`/dashboard/${opticaId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando tu pago...
            </h1>
            <p className="text-gray-600">
              Estamos activando tu plan {plan}. Esto puede tomar unos segundos.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago exitoso!
            </h1>
            <p className="text-gray-600 mb-2">
              Tu plan <strong>{plan?.toUpperCase()}</strong> ha sido activado.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              ID de sesión: {sessionId?.slice(0, 20)}...
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ Tu plan está activo por <strong>30 días</strong>.
                <br />
                Recibirás un recordatorio antes de que venza.
              </p>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors"
            >
              Ir a mi Dashboard
            </button>

            <Link
              href="/"
              className="block mt-4 text-sm text-gray-600 hover:text-navy-900"
            >
              ← Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

import { Suspense } from 'react';