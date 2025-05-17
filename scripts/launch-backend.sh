#!/bin/bash

wt.exe -w 0 --title "go-server" wsl -d Ubuntu-22.04 bash -ic \
	   'cd ~/myclinic-go-server && export \$(cat local-8080.env |xargs) && go run .'

