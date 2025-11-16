import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clicks en el mapa
function LocationMarker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const LocationPicker = ({ onLocationSelect, initialPosition = [9.9281, -84.0907] }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState('');

  const handleLocationSelect = async (lat, lng) => {
    setSelectedPosition([lat, lng]);
    
    // Reverse geocoding para obtener la dirección
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const fullAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fullAddress);
      onLocationSelect({ lat, lng, address: fullAddress });
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(coords);
      onLocationSelect({ lat, lng, address: coords });
    }
  };

  return (
    <div>
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 mb-2 relative z-0">
        <MapContainer
          center={initialPosition}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            onLocationSelect={handleLocationSelect} 
            initialPosition={selectedPosition}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500">
        Haz clic en el mapa para seleccionar la ubicación del reporte
      </p>
      {address && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📍 <strong>Ubicación seleccionada:</strong> {address}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
