# ─── STAGE 1: Compilación de la Aplicación Frontend con Node.js ───
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiesto de dependencias para aprovechar caché de Docker
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# ─── STAGE 2: Servidor Web Nginx Ultraliviano para Producción ───
FROM nginx:alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados del Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
