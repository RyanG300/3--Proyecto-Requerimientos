import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario en sesión al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (cedula, password) => {
    // Obtener usuarios del localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Buscar usuario
    const foundUser = users.find(
      (u) => u.cedula === cedula && u.password === password
    );

    if (foundUser) {
      // Guardar usuario en sesión (sin contraseña)
      const userSession = {
        nombre: foundUser.nombre,
        cedula: foundUser.cedula,
        correo: foundUser.correo,
        // NUEVO: rol y municipalidad
        role: foundUser.role || 'CIUDADANO',
        municipalidadId: foundUser.municipalidadId || null,
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      setUser(userSession);
      return { success: true };
    }

    return { success: false, error: 'Cédula o contraseña incorrectos' };
  };

  const register = (userData) => {
    // Obtener usuarios existentes
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar si el usuario ya existe
    const existingUser = users.find(
      (u) => u.cedula === userData.cedula || u.correo === userData.correo
    );

    if (existingUser) {
      if (existingUser.cedula === userData.cedula) {
        return { success: false, error: 'Esta cédula ya está registrada' };
      }
      return { success: false, error: 'Este correo ya está registrado' };
    }

    // NUEVO: definimos el objeto que vamos a guardar
    const newUser = {
      ...userData,
      role: userData.role || 'CIUDADANO',           // 'FUNCIONARIO' o 'CIUDADANO'
      municipalidadId: userData.municipalidadId || null, // para funcionario
    };

    // Agregar nuevo usuario
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Iniciar sesión automáticamente (sin password)
    const userSession = {
      nombre: newUser.nombre,
      cedula: newUser.cedula,
      correo: newUser.correo,
      role: newUser.role,
      municipalidadId: newUser.municipalidadId,
    };
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    setUser(userSession);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    // NUEVO: helpers
    isFuncionario: user?.role === 'FUNCIONARIO',
    isCiudadano: user?.role === 'CIUDADANO' || !user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
