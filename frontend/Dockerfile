# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Iniciar con host accesible
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]