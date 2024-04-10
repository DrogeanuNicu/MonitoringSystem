DIR_BIN := ./bin
DIR_SRC := ./src
DIR_TESTS := ./tests

BIN_NAME := backend

.PHONY: all
all: run

.PHONY: run
run: build
	${DIR_BIN}/${BIN_NAME}  

.PHONY: build
build:
	go build -o ${DIR_BIN}/${BIN_NAME}  ${DIR_SRC}/main.go

.PHONY: update
update:
	go mod download

.PHONY: test_% 
test_%:
	$(MAKE) -C ${DIR_TESTS}/$* ARGS="$(filter-out $@,$(MAKECMDGOALS))"

.PHONY: clean
clean:
	rm -rf ${DIR_BIN}
