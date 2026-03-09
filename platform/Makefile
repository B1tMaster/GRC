ci-start:
	docker compose -f compose.yaml --env-file .env.docker up -d

app-build:
	docker compose -f compose.yaml --env-file .env.docker build app

app-start:
	docker compose -f compose.yaml --env-file .env.docker up -d app

app-stop:
	docker compose -f compose.yaml --env-file .env.docker down app

services-start:
	docker compose -f compose.yaml --env-file .env.docker up -d db observability input-parser cache storage storage-setup

services-stop:
	docker compose -f compose.yaml --env-file .env.docker down db observability input-parser cache storage storage-setup

services-minimal-start:
	docker compose -f compose.yaml --env-file .env.docker up -d db input-parser cache storage

services-minimal-stop:
	docker compose -f compose.yaml --env-file .env.docker down db input-parser cache storage
