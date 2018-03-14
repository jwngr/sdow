# Web Server Setup | Six Degrees of Wikipedia

## Table of Contents

* [Initial Setup](#initial-setup)
* [Recurring Setup](#recurring-setup)

## Initial Setup

1.  Create a new [Google Compute Engine instance](https://console.cloud.google.com/compute/instances?project=sdow-prod)
    from the `sdow-web-server` instance template, which is configured with the following specs::
    1.  **Name:** `sdow-web-server-1`
    1.  **Zone:** `us-central1-c`
    1.  **Machine Type:** f1-micro (1 vCPU, 0.6 GB RAM)
    1.  **Boot disk**: 16 GB SSD, Debian GNU/Linux 8 (jessie)
    1.  **Notes**: Click "Set access for each API" and use default values for all APIs except set
        Storage to "Read Write". Do not use Debian GNU/Linux 9 (stretch) due to
        [degraded performance](https://lists.debian.org/debian-kernel/2017/12/msg00265.html).
1.  SSH into the machine:

    ```bash
    $ gcloud compute ssh sdow-web-server-1
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
    $ sqlite3 sdow/searches.sqlite ".read database/createSearchesTable.sql"
    ```

    **Note:** Alternatively, copy a backed-up version of `searches.sqlite`:

    ```bash
    $ gsutil -u sdow-prod cp gs://sdow-prod/backups/<YYYYMMDD>/searches-<YYYYMMDD>.sql.gz sdow/searches.sql.gz
    $ pigz -d sdow/searches.sql.gz
    $ sqlite3 sdow/searches.sqlite ".read sdow/searches.sql"
    $ rm sdow/searches.sql
    ```

1.  Ensure the VM has been [assigned Six Degrees of Wikipedia's static external IP address](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address#IP_assign).
1.  Install required operating system dependencies to generate an SSL certificate (this and the
    following instructions are based on these
    [blog](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-8)
    [posts](https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https)):

    ```bash
    $ echo 'deb http://ftp.debian.org/debian jessie-backports main' | sudo tee /etc/apt/sources.list.d/backports.list
    $ sudo apt-get -q update
    $ sudo apt-get -yq install nginx
    $ sudo apt-get -yq install certbot -t jessie-backports
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

1.  Ensure the server has the proper static IP address (`sdow-web-server-static-ip`) by editing it on
    the [GCP console](https://console.cloud.google.com/compute/instances?project=sdow-prod) if
    necessary.
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
    0 4 * * * /usr/bin/certbot renew --noninteractive --renew-hook "/bin/systemctl reload nginx" >> /var/log/le-renew.log
    */10 * * * * /home/jwngr/sdow/env/bin/supervisorctl -c /home/jwngr/sdow/config/supervisord.conf restart gunicorn
    0 6 * * 0 /home/jwngr/sdow/database/backupSearchesDatabase.sh
    ```

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

1.  Install the Stackdriver monitoring agent:

    ```bash
    $ curl -sSO https://repo.stackdriver.com/stack-install.sh
    $ sudo bash stack-install.sh --write-gcm
    ```

## Recurring Setup

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
