# Usa una imagen oficial de Node.js como base
FROM node:18-alpine 

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente
COPY . .

# Expone el puerto del backend
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start:prod"]
