rm -rf ./dist
mkdir dist
cp -r ../dist ./
docker build -t hangilc/myclinic-vite:1.0.0 .
