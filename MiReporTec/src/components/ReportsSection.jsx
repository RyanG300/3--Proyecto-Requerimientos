import React from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReportsSection = () => {
  // Simular que no hay reportes por el momento
  const reports = [];
  const { user, logout } = useAuth();

  return (
    <div className="flex-1">
      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
        {user ? (
            // Estado vacío - sin reportes
            <div>
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    No hay reportes disponibles
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Aún no se han registrado reportes en esta área. 
                    Sé el primero en contribuir a mejorar tu comunidad.
                </p>
                <button className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg">
                    Crear Primer Reporte
                </button>
            </div>
        ) : (
            // Estado vacío - sin reportes y sin usuario
            <div>
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
                </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                No hay reportes disponibles
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Aún no se han registrado reportes en esta área. 
                Inicia sesión para ser el primero en contribuir a mejorar tu comunidad. 
            </p>
          </div>

        )
        }</div>) : (
        // Grid de reportes (para cuando haya datos)
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {report.title}
                  </h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {report.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>📍 {report.location}</span>
                  <span>📅 {report.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
