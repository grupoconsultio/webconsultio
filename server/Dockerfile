# Imagen base Node.js Alpine liviana y segura
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero para optimizar la caché de capas Docker
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el código del servidor backend
COPY index.js db.js ./

# Exponer el puerto del API
EXPOSE 3001

# Variables de entorno por defecto (pueden sobreescribirse en docker-compose)
ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "index.js"]
