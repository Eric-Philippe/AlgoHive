# Étape 1 : Construire le frontend avec Node.js
FROM node:20-alpine AS build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Étape 2 : Construire l'image finale avec Python et Flask
FROM python:3.10-alpine

WORKDIR /app

COPY . /app

# Copier les fichiers compilés de React depuis l'étape de build
COPY --from=build /app/frontend/dist /app/frontend/dist

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/puzzles && chown -R 777 /app/puzzles

ENV SERVER_NAME="Local"

EXPOSE 5000

CMD ["python3", "server.py"]