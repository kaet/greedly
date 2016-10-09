'use strict'

const later = require('later')
    , atom = require('./atom')
    , crypto = require('crypto')
    , osmosis = require('osmosis')

class Feed {

  constructor (opts) {
    this.opts = opts
    this.cache = []

    let structure = {}
    for (let field in opts.fields) {
      structure[field] = opts.fields[field].select
    }

    this.request = new osmosis(opts.feed.link_alternate
      , opts.feed.request)
        .find(opts.feed.root)
        .set(structure)
        .data(this._data.bind(this))
        .done(this._done.bind(this))
  }

  fetch (callback) {
    this.items = []
    this.callback = callback
    this.request.run()
  }

  _data (obj) {
    let item = { updated: new Date }

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
    item.delay = item.updated - Date.now()
    item.publish = item.delay <= 0 ? true : false

    if (item.publish) this.cache.push(item.md5)
    this.item(item)
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
      if (item.publish) feed.entry(item)
    }

    let output =
      { items: this.items
      , atom: feed.toString()
      }
    this.callback(output)
  }

  item (obj) {
    this.items.push(obj)
    if (this.opts.ttl > 0) {
      setTimeout(this.items.splice, this.opts.ttl
        , this.items.indexOf(obj), 1).unref()
    }
  }

}

class Manager {

  constructor (opts) {
    this.opts = opts
    this.feed = new Feed(opts)
    this.cbs = [this._delay.bind(this)]
    this.sched = later.parse.text(opts.fetch)
  }

  data (func) {
    this.cbs.push(func)
    return this
  }

  start () {
    later.date.localTime()
    this.timer = later.setInterval(
      this._fetch.bind(this)(), this.sched)
    return this
  }

  stop () {
    this.timer.clear()
    clearTimeout(this.forced)
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
      if (item.publish) continue

      let next = later.schedule(this.sched)
        .next(1, item.updated) - Date.now()

      if (item.delay < next) this.forced = setTimeout(
          this._fetch.bind(this), item.delay)
    }
  }

}

module.exports = { Manager, Feed }
