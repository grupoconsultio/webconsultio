# ─── STAGE 1: Compilación de la Aplicación Frontend Vite ───
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiesto de dependencias para aprovechar caché
COPY package*.json ./
RUN npm ci

# Copiar todo el código y compilar Vite
COPY . .
RUN npm run build

# ─── STAGE 2: Imagen Final Autocontenida (Express + Frontend + API) ───
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del backend
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copiar código del servidor
COPY server/ ./server/

# Copiar los assets compilados de Vite
COPY --from=build /app/dist ./dist

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer ambos puertos (3000 por defecto en Coolify y 80 estándar web)
EXPOSE 3000
EXPOSE 80

# Iniciar la aplicación completa (Frontend SPA + API REST conectada a MySQL)
CMD ["node", "server/index.js"]
