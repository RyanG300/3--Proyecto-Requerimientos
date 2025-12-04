import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ReportsSection from './components/ReportsSection';
import FuncionarioDashboard from './components/FuncionarioDashboard';

function App() {
  const { loading, isFuncionario } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    location: '',
    municipality: ''
  });

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  // Mostrar loading mientras verifica sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {isFuncionario ? (
              <>
                {/* Título para funcionario */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Gestión de Reportes Municipales
                  </h2>
                  <p className="text-gray-600">
                    Revisa y gestiona los reportes asociados a tu municipalidad,
                    según su ubicación y prioridad.
                  </p>
                </div>

                {/* Panel de funcionario */}
                <FuncionarioDashboard />
              </>
            ) : (
              <>
                {/* Título para ciudadano */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Reportes Ciudadanos
                  </h2>
                  <p className="text-gray-600">
                    Consulta y crea reportes sobre el estado de la obra pública en tu comunidad
                  </p>
                </div>

                {/* Search Bar */}
                <SearchBar onSearch={handleSearch} filters={searchFilters} />

                {/* Reports Section */}
                <ReportsSection filters={searchFilters} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
