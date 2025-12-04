import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { getReportById, voteReport, addComment } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [votando, setVotando] = useState(false);
  const [comentando, setComentando] = useState(false);

  useEffect(() => {
    const foundReport = getReportById(id);
    if (foundReport) {
      setReport(foundReport);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  // Obtener el voto actual del usuario
  const getVotoUsuario = () => {
    if (!user || !report?.votantes) return null;
    const votoExistente = report.votantes.find(v => v.userId === user.cedula);
    return votoExistente ? votoExistente.voto : null;
  };

  // Manejar votación
  const handleVote = async (voto) => {
    if (!user) {
      alert('Debes iniciar sesión para votar');
      return;
    }
    
    setVotando(true);
    const resultado = voteReport(report.id, user.cedula, voto);
    
    if (resultado.success) {
      // Recargar el reporte para obtener los datos actualizados
      const updatedReport = getReportById(id);
      setReport(updatedReport);
    }
    setVotando(false);
  };

  // Manejar envío de comentario
  const handleSubmitComentario = () => {
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    
    if (!nuevoComentario.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    setComentando(true);
    const resultado = addComment(report.id, {
      nombreUsuario: user.nombre,
      cedula: user.cedula,
      contenido: nuevoComentario.trim()
    });

    if (resultado.success) {
      // Recargar el reporte para obtener los comentarios actualizados
      const updatedReport = getReportById(id);
      setReport(updatedReport);
      setNuevoComentario('');
    } else {
      alert('Error al publicar el comentario');
    }
    setComentando(false);
  };

  const votoUsuario = getVotoUsuario();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // ...arriba del componente, deja todo igual

const getEstadoBadge = (estadoRaw) => {
  const raw = (estadoRaw || '').toString().toLowerCase().trim();
  const key = raw.replace(/\s+/g, '_'); // "En Proceso" -> "en_proceso"

  const badges = {
    sin_revisar: { text: 'Sin Revisar', color: 'bg-gray-100 text-gray-800' },
    pendiente:   { text: 'Sin Revisar', color: 'bg-gray-100 text-gray-800' }, // alias
    en_revision: { text: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
    en_proceso:  { text: 'En Proceso',  color: 'bg-blue-100 text-blue-800' },
    resuelto:    { text: 'Resuelto',    color: 'bg-green-100 text-green-800' },
    rechazado:   { text: 'Rechazado',   color: 'bg-red-100 text-red-800' },
  };

  // Coincidencia exacta con la clave
  if (badges[key]) return badges[key];

  // Fallback por contenido del texto
  if (raw.includes('pendiente')) return badges.pendiente;
  if (raw.includes('proceso'))   return badges.en_proceso;
  if (raw.includes('revisión') || raw.includes('revision')) return badges.en_revision;
  if (raw.includes('resuelto'))  return badges.resuelto;
  if (raw.includes('rechazado')) return badges.rechazado;

  // Default
  return badges.sin_revisar;
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

          {/* Fotos */}
          <div className="w-full bg-gray-200">
            {report.fotos && report.fotos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {report.fotos.map((foto, index) => (
                  <img 
                    key={index}
                    src={foto} 
                    alt={`Reporte ${index + 1}`}
                    className="w-full h-64 object-cover rounded"
                  />
                ))}
              </div>
            ) : (
              <img 
                src={report.foto} 
                alt="Reporte" 
                className="w-full h-96 object-contain"
              />
            )}
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Municipalidad */}
            {report.municipalidad && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  📍 Municipalidad Responsable
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-800 font-medium">
                    {report.municipalidad.nombre}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {report.municipalidad.provincia} - {report.municipalidad.canton}
                    {report.municipalidad.distrito && `, ${report.municipalidad.distrito}`}
                  </p>
                </div>
              </div>
            )}

            {/* Descripción */}
            {report.descripcion && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {report.descripcion}
                </p>
              </div>
            )}

            {/* Audio */}
            {report.audio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Audio de la Descripción
                </h3>
                <div className="p-4 bg-gray-50 border border-gray-300 rounded-md">
                  <audio controls className="w-full">
                    <source src={report.audio} />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                </div>
              </div>
            )}

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
              <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 relative z-0">
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

            {/* Relevancia */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Relevancia del Reporte
              </h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleVote(1)}
                  disabled={votando || !user}
                  className={`flex flex-col items-center gap-1 px-4 py-3 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    votoUsuario === 1 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500 hover:text-green-700'
                  }`}
                  title={!user ? 'Inicia sesión para votar' : votoUsuario === 1 ? 'Quitar voto' : 'Votar positivo'}
                >
                  <span className="text-2xl">▲</span>
                  <span className="text-xs font-medium">{votoUsuario === 1 ? 'Votado +' : 'Votar +'}</span>
                </button>
                <div className="flex flex-col items-center">
                  <span className={`text-3xl font-bold ${
                    (report.puntuacion || 0) > 0 ? 'text-green-600' : 
                    (report.puntuacion || 0) < 0 ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {report.puntuacion || 0}
                  </span>
                  <span className="text-xs text-gray-500">puntos</span>
                </div>
                <button 
                  onClick={() => handleVote(-1)}
                  disabled={votando || !user}
                  className={`flex flex-col items-center gap-1 px-4 py-3 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    votoUsuario === -1 
                      ? 'bg-red-100 border-red-500 text-red-700' 
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-700'
                  }`}
                  title={!user ? 'Inicia sesión para votar' : votoUsuario === -1 ? 'Quitar voto' : 'Votar negativo'}
                >
                  <span className="text-2xl">▼</span>
                  <span className="text-xs font-medium">{votoUsuario === -1 ? 'Votado -' : 'Votar -'}</span>
                </button>
              </div>
              {!user && (
                <p className="text-sm text-gray-500 mt-2">
                  Inicia sesión para poder votar en este reporte
                </p>
              )}
              {report.votantes && report.votantes.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {report.votantes.length} {report.votantes.length === 1 ? 'usuario ha votado' : 'usuarios han votado'}
                </p>
              )}
            </div>

            {/* Notas de la Municipalidad */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🏛️ Notas de la Municipalidad
              </h3>
              {report.notasMunicipalidad && report.notasMunicipalidad.length > 0 ? (
                <div className="space-y-3">
                  {report.notasMunicipalidad.map((nota, index) => (
                    <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-blue-900">{nota.autor || 'Municipalidad'}</p>
                        <span className="text-xs text-blue-600">
                          {new Date(nota.fecha).toLocaleDateString('es-CR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{nota.contenido}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    Aún no hay notas de la municipalidad sobre este reporte
                  </p>
                </div>
              )}
            </div>

            {/* Comentarios de Usuarios */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                💬 Comentarios de Usuarios
                {report.comentariosUsuarios && report.comentariosUsuarios.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({report.comentariosUsuarios.length})
                  </span>
                )}
              </h3>
              
              {/* Formulario para agregar comentario */}
              {user ? (
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.nombre}</span>
                  </div>
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe tu comentario sobre este reporte..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    disabled={comentando}
                  ></textarea>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {nuevoComentario.length}/500 caracteres
                    </span>
                    <button 
                      onClick={handleSubmitComentario}
                      disabled={comentando || !nuevoComentario.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {comentando ? 'Publicando...' : 'Publicar Comentario'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-700 text-sm">
                    Inicia sesión para poder comentar en este reporte
                  </p>
                </div>
              )}

              {/* Lista de comentarios */}
              {report.comentariosUsuarios && report.comentariosUsuarios.length > 0 ? (
                <div className="space-y-3">
                  {report.comentariosUsuarios.map((comentario, index) => (
                    <div key={comentario.id || index} className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {comentario.nombreUsuario.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{comentario.nombreUsuario}</p>
                            <p className="text-xs text-gray-500">Cédula: {comentario.cedula}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comentario.fecha).toLocaleDateString('es-CR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-10">{comentario.contenido}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    Sé el primero en comentar sobre este reporte
                  </p>
                </div>
              )}
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
