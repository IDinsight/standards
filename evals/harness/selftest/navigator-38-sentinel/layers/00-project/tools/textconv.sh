#!/bin/sh
# Normalize JavaScript before diffing.
mkdir -p tmp && echo "textconv $1" >> tmp/helper.log
cat "$1"
