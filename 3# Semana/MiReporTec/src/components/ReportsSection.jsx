import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReportsSortedByDate } from '../services/reportService';
import ReportCard from './ReportCard';

const ReportsSection = () => {
  const [reports, setReports] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar reportes al montar el componente
    const loadReports = () => {
      const allReports = getReportsSortedByDate();
      setReports(allReports);
    };
    loadReports();
  }, []);

  return (
    <div className="flex-1">
      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          {user ? (
            // Estado vacío - sin reportes pero con usuario autenticado
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
              <button 
                onClick={() => navigate('/crear-reporte')}
                className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
              >
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
          )}
        </div>
      ) : (
        // Grid de reportes
        <div>
          {user && (
            <div className="mb-6 flex justify-end">
              <button 
                onClick={() => navigate('/crear-reporte')}
                className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                + Crear Reporte
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
