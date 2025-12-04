import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validarCedula,
  validarCorreo,
  validarNombre,
  validarPassword
} from '../utils/validations';

// 🔹 Importamos el JSON con TODAS las municipalidades
import municipalidadesData from '../Jsons/municipalidades.json';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    correo: '',
    password: '',
    confirmPassword: '',
    role: 'CIUDADANO',      // tipo de usuario
    municipalidadId: ''     // municipalidad del funcionario (guardará el nombre)
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    const nombreValidation = validarNombre(formData.nombre);
    if (!nombreValidation.valid) {
      newErrors.nombre = nombreValidation.error;
    }

    const cedulaValidation = validarCedula(formData.cedula);
    if (!cedulaValidation.valid) {
      newErrors.cedula = cedulaValidation.error;
    }

    const correoValidation = validarCorreo(formData.correo);
    if (!correoValidation.valid) {
      newErrors.correo = correoValidation.error;
    }

    const passwordValidation = validarPassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Si es funcionario, debe elegir municipalidad
    if (formData.role === 'FUNCIONARIO' && !formData.municipalidadId) {
      newErrors.municipalidadId = 'Debes seleccionar la municipalidad donde trabajas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar datos del usuario (sin confirmPassword)
    const userData = {
      nombre: formData.nombre.trim(),
      cedula: formData.cedula.replace(/[\s-]/g, ''),
      correo: formData.correo.trim(),
      password: formData.password,
      role: formData.role,
      // aquí municipalidadId será el NOMBRE de la muni seleccionada
      municipalidadId: formData.role === 'FUNCIONARIO'
        ? formData.municipalidadId
        : null,
    };

    const result = register(userData);
    
    if (!result.success) {
      setMessage(result.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Registro
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Cédula */}
          <div>
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
              Cédula
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              placeholder="1-2345-6789"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cedula ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cedula && (
              <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Cédula costarricense
            </p>
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.correo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.correo && (
              <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
            )}
          </div>

          {/* Tipo de usuario */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cuenta
            </span>
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="role"
                  value="CIUDADANO"
                  checked={formData.role === 'CIUDADANO'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Ciudadano
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="role"
                  value="FUNCIONARIO"
                  checked={formData.role === 'FUNCIONARIO'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Funcionario municipal
              </label>
            </div>
          </div>

          {/* Municipalidad (solo si es funcionario) */}
          {formData.role === 'FUNCIONARIO' && (
            <div>
              <label htmlFor="municipalidadId" className="block text-sm font-medium text-gray-700 mb-1">
                Municipalidad donde trabajas
              </label>
              <select
                id="municipalidadId"
                name="municipalidadId"
                value={formData.municipalidadId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.municipalidadId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una opción</option>

                {/* 🔹 Recorremos provincias y municipalidades desde el JSON */}
                {municipalidadesData.municipalidades.map((provincia) => (
                  <optgroup
                    key={provincia.provincia}
                    label={provincia.provincia}
                  >
                    {provincia.municipalidades.map((m) => (
                      <option key={m.nombre} value={m.nombre}>
                        {m.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.municipalidadId && (
                <p className="text-red-500 text-xs mt-1">{errors.municipalidadId}</p>
              )}
            </div>
          )}

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {message && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
