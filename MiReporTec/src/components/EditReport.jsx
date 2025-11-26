import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReportById, updateReport } from '../services/reportService';
import Header from './Header';

const EditReport = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    descripcion: '',
    audio: null,
    fotos: [],
    tags: []
  });
  const [originalReport, setOriginalReport] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tipoDescripcion, setTipoDescripcion] = useState('texto');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const report = getReportById(id);
    
    if (!report) {
      navigate('/');
      return;
    }

    // Verificar que el reporte pertenece al usuario
    if (report.cedula !== user.cedula) {
      alert('No tienes permiso para editar este reporte');
      navigate('/');
      return;
    }

    setOriginalReport(report);
    const hasAudio = report.audio && report.audio !== null;
    setTipoDescripcion(hasAudio ? 'audio' : 'texto');
    setFormData({
      descripcion: report.descripcion || '',
      audio: report.audio || null,
      fotos: report.fotos || (report.foto ? [report.foto] : []),
      tags: report.tags || []
    });
  }, [id, user, navigate]);

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

    if (formData.fotos.length + files.length > 5) {
      setErrors(prev => ({ ...prev, fotos: 'Máximo 5 imágenes permitidas' }));
      return;
    }

    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, fotos: 'Cada imagen no debe superar 5MB' }));
      return;
    }

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

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, audio: 'El audio no debe superar 10MB' }));
        return;
      }

      if (!file.type.startsWith('audio/')) {
        setErrors(prev => ({ ...prev, audio: 'Solo se permiten archivos de audio' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, audio: reader.result }));
        setErrors(prev => ({ ...prev, audio: '' }));
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    
    if (tipoDescripcion === 'texto' && !formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (tipoDescripcion === 'audio' && !formData.audio) {
      newErrors.audio = 'Debes mantener un audio';
    }

    if (formData.fotos.length === 0) {
      newErrors.fotos = 'Debes mantener al menos una foto del problema';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedData = {
      descripcion: tipoDescripcion === 'texto' ? formData.descripcion : '',
      audio: tipoDescripcion === 'audio' ? formData.audio : null,
      fotos: formData.fotos,
      tags: formData.tags
    };

    const success = updateReport(id, updatedData);
    
    if (success) {
      navigate('/mis-reportes');
    } else {
      alert('Error al actualizar el reporte. Por favor intenta de nuevo.');
    }
  };

  if (!originalReport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Editar Reporte
          </h2>
          <p className="text-gray-600 mb-6">
            Actualiza la información de tu reporte (la ubicación no puede modificarse)
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
                <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-1">
                  Audio del Problema * (Máximo 10MB)
                </label>
                <input
                  type="file"
                  id="audio"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.audio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.audio && (
                  <p className="text-red-500 text-xs mt-1">{errors.audio}</p>
                )}
                {formData.audio && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-medium">🎧 Audio adjunto</span>
                      <button
                        type="button"
                        onClick={handleRemoveAudio}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                    <audio controls className="w-full">
                      <source src={formData.audio} />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
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

            {/* Ubicación (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación del Problema (No editable)
              </label>
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                📍 {originalReport.ubicacion?.address || 'Ubicación registrada'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                La ubicación no puede modificarse después de crear el reporte
              </p>
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
                onClick={() => navigate('/mis-reportes')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReport;
