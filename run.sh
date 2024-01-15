#!/bin/bash

msg='Script executed at: '
msg+=$(date)
#start the redis server
redis-server --daemonize yes
echo msg >> /usr/src/app/log/run_script.log
