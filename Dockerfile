# ==============================================================================
# Multi-Stage Dockerfile for ARIA Unified Deployment
# Builds React SPA + bundles Python FastAPI core into a single container
# ==============================================================================

# ---- Stage 1: Build React Frontend ----
FROM node:20-slim AS frontend-builder
WORKDIR /app/web

# Install dependencies
COPY web/package*.json ./
RUN npm ci

# Copy frontend source and compile static bundle
COPY web/ ./
RUN npm run build

# ---- Stage 2: Python FastAPI Runtime ----
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/src

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python core library and web API
COPY src/ /app/src/
COPY web/api/ /app/web/api/

# Copy compiled SPA assets from Stage 1
COPY --from=frontend-builder /app/web/dist /app/web/dist

# Render / Railway dynamically pass $PORT
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn web.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
