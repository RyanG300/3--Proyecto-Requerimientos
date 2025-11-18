import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (itemName) => {
    if (itemName === 'Crear Reporte') {
      navigate('/crear-reporte');
    } else if (itemName === 'Reportes' && user) {
      navigate('/mis-reportes');
    }
    setIsOpen(false);
  };
  
  const menuItems = [
    ...(user ? [{ name: 'Reportes', icon: '📋' }] : []),
    { name: 'Anuncios', icon: '📢' },
    { name: 'Tags', icon: '🏷️' },
    ...(user ? [{ name: 'Crear Reporte', icon: '➕', highlight: true }] : [])
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-blue-800 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 h-full
          bg-linear-to-b from-gray-50 to-gray-100 
          shadow-xl border-r border-gray-200
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-56 xl:w-64
        `}
      >
        <nav className="p-4 pt-24 lg:pt-6 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.name)}
              className={`
                w-full text-left px-4 py-3 rounded-lg
                flex items-center space-x-3
                transition-all duration-200
                ${item.highlight 
                  ? 'bg-blue-800 text-white hover:bg-blue-700 shadow-md font-semibold' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-medium'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-6 border-t border-gray-300" />

        {/* Additional Info Section */}
        <div className="px-4 py-3 mx-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 font-medium">
            Sistema de Reportes Ciudadanos
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Versión 1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
