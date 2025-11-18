// Obtener todos los usuarios
export const getUsers = () => {
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

// Guardar usuarios
export const saveUsers = (users) => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
    return false;
  }
};

// Agregar un nuevo usuario
export const addUser = (user) => {
  try {
    const users = getUsers();
    users.push(user);
    return saveUsers(users);
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    return false;
  }
};

// Buscar usuario por cédula
export const findUserByCedula = (cedula) => {
  const users = getUsers();
  return users.find(user => user.cedula === cedula);
};

// Buscar usuario por correo
export const findUserByEmail = (correo) => {
  const users = getUsers();
  return users.find(user => user.correo === correo);
};

// Obtener usuario actual de la sesión
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
};

// Guardar usuario actual en la sesión
export const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    return true;
  } catch (error) {
    console.error('Error al guardar usuario actual:', error);
    return false;
  }
};

// Cerrar sesión
export const clearSession = () => {
  try {
    localStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};
