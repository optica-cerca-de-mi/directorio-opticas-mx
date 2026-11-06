import LegalPageLayout from "@/components/LegalPageLayout";
import { Shield } from "lucide-react";

export default function AvisoDePrivacidadPage() {
  return (
    <LegalPageLayout
      icon={<Shield className="w-8 h-8 text-gold-400" />}
      title="Aviso de Privacidad Integral"
      subtitle="Protección y tratamiento de sus datos personales"
      lastUpdated="7 de noviembre de 2026"
    >
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">1. Responsable del tratamiento</h2>
          <p>
            <strong>María Esther Sotelo Reali</strong>, con RFC <strong>SORE870513PW8</strong>, 
            operando bajo el nombre comercial <strong>"Orange Point"</strong>, con domicilio para oír y 
            recibir notificaciones en <strong>Av. El Vidrio MZb Lt7, Cuautitlán Izcalli, Estado de México, México</strong>, 
            es la responsable del tratamiento de sus datos personales, de conformidad con lo establecido 
            en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) 
            y su Reglamento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">2. Datos personales que recopilamos</h2>
          <p className="mb-4">Para las finalidades señaladas en el presente aviso, podemos recopilar los siguientes datos personales:</p>
          <ul className="list-disc pl-6 space-y-2 bg-navy-50 p-6 rounded-lg border-l-4 border-gold-400">
            <li><strong>Datos de identificación:</strong> Nombre completo, correo electrónico, número telefónico.</li>
            <li><strong>Datos fiscales y comerciales:</strong> Nombre comercial de la óptica, dirección fiscal, RFC (cuando aplique para facturación).</li>
            <li><strong>Datos financieros:</strong> Información de tarjetas de crédito/débito. <em>Nota: Orange Point no almacena datos sensibles de pago; estos son procesados directamente por Stripe, Inc., bajo estándares PCI-DSS.</em></li>
            <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, cookies y datos de geolocalización (previo consentimiento expreso).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">3. Finalidades del tratamiento</h2>
          <p className="mb-4">Sus datos personales serán utilizados para las siguientes finalidades:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white border border-navy-200 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Finalidades Primarias (Necesarias)</h4>
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>Prestación del servicio de directorio digital y gestión de su cuenta.</li>
                <li>Procesamiento de pagos, facturación y cumplimiento de obligaciones fiscales.</li>
                <li>Comunicación relacionada con el servicio contratado.</li>
              </ul>
            </div>
            <div className="p-5 bg-white border border-gold-200 rounded-lg">
              <h4 className="font-bold text-navy-900 mb-2">Finalidades Secundarias (Opcionales)</h4>
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>Envío de boletines informativos, promociones y novedades del sector.</li>
                <li>Elaboración de perfiles de consumo para mejorar la experiencia del usuario.</li>
                <li>Análisis estadístico y métricas de rendimiento del sitio web.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm">
            Si no desea que sus datos personales sean tratados para las finalidades secundarias, 
            puede enviar un correo electrónico a <strong>privacidad@orangepoint.mx</strong> (o el correo que designes) 
            solicitando la limitación del tratamiento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">4. Ejercicio de Derechos ARCO</h2>
          <p className="mb-4">
            Usted o su representante legal tienen derecho a conocer qué datos personales tenemos de usted, 
            para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su 
            derecho solicitar la corrección de su información personal en caso de que esté desactualizada, 
            sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de 
            datos cuando considere que la misma no está siendo utilizada conforme a los principios, deberes 
            y obligaciones previstas en la normativa (Cancelación); así como oponerse al uso de sus datos 
            personales para fines específicos (Oposición).
          </p>
          <p className="mb-4">
            Para el ejercicio de cualquiera de los derechos ARCO, debe enviar una solicitud mediante correo 
            electrónico a <strong>privacidad@orangepoint.mx</strong>, la cual deberá contener:
          </p>
          <ul className="list-decimal pl-6 space-y-2 mb-4">
            <li>Nombre del titular y domicilio u otro medio para comunicar la respuesta.</li>
            <li>Documentos que acrediten la identidad o, en su caso, la representación legal del titular.</li>
            <li>Descripción clara y precisa de los datos personales respecto de los que se busca ejercer alguno de los derechos ARCO.</li>
            <li>Cualquier otro elemento o documento que facilite la localización de los datos personales.</li>
          </ul>
          <p>La respuesta a su solicitud se le hará llegar en un plazo máximo de 20 días hábiles.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">5. Transferencia de datos y terceros</h2>
          <p>
            Orange Point no vende, alquila ni cede sus datos personales a terceros no autorizados. 
            Solo compartimos información con proveedores de servicios tecnológicos indispensables para 
            la operación (ej. Stripe para pagos, Firebase para alojamiento de datos), quienes están 
            obligados contractualmente a mantener la confidencialidad y seguridad de la información.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">6. Uso de tecnologías de rastreo</h2>
          <p>
            Le informamos que en nuestro sitio web utilizamos cookies y otras tecnologías de rastreo para 
            permitirle una mejor experiencia de navegación. Para mayor detalle, consulte nuestra 
            <a href="/politica-de-cookies" className="text-gold-700 underline ml-1">Política de Cookies</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-navy-900 font-display mb-4">7. Cambios al Aviso de Privacidad</h2>
          <p>
            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas 
            de nuevos requerimientos legales, decisiones internas o cambios en nuestros modelos de negocio. 
            Le informaremos sobre cualquier cambio a través de nuestro sitio web.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}