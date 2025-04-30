#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! ss -tln | grep -q ':8080'; then
	$DIR/launch-backend.sh
else
	echo "go server is already started"
fi
if ! ss -tln | grep -q ':5173'; then
	$DIR/launch-dev-server.sh
else
	echo "dev server is already started"
fi

