# Data Source | Six Degrees of Wikipedia

## Table of Contents

* [Data Source](#data-source)
* [Get the Data Yourself](#get-the-data-yourself)
* [Database Schema](#database-schema)
* [Database Creation Script](#database-creation-script)
* [Historical Search Results](#historical-search-results)
* [Database Creation Process](#database-creation-process)

## Data Source

Data for this project comes from Wikimedia, which creates [gzipped SQL dumps of the English language
Wikipedia database](https://dumps.wikimedia.your.org/enwiki) twice monthly. The Six Degrees of
Wikipedia SQLite database is built by downloading, trimming, and parsing the following three SQL
tables:

1.  [`page`](https://www.mediawiki.org/wiki/Manual:Page_table) - Contains the ID and name (among
    other things) for all pages.
2.  [`pagelinks`](https://www.mediawiki.org/wiki/Manual:Pagelinks_table) - Contains the source and
    target pages all links.
3.  [`redirect`](https://www.mediawiki.org/wiki/Manual:Redirect_table) - Contains the source and
    target pages for all redirects.

For performance reasons, files are downloaded from the
[`dumps.wikimedia.your.org` mirror](https://dumps.wikimedia.your.org/backup-index.html).

Six Degrees of Wikipedia only deals with actual Wikipedia pages, which in Wikipedia parlance means
pages which belong to [namespace](https://en.wikipedia.org/wiki/Wikipedia:Namespace) `0`.

## Get the Data Yourself

Compressed versions of the Six Degrees of Wikipedia SQLite database (`sdow.sqlite.gz`) are available
for download from ["requester pays"](https://cloud.google.com/storage/docs/requester-pays) Google
Cloud Storage buckets. Check the [pricing page](https://cloud.google.com/storage/pricing) for the
full details. In general, copying is free from within Google Cloud Platform (e.g., to another Google
Cloud Storage bucket or to a Google Cloud Engine VM) and around $0.05 per compressed SQLite file
otherwise.

Use the following [`gsutil`](https://cloud.google.com/storage/docs/gsutil) and
[pigz](https://zlib.net/pigz/) commands to download a file, making sure to replace
`<GCP_PROJECT_ID>` with your Google Cloud Platform project ID and `<YYYYMMDD>` with the date of the
database dump:

```bash
$ gsutil -u <GCP_PROJECT_ID> cp gs://sdow-prod/dumps/<YYYYMMDD>/sdow.sqlite.gz .
$ pigz -d sdow.sqlite.gz
```

Here is a list of historical Six Degrees of Wikipedia SQLite databases currently available for
download:

* `gs://sdow-prod/dumps/20180201/sdow.sqlite.gz` (2.99 GB)
* `gs://sdow-prod/dumps/20180301/sdow.sqlite.gz` (3.01 GB)

## Database Schema

The Six Degrees of Wikipedia database is a single SQLite file containing the following three tables:

1.  `pages` - Page information for all pages.
    1.  `id` - Page ID.
    2.  `title` - [Sanitized page title](https://www.mediawiki.org/wiki/Manual:Page_title).
    3.  `is_redirect` - Whether or not the page is a redirect (`1` means it is a redirect; `0` means
        it is not)
2.  `links` - Outgoing and incoming links for each non-redirect page.
    1.  `id` - The page ID of the source page, the page that contains the link.
    2.  `outgoing_links_count` - The number of pages to which this page links to.
    3.  `incoming_links_count` - The number of pages which link to this page.
    4.  `outgoing_links` - A `|`-separated list of page IDs to which this page links.
    5.  `incoming_links` - A `|`-separated list of page IDs which link to this page.
3.  `redirects` - Source and target page IDs for all redirects.
    1.  `source_id` - The page ID of the source page, the page that redirects to another page.
    2.  `target_id` - The page ID of the target page, to which the redirect page redirects.

## Historical Search Results

Historical search results are stored in a separate SQLite database (`searches.sqlite`) which
contains a single `searches` table with the following schema:

1.  `source_id` - The page ID of the source page at which to start the search.
2.  `target_id` - The page ID of the target page at which to end the search.
3.  `duration` - How long the search took, in seconds.
4.  `degrees_count` - The number of degrees between the source and target pages.
5.  `paths_count` - The number of paths found between the source and target pages.
6.  `paths` - Stringified JSON representation of the paths of page IDs between the source and
    target pages.
7.  `t` - Timestamp when the search finished.

Search results are kept in a separate SQLite file to avoid locking the main `sdow.sqlite` database
as well as to make it easy to update the `sdow.sqlite` database to a more recent Wikipedia dump.

Historical search results are not available for public download, but they are not required to run
this project yourself.

## Database Creation Script

A new build of the Six Degrees of Wikipedia database is created using the [database creation shell
script](../database/buildDatabase.sh):

```bash
$ ./buildDatabase.sh
```

By default, it uses the most recent Wikipedia dump available, but it can download any available dump
by passing the date of the dump in the format `YYYYMMDD` as a command line argument:

```bash
$ ./buildDatabase.sh <YYYYMMDD>
```

## Database Creation Process

Generating the Six Degrees of Wikipedia database from a dump of Wikipedia takes approximately one
hour given the following instructions:

1.  Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod)
    from the `sdow-db-builder` instance template, which is configured with the following specs:
    1.  **Name:** `sdow-db-builder-1`
    1.  **Zone:** `us-central1-c`
    1.  **Machine Type:** n1-highmem-8 (8 vCPUs, 52 GB RAM)
    1.  **Boot disk**: 256 GB SSD, Debian GNU/Linux 8 (jessie)
    1.  **Notes**: Allow full access to all Cloud APIs. Do not use Debian GNU/Linux 9 (stretch) due to
        [degraded performance](https://lists.debian.org/debian-kernel/2017/12/msg00265.html).
1.  SSH into the machine:

    ```bash
    $ gcloud compute ssh sdow-db-builder-1
    ```

1.  Install required operating system dependencies:

    ```bash
    $ sudo apt-get -q update
    $ sudo apt-get -yq install git pigz sqlite3
    ```

1.  Clone this directory via HTTPS:

    ```bash
    $ git clone https://github.com/jwngr/sdow.git
    ```

1.  Move to the proper directory and create a new screen in case the VM connection is lost:

    ```bash
    $ cd sdow/database/
    $ screen  # And then press <ENTER> on the screen that pops up
    ```

1.  Run the database creation script, providing
    [an optional date](https://dumps.wikimedia.your.org/enwiki/) for the backup:

    ```bash
    $ (time ./buildDatabase.sh [<YYYYMMDD>]) &> output.txt
    ```

1.  Detach from the current screen session by pressing `<CTRL> + <a>` and then `<d>`. To reattach to
    the screen, run `screen -r`. Make sure to always detach from the screen cleanly so it can be
    resumed!
1.  Copy the script output and the resulting SQLite file to the `sdow-prod` GCS bucket:

    ```
    $ gsutil -u sdow-prod cp output.txt gs://sdow-prod/dumps/<YYYYMMDD>/
    $ gsutil -u sdow-prod cp dump/sdow.sqlite.gz gs://sdow-prod/dumps/<YYYYMMDD>/
    ```

1.  Run the [Wikipedia facts queries](../database/wikipediaFactsQueries.txt) and update the
    [corresponding JSON file](../website/src/resources/wikipediaFacts.json).
1.  Delete the VM to prevent incurring large fees.
