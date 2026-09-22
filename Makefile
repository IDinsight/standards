#!make

.DEFAULT_GOAL := help
.PHONY: clean help lint

# Put it first so that "make" without argument is like "make help".
help: ## Display available commands
	@echo "Available commands:"
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}'

########## COLOR CODES FOR OUTPUT ##########
BLUE := $(shell tput setaf 4 2>/dev/null)
GREEN := $(shell tput setaf 2 2>/dev/null)
RESET := $(shell tput sgr0 2>/dev/null)

########## GLOBALS ##########
PROJECT_NAME = standards
SHELL := /bin/bash

########## CLEAN UP ##########
clean: ## Remove caches, build output, and testing artifacts
	@echo "$(BLUE)Cleaning project files...$(RESET)"
	@+rm -rf \
		.cache \
		.eslintcache \
		.next \
		.stylelintcache \
		.turbo \
		.vite \
		.vitest \
		build \
		coverage \
		dist \
		node_modules/.vitest
	@pnpm store prune
	@echo "$(GREEN)Cleanup complete.$(RESET)"

########## LINTING ##########
lint: lint-markdown ## Run all linters and formatters

lint-markdown: ## Format Markdown with Prettier (write), excluding PROTOCOL.md
	@echo "$(BLUE)Running prettier...$(RESET)"
	@npx prettier --write --prose-wrap always --print-width 80 --ignore-path .gitignore "**/*.md" "!PROTOCOL.md"
	@echo "$(GREEN)Markdown formatting complete.$(RESET)"
