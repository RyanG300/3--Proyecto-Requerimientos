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
