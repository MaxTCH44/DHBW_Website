# Makefile for react-training project
# Targets to install dependencies and run common commands.

# Default goal: install prerequisites
all: install

.PHONY: all install dev build lint preview clean

# install node modules
install:
	npm install

# start development server
dev:
	npm run dev

# build production bundle
build:
	npm run build

# run linter
lint:
	npm run lint

# preview production build locally
preview:
	npm run preview

# remove generated files (node_modules and dist)
clean:
	@echo "Removing node_modules and dist..."
	@if [ -d node_modules ]; then rm -rf node_modules; fi
	@if [ -d dist ]; then rm -rf dist; fi
