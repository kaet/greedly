# Greedly

Greedly is a very simple wrapper around [Osmosis](https://github.com/rchipka/node-osmosis) and [Later](https://github.com/bunkat/later) that generates Atom feeds for web services that do not offer their own, on a schedule. It offers flexible configuration for scraping, pruning and formatting data, as well as delayed
publication of items.

## Installation

```
$ git clone https://github.com/kaet/greedly.git
$ cd greedly
$ npm install
```

Note that you may need to install build tools (i.e., `gcc-c++` and `make`) to compile the native `libxmljs` dependency.

## Usage

Greedly is run from the command line and takes a JS config file as input. An annotated example of the configuration options can be found in [`public/example.js`](https://github.com/kaet/greedly/blob/master/public/example.js).

```
$ ./greedly <config_path> <output_path> [<timeout>]
```

- `config_path` Path to the JS config file.
- `output_path` Path that the Atom feed should be written to.
- `timeout` Optional timeout in milliseconds to exit the script. Useful for testing configs before deploying.

**Example**

```
$ ./greedly public/example.js public/example.atom 1500
```

Note that due to the lack of any fault tolerance or logging, it's recommended to use a supervisor such as [pm2](https://github.com/Unitech/pm2).
