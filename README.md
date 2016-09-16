# Greedly

Greedly is a very simple wrapper around [Osmosis](https://github.com/rchipka/node-osmosis) and [Later](https://github.com/bunkat/later) that generates Atom feeds for web services that do not offer their own, on a schedule. It includes a basic hook system to operate on and modify retrieved data.

## Installation

```
$ git clone https://github.com/kaet/greedly.git
$ cd greedly && npm install
```

## Usage

Greedly is run from the command line and takes a JS config file as input. An example of the configuration options can be found in `public/example.js`.

```
$ node greedly.js <config_path> <output_path> [<timeout>]
```

- `config_path` Path to the JS config file.
- `output_path` Path that the Atom feed should be written to. I recommend simply changing the extension, e.g. `public/example.atom`.
- `timeout` Optional timeout in milliseconds to exit the script. Useful for testing configs before deploying.

**Example**

```
$ node greedly.js public/example.js public/example.atom 1500
```
## Todo

- Add timezone support (script currently defaults to UTC instead of system timezone).
- Write a replacement `feed` library to fully implement the [RFC 4287](https://tools.ietf.org/html/rfc4287) and [RFC 5023](https://www.ietf.org/rfc/rfc5023.txt) specifications.
