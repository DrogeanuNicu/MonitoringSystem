DIR_BIN := ./bin
DIR_SRC := ./src
DIR_CERTS := ../certs

FILE_CERT := $(abspath $(DIR_CERTS)/cert.pem)
FILE_PRIVATE_KEY := $(abspath $(DIR_CERTS)/key.pem)

.PHONY: all
all: build

.PHONY: run
run: build
	${DIR_BIN}/backend --web-cert ${FILE_CERT} --web-private-key ${FILE_PRIVATE_KEY} 

.PHONY: build
build:
	go build -o ${DIR_BIN}/backend ${DIR_SRC}/main.go

.PHONY: update
update:
	go mod download

.PHONY: clean
clean:
	rm -rf ${DIR_BIN}
