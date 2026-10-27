import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, RotateCcw, Compass, Filter, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mexicoGeo from '../data/mexicoEstados.json';

// Función para normalizar nombres canónicos de estados mexicanos
export function normalizeState(name) {
  if (!name) return '';
  const s = String(name).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();

  // CDMX / Distrito Federal
  if (s.includes('cdmx') || s.includes('distrito federal') || s.includes('ciudad de mexico')) {
    return 'cdmx';
  }

  // Estado de México vs México
  if (s.includes('estado de mexico') || s === 'mexico' || s.includes('edomex')) {
    return 'mexico';
  }

  // Michoacán de Ocampo
  if (s.includes('michoacan')) {
    return 'michoacan';
  }

  // Veracruz de Ignacio de la Llave
  if (s.includes('veracruz')) {
    return 'veracruz';
  }

  // Coahuila de Zaragoza
  if (s.includes('coahuila')) {
    return 'coahuila';
  }

  return s;
}

// Función para emparejar nombres de estados de forma tolerante a tildes y nombres oficiales
export function matchStateName(s1, s2) {
  if (!s1 || !s2) return false;
  const c1 = normalizeState(s1);
  const c2 = normalizeState(s2);
  if (c1 === c2) return true;

  const norm = s => String(s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
  const n1 = norm(s1);
  const n2 = norm(s2);

  // Evitar colisión entre CDMX y Estado de México
  const isCdmx1 = n1.includes('cdmx') || n1.includes('distrito federal') || n1.includes('ciudad de mexico');
  const isCdmx2 = n2.includes('cdmx') || n2.includes('distrito federal') || n2.includes('ciudad de mexico');
  if (isCdmx1 !== isCdmx2) return false;

  return n1.includes(n2) || n2.includes(n1);
}

const MapaMexicoEncuesta = ({
  provinciaStats = [],
  totalSamples = 0,
  selectedProvincia = 'Todas',
  onSelectProvincia,
  darkMode = true
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const [hoveredState, setHoveredState] = useState(null);

  // Mapear estadísticas por estado para búsqueda rápida
  const statsMap = useMemo(() => {
    const map = new Map();
    (provinciaStats || []).forEach(item => {
      const key = item.provincia || item.grupo || item.estado;
      if (key) map.set(key, item);
    });
    return map;
  }, [provinciaStats]);

  // Obtener datos de un estado del GeoJSON
  const getStateData = (geoNombre) => {
    let totalCount = 0;
    let found = false;
    let matchedGrupo = geoNombre;

    for (const [nombre, data] of statsMap.entries()) {
      if (matchStateName(nombre, geoNombre)) {
        found = true;
        matchedGrupo = data.provincia || data.grupo || nombre;
        const count = Number(data.count) || 0;
        totalCount += count;
      }
    }

    if (found && totalCount > 0) {
      return { grupo: matchedGrupo, count: totalCount };
    }
    return { grupo: geoNombre, count: 0 };
  };

  // Escala de color por cantidad de respuestas
  const getColor = (count) => {
    if (!count || count === 0) return darkMode ? '#1e293b' : '#e2e8f0';
    if (count <= 2) return '#0284c7'; // Azul
    if (count <= 5) return '#06b6d4'; // Cyan
    if (count <= 15) return '#10b981'; // Verde Esmeralda
    return '#10b981'; // Alta participación
  };

  // Inicialización del Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Coordenadas centrales de México
      const map = L.map(mapContainerRef.current, {
        center: [23.6345, -102.5528],
        zoom: 5,
        minZoom: 4,
        maxZoom: 9,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      });

      // Capa base de mapa
      const tileUrl = darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19
      });

      tileLayer.on('tileerror', () => {
        if (!map._osmFallbackAdded) {
          map._osmFallbackAdded = true;
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
          }).addTo(map);
        }
      });

      tileLayer.addTo(map);

      // Limitar límites de vista a México
      map.setMaxBounds([
        [12.0, -120.0],
        [34.0, -84.0]
      ]);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remover capa previa si existe para actualizar colores con los nuevos stats
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    // Estilo dinámico de cada estado
    const styleFeature = (feature) => {
      const geoNombre = feature.properties.state_name || feature.properties.name || feature.properties.nombre;
      const data = getStateData(geoNombre);
      const isSelected = selectedProvincia !== 'Todas' && matchStateName(selectedProvincia, geoNombre);

      return {
        fillColor: getColor(data.count),
        weight: isSelected ? 2.5 : 1,
        opacity: 1,
        color: isSelected ? '#00e5ff' : (darkMode ? '#334155' : '#cbd5e1'),
        fillOpacity: data.count > 0 ? (darkMode ? 0.85 : 0.75) : (darkMode ? 0.35 : 0.25)
      };
    };

    // Capa GeoJSON interactiva
    const geoJsonLayer = L.geoJSON(mexicoGeo, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const geoNombre = feature.properties.state_name || feature.properties.name || feature.properties.nombre;
        const data = getStateData(geoNombre);
        const count = data.count || 0;
        const pct = totalSamples > 0 ? ((count / totalSamples) * 100).toFixed(1) : 0;

        // Tooltip interactivo estilizado
        const tooltipHtml = `
          <div style="font-family: inherit; padding: 4px 6px; min-width: 140px;">
            <div style="font-weight: 700; font-size: 13px; color: #00e5ff; margin-bottom: 4px;">
              ${geoNombre}
            </div>
            <div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>Muestras recibidas:</span>
              <strong style="color: #ffffff;">${count} (${pct}%)</strong>
            </div>
            <div style="font-size: 10px; color: #64748b;">
              Click para filtrar este estado
            </div>
          </div>
        `;

        layer.bindTooltip(tooltipHtml, {
          sticky: true,
          direction: 'auto',
          className: darkMode ? 'leaflet-custom-dark' : 'leaflet-custom-light'
        });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2.5,
              color: '#00e5ff',
              fillOpacity: 0.95
            });
            l.bringToFront();
            setHoveredState({ nombre: geoNombre, ...data, pct });
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
            setHoveredState(null);
          },
          click: () => {
            if (onSelectProvincia) {
              const targetGroup = (data && data.count > 0 && data.grupo) ? data.grupo : geoNombre;
              if (selectedProvincia !== 'Todas' && matchStateName(selectedProvincia, geoNombre)) {
                onSelectProvincia('Todas');
              } else {
                onSelectProvincia(targetGroup);
              }
            }
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;

    // Ajustar zoom inicial para encuadrar México
    try {
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [10, 10] });
    } catch {}

  }, [provinciaStats, selectedProvincia, totalSamples, darkMode]);

  // Ranking ordenado de estados activos
  const activeStatesRanking = useMemo(() => {
    return (provinciaStats || [])
      .map(item => ({
        nombre: item.provincia || item.grupo || 'Sin especificar',
        count: Number(item.count) || 0,
        pct: totalSamples > 0 ? (((Number(item.count) || 0) / totalSamples) * 100).toFixed(1) : 0
      }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [provinciaStats, totalSamples]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative">
      {/* Contenedor del Mapa Leaflet */}
      <div className="flex-1 relative min-h-[360px] md:min-h-[460px]">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

        {/* HUD Superior: Estado Seleccionado / Filtro Activo */}
        <div className="absolute top-3 left-3 z-[10] flex items-center gap-2">
          {selectedProvincia !== 'Todas' ? (
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-[var(--color-brand-cyan)] px-3 py-1.5 rounded-xl shadow-lg">
              <Filter className="w-3.5 h-3.5 text-[var(--color-brand-cyan)]" />
              <span className="text-xs font-semibold text-white">
                Filtrado por: <strong className="text-[var(--color-brand-cyan)]">{selectedProvincia}</strong>
              </span>
              <button
                onClick={() => onSelectProvincia && onSelectProvincia('Todas')}
                className="ml-1 text-slate-400 hover:text-white p-0.5"
                title="Quitar filtro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-[11px] text-slate-300">
              <Compass className="w-3.5 h-3.5 text-[var(--color-brand-cyan)]" />
              <span>32 Entidades Federativas · Click en un estado para filtrar</span>
            </div>
          )}
        </div>

        {/* Leyenda de Intensidad */}
        <div className="absolute bottom-3 left-3 z-[10] bg-slate-900/85 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-[11px] text-slate-300 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[var(--color-brand-cyan)]" />
            Muestras Registradas
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1e293b] border border-white/10 inline-block" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7] inline-block" />
              <span>1-2</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4] inline-block" />
              <span>3-5</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block" />
              <span>6+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Ranking de Entidades Federativas Activas */}
      <div className={`w-full md:w-72 border-t md:border-t-0 md:border-l p-4 flex flex-col justify-between overflow-y-auto max-h-[460px] ${
        darkMode ? 'bg-[#0A1020]/95 border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-brand-cyan)]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Entidades Activas
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold">
              {activeStatesRanking.length} / 32
            </span>
          </div>

          {activeStatesRanking.length > 0 ? (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {activeStatesRanking.map((item, idx) => {
                const isSelected = selectedProvincia !== 'Todas' && matchStateName(selectedProvincia, item.nombre);
                return (
                  <button
                    key={item.nombre}
                    onClick={() => onSelectProvincia && onSelectProvincia(isSelected ? 'Todas' : item.nombre)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[var(--color-brand-cyan)]/15 border-[var(--color-brand-cyan)] text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <span className="truncate font-medium">
                        {item.nombre}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-white">{item.count}</span>
                      <span className="text-[10px] text-slate-400">({item.pct}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400 space-y-2">
              <MapPin className="w-6 h-6 text-slate-600 mx-auto animate-pulse" />
              <p className="font-medium text-slate-300">Aguardando primeras muestras</p>
              <p className="text-[11px] text-slate-500">
                Los estados de México se iluminarán automáticamente a medida que ingresen las respuestas.
              </p>
            </div>
          )}
        </div>

        {selectedProvincia !== 'Todas' && (
          <button
            onClick={() => onSelectProvincia && onSelectProvincia('Todas')}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ver todo México</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MapaMexicoEncuesta;
