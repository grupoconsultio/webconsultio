import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Award, RotateCcw, Compass, Filter, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import argentinaGeo from '../data/argentinaProvincias.json';

// Función para emparejar nombres de provincias de forma tolerante a tildes, mayúsculas y sufijos
export function matchProvinceName(p1, p2) {
  if (!p1 || !p2) return false;
  const norm = s => s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
  const n1 = norm(p1);
  const n2 = norm(p2);
  return n1.includes(n2) || n2.includes(n1);
}

const MapaArgentinaEncuesta = ({
  provinciaStats = [],
  totalSamples = 0,
  selectedProvincia = 'Todas',
  onSelectProvincia,
  darkMode = true,
  theme = {}
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const [hoveredProv, setHoveredProv] = useState(null);

  // Mapear estadísticas por provincia para búsqueda rápida
  const statsMap = useMemo(() => {
    const map = new Map();
    (provinciaStats || []).forEach(item => {
      map.set(item.grupo, item);
    });
    return map;
  }, [provinciaStats]);

  // Obtener datos de una provincia del GeoJSON
  const getProvinceData = (geoNombre) => {
    for (const [nombre, data] of statsMap.entries()) {
      if (matchProvinceName(nombre, geoNombre)) {
        return data;
      }
    }
    return { grupo: geoNombre, count: 0, promedio: null };
  };

  // Escala de color por cantidad de respuestas
  const getColor = (count) => {
    if (!count || count === 0) return darkMode ? '#1e293b' : '#e2e8f0';
    if (count <= 2) return '#0284c7'; // Azul
    if (count <= 5) return '#06b6d4'; // Cyan
    return '#10b981'; // Verde Esmeralda (alta participación)
  };

  // Inicialización del Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Coordenadas centrales de Argentina
      const map = L.map(mapContainerRef.current, {
        center: [-38.4161, -63.6167],
        zoom: 4,
        minZoom: 3,
        maxZoom: 8,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      });

      // Capa base CartoDB
      const tileUrl = darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 10 }).addTo(map);

      // Limitar límites de vista a Argentina y alrededores
      map.setMaxBounds([
        [-57.0, -78.0],
        [-20.0, -50.0]
      ]);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remover capa previa si existe para actualizar colores con los nuevos stats
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    // Estilo dinámico de cada provincia
    const styleFeature = (feature) => {
      const geoNombre = feature.properties.nombre;
      const data = getProvinceData(geoNombre);
      const isSelected = selectedProvincia !== 'Todas' && matchProvinceName(selectedProvincia, geoNombre);

      return {
        fillColor: getColor(data.count),
        weight: isSelected ? 2.5 : 1,
        opacity: 1,
        color: isSelected ? '#00e5ff' : (darkMode ? '#334155' : '#cbd5e1'),
        fillOpacity: data.count > 0 ? (darkMode ? 0.85 : 0.75) : (darkMode ? 0.35 : 0.25)
      };
    };

    // Capa GeoJSON interactiva
    const geoJsonLayer = L.geoJSON(argentinaGeo, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const geoNombre = feature.properties.nombre;
        const data = getProvinceData(geoNombre);
        const count = data.count || 0;
        const pct = totalSamples > 0 ? ((count / totalSamples) * 100).toFixed(1) : 0;
        const p3 = data.promedio ? `${data.promedio} pts` : '—';

        // Tooltip nativo interactivo estilizado
        const tooltipHtml = `
          <div style="font-family: inherit; padding: 4px 6px; min-width: 140px;">
            <div style="font-weight: 700; font-size: 13px; color: #00e5ff; margin-bottom: 4px;">
              ${geoNombre}
            </div>
            <div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>Respuestas:</span>
              <strong style="color: #ffffff;">${count} (${pct}%)</strong>
            </div>
            <div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
              <span>Valoración P3:</span>
              <strong style="color: #fbbf24;">${p3}</strong>
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
            setHoveredProv({ nombre: geoNombre, ...data, pct });
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
            setHoveredProv(null);
          },
          click: () => {
            if (onSelectProvincia) {
              // Si ya estaba seleccionada, deseleccionar
              if (selectedProvincia !== 'Todas' && matchProvinceName(selectedProvincia, geoNombre)) {
                onSelectProvincia('Todas');
              } else {
                onSelectProvincia(geoNombre);
              }
            }
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;

    // Ajustar zoom inicial para encuadrar Argentina
    map.fitBounds(geoJsonLayer.getBounds(), { padding: [10, 10] });

  }, [provinciaStats, selectedProvincia, totalSamples, darkMode]);

  // Ranking ordenado de provincias activas
  const activeProvinces = useMemo(() => {
    return (provinciaStats || [])
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [provinciaStats]);

  const maxCount = activeProvinces[0]?.count || 1;

  return (
    <div className={`p-5 rounded-2xl border ${theme.card || 'bg-[#0f172a] border-slate-800'}`}>
      
      {/* Encabezado del Mapa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-[#00e5ff]" />
            <h3 className="font-display font-extrabold text-base md:text-lg">
              Mapa Federal de Cobertura y Respuestas por Provincia (P15)
            </h3>
          </div>
          <p className={`text-xs ${theme.subText || 'text-slate-400'} mt-0.5`}>
            Distribución territorial de encuestas completadas en la República Argentina. Haz clic en una provincia para filtrar el tablero.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-xs px-3 py-1 rounded-full bg-[#0284c7]/20 text-[#00e5ff] font-semibold border border-[#0284c7]/30 flex items-center gap-1.5">
            <CheckCircle2 size={13} /> {activeProvinces.length} de 24 Provincias
          </span>
          {selectedProvincia !== 'Todas' && (
            <button
              onClick={() => onSelectProvincia && onSelectProvincia('Todas')}
              className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 hover:bg-rose-500/30 transition-all"
            >
              <RotateCcw size={12} /> Quitar filtro ({selectedProvincia})
            </button>
          )}
        </div>
      </div>

      {/* Grid: Mapa Interactivo (izq) + Ranking Territorial (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Contenedor del Mapa Leaflet */}
        <div className="lg:col-span-7 relative rounded-xl overflow-hidden border border-white/10 bg-[#090d16] flex flex-col justify-between">
          <div
            ref={mapContainerRef}
            className="w-full h-[460px] md:h-[500px] z-10"
            style={{ backgroundColor: darkMode ? '#090d16' : '#f8fafc' }}
          />

          {/* Leyenda Flotante de Densidad */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-[11px] flex flex-col gap-1.5 shadow-xl">
            <span className="font-semibold text-slate-300">Densidad de Muestras</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b] border border-slate-700" /> 0
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" /> 1-2
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> 3-5
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> 6+
              </span>
            </div>
          </div>

          {/* Tarjeta flotante de provincia hovered */}
          {hoveredProv && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#00e5ff]/40 text-xs shadow-2xl flex flex-col gap-1 max-w-[200px]"
            >
              <span className="font-bold text-[#00e5ff] truncate">{hoveredProv.nombre}</span>
              <div className="flex justify-between text-slate-300">
                <span>Casos:</span>
                <span className="font-semibold text-white">{hoveredProv.count} ({hoveredProv.pct}%)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>P3 Promedio:</span>
                <span className="font-semibold text-amber-400">{hoveredProv.promedio ? `${hoveredProv.promedio} pts` : '—'}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Ranking de Provincias (Leaderboard Territorial) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-sm flex items-center gap-2">
                <Users size={16} className="text-cyan-400" /> Ranking de Participación Provincial
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Total: {totalSamples} casos</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Provincias con mayor volumen de respuestas recolectadas. Haz clic en cualquiera para aislar su análisis.
            </p>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {activeProvinces.map((p, idx) => {
                const pct = totalSamples > 0 ? ((p.count / totalSamples) * 100).toFixed(1) : 0;
                const isSelected = selectedProvincia !== 'Todas' && matchProvinceName(selectedProvincia, p.grupo);

                return (
                  <button
                    key={p.grupo}
                    onClick={() => onSelectProvincia && onSelectProvincia(isSelected ? 'Todas' : p.grupo)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#0284c7]/25 border-[#00e5ff] shadow-md shadow-[#0284c7]/20'
                        : `${theme.cardSubtle || 'bg-white/5 border-white/5'} hover:border-cyan-500/40 hover:bg-white/10`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-500 text-black' : (idx === 1 ? 'bg-slate-300 text-black' : (idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-300'))
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-xs text-slate-200 truncate">{p.grupo}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-shrink-0">
                        <span className="font-bold text-white">{p.count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span></span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                          {p.promedio ? `${p.promedio}` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-emerald-400' : 'bg-[#0284c7]'
                        }`}
                        style={{ width: `${(p.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}

              {activeProvinces.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  Aún no hay provincias con registros válidos.
                </div>
              )}
            </div>
          </div>

          {/* Resumen Federal */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Provincia con mayor muestra:</span>
            <span className="font-bold text-[#00e5ff]">
              {activeProvinces[0] ? `${activeProvinces[0].grupo} (${activeProvinces[0].count})` : '—'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MapaArgentinaEncuesta;
