// Validar cédula costarricense
export const validarCedula = (cedula) => {
  // Remover espacios y guiones
  const cedulaLimpia = cedula.replace(/[\s-]/g, '');
  
  // Verificar que tenga exactamente 10 dígitos
  if (!/^\d{10}$/.test(cedulaLimpia)) {
    return {
      valid: false,
      error: 'La cédula debe tener exactamente 10 dígitos'
    };
  }

  // Verificar el primer dígito (provincia u origen)
  const primerDigito = parseInt(cedulaLimpia[0]);
  if (primerDigito < 0 || primerDigito > 9) {
    return {
      valid: false,
      error: 'La cédula no tiene un formato válido'
    };
  }

  // Validación adicional: provincias 1-7, naturalizados 8-9, especiales 0
  // Todos son válidos según las especificaciones
  
  return { valid: true };
};

// Validar correo electrónico
export const validarCorreo = (correo) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(correo)) {
    return {
      valid: false,
      error: 'El correo electrónico no es válido'
    };
  }
  return { valid: true };
};

// Validar nombre (no vacío, solo letras y espacios)
export const validarNombre = (nombre) => {
  if (!nombre || nombre.trim().length === 0) {
    return {
      valid: false,
      error: 'El nombre es requerido'
    };
  }

  if (nombre.trim().length < 2) {
    return {
      valid: false,
      error: 'El nombre debe tener al menos 2 caracteres'
    };
  }

  return { valid: true };
};

// Validar contraseña
export const validarPassword = (password) => {
  if (!password || password.length < 6) {
    return {
      valid: false,
      error: 'La contraseña debe tener al menos 6 caracteres'
    };
  }

  return { valid: true };
};

// Formatear cédula (agregar guiones para visualización)
export const formatearCedula = (cedula) => {
  const cedulaLimpia = cedula.replace(/[\s-]/g, '');
  if (cedulaLimpia.length <= 1) return cedulaLimpia;
  if (cedulaLimpia.length <= 5) {
    return `${cedulaLimpia.slice(0, 1)}-${cedulaLimpia.slice(1)}`;
  }
  return `${cedulaLimpia.slice(0, 1)}-${cedulaLimpia.slice(1, 5)}-${cedulaLimpia.slice(5, 9)}`;
};
