import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateId, saveReport } from '../services/reportService';
import { asignarMunicipalidadPorCoordenadas } from '../services/municipalidadService';
import LocationPicker from './LocationPicker';
import Header from './Header';

const CreateReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    descripcion: '',
    audio: null,
    fotos: [],
    ubicacion: null,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [tipoDescripcion, setTipoDescripcion] = useState('texto'); // 'texto' o 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [asignandoMunicipalidad, setAsignandoMunicipalidad] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirigir si no hay usuario
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validar que no supere 5 imágenes
    if (formData.fotos.length + files.length > 5) {
      setErrors(prev => ({ ...prev, fotos: 'Máximo 5 imágenes permitidas' }));
      return;
    }

    // Validar tamaño de cada archivo (máximo 5MB)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, fotos: 'Cada imagen no debe superar 5MB' }));
      return;
    }

    // Convertir todas las imágenes a base64
    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      setFormData(prev => ({ 
        ...prev, 
        fotos: [...prev.fotos, ...results] 
      }));
      setErrors(prev => ({ ...prev, fotos: '' }));
    });
  };

  const handleRemoveFoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, audio: reader.result }));
          setErrors(prev => ({ ...prev, audio: '' }));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Contador de tiempo
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // Máximo 5 minutos
            stopRecording();
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      recorder.interval = interval;
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setErrors(prev => ({ ...prev, audio: 'No se pudo acceder al micrófono' }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      if (mediaRecorder.interval) {
        clearInterval(mediaRecorder.interval);
      }
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoveAudio = () => {
    setFormData(prev => ({ ...prev, audio: null }));
  };

  const handleTipoDescripcionChange = (tipo) => {
    setTipoDescripcion(tipo);
    if (tipo === 'texto') {
      setFormData(prev => ({ ...prev, audio: null }));
      setErrors(prev => ({ ...prev, audio: '' }));
    } else {
      setFormData(prev => ({ ...prev, descripcion: '' }));
      setErrors(prev => ({ ...prev, descripcion: '' }));
    }
  };

  const handleLocationSelect = (ubicacion) => {
    setFormData(prev => ({ ...prev, ubicacion }));
    setErrors(prev => ({ ...prev, ubicacion: '' }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    const newErrors = {};
    
    if (tipoDescripcion === 'texto' && !formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (tipoDescripcion === 'audio' && !formData.audio) {
      newErrors.audio = 'Debes grabar o subir un audio';
    }

    if (formData.fotos.length === 0) {
      newErrors.fotos = 'Debes subir al menos una foto del problema';
    }

    if (!formData.ubicacion) {
      newErrors.ubicacion = 'Debes seleccionar una ubicación en el mapa';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Asignar municipalidad automáticamente según ubicación
    setAsignandoMunicipalidad(true);
    let municipalidad = null;
    
    try {
      municipalidad = await asignarMunicipalidadPorCoordenadas(
        formData.ubicacion.lat,
        formData.ubicacion.lng
      );
    } catch (error) {
      console.error('Error al asignar municipalidad:', error);
    }
    
    setAsignandoMunicipalidad(false);

    // Crear reporte
    const nuevoReporte = {
      id: generateId(),
      cedula: user.cedula,
      nombreUsuario: user.nombre,
      descripcion: tipoDescripcion === 'texto' ? formData.descripcion : '',
      audio: tipoDescripcion === 'audio' ? formData.audio : null,
      fotos: formData.fotos,
      ubicacion: formData.ubicacion,
      municipalidad: municipalidad,
      tags: formData.tags,
      fechaCreacion: new Date().toISOString(),
      estado: 'sin_revisar',
      puntuacion: 0,
      votantes: [],
      notasMunicipalidad: [], // Array de notas/comentarios de la municipalidad
      comentariosUsuarios: [] // Array de comentarios de usuarios
    };

    // Guardar reporte
    const saved = saveReport(nuevoReporte);
    
    if (saved) {
      navigate('/');
    } else {
      alert('Error al guardar el reporte. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Crear Nuevo Reporte
          </h2>
          <p className="text-gray-600 mb-6">
            Reporta problemas de infraestructura pública en tu comunidad
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de Tipo de Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cómo deseas describir el problema? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="tipoDescripcion"
                    value="texto"
                    checked={tipoDescripcion === 'texto'}
                    onChange={(e) => handleTipoDescripcionChange(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">📝 Texto</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="tipoDescripcion"
                    value="audio"
                    checked={tipoDescripcion === 'audio'}
                    onChange={(e) => handleTipoDescripcionChange(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">🎤 Audio</span>
                </label>
              </div>
            </div>

            {/* Descripción de Texto */}
            {tipoDescripcion === 'texto' && (
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Problema *
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe el problema que estás reportando..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>
                )}
              </div>
            )}

            {/* Audio */}
            {tipoDescripcion === 'audio' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graba tu Audio * (Máximo 5 minutos)
                </label>
                
                {!formData.audio ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    {!isRecording ? (
                      <div>
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">🎤</span>
                          </div>
                          <p className="text-gray-600 mb-4">Haz clic para comenzar a grabar</p>
                        </div>
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
                        >
                          ● Iniciar Grabación
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                            <span className="text-3xl text-white">🎤</span>
                          </div>
                          <p className="text-gray-800 font-semibold text-xl mb-2">Grabando...</p>
                          <p className="text-gray-600 text-lg font-mono">{formatTime(recordingTime)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-semibold shadow-md"
                        >
                          ■ Detener Grabación
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-300 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-700 font-medium">🎧 Audio grabado</span>
                      <button
                        type="button"
                        onClick={handleRemoveAudio}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        × Eliminar y grabar de nuevo
                      </button>
                    </div>
                    <audio controls className="w-full">
                      <source src={formData.audio} />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                )}
                
                {errors.audio && (
                  <p className="text-red-500 text-xs mt-2">{errors.audio}</p>
                )}
              </div>
            )}

            {/* Fotos */}
            <div>
              <label htmlFor="fotos" className="block text-sm font-medium text-gray-700 mb-1">
                Fotos del Problema * (Máximo 5)
              </label>
              <input
                type="file"
                id="fotos"
                accept="image/*"
                multiple
                onChange={handleFotosChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fotos ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.fotos.length}/5 imágenes seleccionadas
              </p>
              {errors.fotos && (
                <p className="text-red-500 text-xs mt-1">{errors.fotos}</p>
              )}
              {formData.fotos.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.fotos.map((foto, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={foto} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación del Problema *
              </label>
              <LocationPicker onLocationSelect={handleLocationSelect} />
              {errors.ubicacion && (
                <p className="text-red-500 text-xs mt-1">{errors.ubicacion}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas (Opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  placeholder="Ej: bache, semáforo, alcantarilla..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                >
                  Agregar
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={asignandoMunicipalidad}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={asignandoMunicipalidad}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {asignandoMunicipalidad ? 'Asignando municipalidad...' : 'Crear Reporte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;
