import municipalidadesData from '../Jsons/municipalidades.json';

/**
 * Servicio para asignar municipalidad según ubicación del reporte
 */

/**
 * Obtiene información geográfica (provincia, cantón, distrito) de una dirección usando Nominatim
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<{provincia: string, canton: string, distrito: string}>}
 */
export const obtenerInfoGeografica = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`
    );
    const data = await response.json();
    
    const address = data.address || {};
    
    console.log('📍 Datos de Nominatim:', address);
    
    // Extraer provincia, cantón y distrito de la respuesta de Nominatim
    const provincia = address.state || address.province || '';
    const canton = address.county || address.city || address.town || address.municipality || '';
    
    // Para distritos, buscar en múltiples campos y también en el nombre completo
    const distrito = address.village || 
                    address.suburb || 
                    address.neighbourhood || 
                    address.hamlet ||
                    address.quarter ||
                    address.city_district || '';
    
    // También revisar el display_name para posibles distritos
    const displayName = data.display_name || '';
    
    const result = {
      provincia: normalizarTexto(provincia),
      canton: normalizarTexto(canton),
      distrito: normalizarTexto(distrito),
      displayName: displayName
    };
    
    console.log('📊 Info geográfica extraída:', result);
    
    return result;
  } catch (error) {
    console.error('Error al obtener información geográfica:', error);
    return { provincia: '', canton: '', distrito: '', displayName: '' };
  }
};

/**
 * Normaliza texto removiendo acentos, convirtiendo a minúsculas y eliminando espacios extras
 * @param {string} texto - Texto a normalizar
 * @returns {string}
 */
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Busca la municipalidad correspondiente según provincia, cantón y distrito
 * @param {string} provincia - Nombre de la provincia
 * @param {string} canton - Nombre del cantón
 * @param {string} distrito - Nombre del distrito (opcional)
 * @param {string} displayName - Nombre completo de la dirección (opcional)
 * @returns {Object|null} - Objeto con información de la municipalidad o null
 */
export const buscarMunicipalidad = (provincia, canton, distrito = '', displayName = '') => {
  const provinciaNorm = normalizarTexto(provincia);
  const cantonNorm = normalizarTexto(canton);
  const distritoNorm = normalizarTexto(distrito);
  const displayNameNorm = normalizarTexto(displayName);
  
  console.log('🔍 Buscando municipalidad con:', { provincia, canton, distrito });
  
  // Buscar provincia
  const provinciaData = municipalidadesData.municipalidades.find(
    p => normalizarTexto(p.provincia) === provinciaNorm
  );
  
  if (!provinciaData) {
    console.log('❌ Provincia no encontrada:', provincia);
    return null;
  }
  
  console.log('✅ Provincia encontrada:', provinciaData.provincia);
  
  // PRIORIDAD 1: Buscar por distrito con cantón correcto
  if (distritoNorm) {
    const municipalidadDistrito = provinciaData.municipalidades.find(m => {
      const ubicacion = m.ubicacion || {};
      const distritoMatch = normalizarTexto(ubicacion.distrito || '') === distritoNorm;
      const cantonMatch = normalizarTexto(ubicacion.canton || '') === cantonNorm;
      
      console.log(`  🔎 Revisando ${m.nombre}: distrito=${ubicacion.distrito} (match: ${distritoMatch}), cantón=${ubicacion.canton} (match: ${cantonMatch})`);
      
      return ubicacion.distrito && distritoMatch && cantonMatch;
    });
    
    if (municipalidadDistrito) {
      console.log('✅ Municipalidad de distrito encontrada:', municipalidadDistrito.nombre);
      return {
        nombre: municipalidadDistrito.nombre,
        provincia: provinciaData.provincia,
        canton: municipalidadDistrito.ubicacion.canton,
        distrito: municipalidadDistrito.ubicacion.distrito
      };
    }
  }
  
  // PRIORIDAD 2: Buscar distrito por coincidencia parcial en displayName
  if (displayNameNorm) {
    const municipalidadPorDisplayName = provinciaData.municipalidades.find(m => {
      const ubicacion = m.ubicacion || {};
      if (!ubicacion.distrito) return false;
      
      const distritoEnJSON = normalizarTexto(ubicacion.distrito);
      const cantonEnJSON = normalizarTexto(ubicacion.canton);
      
      // Buscar si el distrito aparece en el displayName
      const distritoEncontrado = displayNameNorm.includes(distritoEnJSON);
      const cantonEncontrado = displayNameNorm.includes(cantonEnJSON);
      
      console.log(`  🔎 Buscando en displayName para ${m.nombre}: distrito="${distritoEnJSON}" (${distritoEncontrado}), cantón="${cantonEnJSON}" (${cantonEncontrado})`);
      
      return distritoEncontrado && cantonEncontrado;
    });
    
    if (municipalidadPorDisplayName) {
      console.log('✅ Municipalidad de distrito encontrada por displayName:', municipalidadPorDisplayName.nombre);
      return {
        nombre: municipalidadPorDisplayName.nombre,
        provincia: provinciaData.provincia,
        canton: municipalidadPorDisplayName.ubicacion.canton,
        distrito: municipalidadPorDisplayName.ubicacion.distrito
      };
    }
  }
  
  // PRIORIDAD 3: Buscar por cantón (solo si no hay distrito)
  const municipalidadCanton = provinciaData.municipalidades.find(m => {
    const ubicacion = m.ubicacion || {};
    return normalizarTexto(ubicacion.canton || '') === cantonNorm && !ubicacion.distrito;
  });
  
  if (municipalidadCanton) {
    console.log('✅ Municipalidad de cantón encontrada:', municipalidadCanton.nombre);
    return {
      nombre: municipalidadCanton.nombre,
      provincia: provinciaData.provincia,
      canton: municipalidadCanton.ubicacion.canton,
      distrito: null
    };
  }
  
  console.log('❌ Municipalidad no encontrada para:', { provincia, canton, distrito });
  return null;
};

/**
 * Asigna automáticamente una municipalidad según las coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object|null>} - Objeto con información de la municipalidad o null
 */
export const asignarMunicipalidadPorCoordenadas = async (lat, lng) => {
  try {
    console.log('🎯 Iniciando asignación de municipalidad para coordenadas:', { lat, lng });
    
    // Obtener información geográfica de las coordenadas
    const infoGeo = await obtenerInfoGeografica(lat, lng);
    
    if (!infoGeo.provincia || !infoGeo.canton) {
      console.log('❌ No se pudo obtener información geográfica completa');
      return null;
    }
    
    // Buscar municipalidad correspondiente
    const municipalidad = buscarMunicipalidad(
      infoGeo.provincia,
      infoGeo.canton,
      infoGeo.distrito,
      infoGeo.displayName
    );
    
    if (municipalidad) {
      console.log('🎉 Municipalidad asignada exitosamente:', municipalidad);
    } else {
      console.log('⚠️ No se encontró municipalidad correspondiente');
    }
    
    return municipalidad;
  } catch (error) {
    console.error('❌ Error al asignar municipalidad:', error);
    return null;
  }
};

/**
 * Obtiene todas las municipalidades disponibles
 * @returns {Array} - Array con todas las municipalidades
 */
export const obtenerTodasMunicipalidades = () => {
  const todas = [];
  municipalidadesData.municipalidades.forEach(provincia => {
    provincia.municipalidades.forEach(muni => {
      todas.push({
        nombre: muni.nombre,
        provincia: provincia.provincia,
        canton: muni.ubicacion.canton,
        distrito: muni.ubicacion.distrito || null
      });
    });
  });
  return todas;
};
