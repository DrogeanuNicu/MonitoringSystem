DIR_BACKEND := ./backend
DIR_FRONTEND := ./frontend

.PHONY: all
all: build

.PHONY: build
build:
	$(MAKE) -C ${DIR_BACKEND} build
	$(MAKE) -C ${DIR_FRONTEND} build

.PHONY: backend
backend:
	$(MAKE) -C ${DIR_BACKEND} run

.PHONY: frontend
frontend:
	$(MAKE) -C ${DIR_FRONTEND} run

.PHONY: update
update:
	$(MAKE) -C ${DIR_BACKEND} update
	$(MAKE) -C ${DIR_FRONTEND} update

.PHONY: clean
clean:
	$(MAKE) -C ${DIR_BACKEND} clean
	$(MAKE) -C ${DIR_FRONTEND} clean

