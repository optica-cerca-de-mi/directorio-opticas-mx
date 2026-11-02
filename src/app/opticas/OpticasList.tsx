"use client";

// Función para quitar acentos y hacer búsqueda flexible
function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
import { useState, useMemo } from "react";
import { MapPin, Star, MessageCircle, Award, BadgeCheck, Search, X } from "lucide-react";
import Link from "next/link";
import { getAllOpticas } from "@/data/mock-opticas";

export default function OpticasList() {
  const opticas = getAllOpticas();
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [planFiltro, setPlanFiltro] = useState("todos");

  // Obtener lista única de estados para el dropdown
  const estados = useMemo(() => {
    const unicos = new Set(opticas.map((o) => o.estado));
    return ["todos", ...Array.from(unicos)];
  }, [opticas]);

  // Filtrar ópticas según los criterios
     // Mapeo de alias de búsqueda (términos coloquiales)
  const aliasBusqueda: Record<string, string> = {
    "cdmx": "ciudad de mexico",
    "df": "ciudad de mexico",
    "mexico df": "ciudad de mexico",
    "edomex": "estado de mexico",
    "edoméx": "estado de mexico",
  };

  const opticasFiltradas = useMemo(() => {
    return opticas.filter((optica) => {
      // Filtro de búsqueda (insensible a acentos, mayúsculas y con alias)
      const textoBusqueda = normalizarTexto(busqueda);
      const textoBusquedaConAlias = aliasBusqueda[textoBusqueda] || textoBusqueda;

      const coincideBusqueda =
        !textoBusqueda ||
        normalizarTexto(optica.nombre).includes(textoBusquedaConAlias) ||
        normalizarTexto(optica.ciudad).includes(textoBusquedaConAlias) ||
        normalizarTexto(optica.estado).includes(textoBusquedaConAlias) ||
        normalizarTexto(optica.direccion).includes(textoBusquedaConAlias);

      // Filtro de estado
      const coincideEstado =
        estadoFiltro === "todos" || optica.estado === estadoFiltro;

      // Filtro de plan
      const coincidePlan =
        planFiltro === "todos" || optica.plan === planFiltro;

      return coincideBusqueda && coincideEstado && coincidePlan;
    });
  }, [opticas, busqueda, estadoFiltro, planFiltro]);

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todos");
    setPlanFiltro("todos");
  };

  const hayFiltrosActivos = busqueda || estadoFiltro !== "todos" || planFiltro !== "todos";

  return (
    <>
      {/* Barra de búsqueda y filtros */}
      <section className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-40 shadow-sm">
        <div className="container-premium py-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Buscador */}
            <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-[var(--radius-premium)] px-4 py-2.5">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, ciudad o estado..."
                className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro Estado */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-[var(--radius-premium)] px-4 py-2.5 text-gray-700 focus:outline-none focus:border-navy-500 cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              {estados
                .filter((e) => e !== "todos")
                .map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
            </select>

            {/* Filtro Plan */}
            <select
              value={planFiltro}
              onChange={(e) => setPlanFiltro(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-[var(--radius-premium)] px-4 py-2.5 text-gray-700 focus:outline-none focus:border-navy-500 cursor-pointer"
            >
              <option value="todos">Todos los planes</option>
              <option value="premium_plus">Premium+</option>
              <option value="premium">Premium</option>
              <option value="free">Gratis</option>
            </select>
          </div>

          {/* Indicador de filtros activos */}
          {hayFiltrosActivos && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-navy-900">
                  {opticasFiltradas.length}
                </span>{" "}
                {opticasFiltradas.length === 1 ? "óptica encontrada" : "ópticas encontradas"}
              </p>
              <button
                onClick={limpiarFiltros}
                className="text-sm text-navy-700 hover:text-navy-900 font-medium underline underline-offset-4"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Listado de ópticas */}
      <section className="py-8 md:py-12">
        <div className="container-premium">
          {opticasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-900 mb-2">
                No encontramos ópticas
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta con otros filtros o términos de búsqueda
              </p>
              <button
                onClick={limpiarFiltros}
                className="btn-primary"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opticasFiltradas.map((optica) => {
                const esPremium = optica.plan === "premium" || optica.plan === "premium_plus";
                const esPremiumPlus = optica.plan === "premium_plus";

                return (
                  <Link
                    key={optica.id}
                    href={`/opticas/${optica.slug}`}
                    className="card-premium p-6 block group hover:border-navy-400 relative"
                  >
                    {/* Borde dorado solo Premium+ */}
                    {esPremiumPlus && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-300"></div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-navy-100 rounded-[var(--radius-premium)] flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-7 h-7 text-navy-700" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {optica.verificado && (
                          <BadgeCheck className="w-4 h-4 text-navy-700" />
                        )}
                        {esPremium && (
                          <span className={esPremiumPlus ? "badge-premium-plus" : "badge-premium"}>
                            <Award className="w-3 h-3" />
                            {esPremiumPlus ? "PREMIUM+" : "PREMIUM"}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-navy-900 mb-1 group-hover:text-navy-700 transition-colors font-display">
                      {optica.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {optica.ciudad}, {optica.estado}
                    </p>

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

                    {optica.especialidades && optica.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
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

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {optica.whatsapp && (
                        <a
                          href={`https://wa.me/${optica.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex-1 text-xs py-2 gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                          WhatsApp
                        </a>
                      )}
                      <span className="btn-primary flex-1 text-xs py-2 gap-1.5 justify-center">
                        Ver ficha
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}