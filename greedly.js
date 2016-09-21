'use strict'

const later = require('later')
    , atom = require('feed')
    , crypto = require('crypto')
    , osmosis = require('osmosis')

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

  _data (obj) {
    let item = { date: new Date }

    let concat = ''
    for (let field in obj) {
      concat += obj[field]
    }
    item.md5 = crypto.createHash('md5')
      .update(concat)
      .digest('hex')

    if (this.cache.includes(item.md5)) return

    for (let field in obj) {
      let rule = this.opts.fields[field]
      let value = [obj[field]]

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
    item.id = item.id || item.link

    this.items.push(item)
    this.cache.push(item.md5)
  }

  _done () {
    let limit = this.opts.feed.limit < 1
      ? this.items.length
      : this.opts.feed.limit

    let items = this.items.slice(0, limit)
    if (this.opts.feed.reverse) {
      items.reverse()
    }

    let feed = new atom(this.opts.feed)
    for (let item of items) {
      if (item.delay <= 0) {
        feed.addItem(item)
      }
    }

    let output =
      { items: this.items
      , atom: feed.render('atom-1.0')
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
    later.date.localTime()
    this.timer = later.setInterval(this._fetch.bind(this)(),
      later.parse.text(this.opts.fetch))
    return this
  }

  stop () {
    this.timer.clear()
    clearTimeout(this.scheduled)
  }

  _fetch () {
    let callback = obj => {
      for (let cb of this.cbs) cb(obj)
    }
    this.feed.fetch(callback)
    return this._fetch.bind(this)
  }

  _delay (feed) {
    for (let item of feed.items) {
      if (item.delay > 0) {
        this.scheduled = setTimeout(this._fetch, item.delay)
      }
    }
  }

}

module.exports = Manager
