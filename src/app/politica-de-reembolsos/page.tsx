import LegalPageLayout from "@/components/LegalPageLayout";
import { RefreshCw } from "lucide-react";

export default function PoliticaDeReembolsosPage() {
  return (
    <LegalPageLayout
      icon={<RefreshCw className="w-8 h-8 text-gold-400" />}
      title="Política de Reembolsos"
      subtitle="Nuestra garantía de satisfacción"
      lastUpdated="7 de noviembre de 2026"
    >
      <div className="space-y-8">
        {/* Garantía destacada */}
        <div className="bg-gradient-to-br from-gold-50 to-gold-100 border-2 border-gold-400 p-8 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gold-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-8 h-8 text-navy-900" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-900 font-display mb-2">
                Garantía de satisfacción de 15 días
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Si no estás satisfecho con tu plan <strong>Premium</strong> o <strong>Premium+</strong>, 
                te devolvemos el <strong>100% de tu inversión</strong> durante los primeros 15 días. 
                Sin preguntas, sin complicaciones.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            1. Condiciones para solicitar un reembolso
          </h2>
          <div className="bg-navy-50 border-l-4 border-gold-400 p-6 rounded-r-lg">
            <ul className="space-y-2 text-gray-700">
              <li>✅ La solicitud debe realizarse dentro de los <strong>15 días naturales</strong> posteriores a la contratación</li>
              <li>✅ Aplica únicamente para planes <strong>Premium</strong> y <strong>Premium+</strong></li>
              <li>✅ No aplica para el plan Gratuito (sin costo)</li>
              <li>✅ Se reembolsará el 100% del monto pagado</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            2. Cómo solicitar un reembolso
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white border-2 border-navy-100 rounded-lg">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-navy-900">Envía un correo</h4>
                <p className="text-sm text-gray-700">
                  Escribe a <a href="mailto:reembolsos@laopticacercademi.com" className="text-gold-700 underline font-medium">reembolsos@laopticacercademi.com</a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white border-2 border-navy-100 rounded-lg">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-navy-900">Incluye la información</h4>
                <p className="text-sm text-gray-700">
                  Nombre de la óptica, correo de la cuenta y motivo de la solicitud (opcional)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white border-2 border-navy-100 rounded-lg">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-navy-900">Recibe tu reembolso</h4>
                <p className="text-sm text-gray-700">
                  Procesamos el reembolso en un plazo máximo de <strong>5 días hábiles</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            3. Casos en los que NO aplica reembolso
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>❌ Solicitudes realizadas después de los 15 días</li>
            <li>❌ Planes ya renovados automáticamente</li>
            <li>❌ Violación de los Términos y Condiciones</li>
            <li>❌ Uso fraudulento del servicio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            4. Cancelación del servicio
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Puedes cancelar tu plan en cualquier momento desde tu Dashboard. La cancelación 
            será efectiva al final del período de facturación actual. No se realizarán 
            cargos adicionales después de la cancelación.
          </p>
          <div className="bg-gold-50 border-2 border-gold-400 p-6 rounded-lg">
            <p className="text-navy-900 font-medium">
              💡 <strong>Importante:</strong> Al cancelar, mantendrás acceso al servicio hasta 
              el final del período ya pagado.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            5. Contacto
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Si tienes dudas sobre esta política o necesitas asistencia, contáctanos en:
          </p>
          <div className="mt-4 p-4 bg-navy-900 text-white rounded-lg">
            <p>📧 <a href="mailto:soporte@laopticacercademi.com" className="text-gold-300 underline">soporte@laopticacercademi.com</a></p>
            <p className="text-sm text-navy-200 mt-2">Horario de atención: Lunes a Viernes, 9:00 - 18:00 hrs</p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}