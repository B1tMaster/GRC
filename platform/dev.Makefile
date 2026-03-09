ci-start:
	docker compose -f compose.yaml --env-file .env.docker up --build -d

app-build:
	docker compose -f compose.yaml --env-file .env.docker build app

services-start:
	docker compose -f compose.yaml --env-file .env.docker up -d input-parser db observability cache storage storage-setup

services-stop:
	docker compose -f compose.yaml --env-file .env.docker down input-parser db observability cache storage storage-setup

input-parser-build:
	docker compose -f compose.yaml --env-file .env.docker build input-parser

input-parser-start:
	docker compose -f compose.yaml --env-file .env.docker up -d input-parser

input-parser-stop:
	docker compose -f compose.yaml --env-file .env.docker down input-parser

input-parser-logs:
	docker compose -f compose.yaml --env-file .env.docker logs -f input-parser