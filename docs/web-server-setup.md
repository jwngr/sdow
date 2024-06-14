# Web erver Setup | Six Degrees of Wikipedia

## Table of contents

- [Initial Setup](#initial-setup)
- [Recurring Setup](#recurring-setup)
- [Updating Data Source](#updating-data-source)
- [Updating Server Code](#updating-server-code)

## Initial setup

1.  Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod)
    from the `sdow-web-server` instance template, which is configured with the following specs:

    1.  **Name:** `sdow-web-server-1`
    1.  **Zone:** `us-central1-c`
    1.  **Machine Type:** f1-micro (1 vCPU, 0.6 GB RAM)
    1.  **Boot disk**: 32 GB SSD, Debian GNU/Linux 10 (buster)
    1.  **Notes**: Click "Set access for each API" and use default values for all APIs except set
        Storage to "Read Write".

1.  [Install, initialize, and authenticate to the `gcloud` CLI](https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version).

1.  Set the default region and zone for the `gcloud` CLI:

    ```
    $ gcloud config set compute/region us-central1
    $ gcloud config set compute/zone us-central1-c
    ```

1.  SSH into the machine:

    ```bash
    $ gcloud compute ssh sdow-web-server-# --project=sdow-prod
    ```

1.  Install required operating system dependencies to run the Flask app:

    ```bash
    $ sudo apt-get -q update
    $ sudo apt-get -yq install git pigz sqlite3 python-pip
    $ sudo pip install --upgrade pip setuptools virtualenv
    # OR for Python 3
    #$ sudo apt-get -q update
    #$ sudo apt-get -yq install git pigz sqlite3 python3-pip
    #$ sudo pip3 install --upgrade pip setuptools virtualenv
    ```

1.  Clone this directory via HTTPS and navigate into the repo:

    ```bash
    $ git clone https://github.com/jwngr/sdow.git
    $ cd sdow/
    ```

1.  Create and activate a new `virtualenv` environment:

    ```bash
    $ virtualenv -p python2 env  # OR virtualenv -p python3 env
    $ source env/bin/activate
    ```

1.  Install the required Python libraries:

    ```bash
    $ pip install -r requirements.txt
    ```

1.  Copy the latest compressed SQLite file from the `sdow-prod` GCS bucket:

    ```bash
    $ gsutil -u sdow-prod cp gs://sdow-prod/dumps/<YYYYMMDD>/sdow.sqlite.gz sdow/
    ```

1.  Decompress the SQLite file:

    ```bash
    $ pigz -d sdow/sdow.sqlite.gz
    ```

1.  Create the `searches.sqlite` file:

    ```bash
    $ sqlite3 sdow/searches.sqlite ".read sql/createSearchesTable.sql"
    ```

    **Note:** Alternatively, copy a backed-up version of `searches.sqlite`:

    ```bash
    $ gsutil -u sdow-prod cp gs://sdow-prod/backups/<YYYYMMDD>/searches.sql.gz sdow/searches.sql.gz
    $ pigz -d sdow/searches.sql.gz
    $ sqlite3 sdow/searches.sqlite ".read sdow/searches.sql"
    $ rm sdow/searches.sql
    ```

1.  Install required operating system dependencies to generate an SSL certificate (this and the
    following instructions are based on [these](https://certbot.eff.org/lets-encrypt/debianbuster-nginx)
    [blog](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-8)
    [posts](https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https)):

    ```bash
    $ sudo apt-get -q update
    $ sudo apt-get -yq install nginx certbot python-certbot-nginx
    ```

1.  Add this `location` block inside the `server` block in `/etc/nginx/sites-available/default`:

    ```
    location ~ /.well-known {
        allow all;
    }
    ```

1.  Start NGINX:

    ```bash
    $ sudo systemctl restart nginx
    ```

1.  Ensure the VM has been [assigned the proper static IP
    address](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address#IP_assign)
    (`sdow-web-server-static-ip`) by editing it on
    the [GCP console](https://console.cloud.google.com/compute/instances?project=sdow-prod).

1.  Create an SSL certificate using [Let's Encrypt](https://letsencrypt.org/)'s `certbot`:

    ```bash
    $ sudo certbot certonly -a webroot --webroot-path=/var/www/html -d api.sixdegreesofwikipedia.com --email wenger.jacob@gmail.com
    ```

1.  Ensure auto-renewal of the SSL certificate is configured properly:

    ```bash
    $ sudo certbot renew --dry-run
    ```

1.  Run `crontab -e` and add the following cron jobs to that file to auto-renew the SSL certificate,
    regularly restart the web server (to ensure it stays responsive), and backup the searches
    database weekly:

    ```
    # Renew the cert daily.
    0 4 * * * sudo /usr/bin/certbot renew --noninteractive --renew-hook "sudo /bin/systemctl reload nginx"

    # Restart the server every ten minutes.
    */10 * * * * /home/jwngr/sdow/env/bin/supervisorctl -c /home/jwngr/sdow/config/supervisord.conf restart gunicorn

    # Backup the searches database weekly.
    0 6 * * 0 /home/jwngr/sdow/scripts/backupSearchesDatabase.sh
    ```

    **Note:** Let's Encrypt debug logs can be found at `/var/log/letsencrypt/letsencrypt.log`.

    **Note:** Supervisor debug logs can be found at `/tmp/supervisord.log`.

1.  Replace the `ExecStart` line in `/lib/systemd/system/certbot.service` with the following to
    ensure NGINX restarts every time a new certificate is generated:

    ```
    ExecStart=/usr/bin/certbot -q renew --noninteractive --renew-hook "sudo /bin/systemctl reload nginx"
    ```

1.  Run the following commands to restart `certbot` and ensure the new timer is enabled:

    ```
    $ sudo systemctl daemon-reload
    $ sudo systemctl restart certbot.service
    $ sudo systemctl restart certbot.timer
    ```

1.  Install a mail service in order to read logs from cron jobs:

    ```bash
    $ sudo apt-get -yq install postfix
    # Choose "Local only" and use the default email address.
    ```

    **Note:** Cron job logs will be written to `/var/mail/jwngr`.

1.  Generate a strong Diffie-Hellman group to further increase security (note that this can take a
    couple minutes):

    ```bash
    $ sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
    ```

1.  Copy over the NGINX configuration, making sure to back up the original configuration:

    ```bash
    $ sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    $ sudo cp ./config/nginx.conf /etc/nginx/nginx.conf
    ```

1.  Restart `nginx`:

    ```bash
    $ sudo systemctl restart nginx
    ```

1.  Install the [Stackdriver monitoring agent](https://cloud.google.com/monitoring/agent/install-agent):

    ```bash
    $ curl -sSO https://dl.google.com/cloudagents/add-monitoring-agent-repo.sh
    $ sudo bash add-monitoring-agent-repo.sh
    $ sudo apt-get update
    $ rm add-monitoring-agent-repo.sh
    $ sudo apt-get -yq install stackdriver-agent
    $ sudo service stackdriver-agent start
    ```

## Recurring setup

1.  Activate the `virtualenv` environment:

    ```bash
    $ cd sdow/
    $ source env/bin/activate
    ```

1.  Start the Flask web server via [Supervisor](http://supervisord.org/) which runs
    [Gunicorn](http://gunicorn.org/):

    ```bash
    $ cd config/
    $ supervisord
    ```

1.  Use [`supervisorctl`](http://supervisord.org/running.html#supervisorctl-command-line-options) to
    manage the running web server:

    ```bash
    $ supervisorctl status             # Get status of running processes
    $ supervisorctl stop gunicorn      # Stop web server
    $ supervisorctl start gunicorn     # Start web server
    $ supervisorctl restart gunicorn   # Restart web server
    ```

    **Note:** `supervisord` and `supervisorctl` must be run from the `config/` directory or specify
    the configuration file via the `-c` argument or else they will return an obscure
    `"http://localhost:9001 refused connection"` error message.

    **Note:** Log output from `supervisord` is written to `/tmp/supervisord.log` and log output from
    `gunicorn` is written to `/tmp/gunicorn-stdout---supervisor-<HASH>.log`. Logs are also written to
    Stackdriver Logging.

## Updating data source

To update the web server to a more recent `sdow.sqlite` file with minimal downtime, run the
following commands after SSHing into the web server:

```bash
$ cd sdow/
$ source env/bin/activate
$ gsutil -u sdow-prod cp gs://sdow-prod/dumps/YYYYMMDD/sdow.sqlite.gz sdow/sdow_new.sqlite.gz
$ pigz -d sdow/sdow_new.sqlite.gz  # This takes ~5 minutes and causes search to be non-responsive.
$ mv sdow/sdow_new.sqlite sdow/sdow.sqlite
$ cd config/
$ supervisorctl restart gunicorn
```

## Updating server code

To update the Python server code which powers the SDOW backend, run the following commands after
SSHing into the web server:

```bash
$ cd sdow/
$ source env/bin/activate
$ git pull
$ pip install -r requirements.txt
$ cd config/
$ supervisorctl restart gunicorn
```
