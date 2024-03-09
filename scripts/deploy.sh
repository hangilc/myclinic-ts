#!/bin/bash

STAMP=$(date '+%Y-%m%d-%H%M%S')
echo $STAMP

npm run compile
npm run build -w packages/frontend
rsync -avg packages/frontend/dist/ changclinic-server:~/vite-$STAMP
ssh changclinic-server rm -f vite
ssh changclinic-server ln -s vite-$STAMP vite
