# Setup
## Server
Raspbian OS was used; any Debian derivative should work fine.
List of necessary Raspbian packages:
```
sudo apt install make mosquitto mosquitto-clients openssl nginx certbot python3-certbot-nginx postgresql postgresql-contrib
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
sudo cp configs/nginx/golang-server.conf /etc/nginx/sites-available/golang-server.conf
```
Create the link to mark the config as active:
```
sudo ln -s /etc/nginx/sites-available/golang-server.conf /etc/nginx/sites-enabled/golang-server
```

If the file `proxy_params` is not present in `/etc/nginx`, copy it from the repo.
```
sudo cp configs/nginx/proxy_params /etc/nginx/proxy_params
```

Restart the service for the changes to take effect:
```
sudo systemctl restart nginx.service
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
sudo cp certs/mqtts/ca.crt /etc/mosquitto/ca_certificates/ca.crt
sudo cp certs/mqtts/server.crt /etc/mosquitto/certs/server.crt
sudo cp certs/mqtts/server.key /etc/mosquitto/certs/server.key
```

Configure the broker:
```
sudo cp configs/mosquitto/mosquitto.conf /etc/mosquitto/conf.d/mosquitto.conf
```

Restart the broker service for the changes to take effect.
```
sudo systemctl restart mosquitto.service
```

Eg for `mosquitto_sub`:
```
mosquitto_sub -h localhost -p 8883 --cafile /etc/mosquitto/ca_certificates/ca.crt --cert /etc/mosquitto/certs/server.crt --key /etc/mosquitto/certs/server.key -t test
```

Eg for `mosquitto_pub`:
```
mosquitto_pub -h drogeanunicusor.go.ro -p 8883 --cafile certs/mqtts/ca.crt -t test -m "message"
```

More details can be found here: [Mosquitto TLS Guide](http://www.steves-internet-guide.com/mosquitto-tls/)


## PostgreSQL
After the PostgreSQL service is up, connect to the `postgres` user and set a new password:
```
sudo -u postgres psql
\password postgres
```

Enter the password from the backend config file: ```backend/backend.config.json```

While connected to the psql command line, create a new database with the name specified in the config file:
```
CREATE DATABASE database_name;
```

Start the backend, the tables will be created by the application.