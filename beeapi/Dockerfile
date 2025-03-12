# Étape 1 : Construire le frontend avec Node.js
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copier uniquement les fichiers nécessaires pour npm install
COPY frontend/package*.json ./
RUN npm ci --production

# Copier le reste des fichiers et construire
COPY frontend/ ./
RUN npm run build

# Étape 2 : Construire l'image Python minimale
FROM python:3.10-slim-buster AS python-build

WORKDIR /app
COPY requirements.txt .

# Installer les dépendances dans un environnement virtuel
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Étape 3 : Image finale minimale
FROM python:3.10-slim-buster

WORKDIR /app

# Copier l'environnement virtuel depuis l'étape python-build
COPY --from=python-build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copier uniquement les fichiers Python nécessaires
COPY server.py .
COPY app/ ./app/
# Retirer la ligne qui cause l'erreur
# COPY modules/ ./modules/

# Copier les fichiers compilés du frontend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Créer le dossier puzzles avec les permissions appropriées
RUN mkdir -p /app/puzzles && chmod 777 /app/puzzles

ENV SERVER_NAME="Local"
EXPOSE 5000

# Utiliser un utilisateur non-root
RUN useradd -m appuser
USER appuser

CMD ["python3", "server.py"]