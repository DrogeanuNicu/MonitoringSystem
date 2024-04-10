DIR_BIN := ./bin
DIR_SRC := ./src

BIN_NAME := mqttsTest

.PHONY: all
all: run

.PHONY: run
run: build
	${DIR_BIN}/${BIN_NAME} $(ARGS)

.PHONY: build
build:
	go build -o ${DIR_BIN}/${BIN_NAME} ${DIR_SRC}/main.go

.PHONY: clean
clean:
	rm -rf ${DIR_BIN}
