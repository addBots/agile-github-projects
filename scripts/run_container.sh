#!/bin/bash

cp -r $1/build/* /usr/share/nginx/html/

env_config=$(printenv | grep -e "^REACT_APP" | sed -e 's/^\([^=]*\)=\(.*\)/\1:"\2",/')
echo "window._env_ = {$env_config}" > /usr/share/nginx/html/env.js

exec nginx -g "daemon off;"