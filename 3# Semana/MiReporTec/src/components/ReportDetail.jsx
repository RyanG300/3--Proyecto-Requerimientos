import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { getReportById } from '../services/reportService';
import Header from './Header';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const foundReport = getReportById(id);
    if (foundReport) {
      setReport(foundReport);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Botón Volver */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver a reportes
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Reporte #{report.id}
                </h1>
                <p className="text-sm text-gray-500">
                  Creado el {fecha}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </div>

          {/* Foto */}
          <div className="w-full h-96 bg-gray-200">
            <img 
              src={report.foto} 
              alt="Reporte" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Descripción
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {report.descripcion}
              </p>
            </div>

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ubicación */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Ubicación
              </h3>
              <p className="text-gray-600 mb-3">
                📍 {report.ubicacion.address}
              </p>
              <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={[report.ubicacion.lat, report.ubicacion.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[report.ubicacion.lat, report.ubicacion.lng]} />
                </MapContainer>
              </div>
            </div>

            {/* Información del Reportero */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Información del Reporte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Reportado por:</span>
                  <p className="font-medium text-gray-800">{report.nombreUsuario}</p>
                </div>
                <div>
                  <span className="text-gray-600">Cédula:</span>
                  <p className="font-medium text-gray-800">{report.cedula}</p>
                </div>
                <div>
                  <span className="text-gray-600">ID del Reporte:</span>
                  <p className="font-mono text-xs text-gray-800">{report.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Coordenadas:</span>
                  <p className="font-mono text-xs text-gray-800">
                    {report.ubicacion.lat.toFixed(6)}, {report.ubicacion.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
