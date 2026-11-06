import LegalPageLayout from "@/components/LegalPageLayout";
import { Shield } from "lucide-react";

export default function AvisoDePrivacidadPage() {
  return (
    <LegalPageLayout
      icon={<Shield className="w-8 h-8 text-gold-400" />}
      title="Aviso de Privacidad"
      subtitle="Protección de tus datos personales"
      lastUpdated="7 de noviembre de 2026"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            1. Responsable del tratamiento de datos
          </h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>Grupo Óptico ALPLA SA de CV</strong>, con domicilio en Cuautitlán Izcalli, 
            Estado de México, es responsable del tratamiento de sus datos personales, de 
            conformidad con lo establecido en la <strong>Ley Federal de Protección de Datos 
            Personales en Posesión de los Particulares (LFPDPPP)</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            2. Datos personales que recopilamos
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Para prestar nuestros servicios, podemos recopilar los siguientes datos personales:
          </p>
          <div className="bg-navy-50 border-l-4 border-gold-400 p-6 rounded-r-lg">
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Datos de identificación:</strong> nombre, correo electrónico, teléfono</li>
              <li>• <strong>Datos de la óptica:</strong> nombre comercial, dirección, RFC</li>
              <li>• <strong>Datos de pago:</strong> procesados de forma segura a través de Stripe (no almacenamos datos de tarjetas)</li>
              <li>• <strong>Datos de navegación:</strong> cookies, dirección IP, tipo de dispositivo</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            3. Finalidades del tratamiento
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Sus datos personales serán utilizados para las siguientes finalidades:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border-2 border-navy-100 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Finalidades primarias</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Prestar el servicio de directorio</li>
                <li>• Procesar pagos y facturación</li>
                <li>• Gestionar su cuenta y plan</li>
              </ul>
            </div>
            <div className="p-4 bg-white border-2 border-gold-200 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Finalidades secundarias</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Enviar comunicaciones comerciales</li>
                <li>• Mejorar nuestros servicios</li>
                <li>• Análisis estadístico</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            4. Derechos ARCO
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> al 
            tratamiento de sus datos personales (Derechos ARCO). Para ejercer estos derechos, 
            puede enviar una solicitud a:
          </p>
          <div className="bg-gold-50 border-2 border-gold-400 p-6 rounded-lg">
            <p className="text-navy-900 font-medium">
              📧 Correo: <a href="mailto:privacidad@laopticacercademi.com" className="text-gold-700 underline">privacidad@laopticacercademi.com</a>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Le responderemos en un plazo máximo de 20 días hábiles.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            5. Transferencia de datos
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Sus datos personales no serán compartidos con terceros, excepto cuando sea 
            necesario para la prestación del servicio (ej. Stripe para procesar pagos) o 
            cuando lo requiera la ley.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            6. Seguridad de los datos
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Implementamos medidas de seguridad administrativas, físicas y técnicas para 
            proteger sus datos personales contra daño, pérdida, alteración, destrucción o 
            uso, acceso o tratamiento no autorizado.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            7. Cambios al aviso de privacidad
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Nos reservamos el derecho de efectuar modificaciones al presente aviso de 
            privacidad. Cualquier cambio será publicado en esta página con la fecha de 
            última actualización.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}