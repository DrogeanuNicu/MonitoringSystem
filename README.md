# Setup
## Server
Raspbian OS was used; any Debian derivative should work fine.
List of necessary Raspbian packages:
```
sudo apt install make mosquitto mosquitto-clients openssl nginx certbot python3-certbot-nginx
```

To set up Golang, see section [Backend](#backend).

To set up NodeJs, see section [Frontend](#frontend).

## Backend
Download `Golang` and follow these steps: [Golang Installation](https://go.dev/doc/install).

Add the path export to `~/.bashrc` and re-source to have the `go` command available everywhere.

To download the `Golang` dependencies:
```
make backend_update
```

To build the backend application:
```
make backend_build
```

To run the backend application:
```
make backend
```

## Frontend
To install `nvm` follow the steps from this repo: [nvm](https://github.com/nvm-sh/nvm).

Install the necessary `NodeJs` version:
```
nvm install 20
```

To download the `NodeJs` dependencies:
```
make frontend_update
```

To build the frontend application:
```
make frontend_build
```

To run the backend application:
```
make frontend
```

## HTTPS
```
sudo certbot certonly --nginx -d drogeanunicusor.go.ro
```

Optionally, copy the generated files to the repo.

## Nginx
After the [HTTPS Certificates](#https) were generated, configure Nginx (modify the paths from the config file if necessary):
```
cp configs/nginx/golang-server.conf /etc/nginx/sites-available/golang-server.conf
```
Create the link to mark the config as active:
```
ln -s etc/nginx/sites-available/golang-server.conf etc/nginx/sites-enabled/golang-server
```

Restart the service for the changes to take effect:
```
systemctl restart nginx.service
```

## MQTTS
Modify `v3.ext` accordingly if needed:
```
openssl genrsa -out ca.key 2048
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt 
openssl genrsa -out server.key 2048
openssl req -new -out server.csr -key server.key
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 720 -extfile v3.ext
```

To use a passphrase for the ca.key:
```
openssl genrsa -des3 -out ca.key 2048
```

Be aware that the fields for the 2nd and 4th command cannot be exactly the same!

## Mosquitto
After the [MQTTS Certificates](#mqtts) were generated, copy them to the necessary folders of the broker:
```
cp certs/mqtts/ca.crt /etc/mosquitto/ca_certificates/ca.crt
cp certs/mqtts/server.crt /etc/mosquitto/certs/server.crt
cp certs/mqtts/server.key /etc/mosquitto/certs/server.key
```

Configure the broker:
```
cp configs/mosquitto/mosquitto.conf /etc/mosquitto/conf.d/mosquitto.conf
```

Restart the broker service for the changes to take effect.
```
systemctl restart mosquitto.service
```

Eg for `mosquitto_sub`:
```
mosquitto_sub -h localhost -p 8883 --cafile /etc/mosquitto/ca_certificates/ca.crt --cert /etc/mosquitto/certs/server.crt --key /etc/mosquitto/certs/server.key -t test
```

Eg for `mosquitto_pub`:
```
mosquitto_pub -h drogeanunicusor.go.ro -p 8883 -t test -m "message" --cafile certs/mqtts/ca.crt
```

More details can be found here: [Mosquitto TLS Guide](http://www.steves-internet-guide.com/mosquitto-tls/)