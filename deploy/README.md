# Provider-Neutral Deployment Architecture

This directory contains container definitions and orchestration configurations for running the Global Tourism Platform in local development, continuous integration, and provider-neutral cloud environments (Kubernetes, AWS ECS, Google Cloud Run, Azure Container Apps, or bare-metal Docker hosts).

## Structure

- `docker-compose.yml`: Local multi-container orchestration.
- `Dockerfile.web`: Multi-stage production container build for the web application (`apps/web`).

## Building & Running Locally with Docker

```bash
# Build and run containers
docker-compose -f deploy/docker-compose.yml up --build

# Run in background
docker-compose -f deploy/docker-compose.yml up -d
```
