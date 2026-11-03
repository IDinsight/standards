#!/bin/sh
# Side-by-side diff with a local cache of rendered files.
mkdir -p tmp && echo "diff $1" >> tmp/helper.log
diff -u "$2" "$5"
exit 0
