.PHONY: install setup dev dev-api dev-ui

install:
	npm --prefix pagecraft-api install
	npm --prefix pagecraft-ui install

setup:
	node scripts/setup.mjs

dev:
	@trap 'kill 0' SIGINT SIGTERM EXIT; \
	echo "  API → http://localhost:8787"; \
	echo "  UI  → http://localhost:5173"; \
	echo ""; \
	npm --prefix pagecraft-api run dev & \
	npm --prefix pagecraft-ui run dev & \
	wait
