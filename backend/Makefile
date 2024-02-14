DIR_BIN := ./bin
DIR_SRC := ./src
DIR_CERTS := ../certs

FILE_HTTPS_CERT := $(abspath $(DIR_CERTS)/https/cert.pem)
FILE_HTTPS_KEY := $(abspath $(DIR_CERTS)/https/key.pem)
FILE_MQTTS_CA := $(abspath $(DIR_CERTS)/mqtts/ca.crt)
FILE_MQTTS_CERT := $(abspath $(DIR_CERTS)/mqtts/server.crt)
FILE_MQTTS_KEY := $(abspath $(DIR_CERTS)/mqtts/server.key)

.PHONY: all
all: build

.PHONY: run
run: build
	${DIR_BIN}/backend \
		--web-cert ${FILE_HTTPS_CERT} \
		--web-private-key ${FILE_HTTPS_KEY} \
		--mqtt-ca ${FILE_MQTTS_CA} \
		--mqtt-cert ${FILE_MQTTS_CERT} \
		--mqtt-key ${FILE_MQTTS_KEY}

.PHONY: build
build:
	go build -o ${DIR_BIN}/backend ${DIR_SRC}/main.go

.PHONY: update
update:
	go mod download

.PHONY: clean
clean:
	rm -rf ${DIR_BIN}
