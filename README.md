# Six Degrees of Wikipedia (SDOW)

## Data Source

Wikipedia dumps raw database tables in a gzipped SQL format for the English language Wikipedia
(`enwiki`) approximately once a month (e.g.
[dump from February 1, 2018](https://dumps.wikimedia.your.org/enwiki/20180201/)). The
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
four tables:

1. `pages` - Page information for all pages, including redirects.
   1. `id` - Page ID.
   2. `title` - Sanitized page title.
   3. `is_redirect` - Whether or not the page is a redirect (`1` means it is a redirect; `0` means
      it is not)
2. `links` - Outgoing and incoming links for each non-redirect page.
   1. `id` - The page ID of the source page, the page that contains the link.
   2. `outgoing_links_count` - The number of pages to which this page links to.
   3. `incoming_links_count` - The number of pages which link to this page.
   4. `outgoing_links` - A `|`-separated list of page IDs to which this page links.
   5. `incoming_links` - A `|`-separated list of page IDs which link to this page.
3. `redirects` - Source and target page IDs for all redirects.
   1. `source_id` - The page ID of the source page, the page that redirects to another page.
   2. `target_id` - The page ID of the target page, to which the redirect page redirects.
4. `searches` - Historical results of all past searches.
   1. `source_id` - The page ID of the source page at which to start the search.
   2. `target_id` - The page ID of the target page at which to end the search.
   3. `duration` - How long the search took, in seconds.
   4. `degrees_count` - The number of degrees between the source and target pages.
   5. `paths_count` - The number of paths found between the source and target pages.
   6. `paths` - Stringified JSON representation of the paths of page IDs between the source and
      target pages.
   7. `t` - Timestamp when the search finished.

Generating the SDOW database from a dump of Wikipedia takes approximately one hour given the
following instructions:

1. Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod)
   from the `sdow-db-builder` instance template, which is configured with the following specs:
   1. **Name:** `sdow-db-builder-1`
   1. **Zone:** `us-central1-c`
   1. **Machine Type:** n1-highmem-8 (8 vCPUs, 52 GB RAM)
   1. **Boot disk**: 256 GB SSD, Debian GNU/Linux 8 (jessie)
   1. **Notes**: Allow full access to all Cloud APIs. Do not use Debian GNU/Linux 9 (stretch) due to
      degraded performance.
1. SSH into the machine:
   ```bash
   $ gcloud compute ssh sdow-db-builder-1
   ```
1. Install required operating system dependencies:
   ```bash
   $ sudo apt-get -q update
   $ sudo apt-get -yq install git pigz sqlite3
   ```
1. Clone this directory via HTTPS:
   ```bash
   $ git clone https://github.com/jwngr/sdow.git
   ```
1. Move to the proper directory and create a new screen in case the VM connection is lost:
   ```bash
   $ cd sdow/database/
   $ screen  # And then press <ENTER> on the screen that pops up
   ```
1. Run the database creation script, providing
   [an optional date](https://dumps.wikimedia.your.org/enwiki/) for the backup:
   ```bash
   $ (time ./buildDatabase.sh [<YYYYMMDD>]) &> output.txt
   ```
1. Detach from the current screen session by pressing `<CTRL> + <a>` and then `<d>`. To reattach to
   the screen, run `screen -r`. Make sure to always detach from the screen cleanly so it can be
   resumed!
1. Copy the script output and the resulting SQLite file to the `sdow-prod` GCS bucket:
   ```
   $ gsutil cp output.txt gs://sdow-prod/dumps/<YYYYMMDD>/
   $ gsutil cp dump/sdow.sqlite gs://sdow-prod/dumps/<YYYYMMDD>/
   ```
1. Delete the VM to prevent incurring large fees.

## Web Server

### Initial Setup

1. Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod)
   from the `sdow-web-server` instance template, which is configured with the following specs::
   1. **Name:** `sdow-web-server-1`
   1. **Zone:** `us-central1-c`
   1. **Machine Type:** f1-micro (1 vCPU, 0.6 GB RAM)
   1. **Boot disk**: 16 GB SSD, Debian GNU/Linux 8 (jessie)
   1. **Notes**: Allow default access to Cloud APIs. Do not use Debian GNU/Linux 9 (stretch) due to
      degraded performance.
1. SSH into the machine:
   ```bash
   $ gcloud compute ssh sdow-web-server-1
   ```
1. Install required operating system dependencies to run the Flask app:
   ```bash
   $ sudo apt-get -q update
   $ sudo apt-get -yq install git pigz sqlite3 python-pip
   $ sudo pip install --upgrade pip setuptools virtualenv
   # OR for Python 3
   #$ sudo apt-get -q update
   #$ sudo apt-get -yq install git pigz sqlite3 python3-pip
   #$ sudo pip3 install --upgrade pip setuptools virtualenv
   ```
1. Clone this directory via HTTPS and navigate into the repo:
   ```bash
   $ git clone https://github.com/jwngr/sdow.git
   $ cd sdow/
   ```
1. Create and activate a new `virtualenv` environment:
   ```bash
   $ virtualenv -p python2 env  # OR virtualenv -p python3 env
   $ source env/bin/activate
   ```
1. Install the required Python libraries:
   ```bash
   $ pip install -r requirements.txt
   ```
1. Copy the latest SQLite file from the `sdow-prod` GCS bucket:
   ```bash
   $ gsutil cp gs://sdow-prod/dumps/<YYYYMMDD>/sdow.sqlite ./sdow/sdow.sqlite
   ```
1. Install required operating system dependencies to generate an SSL certificate (this and the
   following instructions are based on these
   [blog](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-8)
   [posts](https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https)):
   ```bash
   $ echo 'deb http://ftp.debian.org/debian jessie-backports main' | sudo tee /etc/apt/sources.list.d/backports.list
   $ sudo apt-get -q update
   $ sudo apt-get -yq install nginx
   $ sudo apt-get -yq install certbot -t jessie-backports
   ```
1. Add this `location` block inside the `server` block in `/etc/nginx/sites-available/default`:
   ```
   location ~ /.well-known {
       allow all;
   }
   ```
1. Start NGINX:
   ```bash
   $ sudo systemctl restart nginx
   ```
1. Ensure the server has the proper static IP address (`sdow-web-server-static-ip`) by editing it on
   the [GCP console](https://console.cloud.google.com/compute/instances?project=sdow-prod) if
   necessary.
1. Create an SSL certificate using [Let's Encrypt](https://letsencrypt.org/)'s `certbot`:
   ```bash
   $ sudo certbot certonly -a webroot --webroot-path=/var/www/html -d api.sixdegreesofwikipedia.com --email wenger.jacob@gmail.com
   ```
1. Ensure auto-renewal of the SSL certificate is configured properly:
   ```bash
   $ certbot renew --dry-run
   ```
1. Run `crontab -e` and add the following cron job to that file to auto-renew the SSL certificate:
   ```
   0 0,12 * * * python -c 'import random; import time; time.sleep(random.random() * 3600)' && /usr/bin/certbot renew
   ```
1. Generate a strong Diffie-Hellman group to further increase security (note that this can take a
   couple minutes):
   ```bash
   $ sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
   ```
1. Copy over the NGINX configuration, making sure to back up the original configuration:
   ```bash
   $ sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
   $ sudo cp ./config/nginx.conf /etc/nginx/nginx.conf
   ```
1. Restart `nginx`:
   ```bash
   $ sudo systemctl restart nginx
   ```

### Recurring Setup

1. Activate the `virtualenv` environment:
   ```bash
   $ cd sdow/
   $ source env/bin/activate
   ```
1. Set the `SDOW_ENV` environment variable to `prod`:
   ```bash
   $ export SDOW_ENV=prod
   ```
1. Start the Flask web server via [Supervisor](http://supervisord.org/) which runs
   [Gunicorn](http://gunicorn.org/):
   ```bash
   $ cd config/
   $ supervisord
   ```
1. Use [`supervisorctl`](http://supervisord.org/running.html#supervisorctl-command-line-options) to
   manage the running web server:
   ```bash
   $ supervisorctl status             # Get status of running processes
   $ supervisorctl stop gunicorn      # Stop web server
   $ supervisorctl start gunicorn     # Start web server
   $ supervisorctl restart gunicorn   # Restart web server
   ```

## Resources

* [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page)
* [MediaWiki Database Layout](https://www.mediawiki.org/wiki/Manual:Database_layout)

## Edge Case Pages

| ID       | Title                                        | Sanitized Title                                |
| -------- | -------------------------------------------- | ---------------------------------------------- |
| 50899560 | 🦎                                           | `🦎`                                           |
| 725006   | "                                            | `\"`                                           |
| 438953   | 4′33″                                        | `4′33″`                                        |
| 32055176 | Λ-ring                                       | `Λ-ring`                                       |
| 11760    | F-110 Spectre                                | `F-110_Spectre`                                |
| 8695     | Dr. Strangelove                              | `Dr._Strangelove`                              |
| 337903   | Farmers' market                              | `Farmers\'_market`                             |
| 24781873 | Lindström (company)                          | `Lindström_(company)`                          |
| 54201777 | Disinformation (book)                        | `Disinformation_(book)`                        |
| 1514     | Albert, Duke of Prussia                      | `Albert,_Duke_of_Prussia`                      |
| 35703467 | "A," My Name is Alex - Parts I & II          | `\"A,\"\_My_Name_is_Alex_-_Parts_I_&_II`       |
| 54680944 | N,N,N′,N′-tetramethylethylenediamine         | `N,N,N′,N′-tetramethylethylenediamine`         |
| 24781871 | Jack in the Green: Live in Germany 1970–1993 | `Jack_in_the_Green:_Live_in_Germany_1970–1993` |

## Interesting searches

| Source Page Title             | Target Page Title                 | Notes                          |
| ----------------------------- | --------------------------------- | ------------------------------ |
| Hargrave Military Academy     | Illiosentidae                     | Cool graph                     |
| Arthropod                     | Haberdashers' Aske's Boys' School | Cool graph                     |
| AC power plugs and sockets    | Gymnobela abyssorum               | 1,311 paths of 6 degrees       |
| Nyctipolus                    | Philemon Quaye                    | 2,331 paths of 6 degrees       |
| Six Degrees of Kevin Bacon    | Phinney                           | Only 6 paths, but of 6 degrees |
| Erlang (programming language) | Barbra Streisand                  | 2,274 paths of 4 degrees       |
| Lion Express                  | Phinney                           | 1,246 paths of 9 degrees       |
| 2016 French Open              | Brachmia melicephala              | 11 paths of 6 degrees          |

## Contributing

See the [contribution page](./.github/CONTRIBUTING.md) for details.
