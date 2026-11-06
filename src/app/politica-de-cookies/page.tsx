import LegalPageLayout from "@/components/LegalPageLayout";
import { Cookie } from "lucide-react";

export default function PoliticaDeCookiesPage() {
  return (
    <LegalPageLayout
      icon={<Cookie className="w-8 h-8 text-gold-400" />}
      title="Política de Cookies"
      subtitle="Cómo utilizamos las cookies en nuestro sitio"
      lastUpdated="7 de noviembre de 2026"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            1. ¿Qué son las cookies?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo 
            cuando visita un sitio web. Nos permiten reconocer su navegador y recordar 
            información sobre su visita.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            2. Tipos de cookies que utilizamos
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-white border-2 border-navy-100 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">🔧 Cookies esenciales</h4>
              <p className="text-sm text-gray-700">
                Necesarias para el funcionamiento del sitio (sesión de usuario, seguridad). 
                No requieren consentimiento.
              </p>
            </div>
            <div className="p-5 bg-white border-2 border-gold-200 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">📊 Cookies analíticas</h4>
              <p className="text-sm text-gray-700">
                Nos ayudan a entender cómo los usuarios interactúan con el sitio 
                (Google Analytics). Requieren consentimiento.
              </p>
            </div>
            <div className="p-5 bg-white border-2 border-gold-300 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">📢 Cookies de publicidad</h4>
              <p className="text-sm text-gray-700">
                Utilizadas para mostrar anuncios relevantes (Google Ads). Requieren consentimiento.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            3. Cómo gestionar las cookies
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Puede configurar su navegador para rechazar cookies o eliminarlas. Sin embargo, 
            esto puede afectar la funcionalidad del sitio.
          </p>
          <div className="bg-gold-50 border-2 border-gold-400 p-6 rounded-lg">
            <p className="text-navy-900 font-medium mb-2">
              Puede cambiar sus preferencias de cookies en cualquier momento:
            </p>
            <button className="px-6 py-3 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 transition-colors">
              Configurar cookies
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            4. Cookies de terceros
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Utilizamos servicios de terceros que pueden establecer sus propias cookies:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>• <strong>Stripe:</strong> para procesar pagos de forma segura</li>
            <li>• <strong>Google Analytics:</strong> para análisis de tráfico</li>
            <li>• <strong>Google Ads:</strong> para publicidad (si aplica)</li>
            <li>• <strong>Firebase:</strong> para autenticación y base de datos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            5. Duración de las cookies
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-navy-900 text-white">
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-left">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-navy-100">
                  <td className="p-3">Sesión</td>
                  <td className="p-3">Se eliminan al cerrar el navegador</td>
                </tr>
                <tr className="border-b border-navy-100">
                  <td className="p-3">Persistentes</td>
                  <td className="p-3">Hasta 2 años</td>
                </tr>
                <tr>
                  <td className="p-3">De terceros</td>
                  <td className="p-3">Según política del proveedor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}