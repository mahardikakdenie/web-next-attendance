# Variables
IMAGE_NAME=kucingemas/attendance-app
TAG=latest

.PHONY: up down restart pull logs status help

help:
	@echo "Usage:"
	@echo "  make pull    - Pull the latest image from Docker Hub"
	@echo "  make up      - Start the container in detached mode"
	@echo "  make down    - Stop and remove the container"
	@echo "  make restart - Restart the container"
	@echo "  make logs    - View container logs"
	@echo "  make status  - Check container status"

pull:
	docker compose -f docker-compose.yml pull

up:
	docker compose -f docker-compose.yml up -d

down:
	docker compose -f docker-compose.yml down

restart:
	docker compose -f docker-compose.yml restart

logs:
	docker compose -f docker-compose.yml logs -f

status:
	docker compose -f docker-compose.yml ps
