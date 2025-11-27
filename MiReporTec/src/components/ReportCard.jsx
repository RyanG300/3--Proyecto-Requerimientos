import { useNavigate } from 'react-router-dom';

const ReportCard = ({ report }) => {
  const navigate = useNavigate();

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

  const badge = getEstadoBadge(report.estado);
  const fecha = new Date(report.fechaCreacion).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      onClick={() => navigate(`/reporte/${report.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      {/* Imagen */}
      <div className="h-48 overflow-hidden bg-gray-200 relative">
        <img 
          src={report.fotos?.[0] || report.foto} 
          alt="Reporte" 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {report.fotos && report.fotos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            +{report.fotos.length - 1} fotos
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Header con ID y Estado */}
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-mono text-gray-500">
            #{report.id.split('-')[1]}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
            {badge.text}
          </span>
        </div>

        {/* Municipalidad */}
        {report.municipalidad && (
          <div className="mb-2 flex items-center text-xs text-gray-600">
            <span className="font-semibold">📍 {report.municipalidad.nombre}</span>
          </div>
        )}

        {/* Descripción */}
        <p className="text-gray-800 text-sm mb-3 line-clamp-2">
          {report.descripcion || '🎤 Reporte con audio'}
        </p>

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {report.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {report.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{report.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>📍 {report.ubicacion?.address?.split(',')[0] || 'Ubicación'}</span>
          <span>📅 {fecha}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
