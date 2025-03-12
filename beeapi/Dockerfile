# Étape 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Étape 2 : Build the Python server
FROM python:3.10-alpine

WORKDIR /app

COPY . /app

# Copy the React app build from the previous stage
COPY --from=build /app/frontend/dist /app/frontend/dist

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/puzzles && chown -R 777 /app/puzzles

ENV SERVER_NAME="Local"
ENV SERVER_DESCRIPTION="Local Dev Server"

EXPOSE 5000

CMD ["python3", "server.py"]