import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { getUniqueProvinces, getUniqueMunicipalities } from '../services/reportService';

const SearchBar = ({ onSearch, filters }) => {
  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || '');
  const [location, setLocation] = useState(filters?.location || '');
  const [municipality, setMunicipality] = useState(filters?.municipality || '');
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  // Cargar opciones de filtro al montar
  useEffect(() => {
    setProvinces(getUniqueProvinces());
    setMunicipalities(getUniqueMunicipalities());
  }, []);

  // Actualizar estados locales cuando cambian los filtros externos
  useEffect(() => {
    if (filters) {
      setSearchTerm(filters.searchTerm || '');
      setLocation(filters.location || '');
      setMunicipality(filters.municipality || '');
    }
  }, [filters]);

  const handleSearch = () => {
    onSearch({
      searchTerm,
      location,
      municipality
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setMunicipality('');
    onSearch({
      searchTerm: '',
      location: '',
      municipality: ''
    });
  };

  const hasActiveFilters = searchTerm || location || municipality;

  // Buscar al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descripción, ID, etiquetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Location Select */}
        <div className="relative lg:w-56">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">Todas las provincias</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        {/* Municipality Select */}
        <div className="relative lg:w-56">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">Todas las municipalidades</option>
            {municipalities.map((muni) => (
              <option key={muni} value={muni}>{muni}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
        >
          Buscar
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button 
            onClick={handleClearFilters}
            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center gap-2"
            title="Limpiar filtros"
          >
            <X className="h-4 w-4" />
            <span className="hidden md:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Filtros activos:</span>
          {searchTerm && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Texto: "{searchTerm}"
            </span>
          )}
          {location && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Provincia: {location}
            </span>
          )}
          {municipality && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              Municipalidad: {municipality}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
