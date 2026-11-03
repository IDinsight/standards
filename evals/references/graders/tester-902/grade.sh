#!/bin/sh
# tester-902 (T2): runs in the runner image on a copy of the finished project,
# which is the working directory, with no network (graders.mjs).
exec python3 -I /opt/grader/grade.py
