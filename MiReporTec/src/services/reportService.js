// Generar ID único
export const generateId = () => {
  const timestamp = Date.now().toString(36); // Convertir timestamp a base36
  const random = Math.random().toString(36).substr(2, 4); // 4 caracteres aleatorios
  return `${timestamp}-${random}`.toUpperCase();
};

// Obtener todos los reportes
export const getReports = () => {
  try {
    const reports = localStorage.getItem('reports');
    return reports ? JSON.parse(reports) : [];
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return [];
  }
};

// Guardar reporte
export const saveReport = (report) => {
  try {
    const reports = getReports();
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));
    return true;
  } catch (error) {
    console.error('Error al guardar reporte:', error);
    return false;
  }
};

// Obtener reporte por ID
export const getReportById = (id) => {
  const reports = getReports();
  return reports.find(report => report.id === id);
};

// Actualizar estado de reporte
export const updateReportStatus = (id, newStatus) => {
  try {
    const reports = getReports();
    const index = reports.findIndex(report => report.id === id);
    if (index !== -1) {
      reports[index].estado = newStatus;
      localStorage.setItem('reports', JSON.stringify(reports));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return false;
  }
};

// Obtener reportes ordenados por fecha (más reciente primero)
export const getReportsSortedByDate = () => {
  const reports = getReports();
  return reports.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
};

// Eliminar reporte
export const deleteReport = (id) => {
  try {
    const reports = getReports();
    const filteredReports = reports.filter(report => report.id !== id);
    localStorage.setItem('reports', JSON.stringify(filteredReports));
    return true;
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    return false;
  }
};

// Actualizar reporte completo
export const updateReport = (id, updatedData) => {
  try {
    const reports = getReports();
    const index = reports.findIndex(report => report.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updatedData };
      localStorage.setItem('reports', JSON.stringify(reports));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    return false;
  }
};

// Votar en un reporte (voto: 1 para arriba, -1 para abajo)
export const voteReport = (reportId, userId, voto) => {
  try {
    const reports = getReports();
    const index = reports.findIndex(report => report.id === reportId);
    if (index !== -1) {
      const report = reports[index];
      if (!report.votantes) report.votantes = [];
      if (!report.puntuacion) report.puntuacion = 0;

      // Verificar si el usuario ya votó
      const votoExistente = report.votantes.find(v => v.userId === userId);
      
      if (votoExistente) {
        // Si ya votó igual, remover el voto
        if (votoExistente.voto === voto) {
          report.puntuacion -= voto;
          report.votantes = report.votantes.filter(v => v.userId !== userId);
        } else {
          // Si votó diferente, cambiar el voto
          report.puntuacion -= votoExistente.voto;
          report.puntuacion += voto;
          votoExistente.voto = voto;
        }
      } else {
        // Nuevo voto
        report.puntuacion += voto;
        report.votantes.push({ userId, voto });
      }

      localStorage.setItem('reports', JSON.stringify(reports));
      return { success: true, puntuacion: report.puntuacion };
    }
    return { success: false };
  } catch (error) {
    console.error('Error al votar reporte:', error);
    return { success: false };
  }
};

// Obtener reportes del usuario
export const getUserReports = (cedula) => {
  const reports = getReports();
  return reports.filter(report => report.cedula === cedula)
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
};

// Agregar comentario a un reporte
export const addComment = (reportId, comentario) => {
  try {
    const reports = getReports();
    const index = reports.findIndex(report => report.id === reportId);
    if (index !== -1) {
      if (!reports[index].comentariosUsuarios) {
        reports[index].comentariosUsuarios = [];
      }
      reports[index].comentariosUsuarios.push({
        ...comentario,
        id: generateId(),
        fecha: new Date().toISOString()
      });
      localStorage.setItem('reports', JSON.stringify(reports));
      return { success: true, comentarios: reports[index].comentariosUsuarios };
    }
    return { success: false };
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    return { success: false };
  }
};

// Buscar reportes con filtros
export const searchReports = (filters) => {
  const reports = getReports();
  let filtered = [...reports];

  // Filtrar por término de búsqueda (descripción, tags, ID)
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const term = filters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter(report => 
      (report.descripcion && report.descripcion.toLowerCase().includes(term)) ||
      (report.id && report.id.toLowerCase().includes(term)) ||
      (report.tags && report.tags.some(tag => tag.toLowerCase().includes(term))) ||
      (report.ubicacion?.address && report.ubicacion.address.toLowerCase().includes(term))
    );
  }

  // Filtrar por ubicación (provincia)
  if (filters.location && filters.location.trim()) {
    const loc = filters.location.toLowerCase().trim();
    filtered = filtered.filter(report =>
      (report.municipalidad?.provincia && report.municipalidad.provincia.toLowerCase().includes(loc)) ||
      (report.ubicacion?.address && report.ubicacion.address.toLowerCase().includes(loc))
    );
  }

  // Filtrar por municipalidad
  if (filters.municipality && filters.municipality.trim()) {
    const muni = filters.municipality.toLowerCase().trim();
    filtered = filtered.filter(report =>
      report.municipalidad?.nombre && report.municipalidad.nombre.toLowerCase().includes(muni)
    );
  }

  // Ordenar por fecha (más reciente primero)
  return filtered.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
};

// Obtener todas las municipalidades únicas de los reportes
export const getUniqueMunicipalities = () => {
  const reports = getReports();
  const municipalities = new Set();
  reports.forEach(report => {
    if (report.municipalidad?.nombre) {
      municipalities.add(report.municipalidad.nombre);
    }
  });
  return Array.from(municipalities).sort();
};

// Obtener todas las provincias únicas de los reportes
export const getUniqueProvinces = () => {
  const reports = getReports();
  const provinces = new Set();
  reports.forEach(report => {
    if (report.municipalidad?.provincia) {
      provinces.add(report.municipalidad.provincia);
    }
  });
  return Array.from(provinces).sort();
};