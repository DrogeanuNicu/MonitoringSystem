# Chapter 1: Setup
## Section 1.1: MQTTS certificates
openssl genrsa -out ca.key 2048

openssl genrsa -des3 -out ca.key 2048

openssl req -new -x509 -days 3650 -key ca.key -out ca.crt 
openssl genrsa -out server.key 2048
openssl req -new -out server.csr -key server.key
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 720 -extfile v3.ext