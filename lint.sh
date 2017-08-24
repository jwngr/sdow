#!/bin/bash

set -o errexit
set -o nounset


function lintAllFiles () {
  echo "[INFO] Running linter on module $1"
  pylint --disable=$2 $1
}

function lintChangedFiles () {
  files=`git status -s $1 | grep -v "^D" | awk '{print $NF}' | grep .py$`
  for f in $files
  do
    echo "[INFO] Running linter on $f"
    pylint --disable=$2 $f
  done
}

SKIP_FOR_TESTS="redefined-outer-name,protected-access,missing-docstring"

if [[ "$#" -eq 1 && "$1" = "all" ]]
then
  CHECK_ALL=true
elif [[ "$#" -eq  0 ]]
then
  CHECK_ALL=false
else
  echo "Usage: ./lint.sh [all]"
  exit 1
fi

if [[ "$CHECK_ALL" = true ]]
then
  lintAllFiles "breadth_first_search" ""
  lintAllFiles "tests" "$SKIP_FOR_TESTS"
else
  lintChangedFiles "breadth_first_search" ""
  lintChangedFiles "tests" "$SKIP_FOR_TESTS"
fi
