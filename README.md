# Six Degrees of Wikipedia

## Data Source

Dumps of the English Wikipedia can be found at http://dumps.wikimedia.org/enwiki/

## Contributing

If you'd like to contribute to Six Degrees of Wikipedia, you'll need to run the following commands
to get your environment set up:

```bash
$ git clone https://github.com/jwngr/sdow.git
$ cd sdow                # go to the sdow directory
$ npm install -g gulp    # globally install gulp task runner
$ npm install -g bower   # globally install Bower package manager
$ npm install            # install local npm build / test dependencies
$ bower install          # install local JavaScript dependencies
$ gulp watch             # watch for source file changes
```

In order to get the files from Wikipedia which are used to generate the database files, we use `wget`.
You can install `wget` via [Homebrew](http://brew.sh/):

```
$ brew install wget
```

