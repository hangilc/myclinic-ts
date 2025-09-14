#!/bin/bash

set -e

if [ $# -ne 1 ]; then
    echo "Usage: $0 <LABEL>"
    exit 1
fi

LABEL=$1
STAMP=$(date '+%Y-%m%d-%H%M%S')
echo $STAMP

npm run compile
npm run build -w packages/frontend
rsync -avg packages/frontend/dist/ changclinic-server:~/vite-$STAMP-$LABEL
ssh changclinic-server rm -f vite
ssh changclinic-server ln -s vite-$STAMP-$LABEL vite
