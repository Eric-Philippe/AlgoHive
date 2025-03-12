# Stage 1: Build the frontend with Node.js
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy only necessary files for npm install
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of the files and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Python minimal image
FROM python:3.10-slim-buster AS python-build

WORKDIR /app
COPY requirements.txt .

# Install dependencies in a virtual environment
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 3: Final minimal image
FROM python:3.10-slim-buster

WORKDIR /app

# Copy the virtual environment from the python-build stage
COPY --from=python-build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy only the necessary Python files
COPY server.py .
COPY app/ ./app/

# Copy the compiled frontend files
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Create puzzles folder with appropriate permissions
RUN mkdir -p /app/puzzles && chmod 777 /app/puzzles

ENV SERVER_NAME="Local"
EXPOSE 5000

# Use a non-root user
RUN useradd -m appuser
USER appuser

CMD ["python3", "server.py"]