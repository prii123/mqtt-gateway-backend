# Mosquitto
```bash
  sudo nano /etc/mosquitto/mosquitto.conf
```

```bash
    listener 1883
    allow_anonymous true

    listener 9001
    protocol websockets

    log_type all
    sys_interval 10  # Publica métricas cada 10 segundos

```

sudo systemctl restart mosquitto




# 1. DESPLIEGUE POR PRIMERA VEZ

Despliegue diseñado para servidores ubuntu con ssh
# Terraform

```bash

resource "null_resource" "configuracion_droplet" {
  provisioner "remote-exec" {
    inline = [
      # Deshabilitar la verificación interactiva de claves de host SSH
      "echo 'Host github.com\n  StrictHostKeyChecking no\n  UserKnownHostsFile /dev/null' >> ~/.ssh/config",
      "chmod 600 ~/.ssh/config",
      "mkdir -p ~/mqttproyect",
      "git clone git@github.com:prii123/iot-gateway-client.git /root/mqttproyect/frontend",
      "git clone git@github.com:prii123/mqtt-gateway-backend.git /root/mqttproyect/backend",


      # Navegar al directorio del proyecto
      "cd /root/mqttproyect",

      # Copiar el archivo docker-compose.yml desde local al droplet
      "echo '${file("${path.module}/docker-compose.yml")}' > ~/mqttproyect/docker-compose.yml",

      # Cambiar al directorio donde se encuentra el archivo docker-compose.yml
      "cd ~/mqttproyect && docker-compose up -d",

    ]
  }

 connection {
    type        = "ssh"
    user        = "root"
    private_key = file("~/.ssh/id_rsa")
    host        = "164.92.70.248"
  }
}

```


# docker-compose-yml
levanta el cliente y el servidor y una base de datos en mongo db

```bash
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo_user:mongo_password@mongo:27017/mydatabase?authSource=admin
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend

  mongo:
    image: mongo:6
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:


```


# 2. DESPLIEGUE POR PRIMERA VEZ

Actualizaciones