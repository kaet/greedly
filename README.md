# Greedly

Greedly is a very simple wrapper around [Osmosis](https://github.com/rchipka/node-osmosis) and [Later](https://github.com/bunkat/later) that generates Atom feeds for web services that do not offer their own, on a schedule. It includes a basic hook system to operate on retrieved data.

## Installation

```
$ git clone https://github.com/kaet/greedly.git
$ cd greedly && npm install
```

You may run into issues with the `libxmljs` dependency when running Greedly.
This seems to fix it;

```
$ npm install -g node-gyp
$ cd node_modules/osmosis/node_modules/libxmljs-dom/node_modules/libxmljs
$ node-gyp rebuild
```

## Usage

Greedly is run from the command line and takes a JS config file as input. An annotated example of the configuration options can be found in [`public/example.js`](https://github.com/kaet/greedly/blob/master/public/example.js).

```
$ node greedly.js <config_path> <output_path> [<timeout>]
```

- `config_path` Path to the JS config file.
- `output_path` Path that the Atom feed should be written to.
- `timeout` Optional timeout in milliseconds to exit the script. Useful for testing configs before deploying.

**Example**

```
$ node greedly.js public/example.js public/example.atom 1500
```

_Note that due to the lack of any fault tolerance or logging, it's recommended to use a supervisor such as [forever](https://github.com/foreverjs/forever)._
