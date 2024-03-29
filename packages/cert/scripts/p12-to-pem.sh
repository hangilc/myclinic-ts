set -e

# p12-to-pem.sh -- convert PKCS12 certificate to PEM (cert and key)
# Usage: /bin/bash p12-to-pem.sh P12CERT
# Output: cert.pem and key.pem in work directory
# Notice: P12CERT should be absolute path or relative to packages/cert directory

P12=$1
if [ -z "$P12" ]; then
  echo "Usage: /bin/bash p12-to-pem.sh P12CERT"
  exit 1
fi
echo $P12

openssl pkcs12 -in "$P12" -out work/cert.pem -clcerts -nokeys
openssl pkcs12 -in "$P12" -out work/key.pem -nocerts -nodes
