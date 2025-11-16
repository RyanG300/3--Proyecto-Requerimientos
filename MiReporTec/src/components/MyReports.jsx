import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports, deleteReport } from '../services/reportService';
import Header from './Header';
import { FileText, Edit, Calendar, MapPin, Eye, Trash2 } from 'lucide-react';

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userReports = getUserReports(user.cedula);
    setReports(userReports);
  }, [user, navigate]);

  const handleDelete = (reportId, reportDesc) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar este reporte?\n\n"${reportDesc.substring(0, 50)}${reportDesc.length > 50 ? '...' : ''}"`
    );
    
    if (confirmed) {
      const success = deleteReport(reportId);
      if (success) {
        setReports(reports.filter(r => r.id !== reportId));
      } else {
        alert('Error al eliminar el reporte. Por favor intenta de nuevo.');
      }
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      sin_revisar: { text: 'Sin Revisar', color: 'bg-gray-100 text-gray-800' },
      en_revision: { text: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
      en_proceso: { text: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
      resuelto: { text: 'Resuelto', color: 'bg-green-100 text-green-800' },
      rechazado: { text: 'Rechazado', color: 'bg-red-100 text-red-800' }
    };
    return badges[estado] || badges.sin_revisar;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium transition"
        >
          ← Volver al Menú Principal
        </button>
        
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Mis Reportes
          </h2>
          <p className="text-gray-600">
            Gestiona y edita tus reportes ciudadanos
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              No tienes reportes creados
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Aún no has creado ningún reporte. Comienza a contribuir a tu comunidad.
            </p>
            <button 
              onClick={() => navigate('/crear-reporte')}
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Crear Primer Reporte
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const badge = getEstadoBadge(report.estado);
              const fecha = new Date(report.fechaCreacion).toLocaleDateString('es-CR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div 
                  key={report.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Imagen */}
                    <div className="md:w-48 h-48 bg-gray-200 shrink-0">
                      <img 
                        src={report.foto} 
                        alt="Reporte" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono text-gray-500">
                              #{report.id.split('-')[1]}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                              {badge.text}
                            </span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                              ⬆ {report.puntuacion || 0}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-3 line-clamp-2">
                            {report.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {report.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {report.ubicacion?.address?.split(',')[0] || 'Ubicación'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {fecha}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/reporte/${report.id}`)}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-xs font-medium"
                          >
                            <Eye size={14} />
                            Ver
                          </button>
                          <button
                            onClick={() => navigate(`/editar-reporte/${report.id}`)}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs font-medium"
                          >
                            <Edit size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(report.id, report.descripcion)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs font-medium"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
