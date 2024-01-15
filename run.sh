#!/bin/bash

#start the redis server
redis-server --daemonize yes
echo 'Script executed at $(date)' >> /usr/src/app/log/run_script.log
