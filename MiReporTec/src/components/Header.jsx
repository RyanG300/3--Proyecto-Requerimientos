import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-linear-to-r from-blue-800 to-blue-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/iconos/Logo_MiReporTec.png" 
              alt="MiReporTec Logo" 
              className="h-12 w-auto md:h-14 lg:h-16 object-contain"
            />
            <h1 className="text-white text-xl md:text-2xl font-bold hidden sm:block">
              MiReporTec
            </h1>
          </div>

          {/* User Info and Navigation */}
          <nav className="flex items-center space-x-2 md:space-x-4">
            <button className="px-3 py-2 md:px-4 md:py-2 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 text-sm md:text-base font-medium">
              Sobre
            </button>
            
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-700 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    {user.nombre}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="px-3 py-2 md:px-5 md:py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200 text-sm md:text-base font-semibold shadow-md"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-3 py-2 md:px-4 md:py-2 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 text-sm md:text-base font-medium"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => navigate('/registro')}
                  className="px-3 py-2 md:px-5 md:py-2 bg-white text-blue-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm md:text-base font-semibold shadow-md"
                >
                  Registrarse
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
