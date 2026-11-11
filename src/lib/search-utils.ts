/**
 * UTILIDADES DE BÚSQUEDA COMPARTIDAS
 * 
 * Este archivo contiene funciones reutilizables para búsqueda y filtrado
 * que usan tanto Franklin (Home) como el Directorio (/opticas).
 */

/**
 * Normaliza texto eliminando acentos y convirtiendo a minúsculas
 * Ejemplo: "diabétes" → "diabetes", "Óptica" → "optica"
 */
export const normalizarTexto = (texto: string): string => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Filtra ópticas por búsqueda de texto libre en múltiples campos
 * Busca en: nombre, ciudad, dirección, descripción, especialidades (genéricas y personalizadas), seguros
 */
export const buscarPorTexto = (
  opticas: any[],
  busqueda: string
): any[] => {
  const busquedaNormalizada = normalizarTexto(busqueda);
  
  if (!busquedaNormalizada) return opticas;

  return opticas.filter((optica) => {
    return (
      normalizarTexto(optica.nombre || '').includes(busquedaNormalizada) ||
      normalizarTexto(optica.ciudad || '').includes(busquedaNormalizada) ||
      normalizarTexto(optica.direccion || '').includes(busquedaNormalizada) ||
      normalizarTexto(optica.descripcion || '').includes(busquedaNormalizada) ||
      (optica.especialidades || []).some((e: string) => 
        normalizarTexto(e).includes(busquedaNormalizada)
      ) ||
      (optica.especialidadesPersonalizadas || []).some((e: string) => 
        normalizarTexto(e).includes(busquedaNormalizada)
      ) ||
      (optica.segurosAceptados || []).some((s: string) => 
        normalizarTexto(s).includes(busquedaNormalizada)
      )
    );
  });
};

/**
 * Filtra ópticas por especialidad (genéricas y personalizadas)
 */
export const filtrarPorEspecialidad = (
  opticas: any[],
  especialidad: string
): any[] => {
  if (!especialidad) return opticas;
  
  const especialidadNormalizada = normalizarTexto(especialidad);

  return opticas.filter((optica) => {
    return (
      (optica.especialidades || []).some((e: string) => 
        normalizarTexto(e).includes(especialidadNormalizada)
      ) ||
      (optica.especialidadesPersonalizadas || []).some((e: string) => 
        normalizarTexto(e).includes(especialidadNormalizada)
      )
    );
  });
};

/**
 * Filtra ópticas por ciudad
 */
export const filtrarPorCiudad = (
  opticas: any[],
  ciudad: string
): any[] => {
  if (!ciudad) return opticas;
  
  const ciudadNormalizada = normalizarTexto(ciudad);

  return opticas.filter((optica) => {
    return (
      normalizarTexto(optica.ciudad || '').includes(ciudadNormalizada) ||
      normalizarTexto(optica.estado || '').includes(ciudadNormalizada)
    );
  });
};

/**
 * Filtra ópticas por seguro
 */
export const filtrarPorSeguro = (
  opticas: any[],
  seguro: string
): any[] => {
  if (!seguro) return opticas;
  
  const seguroNormalizado = normalizarTexto(seguro);

  return opticas.filter((optica) => {
    return (optica.segurosAceptados || []).some((s: string) => 
      normalizarTexto(s).includes(seguroNormalizado)
    );
  });
};

/**
 * Sistema de scoring para ordenar resultados
 * Da prioridad a: coincidencia en especialidad personalizada > genérica > plan > calificación
 */
export const aplicarScoring = (
  opticas: any[],
  especialidad?: string,
  ciudad?: string
): any[] => {
  if (!especialidad && !ciudad) return opticas;

  const especialidadNormalizada = especialidad ? normalizarTexto(especialidad) : null;

  return opticas.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Ventaja por Plan
    if (a.plan === 'premium_plus') scoreA += 30;
    else if (a.plan === 'premium') scoreA += 20;
    if (b.plan === 'premium_plus') scoreB += 30;
    else if (b.plan === 'premium') scoreB += 20;

    // Ventaja por coincidencia en especialidad
    if (especialidadNormalizada) {
      const aTienePersonalizada = (a.especialidadesPersonalizadas || []).some((e: string) => 
        normalizarTexto(e).includes(especialidadNormalizada)
      );
      const bTienePersonalizada = (b.especialidadesPersonalizadas || []).some((e: string) => 
        normalizarTexto(e).includes(especialidadNormalizada)
      );
      
      if (aTienePersonalizada) scoreA += 50;
      if (bTienePersonalizada) scoreB += 50;

      const aTieneGenerica = (a.especialidades || []).some((e: string) => 
        normalizarTexto(e).includes(especialidadNormalizada)
      );
      const bTieneGenerica = (b.especialidades || []).some((e: string) => 
        normalizarTexto(e).includes(especialidadNormalizada)
      );

      if (aTieneGenerica && !aTienePersonalizada) scoreA += 20;
      if (bTieneGenerica && !bTienePersonalizada) scoreB += 20;
    }

    // Desempate por calificación de Google
    scoreA += (a.calificacionGoogle || 0) * 2;
    scoreB += (b.calificacionGoogle || 0) * 2;

    return scoreB - scoreA;
  });
};