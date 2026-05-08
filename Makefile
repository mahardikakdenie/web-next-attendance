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
	docker compose -f docker-compose.vps.yml pull

up:
	docker compose -f docker-compose.vps.yml up -d

down:
	docker compose -f docker-compose.vps.yml down

restart:
	docker compose -f docker-compose.vps.yml restart

logs:
	docker compose -f docker-compose.vps.yml logs -f

status:
	docker compose -f docker-compose.vps.yml ps
