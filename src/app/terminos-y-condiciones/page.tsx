import LegalPageLayout from "@/components/LegalPageLayout";
import { Scale } from "lucide-react";

export default function TerminosYCondicionesPage() {
  return (
    <LegalPageLayout
      icon={<Scale className="w-8 h-8 text-gold-400" />}
      title="Términos y Condiciones de Uso"
      subtitle="Marco legal para la prestación de servicios digitales"
      lastUpdated="7 de noviembre de 2026"
    >
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">1. Identificación del proveedor</h2>
          <p>
            Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma digital 
            "La Óptica Cerca de mí", operada comercialmente por <strong>Orange Point</strong>, 
            representada por la persona física <strong>María Esther Sotelo Reali</strong>, con RFC 
            <strong> SORE870513PW8</strong>, con domicilio en Av. El Vidrio MZb Lt7, Cuautitlán Izcalli, 
            Estado de México, México.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">2. Objeto y descripción del servicio</h2>
          <p className="mb-4">
            La plataforma funciona como un directorio digital e intermediario tecnológico que conecta a 
            establecimientos ópticos independientes con usuarios finales en México. Orange Point no 
            presta servicios de salud visual ni vende productos ópticos directamente; su función es 
            exclusivamente la de proveer visibilidad digital y herramientas de gestión a las ópticas registradas.
          </p>
          <p>Los planes disponibles son:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2 bg-navy-50 p-6 rounded-lg">
            <li><strong>Gratuito:</strong> Listado básico en el directorio.</li>
            <li><strong>Premium ($199 MXN/mes):</strong> Mayor visibilidad, estadísticas y herramientas de contacto.</li>
            <li><strong>Premium+ ($599 MXN/mes):</strong> Máxima visibilidad, acceso a red B2B, gestión de contenido y reseñas nativas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">3. Precios, pagos y facturación</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Los precios están expresados en Pesos Mexicanos (MXN) e incluyen IVA cuando aplique.</li>
            <li>Los pagos se procesan de forma segura a través de la pasarela de pagos Stripe. Al contratar, usted autoriza el cargo a su método de pago seleccionado.</li>
            <li>La activación del servicio es inmediata tras la confirmación exitosa del pago.</li>
            <li>Orange Point emitirá el comprobante fiscal (CFDI) correspondiente a través del correo electrónico registrado, una vez que el usuario haya proporcionado sus datos fiscales en su perfil.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">4. Garantía y Derecho de Desistimiento</h2>
          <p className="mb-4">
            De conformidad con las mejores prácticas y en apego a la Ley Federal de Protección al Consumidor, 
            ofrecemos una <strong>Garantía de Satisfacción de 15 días naturales</strong> a partir de la contratación 
            de los planes Premium o Premium+.
          </p>
          <p>
            Si el usuario no está satisfecho con el servicio, podrá solicitar la cancelación y el reembolso 
            del 100% del monto pagado dentro de este plazo, sin penalización. Pasado este periodo, los 
            pagos son no reembolsables, aunque el usuario podrá cancelar la renovación automática en cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">5. Obligaciones del usuario (Óptica registrada)</h2>
          <p className="mb-4">El usuario se obliga a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proporcionar información veraz, exacta y actualizada sobre su establecimiento.</li>
            <li>No utilizar la plataforma para actividades ilícitas, fraudulentas o que infrinjan derechos de terceros.</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso, siendo responsable de toda actividad que se realice bajo su cuenta.</li>
            <li>Respetar los derechos de propiedad intelectual de Orange Point y de terceros.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">6. Limitación de responsabilidad</h2>
          <p>
            Orange Point actúa únicamente como un intermediario tecnológico. No nos hacemos responsables 
            por la calidad, veracidad o legalidad de los productos y servicios ofrecidos por las ópticas 
            listadas en el directorio, ni por disputas surgidas entre las ópticas y sus clientes finales. 
            Cada óptica es responsable de cumplir con las normativas sanitarias (COFEPRIS) y comerciales aplicables a su giro.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">7. Propiedad intelectual</h2>
          <p>
            Todo el contenido del sitio web, incluyendo pero no limitado a: diseño, código fuente, logotipos, 
            textos, gráficos y la marca "La Óptica Cerca de mí" / "Orange Point", es propiedad exclusiva de 
            María Esther Sotelo Reali y está protegido por la Ley Federal del Derecho de Autor y la Ley de la Propiedad Industrial.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">8. Ley aplicable y jurisdicción</h2>
          <p>
            La interpretación, cumplimiento y ejecución de los presentes términos se regirá por las leyes 
            federales de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten 
            a la jurisdicción de los tribunales competentes en Cuautitlán Izcalli, Estado de México, 
            renunciando a cualquier otro fuero que pudiera corresponderles.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            En caso de controversia, el consumidor podrá acudir a la Procuraduría Federal del Consumidor (PROFECO).
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}