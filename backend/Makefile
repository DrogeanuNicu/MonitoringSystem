DIR_BIN := ./bin
DIR_SRC := ./src

.PHONY: all
all: build

.PHONY: run
run: build
	${DIR_BIN}/backend 

.PHONY: build
build:
	go build -o ${DIR_BIN}/backend ${DIR_SRC}/main.go

.PHONY: update
update:
	go mod download

.PHONY: clean
clean:
	rm -rf ${DIR_BIN}
