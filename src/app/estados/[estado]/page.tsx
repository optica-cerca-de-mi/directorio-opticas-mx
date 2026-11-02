import { MapPin, Star, Award, BadgeCheck, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAllOpticas } from "@/data/mock-opticas";
import type { Metadata } from "next";

// Mapeo de estados de México a slugs
const estadosMap: Record<string, string> = {
  "Ciudad de México": "ciudad-de-mexico",
  "CDMX": "ciudad-de-mexico",
  "Estado de México": "estado-de-mexico",
  "Aguascalientes": "aguascalientes",
  "Baja California": "baja-california",
  "Baja California Sur": "baja-california-sur",
  "Campeche": "campeche",
  "Chiapas": "chiapas",
  "Chihuahua": "chihuahua",
  "Coahuila": "coahuila",
  "Colima": "colima",
  "Durango": "durango",
  "Guanajuato": "guanajuato",
  "Guerrero": "guerrero",
  "Hidalgo": "hidalgo",
  "Jalisco": "jalisco",
  "Michoacán": "michoacan",
  "Morelos": "morelos",
  "Nayarit": "nayarit",
  "Nuevo León": "nuevo-leon",
  "Oaxaca": "oaxaca",
  "Puebla": "puebla",
  "Querétaro": "queretaro",
  "Quintana Roo": "quintana-roo",
  "San Luis Potosí": "san-luis-potosi",
  "Sinaloa": "sinaloa",
  "Sonora": "sonora",
  "Tabasco": "tabasco",
  "Tamaulipas": "tamaulipas",
  "Tlaxcala": "tlaxcala",
  "Veracruz": "veracruz",
  "Yucatán": "yucatan",
  "Zacatecas": "zacatecas",
};

export async function generateStaticParams() {
  return Object.values(estadosMap).map((estado) => ({ estado }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ estado: string }>;
}): Promise<Metadata> {
  const { estado } = await params;
  const nombreEstado = Object.keys(estadosMap).find(
    (key) => estadosMap[key] === estado
  ) || estado.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  return {
    title: `Ópticas en ${nombreEstado} | Directorio verificado`,
    description: `Encuentra las mejores ópticas verificadas en ${nombreEstado}.`,
  };
}

export default async function EstadoPage({
  params,
}: {
  params: Promise<{ estado: string }>;
}) {
  const { estado } = await params;
  const opticas = getAllOpticas();

  const nombreEstado = Object.keys(estadosMap).find(
    (key) => estadosMap[key] === estado
  ) || estado.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  const getEstadoSlug = (estadoNombre: string): string => {
    const slug = estadosMap[estadoNombre];
    if (slug) return slug;
    return estadoNombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  const opticasDelEstado = opticas.filter(
    (optica) => getEstadoSlug(optica.estado) === estado
  );

  // Si no hay ópticas
  if (opticasDelEstado.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-navy-900 text-white py-12 md:py-16">
          <div className="container-premium">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
              Ópticas en {nombreEstado}
            </h1>
            <p className="text-navy-100 text-lg">
              Próximamente tendremos ópticas verificadas en esta región
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-premium text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-navy-900 mb-3">
              Aún no hay ópticas en {nombreEstado}
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Estamos trabajando para traer las mejores ópticas verificadas a tu estado.
              Mientras tanto, explora otras regiones.
            </p>
            <Link href="/estados" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Ver todos los estados
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Si hay ópticas
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-navy-900 text-white py-12 md:py-16">
        <div className="container-premium">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
              Ópticas en {nombreEstado}
            </h1>
            <p className="text-navy-100 text-lg">
              {opticasDelEstado.length}{" "}
              {opticasDelEstado.length === 1 ? "óptica verificada" : "ópticas verificadas"}{" "}
              en {nombreEstado}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opticasDelEstado.map((optica) => {
              const esPremium = optica.plan === "premium" || optica.plan === "premium_plus";
              const esPremiumPlus = optica.plan === "premium_plus";

              return (
                <div
                  key={optica.id}
                  className="card-premium p-6 relative flex flex-col h-full"
                >
                  {esPremiumPlus && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-300"></div>
                  )}

                  {/* Header de la tarjeta con Link solo en el nombre/logo */}
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/opticas/${optica.slug}`} className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                      <div className="w-14 h-14 bg-navy-100 rounded-[var(--radius-premium)] flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-7 h-7 text-navy-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-navy-900 group-hover:text-navy-700 transition-colors font-display">
                          {optica.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {optica.ciudad}
                        </p>
                      </div>
                    </Link>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      {optica.verificado && <BadgeCheck className="w-5 h-5 text-navy-700" />}
                      {esPremium && (
                        <span className={esPremiumPlus ? "badge-premium-plus" : "badge-premium"}>
                          <Award className="w-3 h-3" />
                          {esPremiumPlus ? "PREMIUM+" : "PREMIUM"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Calificación */}
                  {optica.calificacionGoogle && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                        <span className="font-semibold text-navy-900">
                          {optica.calificacionGoogle}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span>{optica.numeroResenas} reseñas</span>
                    </div>
                  )}

                  {/* Especialidades */}
                  {optica.especialidades && optica.especialidades.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 flex-grow">
                      {optica.especialidades.slice(0, 3).map((esp, i) => (
                        <span
                          key={i}
                          className="text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded-full border border-navy-100"
                        >
                          {esp}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botón de acción (SIN anidamiento de <a>) */}
                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <Link
                      href={`/opticas/${optica.slug}`}
                      className="btn-primary w-full text-xs py-2.5 gap-1.5 justify-center"
                    >
                      Ver ficha completa
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTÓN VOLVER A ESTADOS (Claro y visible al final) */}
      <div className="container-premium pb-12">
        <Link href="/estados" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Ver todos los estados
        </Link>
      </div>
    </main>
  );
}