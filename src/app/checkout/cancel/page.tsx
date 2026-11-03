"use client";

import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pago cancelado
        </h1>
        <p className="text-gray-600 mb-6">
          Tu pago fue cancelado. No se ha realizado ningún cargo.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            Si tuviste algún problema durante el pago, puedes intentarlo de nuevo.
          </p>
        </div>

        <Link
          href="/planes"
          className="block w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors text-center"
        >
          Volver a los planes
        </Link>

        <Link
          href="/"
          className="block mt-4 text-sm text-gray-600 hover:text-navy-900"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}