#!/bin/bash

STAMP=$(date '+%Y-%m%d-%H%M%S')
echo $STAMP

npm run compile
npm run build -w packages/frontend
ssh changclinic-server cp -r  vite vite-$STAMP
rsync -avg packages/frontend/dist/ changclinic-server:~/vite/
