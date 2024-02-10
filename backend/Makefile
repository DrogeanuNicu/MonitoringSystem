DIR_BIN := ./bin

.PHONY: all
all: build

.PHONY: run
run: build
	${DIR_BIN}/backend

.PHONY: build
build:
	go build -o ${DIR_BIN}/backend main.go

.PHONY: clean
clean:
	rm -rf ${DIR_BIN}
