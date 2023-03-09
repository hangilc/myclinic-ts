# create-server-cert.sh -- creates TLS cert for server IP ADDRESS
# Usage: /bin/bash create-server-cert.sh SERVER-IP-ADDR
# required env vars
#   MYCLINIC_CA_CERT: CA cert file path
#   MYCLINIC_CA_KEY:  CA key file path
#   MYCLINIC_SERVER_CSR_CONFIG: server CSR config file path

set -e
CA_CERT=$MYCLINIC_CA_CERT
CA_KEY=$MYCLINIC_CA_KEY
SERVER_CSR_CONFIG=$MYCLINIC_SERVER_CSR_CONFIG

SERVER_ADDR=$1

if [ -z "$SERVER_ADDR" ]; then
    echo "Error: SERVER-ADDR not specified"
	echo "Usage: /bin/bash create-server-cert.sh SERVER-IP-ADDR"
	exit 1
fi

mkdir -p work

PRIV_KEY="work/$1-key.pem"
CERT_FILE="work/$1-cert.pem"
REQ_FILE="work/$1-req.pem"
EXT_FILE="work/$1-ext.txt"

openssl genrsa > "$PRIV_KEY"
openssl req -new -key "$PRIV_KEY" \
    --config "$SERVER_CSR_CONFIG" -out "$REQ_FILE"

cat <<EOF > "$EXT_FILE"
[x509v3_ext]
subjectAltName = @san

[san]
IP.1 = 127.0.0.1
IP.2 = $SERVER_ADDR
EOF

openssl x509 -req -in "$REQ_FILE" -CAkey "$CA_KEY" -CA "$CA_CERT" \
    -extfile "$EXT_FILE" -extensions x509v3_ext \
    -days 3650 \
    -out "$CERT_FILE"

echo "cert/key files have been created at ${PWD}/work"
