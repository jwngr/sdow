#!/bin/bash

set -euo pipefail

# Force default language for output sorting to be bytewise.
export LC_ALL=C

# By default, the latest Wikipedia dump will be downloaded. If a download date in the format
# YYYYMMDD is provided as the first argument, it will be used instead.
if [[ $# -eq 0 ]]; then
  echo "[ERROR] Not date argument provided."
  echo "[INFO] Usage: $0 YYYYMMDD"
  exit 1
elif [ ${#1} -ne 8 ]; then
  echo "[ERROR] Invalid date argument provided: $1"
  echo "[INFO] Usage: $0 YYYYMMDD"
  exit 1
else
  DOWNLOAD_DATE=$1
fi


############################
#  CREATE SQLITE DATABASE  #
############################
echo
echo "[INFO] Uploading files to GCS"

for file in 'output.txt' 'dump/sdow.sqlite.gz'; do
  if [ -f $file ]; then
    gsutil -u sdow-prod cp $file gs://sdow-prod/dumps/$DOWNLOAD_DATE/
    echo "[INFO] $file uploaded to GCS"
  else
    echo "[WARN] $file does not exist, so not uploading"
  fi
done
