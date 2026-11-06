import LegalPageLayout from "@/components/LegalPageLayout";
import { Scale } from "lucide-react";

export default function TerminosYCondicionesPage() {
  return (
    <LegalPageLayout
      icon={<Scale className="w-8 h-8 text-gold-400" />}
      title="Términos y Condiciones"
      subtitle="Reglas para el uso de nuestro servicio"
      lastUpdated="7 de noviembre de 2026"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            1. Aceptación de los términos
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Al acceder y utilizar <strong>La Óptica Cerca de mí</strong>, usted acepta 
            quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con 
            alguna parte de estos términos, le rogamos no utilizar nuestro servicio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            2. Descripción del servicio
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            La Óptica Cerca de mí es un directorio digital que conecta a ópticas 
            independientes con clientes potenciales en México. Ofrecemos tres tipos de 
            planes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border-2 border-navy-100 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Gratuito</h4>
              <p className="text-sm text-gray-700">Listado básico en el directorio</p>
            </div>
            <div className="p-5 bg-white border-2 border-gold-300 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Premium - $199/mes</h4>
              <p className="text-sm text-gray-700">Mayor visibilidad y herramientas</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-gold-50 to-gold-100 border-2 border-gold-400 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Premium+ - $599/mes</h4>
              <p className="text-sm text-gray-700">Máxima visibilidad y acceso B2B</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            3. Pagos y facturación
          </h2>
          <div className="bg-navy-50 border-l-4 border-gold-400 p-6 rounded-r-lg space-y-3">
            <p className="text-gray-700">• Los pagos se procesan de forma segura a través de Stripe.</p>
            <p className="text-gray-700">• Los planes Premium y Premium+ son de pago mensual anticipado.</p>
            <p className="text-gray-700">• El servicio se activa inmediatamente después de la confirmación del pago.</p>
            <p className="text-gray-700">• No realizamos reembolsos parciales por cancelación anticipada (ver Política de Reembolsos).</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            4. Obligaciones del usuario
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Al utilizar nuestro servicio, usted se compromete a:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Proporcionar información veraz y actualizada sobre su óptica</li>
            <li>• No utilizar el servicio para fines ilegales o no autorizados</li>
            <li>• No copiar, reproducir o distribuir el contenido del directorio</li>
            <li>• Mantener la confidencialidad de sus credenciales de acceso</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            5. Limitación de responsabilidad
          </h2>
          <p className="text-gray-700 leading-relaxed">
            La Óptica Cerca de mí actúa únicamente como intermediario digital. No nos 
            hacemos responsables por la calidad de los servicios ofrecidos por las ópticas 
            listadas, ni por disputas entre usuarios. Cada óptica es responsable de la 
            veracidad de la información publicada.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            6. Propiedad intelectual
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Todo el contenido del sitio (diseño, logotipos, textos, código) es propiedad 
            de Grupo Óptico ALPLA SA de CV y está protegido por las leyes de propiedad 
            intelectual aplicables en México.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            7. Modificación de los términos
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Los cambios entrarán en vigor inmediatamente después de su publicación. El uso 
            continuado del servicio implica la aceptación de los términos modificados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">
            8. Legislación aplicable
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier 
            controversia será resuelta por los tribunales competentes del Estado de México.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}