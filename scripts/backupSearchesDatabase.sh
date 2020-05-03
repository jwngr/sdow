#!/bin/bash

set -euo pipefail

DATE=`date +%Y%m%d`
BACKUP_FILENAME="searches.sql.gz"

sqlite3 /home/jwngr/sdow/sdow/searches.sqlite .dump | pigz --best > /tmp/$BACKUP_FILENAME
gsutil -u sdow-prod cp /tmp/$BACKUP_FILENAME gs://sdow-prod/backups/$DATE/
rm /tmp/$BACKUP_FILENAME
