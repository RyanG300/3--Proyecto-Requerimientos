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
    foto: null,
    tags: []
  });
  const [originalReport, setOriginalReport] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [fotoPreview, setFotoPreview] = useState(null);
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
    setFormData({
      descripcion: report.descripcion,
      foto: report.foto,
      tags: report.tags || []
    });
    setFotoPreview(report.foto);
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, foto: 'La foto no debe superar 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result }));
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, foto: '' }));
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
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.foto) {
      newErrors.foto = 'Debes mantener una foto del problema';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedData = {
      descripcion: formData.descripcion,
      foto: formData.foto,
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
            {/* Descripción */}
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

            {/* Foto */}
            <div>
              <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
                Foto del Problema *
              </label>
              <input
                type="file"
                id="foto"
                accept="image/*"
                onChange={handleFotoChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.foto ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.foto && (
                <p className="text-red-500 text-xs mt-1">{errors.foto}</p>
              )}
              {fotoPreview && (
                <div className="mt-3">
                  <img 
                    src={fotoPreview} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover rounded-md border border-gray-300"
                  />
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
