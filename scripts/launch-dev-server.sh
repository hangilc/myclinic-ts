#!/bin/bash

wt.exe --title "dev-server" wsl -d Ubuntu-22.04 bash -ic \
	   'cd ~/myclinic-ts && npm run dev'
