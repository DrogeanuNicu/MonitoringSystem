DIR_BACKEND := ./backend

.PHONY: all
all: build

.PHONY: build
build:
	$(MAKE) -C ${DIR_BACKEND} build

.PHONY: clean
clean:
	$(MAKE) -C ${DIR_BACKEND} clean

