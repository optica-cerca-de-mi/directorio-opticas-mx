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
            <li><strong>Gratuito:</strong> Listado básico en el directorio (máximo 1 sucursal).</li>
            <li><strong>Premium ($199 MXN/mes):</strong> Mayor visibilidad, estadísticas y herramientas de contacto (hasta 3 sucursales).</li>
            <li><strong>Premium+ ($599 MXN/mes):</strong> Máxima visibilidad, acceso a red B2B, gestión de contenido y reseñas nativas (hasta 3 sucursales).</li>
            <li><strong>Corporativo:</strong> Para cadenas de 4 o más sucursales, con tarifas preferenciales y facturación consolidada.</li>
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
            <li>Asegurar que cada sucursal registrada corresponda a un establecimiento físico real y operante.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">6. Política de Multi-Sucursales</h2>
          <div className="bg-navy-50 border-l-4 border-gold-400 p-6 rounded-r-lg space-y-3">
            <p><strong>6.1 Límites por Plan:</strong> El usuario podrá registrar un máximo de sucursales según su plan contratado (Free: 1, Premium: 3, Premium+: 3). Para superar estos límites, es obligatorio adquirir un Plan Corporativo.</p>
            <p><strong>6.2 Modelo de Plan Ancla:</strong> Todas las sucursales asociadas a una cuenta compartirán el mismo nivel de plan y las condiciones de facturación consolidada aplicables.</p>
            <p><strong>6.3 Validación de Unicidad:</strong> Para prevenir el fraude y la duplicidad, el sistema validará que el nombre + ciudad, número de teléfono, dirección exacta y enlace de Google Maps sean únicos en la plataforma. Orange Point se reserva el derecho de rechazar o eliminar registros que no cumplan con este criterio.</p>
            <p><strong>6.4 Prohibición de Transferencia:</strong> No se permite la transferencia, venta o cesión de una sucursal registrada a otra cuenta de usuario diferente dentro de la plataforma.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">7. Política de Pagos, Suspensión y Reactivación</h2>
          <div className="bg-navy-50 border-l-4 border-gold-400 p-6 rounded-r-lg space-y-3">
            <p><strong>7.1 Vencimiento sin Renovación:</strong> Los planes Premium y Premium+ operan bajo un modelo de pago por anticipado (mensual o anual). Al concluir el periodo contratado sin que el usuario realice una nueva renovación, la ficha de la óptica no será eliminada. Tras 48 horas posteriores al vencimiento, la sucursal cambiará automáticamente al plan <strong>Gratuito (Free)</strong>, perdiendo todos los beneficios premium asociados, pero conservando su presencia básica en el directorio.</p>. Tras 48 horas de vencimiento, la sucursal downgradeará automáticamente al plan <strong>Gratuito (Free)</strong>, perdiendo todos los beneficios premium asociados, pero conservando su presencia básica en el directorio.</p>
            <p><strong>7.2 Reactivación:</strong> El usuario puede reactivar su plan premium en cualquier momento realizando el pago pendiente. La restauración de beneficios es inmediata y no genera recargos ni penalizaciones adicionales, siempre que la cuenta no haya sido bloqueada por fraude.</p>
            <p><strong>7.3 Cierre Voluntario:</strong> El usuario puede solicitar el cierre de una sucursal en cualquier momento. No se realizarán reembolsos proporcionales por el tiempo no utilizado del periodo de facturación en curso.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">8. Sanciones por Incumplimiento</h2>
          <p className="mb-4">Orange Point se reserva el derecho de aplicar las siguientes sanciones ante el incumplimiento de estos términos:</p>
          <ul className="list-decimal pl-6 space-y-3">
            <li><strong>Amonestación y Suspensión Temporal (15 días):</strong> Por publicación de información engañosa, desactualizada o que viole las normas de la comunidad. La ficha será ocultada hasta su corrección.</li>
            <li><strong>Cancelación Inmediata sin Reembolso:</strong> Por la creación de fichas duplicadas, ficticias, o por el uso de datos de terceros sin su autorización expresa.</li>
            <li><strong>Bloqueo Permanente de la Cuenta:</strong> Por detección de fraude, creación masiva de fichas spam, o intentos de manipulación del sistema de ranking. Las cuentas bloqueadas por fraude <strong>no tienen derecho a reactivación</strong> ni a la recuperación de sus datos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">9. Limitación de responsabilidad</h2>
          <p>
            Orange Point actúa únicamente como un intermediario tecnológico. No nos hacemos responsables 
            por la calidad, veracidad o legalidad de los productos y servicios ofrecidos por las ópticas 
            listadas en el directorio, ni por disputas surgidas entre las ópticas y sus clientes finales. 
            Cada óptica es responsable de cumplir con las normativas sanitarias (COFEPRIS) y comerciales aplicables a su giro.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">10. Propiedad intelectual</h2>
          <p>
            Todo el contenido del sitio web, incluyendo pero no limitado a: diseño, código fuente, logotipos, 
            textos, gráficos y la marca "La Óptica Cerca de mí" / "Orange Point", es propiedad exclusiva de 
            María Esther Sotelo Reali y está protegido por la Ley Federal del Derecho de Autor y la Ley de la Propiedad Industrial.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">11. Ley aplicable y jurisdicción</h2>
          <p>
            La interpretación, cumplimiento y ejecución de los presentes términos se regirá por las leyes 
            federales de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten 
            a la jurisdicción de los tribunales competentes en Cuautitlán Izcalli, Estado de México, 
            renunciando a cualquier otro fuero que pudiera corresponderles.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            En caso de controversia de consumo, el usuario podrá acudir a la Procuraduría Federal del Consumidor (PROFECO).
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}