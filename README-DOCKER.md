# Despliegue con Docker y Docker Compose - Grupo Consultio / ConsulDat

Esta guía detalla los pasos para levantar el proyecto completo (Frontend React + Nginx y Backend API REST conectado a MySQL) en cualquier servidor nuevo con Docker.

---

## 📁 Arquitectura Docker del Proyecto

- **Frontend (`Dockerfile`):**
  - Compilación multi-stage con Node.js 20 Alpine.
  - Servido a través de **Nginx Alpine** ultraliviano y de alto rendimiento.
  - Soporte completo para SPA (`try_files $uri $uri/ /index.html;`) evitando errores 404 al recargar rutas como `/encuesta-papa` o `/admin`.
  - **Reverse Proxy `/api/`:** Nginx reenvía de forma transparente todas las peticiones a la API del backend en el puerto 3001, sin problemas de CORS ni puertos adicionales expuestos al navegador.

- **Backend (`server/Dockerfile`):**
  - Servidor Express en Node.js 20 Alpine.
  - Conexión a la base de datos MySQL (por defecto apuntando a `2.25.114.103:3306` o a la variable `DB_HOST`).

---

## 🚀 Despliegue Rápido (1 solo comando)

En tu nuevo servidor, clona el repositorio e ingresa a la carpeta:

```bash
git clone https://github.com/grupoconsultio/webconsultio.git
cd webconsultio
```

### 1. Iniciar los contenedores:
```bash
docker compose up -d --build
```

¡Listo! El comando:
1. Compilará la aplicación web frontend.
2. Configurará Nginx como servidor web y proxy reverso en el puerto `80`.
3. Levantará el backend API en segundo plano conectado a MySQL.

---

## ⚙️ Variables de Entorno Opcionales

Puedes crear un archivo `.env` en la raíz de `webconsultio` si deseas cambiar la configuración por defecto:

```env
# Puerto web público en el servidor (por defecto 80)
PORT=80

# Credenciales de la Base de Datos MySQL
DB_HOST=2.25.114.103
DB_PORT=3306
DB_USER=mysql
DB_PASSWORD=msodtssapus5soxz
DB_NAME=mysql
```

---

## 🛠️ Comandos de Mantenimiento Útiles

- **Ver el estado de los contenedores:**
  ```bash
  docker compose ps
  ```

- **Ver logs en tiempo real:**
  ```bash
  docker compose logs -f
  ```

- **Ver logs únicamente del backend API:**
  ```bash
  docker compose logs -f backend
  ```

- **Reiniciar servicios:**
  ```bash
  docker compose restart
  ```

- **Detener los contenedores:**
  ```bash
  docker compose down
  ```
