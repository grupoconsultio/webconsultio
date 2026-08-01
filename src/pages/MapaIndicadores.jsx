import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, BarChart2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../mapa-indicadores.css';
import { DATA } from '../data/mapaData';

/* Importar tipografías del sistema editorial */
const FONT_LINK_ID = 'mapa-editorial-fonts';
function ensureFonts() {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
  document.head.appendChild(link);
}

/* Paletas de color del sistema editorial */
const RAMPS = {
  azul:  ['#DCE9F5', '#B4D0EA', '#7FADD9', '#4B84BE', '#26599A', '#0B3665'],
  bordo: ['#F7E2E4', '#EDBEC2', '#DB9095', '#C25C61', '#9C2F36', '#6B131A'],
  verde: ['#DFEFE2', '#B6DCBE', '#85C295', '#55A26C', '#2E7C4B', '#145530'],
};
const MID = { azul: '#4B84BE', bordo: '#C25C61', verde: '#55A26C' };

const MapaIndicadores = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef   = useRef(null);

  useEffect(() => {
    ensureFonts();

    /* Evitar doble inicialización en StrictMode */
    if (mapInstanceRef.current) return;

    /* ── Estado interno del mapa (imperativo, sin React state) ── */
    let actual  = DATA.indicadores[0];
    let zonaSel = null;
    let escala  = null;

    /* ── Helpers ─────────────────────────────────────────────── */
    function calcEscala(ind) {
      const vs = DATA.zonas.map(z => ind.vals[z]);
      let lo = Math.min(...vs), hi = Math.max(...vs);
      const pad = Math.max((hi - lo) * 0.12, ind.unidad === 'pts' ? 0.15 : 1.2);
      lo = Math.max(0, lo - pad);
      hi = hi + pad;
      return { lo, hi, step: (hi - lo) / 6 };
    }

    function tramo(v) {
      const i = Math.floor((v - escala.lo) / escala.step);
      return Math.min(5, Math.max(0, i));
    }

    function color(v)  { return RAMPS[actual.pal][tramo(v)]; }
    function fmt(v)    { return actual.unidad === 'pts' ? v.toFixed(2) : v.toFixed(1); }
    function unidad()  { return actual.unidad === 'pts' ? ' pts' : '%'; }

    escala = calcEscala(actual);

    /* ── Instancia Leaflet ───────────────────────────────────── */
    const map = L.map('mapa-map', {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    let fallos = 0, conRespaldo = false;
    const base = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }
    ).addTo(map);

    base.on('tileerror', () => {
      if (conRespaldo || ++fallos < 4) return;
      conRespaldo = true;
      map.removeLayer(base);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap',
      }).addTo(map);
    });

    /* ── Capa GeoJSON ────────────────────────────────────────── */
    const capa = L.geoJSON(DATA.geo, {
      style: f => estilo(f.properties.zona, false),
      onEachFeature: (f, l) => {
        const z = f.properties.zona;
        l.on('mouseover', () => hover(z, true));
        l.on('mouseout',  () => hover(z, false));
        l.on('click',     () => seleccionar(z));
        l.bindTooltip('', {
          permanent:  true,
          direction:  'center',
          className:  'zlabel',
          opacity:    1,
        });
      },
    }).addTo(map);

    const limites = capa.getBounds();
    map.fitBounds(limites, { padding: [18, 18] });

    function ajustar() {
      map.invalidateSize();
      map.fitBounds(limites, { padding: [18, 18] });
    }
    setTimeout(ajustar, 60);
    window.addEventListener('resize', () => map.invalidateSize());

    /* ── Estilos y hover ─────────────────────────────────────── */
    function estilo(z, alto) {
      const v = actual.vals[z];
      return {
        fillColor:    color(v),
        fillOpacity:  alto ? 0.95 : 0.82,
        color:        alto ? '#3F3F3F' : '#FFFFFF',
        weight:       alto ? 2.6 : 1.4,
        opacity:      1,
      };
    }

    function capaDe(z) {
      let out = null;
      capa.eachLayer(l => { if (l.feature.properties.zona === z) out = l; });
      return out;
    }

    function hover(z, on) {
      const l = capaDe(z);
      if (!l) return;
      l.setStyle(estilo(z, on || z === zonaSel));
      if (on) l.bringToFront();
      document.querySelectorAll('#mapa-rail .rcard').forEach(r => {
        r.classList.toggle(
          'on',
          r.dataset.zona === z ? (on || z === zonaSel) : r.dataset.zona === zonaSel
        );
      });
      if (on) pintarCard(z);
      else     pintarCard(zonaSel || 'Total');
    }

    function seleccionar(z) {
      zonaSel = (zonaSel === z) ? null : z;
      refrescar(false);
      pintarCard(zonaSel || 'Total');
    }

    /* ── Tarjeta de detalle ──────────────────────────────────── */
    function pintarCard(z) {
      const esTotal = z === 'Total';
      const v   = actual.vals[z];
      const tot = actual.vals['Total'];
      const dif = v - tot;
      const brk = actual.desglose ? actual.desglose[z] : null;

      let html = `
        <div class="hd">
          <span class="zn">${esTotal ? 'Total ciudad' : z}</span>
          <span class="cases">n=${DATA.casos[z]}</span>
        </div>
        <div class="big">${fmt(v)}<span>${unidad()}</span></div>
        <div class="vs">${
          esTotal
            ? 'Promedio de la ciudad'
            : `${dif >= 0 ? '+' : '−'}${fmt(Math.abs(dif))}${unidad()} <b>vs. total ciudad</b> (${fmt(tot)}${unidad()})`
        }</div>`;

      if (brk) {
        const max = Math.max(...brk.map(b => b.val), 1);
        html += `<div class="brk"><div class="bt">Distribución de respuestas</div>`;
        brk.forEach(b => {
          html += `<div class="row">
            <span class="lb" title="${b.cat}">${b.cat}</span>
            <span class="vl">${b.val.toFixed(1)}</span>
            <span class="bar"><i style="width:${(b.val / max * 100).toFixed(1)}%;background:#3F3F3F"></i></span>
          </div>`;
        });
        html += `</div>`;
      }

      html += `<div class="hint">${
        esTotal
          ? 'Pasá el cursor por un sector para ver su detalle. Hacé clic para fijarlo.'
          : 'Clic en el sector para soltar la selección.'
      }</div>`;

      const cardEl = document.getElementById('mapa-card');
      if (cardEl) cardEl.innerHTML = html;
    }

    /* ── Rail de ranking ─────────────────────────────────────── */
    function pintarRail() {
      const orden = [...DATA.zonas].sort((a, b) => actual.vals[b] - actual.vals[a]);
      const max   = Math.max(...DATA.zonas.map(z => actual.vals[z]));
      const rail  = document.getElementById('mapa-rail');
      if (!rail) return;

      rail.innerHTML = orden.map((z, i) => `
        <button class="rcard ${z === zonaSel ? 'on' : ''}" data-zona="${z}">
          <span class="rk">
            <span>${String(i + 1).padStart(2, '0')}</span>
            <span>n=${DATA.casos[z]}</span>
          </span>
          <span class="rz">${z}</span>
          <span class="rv">${fmt(actual.vals[z])}<span>${unidad()}</span></span>
          <span class="rb"><i style="width:${(actual.vals[z] / max * 100).toFixed(1)}%;background:${color(actual.vals[z])}"></i></span>
        </button>`).join('');

      rail.querySelectorAll('.rcard').forEach(b => {
        const z = b.dataset.zona;
        b.addEventListener('mouseenter', () => hover(z, true));
        b.addEventListener('mouseleave', () => hover(z, false));
        b.addEventListener('focus',      () => hover(z, true));
        b.addEventListener('blur',       () => hover(z, false));
        b.addEventListener('click',      () => seleccionar(z));
      });
    }

    /* ── Leyenda de color ────────────────────────────────────── */
    function pintarLeyenda() {
      const rampEl = document.getElementById('mapa-ramp');
      const rminEl = document.getElementById('mapa-rmin');
      const rmaxEl = document.getElementById('mapa-rmax');
      if (rampEl) rampEl.innerHTML = RAMPS[actual.pal].map(c => `<div style="background:${c}"></div>`).join('');
      if (rminEl) rminEl.textContent = fmt(escala.lo) + unidad();
      if (rmaxEl) rmaxEl.textContent = fmt(escala.hi) + unidad();
    }

    /* ── Sidebar de indicadores ──────────────────────────────── */
    function pintarSidebar() {
      const grupos = [...new Set(DATA.indicadores.map(i => i.grupo))];
      const side   = document.getElementById('mapa-side');
      if (!side) return;

      side.innerHTML = grupos.map(g => `
        <div class="grp"><h2>${g}</h2>${
          DATA.indicadores.filter(i => i.grupo === g).map(i => `
            <button class="opt ${i.id === actual.id ? 'on' : ''}" data-id="${i.id}" style="color:${MID[i.pal]}">
              <span class="sw"></span>
              <span class="tx">${i.label}</span>
              <span class="vv">${i.unidad === 'pts' ? i.vals['Total'].toFixed(2) : i.vals['Total'].toFixed(1)}${i.unidad === 'pts' ? '' : '%'}</span>
            </button>`).join('')
        }</div>`).join('');

      side.querySelectorAll('.opt').forEach(b => {
        b.addEventListener('click', () => {
          actual = DATA.indicadores.find(i => i.id === b.dataset.id);
          refrescar(true);
        });
      });
    }

    /* ── Refresco global ─────────────────────────────────────── */
    function refrescar(cambioIndicador) {
      escala = calcEscala(actual);
      capa.eachLayer(l => {
        const z = l.feature.properties.zona;
        l.setStyle(estilo(z, z === zonaSel));
        l.getTooltip().setContent(`${z}<span class="n">${fmt(actual.vals[z])}${unidad()}</span>`);
      });
      pintarLeyenda();
      pintarRail();
      pintarCard(zonaSel || 'Total');

      const qtextEl   = document.getElementById('mapa-qtext');
      const tagGrupoEl= document.getElementById('mapa-tagGrupo');
      const tagTotalEl= document.getElementById('mapa-tagTotal');
      const stNEl     = document.getElementById('mapa-stN');
      const stIEl     = document.getElementById('mapa-stI');

      if (qtextEl)    qtextEl.textContent    = actual.pregunta;
      if (tagGrupoEl) tagGrupoEl.textContent = actual.grupo;
      if (tagTotalEl) tagTotalEl.textContent = `Total ciudad ${fmt(actual.vals['Total'])}${unidad()}`;
      if (stNEl)      stNEl.textContent      = DATA.casos['Total'];
      if (stIEl)      stIEl.textContent      = DATA.indicadores.length;

      if (cambioIndicador) {
        document.querySelectorAll('#mapa-side .opt').forEach(b =>
          b.classList.toggle('on', b.dataset.id === actual.id)
        );
      }
    }

    /* ── Arranque ────────────────────────────────────────────── */
    pintarSidebar();
    refrescar(false);

    /* ── Cleanup al desmontar el componente ──────────────────── */
    return () => {
      window.removeEventListener('resize', () => map.invalidateSize());
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <>
      {/* ── Encabezado de página (dark, estilo sitio) ────────── */}
      <section className="pt-32 pb-10 bg-brand-bg border-b border-white/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors text-sm mb-8"
            >
              <ArrowLeft size={16} /> Volver al inicio
            </Link>

            <span className="block text-[var(--color-brand-cyan)] font-semibold tracking-widest uppercase text-xs mb-3">
              Análisis de Opinión Pública
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
              Indicadores por Sector<br className="hidden md:block" /> · Río Cuarto
            </h1>
            <p className="text-brand-secondary max-w-xl leading-relaxed mb-8">
              Explorá los resultados de opinión pública desagregados por sector geográfico de la ciudad.
              Seleccioná un indicador del panel lateral para visualizar su distribución territorial en el mapa.
            </p>

            {/* Stats rápidas */}
            <div className="flex flex-wrap gap-8">
              {[
                { Icon: Users,    label: 'Casos relevados', value: DATA.casos['Total'] },
                { Icon: MapPin,   label: 'Sectores',        value: DATA.zonas.length },
                { Icon: BarChart2, label: 'Indicadores',    value: DATA.indicadores.length },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/10 flex items-center justify-center">
                    <Icon size={18} className="text-[var(--color-brand-cyan)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-white leading-none">{value}</p>
                    <p className="text-xs text-brand-secondary uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Mapa editorial (full-width, estilo papel) ─────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        ref={mapContainerRef}
        className="mapa-editorial"
        style={{ height: 'calc(100vh - 80px)', minHeight: 600 }}
      >
        {/* Masthead editorial */}
        <div className="mapa-header">
          <span className="marca" aria-label="Grupo Consultio">
            <span className="caja">
              <span className="l1">Grupo</span>
              <span className="l2">Consultio</span>
            </span>
          </span>
          <div className="deck">
            <p className="eyebrow">Serie · Opinión pública</p>
            <h1>Indicadores de opinión pública — Río Cuarto</h1>
          </div>
          <div className="stat-strip">
            <div className="stat">
              <div className="k" id="mapa-stN">—</div>
              <div className="l">Casos</div>
            </div>
            <div className="stat">
              <div className="k">{DATA.zonas.length}</div>
              <div className="l">Sectores</div>
            </div>
            <div className="stat">
              <div className="k" id="mapa-stI">—</div>
              <div className="l">Indicadores</div>
            </div>
          </div>
        </div>

        {/* Shell: sidebar + mapa */}
        <div className="shell">
          <aside id="mapa-side" />

          <main>
            {/* Barra de pregunta activa */}
            <div className="qbar">
              <span className="tag" id="mapa-tagGrupo">—</span>
              <span className="q"   id="mapa-qtext">—</span>
              <span className="tag" id="mapa-tagTotal">—</span>
            </div>

            {/* Mapa + card + leyenda */}
            <div className="mapwrap">
              <div id="mapa-map" />
              <div className="card" id="mapa-card" />
              <div className="legend">
                <div className="lt">Intensidad</div>
                <div className="ramp" id="mapa-ramp" />
                <div className="rlabels">
                  <span id="mapa-rmin">—</span>
                  <span id="mapa-rmax">—</span>
                </div>
              </div>
            </div>

            {/* Rail de ranking */}
            <div className="rail" id="mapa-rail" />
          </main>
        </div>

        {/* Colofón editorial */}
        <div className="mapa-footer">
          <span>Base: total de encuestados por sector · Opción múltiple: % de menciones sobre respondentes</span>
          <span className="fm">Grupo Consultio ® 2026 — Río Cuarto, CBA · grupoconsultio.com</span>
        </div>
      </motion.div>
    </>
  );
};

export default MapaIndicadores;
