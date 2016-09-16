const later = require('later')
const atom = require('feed')
const fs = require('fs')
const hash = require('object-hash')
const osmosis = require('osmosis')

class Feed {
  constructor (opts) {
    this.opts = opts
    this.items = []
    this.cache = []

    let structure = {}
    for (let field in opts.fields) {
      structure[field] = opts.fields[field].select
    }

    this.request = new osmosis(opts.feed.link, opts.feed.request)
      .find(opts.feed.root)
      .set(structure)
      .data(this._data.bind(this))
      .done(this._done.bind(this))
  }
  fetch (callback) {
    this.callback = callback
    this.request.run()
  }
  _data (data) {
    let item = {
      date: new Date,
      guid: hash(data)
    }

    if (this.cache.includes(item.guid)) return

    for (let field in data) {
      let rule = this.opts.fields[field]
      let value = [data[field]]

      if ('match' in rule) {
        value = value[0].match(rule.match)
        if (!value) return
      }
      if ('format' in rule) {
        try {
          value = [rule.format(value)]
        } catch (err) {
          let string = rule.format
          for (let i in value) {
            string = string.replace('%' + i, value[i])
          }
          value = [string]
        }
      }
      item[field] = value[0]
    }
    item.delay = item.date - Date.now()

    this.items.push(item)
    this.cache.push(item.guid)
  }
  _done () {
    let items = this.items.slice(0, this.opts.feed.limit)
    if (this.opts.feed.reverse) items.reverse()

    let feed = new atom(this.opts.feed)
    for (let item of items) {
      if (item.delay <= 0) feed.addItem(item)
    }

    let output = {
      items: this.items,
      atom: feed.render('atom-1.0')
    }
    this.callback(output)
  }
}

class Manager {
  constructor (opts) {
    this.opts = opts
    this.feed = new Feed(opts)
    this.cbs = [this._delay.bind(this)]
  }
  data (func) {
    this.cbs.push(func)
    return this
  }
  start () {
    this.timer = later.setInterval(this._fetch.bind(this)(),
      later.parse.text(this.opts.fetch))
    return this
  }
  _fetch () {
    let callback = (obj) => {
      for (let cb of this.cbs) cb(obj)
    }
    this.feed.fetch(callback)
    return this._fetch
  }
  _delay (feed) {
    for (let item of feed.items) {
      if (item.delay > 0) {
        this.scheduled = setTimeout(this._fetch, item.delay)
      }
    }
  }
}

let instance = new Manager(require(process.argv[2]))
  .data((feed) => fs.writeFileSync(process.argv[3], feed.atom))
  .start()
if (process.argv.length >= 5) {
  setTimeout(process.exit, process.argv[4])
}
