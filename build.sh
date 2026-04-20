#!/bin/bash
TS=$(date +%s)
sed -i.bak "s/messages\.js?v=[A-Za-z0-9_]*/messages.js?v=$TS/" index.html
rm -f index.html.bak
echo "Cache busting: messages.js?v=$TS"
