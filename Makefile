DIR_BACKEND := ./backend
DIR_FRONTEND := ./frontend

.PHONY: all
all: build


# BUILD
.PHONY: backend_build
backend_build:
	$(MAKE) -C ${DIR_BACKEND} build

.PHONY: frontend_build
frontend_build:
	$(MAKE) -C ${DIR_FRONTEND} build

.PHONY: build
build: backend_build frontend_build


# UPDATE
.PHONY: backend_update
backend_update:
	$(MAKE) -C ${DIR_BACKEND} update

.PHONY: frontend_update
frontend_update:
	$(MAKE) -C ${DIR_FRONTEND} update

.PHONY: update
update: backend_update frontend_update


# CLEAN
.PHONY: backend_clean
backend_clean:
	$(MAKE) -C ${DIR_BACKEND} clean

.PHONY: frontend_clean
frontend_clean:
	$(MAKE) -C ${DIR_FRONTEND} clean

.PHONY: clean
clean: backend_clean frontend_clean


# RUN
.PHONY: backend
backend:
	$(MAKE) -C ${DIR_BACKEND} run

.PHONY: frontend
frontend:
	$(MAKE) -C ${DIR_FRONTEND} run

