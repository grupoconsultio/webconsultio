# ConsulDat - Backend API: Encuesta Visita Papal

API REST en Node.js + Express con conexión a MySQL (Railway / Coolify / Docker) para el procesamiento y visualización analítica de la encuesta de opinión pública nacional.

## Credenciales y Variables de Entorno (`.env`)

```env
DB_HOST=consuldatio-bbddencuestapapa-9zupcr
DB_PORT=3306
DB_USER=mysql
DB_PASSWORD=msodtssapus5soxz
DB_NAME=mysql
PORT=3001
CORS_ORIGIN=*
```

> **Nota de red:** `consuldatio-bbddencuestapapa-9zupcr` es el hostname interno dentro de la red privada del servicio. Si se ejecuta fuera de dicha red interna (ej. localmente), asegúrese de utilizar el host público provisto por el panel de hosting (ej. `proxy.railway.app:xxxxx`) o un túnel SSH / VPN.

## Instalación y Ejecución

```bash
cd server
npm install
npm run dev
```

El servidor quedará disponible en `http://localhost:3001`.

## Endpoints Principales

- `GET /api/health` -> Chequeo de salud y conexión activa con la base de datos MySQL.
- `GET /api/survey/stats` -> KPIs, distribución P3 (1-10), matriz de impactos P4, cruces demográficos (Edad, Educación, Provincia), nube de palabras P12 y consumo de medios P2 con filtros dinámicos (`startDate`, `endDate`, `region`, `provincia`, `edad`, `educacion`, `includeSpeeders`).
- `GET /api/survey/raffle` -> Listado de participantes del sorteo (email y últimos 3 del DNI).
- `POST /api/survey/raffle/draw-winner` -> Selección aleatoria de ganador con comprobante de auditoría y hash criptográfico en vivo.
- `GET /api/survey/export/responses` -> Exportación directa a CSV de respuestas anónimas filtradas.
- `GET /api/survey/export/raffle` -> Exportación directa a CSV de participantes del sorteo.
