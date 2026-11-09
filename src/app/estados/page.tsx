import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { AdSlot } from "@/components/OptiAdBoost";
import FooterPublico from "@/components/FooterPublico";

export const metadata: Metadata = {
  title: "Ópticas por Estado en México | Directorio completo",
  description:
    "Encuentra ópticas verificadas en cada estado de México. Selecciona tu estado para ver las mejores opciones cerca de ti.",
};

// Lista de los 32 estados de México
const estadosMexico = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

export default function EstadosPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-navy-900 text-white py-12 md:py-16">
        <div className="container-premium">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
              Ópticas por estado en México
            </h1>
            <p className="text-navy-100 text-lg">
              Selecciona tu estado para encontrar las ópticas verificadas más cercanas
            </p>
          </div>
        </div>
      </section>

 <AdSlot slotId="estados-list-top" />

      {/* Grid de estados */}
      <section className="py-12 md:py-16">
        <div className="container-premium">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {estadosMexico.map((estado) => {
              // Convertir nombre de estado a slug para la URL (ej: "Ciudad de México" -> "ciudad-de-mexico")
              const slug = estado
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "-");

              return (
                <Link
                  key={estado}
                  href={`/estados/${slug}`}
                  className="card-premium p-4 flex items-center gap-3 group hover:border-navy-400 transition-all"
                >
                  <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-navy-700 transition-colors">
                    <MapPin className="w-5 h-5 text-navy-700 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-navy-900 text-sm truncate group-hover:text-navy-700 transition-colors">
                      {estado}
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-navy-700 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <FooterPublico />
    </main>
  );
}