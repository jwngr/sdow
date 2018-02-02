# Six Degrees of Wikipedia (SDOW)

## Data Source

Wikipedia dumps raw database tables in a gzipped SQL format for the English language Wikipedia
(`enwiki`) approximately once a month (e.g.
[dump from July 20, 2017](https://dumps.wikimedia.your.org/enwiki/20170620/)). The
[entire database layout](https://www.mediawiki.org/wiki/Manual:Database_layout) is not required, and
the database creation script only downloads, trims, and parses three tables:

1. [`page`](https://www.mediawiki.org/wiki/Manual:Page_table) - Contains the ID and name (among
   other things) for all pages.
2. [`pagelinks`](https://www.mediawiki.org/wiki/Manual:Pagelinks_table) - Contains the source and
   target pages all links.
3. [`redirect`](https://www.mediawiki.org/wiki/Manual:Redirect_table) - Contains the source and
   target pages for all redirects.

For performance reasons, the files are downloaded from the
[`dumps.wikimedia.your.org` mirror](https://dumps.wikimedia.your.org/backup-index.html). By default,
the script grabs the latest dump (available at
[https://dumps.wikimedia.your.org/enwiki/latest/](https://dumps.wikimedia.your.org/enwiki/latest/)),
but you can also call the database creation script with a download date in the format `YYYYMMDD` as
the first argument.

SDOW only concerns itself with actual Wikipedia articles, which belong to
[namespace](https://en.wikipedia.org/wiki/Wikipedia:Namespace) 0 in the Wikipedia data.

## Database Creation Process

The result of running the database creation script is a single `sdow.sqlite` file which contains
three tables:

1. `pages` - Contains the page ID and name for all pages, including redirects.
   1. `id` - Page ID
   2. `name` - Page name
2. `links` - Contains the source and target page IDs for all links.
   1. `from_id` - The page ID of the source page, the page that contains the link.
   2. `to_id` - The page ID of the target page, to which the link links.
3. `redirects` - Contains the source and target page IDs for all redirects.
   1. `from_id` - The page ID of the source page, the page that redirects to another page.
   2. `to_id` - The page ID of the target page, to which the redirect page redirects.

Generating the SDOW database from a dump of Wikipedia takes approximately two hours given the
instructions below:

# TODO: update to indicate I should now just use the `sdow-db-builder` template.

# TODO: move some of these setup instructions into a single template startup script.

1. Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod):
   1. **Name:** `sdow-build-db`
   1. **Zone:** `us-central1-c`
   1. **Machine Type:** 8 vCPUS, 52 GB RAM
   1. **Boot disk**: 256 GB SSD, Debian GNU/Linux 8 (jessie)
   1. **Notes**: Allow full access to all Cloud APIs.
1. SSH into the machine:
   ```bash
   $ gcloud compute ssh sdow-build-db
   ```
1. Install required dependencies:
   ```bash
   $ sudo apt-get update
   $ sudo apt-get install git pigz sqlite3
   ```
1. Clone this directory via HTTPS:
   ```bash
   $ git clone https://github.com/jwngr/sdow.git
   ```
1. Create a new screen in case you lose connection to the VM:
   ```bash
   $ screen
   ```
1. Run the database creation script, providing [an optional date](https://dumps.wikimedia.your.org/enwiki/)
   for the backup:
   ```bash
   $ cd sdow/database/
   $ (time ./buildDatabase.sh [<YYYYMMDD>]) &> output.txt
   ```
1. Detach from the current screen session by pressing `<CTRL> + <a>` and then `<d>`. To reattach to
   the screen, run `screen -r`. Make sure to always detach from the screen cleanly so it can be
   resumed!
1. Copy the script output and the resulting SQLite file to the `sdow-prod` GCS bucket:
   # TODO: move this command into a script which is easier to run
   ```
   $ gsutil cp output.txt gs://sdow-prod/dumps/<YYYYMMDD>/
   $ gsutil cp dump/sdow.sqlite gs://sdow-prod/dumps/<YYYYMMDD>/
   ```
1. To avoid charges for running VMS and SSD persistent disk, delete the VM as soon as the job is
   complete and the database is saved.

TODO: make sure the external IP is permanent (maybe use a load balancer with a permanent IP?)
Endpoint: http://<external*ip>:5000/paths/Usain%20Bolt/40*(number)

## Web Server Setup Process

**TODO: finish these instructions**

1. Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod):
   1. **Name:** `sdow-web-server`
   1. **Zone:** `us-central1-c`
   1. **Machine Type:** TODO
   1. **Boot disk**: TODO
   1. **Notes**: TODO
1. SSH into the machine:
   ```bash
   $ gcloud compute ssh sdow-web-server
   ```
1. Expose the Flask HTTP port (5000) from the VM’s firewall by running the following command from
   your local development environment:
   ```bash
   gcloud compute firewall-rules create open-flask-rule --allow tcp:5000 --source-tags=sdow-web-server --source-ranges=0.0.0.0/0
   ```
1. Install required dependencies:
   ```bash
   $ sudo apt-get install git sqlite
   $ sudo apt-get install python-pip python-dev build-essential
   $ sudo pip install --upgrade pip
   $ sudo pip install --upgrade virtualenv
   $ sudo pip install flask
   ```
1. Copy all scripts from the [`breadth_first_search/`](./breadth_first_search) directory into the
   current directory.
1. Copy the latest SQLite file from the `sdow-prod` GCS bucket:
   ```bash
   $ gsutil cp gs://sdow-prod/dumps/<YYYYMMDD>/sdow.sqlite .
   ```
1. Start the Flask app, making sure to bind the Flask web service to the public facing network
   interface of the VM:
   ```bash
   $ cd sdow/sdow/
   $ export FLASK_APP=server.py
   $ flask run --host=0.0.0.0
   ```

## Edge Case Pages

| -------- | --------------------------------------------- | ------------------------- |
| Page ID | Page Name | Notes |
| -------- | --------------------------------------------- | ------------------------- |
| 1514 | Albert,\_Duke_of_Prussia | |
| 8695 | Dr.\_Strangelove | |
| 11760 | F-110_Spectre | |
| 49940 | Aaron\'s_rod | |
| 161512 | DivX\_;-) | |
| 24781871 | Jack_in_the_Green:\_Live_in_Germany_1970–1993 | |
| 24781873 | Lindström\_(company) | |
| 54201834 | Disinformation\_(book) | Missing in `pages.txt.gz` |
| 54201536 | .nds | Missing in `pages.txt.gz` |
| | Antonio_L%C3%B3pez_Fajardo | Missing in `pages.txt.gz` |
| -------- | --------------------------------------------- | ------------------------- |

## Contributing

See the [contribution page](./github/CONTRIBUTING.md) for details.
