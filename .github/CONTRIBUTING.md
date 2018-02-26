# Contributing | SDOW

Thank you for contributing to Six Degrees of Wikipedia!

## Local Setup

There are three main pieces you'll need to get set up running locally:

1. Mock SQLite database of Wikipedia links.
2. Backend Python Flask web server.
3. [Create React App](https://github.com/facebook/create-react-app)-based frontend website.

There is some larger set up you'll need to run initially as well as some recurring set up every time
you want to run the service.

Note: The following instructions have only been tested on macOS.

### Initial Setup

The first step is to clone the repo and move into the created directory:

```bash
$ git clone git@github.com:jwngr/sdow.git
$ cd sdow/
```

Several global dependencies are required to run the service. Since installation instructions vary
and are decently documented for each project, please refer to the links below on how to install them.

1. [Python](https://www.python.org/downloads/) - macOS comes with an older `2.x` version of Python,
   but I recommend using [`pyenv`](https://github.com/pyenv/pyenv) to install the latest `2.x`
   release.
1. [`pip`](https://pip.pypa.io/en/stable/installing/) - Most recent versions of Python ship with
   `pip`
1. [`sqlite3`](https://docs.python.org/3/library/sqlite3.html) - Can be installed via `brew install sqlite3`.
1. [`virtualenv`](https://virtualenv.pypa.io/en/stable/installation/) - Helps avoid polluting your
   global environment.

Once all the required global dependencies above are installed, run the following commands to get
everything set up:

```bash
$ virtualenv env
$ source env/bin/activate
$ pip install -r requirements.txt
$ python scripts/create_mock_database.py
$ cp sdow.sqlite sdow/
$ cd website/
$ npm install
$ cd ..
```

### Recurring Setup

Every time you want to run the service, you need to source your environment, start the backend Flask
app, and the frontend website. You can run the backend and frontend apps in different tabs.

To run the backend, open a new tab and run the following commands from the repo root:

```bash
$ source env/bin/activate
$ cd sdow/
$ export FLASK_APP=server.py FLASK_DEBUG=1
$ flask run
```

To run the frontend, open a new tab and run the following commands from the repo root:

```bash
$ cd website/
$ npm start
```

The service should be running at http://localhost:3000.

## Repo Organization

Here are some highlights of the directory structure and notable source files

* `.github/` - Contribution instructions as well as issue and pull request templates.
* `config/` - Configuration files for services like NGINX, Gunicorn, and Supervisord.
* `database/` - Script to generate a new dump of the SDOW database.
* `scripts/` - Helper scripts to do things like create a mock SDOW database or lookup Wikipedia page
  info.
* `sdow/` - The Python Flask web server.
  * `server.py` - Main entry point which initializes the Flask web server.
  * `database.py` - Defines a `Database` class which simplifies querying the SDOW SQLite database.
  * `breadth_first_search.py` - The main search algorithm which finds the shortest path between pages.
  * `helpers.py` - Miscellaneous helper functions and classes.
* `sketch/` - Sketch logo files.
* `website/` - The frontend website, based on [Create React App](https://github.com/facebook/create-react-app).
* `.pylintrc` - Default configuration for `pylint`.
* `requirements.txt` - Requirements specification for installing project dependencies via `pip`.
* `setup.cfg` - Python PEP 8 autoformatting rules.
