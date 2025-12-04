import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ESTADOS_REPORTE = ['Pendiente', 'En proceso', 'Resuelto', 'Rechazado'];

// Normaliza texto para comparar (quita acentos, espacios, etc.)
const normalizeKey = (value) => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD') // quita acentos
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_'); // espacios y símbolos -> _
};

// Obtiene TODOS los posibles “identificadores” de municipalidad de un reporte
const getMunicipalidadKeysFromReport = (r) => {
  const keys = [];

  if (r.municipalidadId) keys.push(r.municipalidadId);
  if (r.municipalidadCodigo) keys.push(r.municipalidadCodigo);
  if (r.municipalidadClave) keys.push(r.municipalidadClave);
  if (r.municipalidadNombre) keys.push(r.municipalidadNombre);

  const m = r.municipalidad;
  if (typeof m === 'string') {
    keys.push(m);
  } else if (m && typeof m === 'object') {
    if (m.id) keys.push(m.id);
    if (m.codigo) keys.push(m.codigo);
    if (m.clave) keys.push(m.clave);
    if (m.etiqueta) keys.push(m.etiqueta);
    if (m.nombre) keys.push(m.nombre);
  }

  return keys;
};

const FuncionarioDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const [estadoEdit, setEstadoEdit] = useState('');
  const [nuevaNota, setNuevaNota] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // --- Cargar reportes de la municipalidad del funcionario ---
  useEffect(() => {
    if (!user || !user.municipalidadId) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const allReports = JSON.parse(localStorage.getItem('reports') || '[]');

      const target = normalizeKey(user.municipalidadId);

      const filtered = allReports
        .filter((r) => {
          const muniKeys = getMunicipalidadKeysFromReport(r);
          if (!muniKeys.length) return false;

          return muniKeys.some((k) => {
            const nk = normalizeKey(k);
            // Coincidencia flexible: SAN_RAMON con "Municipalidad de San Ramón", etc.
            return nk && (nk.includes(target) || target.includes(nk));
          });
        })
        .sort(
          (a, b) =>
            new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0)
        );

      console.log('FUNC DASH - muni usuario:', user.municipalidadId);
      console.log('FUNC DASH - reports filtrados:', filtered);

      setReports(filtered);
    } catch (err) {
      console.error('Error cargando reportes para funcionario', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // --- Sincronizar estado del formulario cuando cambia el reporte seleccionado ---
  useEffect(() => {
    if (!selectedReport) {
      setEstadoEdit('');
      setNuevaNota('');
      setSaveMessage('');
      return;
    }
    setEstadoEdit(selectedReport.estado || 'Pendiente');
    setNuevaNota('');
    setSaveMessage('');
  }, [selectedReport]);

  if (!user) return null;

  const handleSeleccionarReporte = (reporte) => {
    setSelectedReport(reporte);
  };

  const handleGuardarCambios = () => {
  if (!selectedReport || !user?.municipalidadId) return;

  setSaving(true);
  setSaveMessage('');

  try {
    const allReports = JSON.parse(localStorage.getItem('reports') || '[]');

    const updatedReports = allReports.map((r) => {
      if (r.id !== selectedReport.id) return r;

      // Notas internas del funcionario (historial)
      const notasPreviasSeg = Array.isArray(r.seguimientoNotas)
        ? r.seguimientoNotas
        : [];

      // Notas visibles para el ciudadano en el detalle
      const notasPreviasMuni = Array.isArray(r.notasMunicipalidad)
        ? r.notasMunicipalidad
        : [];

      const nuevasNotasSeg = [...notasPreviasSeg];
      const nuevasNotasMuni = [...notasPreviasMuni];

      if (nuevaNota.trim() !== '') {
        const fechaISO = new Date().toISOString();

        // Nota para el historial interno
        nuevasNotasSeg.push({
          id: crypto.randomUUID(),
          texto: nuevaNota.trim(),
          fecha: fechaISO,
          autor: user.nombre,
        });

        // Nota para que la vea el ciudadano
        nuevasNotasMuni.push({
          autor: user.nombre,
          fecha: fechaISO,
          contenido: nuevaNota.trim(),
        });
      }

      return {
        ...r,
        estado: estadoEdit,
        seguimientoNotas: nuevasNotasSeg,
        notasMunicipalidad: nuevasNotasMuni,
      };
    });

    localStorage.setItem('reports', JSON.stringify(updatedReports));

    // Reaplicar el filtro de municipalidad para recargar la lista
    const target = normalizeKey(user.municipalidadId);
    const filtered = updatedReports
      .filter((r) => {
        const muniKeys = getMunicipalidadKeysFromReport(r);
        if (!muniKeys.length) return false;

        return muniKeys.some((k) => {
          const nk = normalizeKey(k);
          return nk && (nk.includes(target) || target.includes(nk));
        });
      })
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0)
      );

    setReports(filtered);

    const updatedSelected = filtered.find((r) => r.id === selectedReport.id);
    setSelectedReport(updatedSelected || null);

    setNuevaNota('');
    setSaveMessage('Cambios guardados correctamente.');
  } catch (err) {
    console.error('Error al guardar cambios del reporte', err);
    setSaveMessage('Ocurrió un error al guardar los cambios.');
  } finally {
    setSaving(false);
  }
};

  const formatearFecha = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('es-CR');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p className="text-gray-700">
          Sesión iniciada como:{' '}
          <span className="font-semibold">{user.nombre}</span>
        </p>
        <p className="text-sm text-gray-600">
          Municipalidad asignada:{' '}
          <span className="font-semibold">
            {user.municipalidadId || 'Sin asignar'}
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando reportes...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">
          No hay reportes asociados a esta municipalidad por el momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lista de reportes */}
          <div className="md:col-span-1 border rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold px-4 py-3 border-b text-gray-800">
              Reportes de tu municipalidad
            </h3>
            <ul className="divide-y">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                    selectedReport?.id === r.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSeleccionarReporte(r)}
                >
                  <p className="font-medium text-sm text-gray-800">
                    {r.titulo ||
                      r.descripcion?.slice(0, 40) ||
                      'Reporte sin título'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Prioridad: {r.prioridad || 'N/A'} · Estado:{' '}
                    {r.estado || 'Pendiente'}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Detalle + gestión */}
          <div className="md:col-span-2 border rounded-lg bg-white shadow-sm p-4">
            {selectedReport ? (
              <>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {selectedReport.titulo || 'Reporte sin título'}
                </h3>
                <p className="text-gray-700 mb-3">
                  {selectedReport.descripcion || 'Sin descripción'}
                </p>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-semibold">Ubicación: </span>
                    {selectedReport.ubicacion?.descripcion ||
                      selectedReport.ubicacionTexto ||
                      (selectedReport.ubicacion
                        ? `${selectedReport.ubicacion.lat}, ${selectedReport.ubicacion.lng}`
                        : 'No especificada')}
                  </p>
                  <p>
                    <span className="font-semibold">Prioridad: </span>
                    {selectedReport.prioridad || 'Media'}
                  </p>
                  <p>
                    <span className="font-semibold">Estado actual: </span>
                    {selectedReport.estado || 'Pendiente'}
                  </p>
                  <p>
                    <span className="font-semibold">Fecha de creación: </span>
                    {formatearFecha(selectedReport.fechaCreacion)}
                  </p>
                </div>

                {/* Gestión */}
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actualizar estado del reporte
                    </label>
                    <select
                      value={estadoEdit}
                      onChange={(e) => setEstadoEdit(e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    >
                      {ESTADOS_REPORTE.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agregar nota de seguimiento
                    </label>
                    <textarea
                      value={nuevaNota}
                      onChange={(e) => setNuevaNota(e.target.value)}
                      rows={3}
                      placeholder="Describe el avance, visitas realizadas, coordinación con cuadrillas, etc."
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGuardarCambios}
                      disabled={saving}
                      className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                        saving
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    {saveMessage && (
                      <span className="text-xs text-gray-600">
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Historial de notas */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Historial de seguimiento
                  </h4>
                  {(!selectedReport.seguimientoNotas ||
                    selectedReport.seguimientoNotas.length === 0) && (
                    <p className="text-xs text-gray-500">
                      Aún no hay notas de seguimiento para este reporte.
                    </p>
                  )}

                  {selectedReport.seguimientoNotas &&
                    selectedReport.seguimientoNotas.length > 0 && (
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {[...selectedReport.seguimientoNotas]
                          .slice()
                          .reverse()
                          .map((nota) => (
                            <li
                              key={nota.id}
                              className="border rounded-md px-3 py-2 bg-gray-50"
                            >
                              <p className="text-xs text-gray-500 mb-1">
                                {nota.autor
                                  ? `${nota.autor} · ${formatearFecha(
                                      nota.fecha
                                    )}`
                                  : formatearFecha(nota.fecha)}
                              </p>
                              <p className="text-sm text-gray-700">
                                {nota.texto}
                              </p>
                            </li>
                          ))}
                      </ul>
                    )}
                </div>
              </>
            ) : (
              <p className="text-gray-500">
                Selecciona un reporte de la lista para ver el detalle y
                gestionarlo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioDashboard;
