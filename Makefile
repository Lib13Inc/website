PORT ?= 8000

.DEFAULT_GOAL := help
.PHONY: help local review staging production

help:
	@echo "make local        Serve the site at http://localhost:$(PORT)/ (override with PORT=9000)"
	@echo "make review       Same server, opens the copy review page"
	@echo "make staging      Deploy the working tree to https://staging.lib13.com (noindex)"
	@echo "make production   Deploy committed master to https://www.lib13.com (asks to confirm)"

# Serve the site locally.
local:
	@echo "Site:   http://localhost:$(PORT)/"
	@echo "Review: http://localhost:$(PORT)/review/"
	@(sleep 1 && open "http://localhost:$(PORT)/") &
	python3 -m http.server $(PORT)

# Serve locally and open the copy review page.
review:
	@echo "Review: http://localhost:$(PORT)/review/"
	@(sleep 1 && open "http://localhost:$(PORT)/review/") &
	python3 -m http.server $(PORT)

# Deploy the current checkout (including uncommitted changes) to staging.
staging:
	./scripts/deploy-staging.sh

# Deploy what is committed on master to production. review/ and Makefile are not shipped.
# Skip the prompt with: make production CONFIRM=yes
production:
	@echo "Production deploy of master ($$(git rev-parse --short master)) to www.lib13.com"
	@if [ -n "$$(git status --porcelain)" ]; then echo "Note: uncommitted changes are NOT included (only committed master ships)."; fi
	@if [ "$$(git rev-parse master)" != "$$(git rev-parse origin/master 2>/dev/null)" ]; then echo "Note: master differs from origin/master (unpushed or unfetched commits)."; fi
	@if [ "$(CONFIRM)" != "yes" ]; then \
		printf "Type 'production' to continue: "; read ans; \
		[ "$$ans" = "production" ] || { echo "Cancelled."; exit 1; }; \
	fi
	./scripts/deploy-production.sh
