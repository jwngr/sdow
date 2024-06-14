# Contributing | SDOW

Thank you for contributing to Six Degrees of Wikipedia!

## Local setup

There are three main pieces you'll need to get set up running locally:

1.  Mock SQLite database of Wikipedia links
2.  Backend Python Flask web server
3.  [Create React App](https://github.com/facebook/create-react-app)-based frontend website

There is some larger set up you'll need to run initially as well as some recurring set up every time
you want to run the service.

Note: The following instructions have only been tested on macOS.

### Initial setup

The first step is to clone the repo and move into the created directory:

```bash
$ git clone git@github.com:jwngr/sdow.git
$ cd sdow/
```

Several dependencies are required to run the service:
1.  [`sqlite3`](https://docs.python.org/3/library/sqlite3.html) - Data storage
1.  [`nvm`](https://github.com/nvm-sh/nvm) - Manage Node and `npm` versions
1.  [`pyenv`](https://github.com/pyenv/pyenv) - Manage Python and `pip` versions
1.  [`virtualenv`](https://virtualenv.pypa.io/) - Avoid polluting global environment

The simplest way to download these is via [Homebrew](https://github.com/pyenv/pyenv):

```bash
## Install SQLite.
$ brew install sqlite

## Install nvm (Node + npm).
$ brew install nvm
$ nvm install node

## Install + configure pyenv (Python + pip).
$ brew install xz
$ brew install pyenv 
# Also configure pyenv path using instructions in link above.
$ pyenv install 3

## Install + configure  virtualenv.
$ python -m pip install --user virtualenv
# Also configure virtualenv path using instructions in link above.
```

Once the required global dependencies are installed, install the project dependencies and generate
a mock local database:

```bash
# Run from root of repo.
$ virtualenv env
$ source env/bin/activate
$ pip install -r requirements.txt
$ python scripts/create_mock_databases.py
```

### Recurring setup

Every time you want to run the service, you need to source your environment, start the backend Flask
app, and the frontend website. You can run the backend and frontend apps in different tabs.

To run the backend, open a new tab and run the following commands from the repo root:

```bash
# Run from root of repo.
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

The service can be found at http://localhost:3000.

## Repo organization

Here are some highlights of the directory structure and notable source files

- `.github/` - Contribution instructions as well as issue and pull request templates
- `config/` - Configuration files for services like NGINX, Gunicorn, and Supervisord
- `docs/` - Documentation
- `scripts/` - Scripts to do things like create a new version of the SDOW database, create a mock
- `sdow/` - The Python Flask web server
  - `server.py` - Main entry point which initializes the Flask web server
  - `database.py` - Defines a `Database` class which simplifies querying the SDOW SQLite database
  - `breadth_first_search.py` - The main search algorithm which finds the shortest path between pages
  - `helpers.py` - Miscellaneous helper functions and classes
- `sketch/` - Sketch logo files
- `sql/` - SQLite table schemas
- `website/` - The frontend website, based on [Create React App](https://github.com/facebook/create-react-app)
- `.pylintrc` - Default configuration for `pylint`
- `requirements.txt` - Requirements specification for installing project dependencies via `pip`
- `setup.cfg` - Python PEP 8 autoformatting rules
