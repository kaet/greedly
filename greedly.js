'use strict'

const later = require('later')
    , atom = require('./atom')
    , crypto = require('crypto')
    , osmosis = require('osmosis')

class Feed {

  constructor(opts) {
    this.opts = opts
    this.cache = []

    const struct = {}
    Object.entries(opts.fields).map([key, value] => struct[key] = value.select)

    this.request = new osmosis(opts.feed.link_alternate, opts.feed.request)
      .find(opts.feed.root)
      .set(struct)
      .data(this._data.bind(this))
      .done(this._done.bind(this))
  }

  fetch(callback) {
    this.items = []
    this.callback = callback
    this.request.run()
  }

  _data(obj) {
    const concat = Object.values(obj).join('')
    const item =
        { updated: new Date
        , md5: crypto.createHash('md5').update(concat).digest('hex')
        }

    if (this.cache.includes(item.md5)) return

    const _process = [key, val] => {
      const rule = this.opts.fields[key]
      let value = [val]

      if ('match' in rule) {
        value = value[0].match(rule.match)
        if (!value) return
      }

      if ('format' in rule) {
        try {
          value = [rule.format(value)]
        } catch (err) {
          let string = rule.format
          value.map((val, i) => string = string.replace(new RegExp('%' + i, 'g'), val))
          value = [string]
        }
      }

      item[key] = value[0]
    }
    Object.entries(obj).map(_process)
    item.delay = item.updated - Date.now()
    if (item.delay <= 0) this.cache.push(item.md5)
    this.item(item)
  }

  _done() {
    const limit = this.opts.feed.limit < 1
      ? this.items.length
      : this.opts.feed.limit

    const items = this.items.slice(0, limit)
    if (this.opts.feed.reverse) items.reverse()

    const feed = new atom(this.opts.feed)
    items.map(item => item.delay <= 0 && feed.entry(item))

    const output =
        { items: this.items
        , atom: feed.toString()
        }
    this.callback(output)
  }

  item(obj) {
    this.items.push(obj)
    if (this.opts.ttl <= 0) return
    setTimeout(this.items.splice, this.opts.ttl, this.items.indexOf(obj), 1)
  }

}

class Manager {

  constructor (opts) {
    this.opts = opts
    this.logger = opts.logger
    this.feed = new Feed(opts)
    this.cbs = [this._delay.bind(this)]
    this.sched = later.parse.text(opts.fetch)
  }

  data(cb) {
    this.cbs.push(cb)
    return this
  }

  start() {
    later.date.localTime()
    this.timer = later.setInterval(this._fetch.bind(this)(), this.sched)
  }

  stop() {
    this.timer.clear()
    clearTimeout(this.forced)
  }

  _fetch() {
    if (this.logger) this.logger(Date())
    const callback = obj => this.cbs.map(cb => cb(obj))
    this.feed.fetch(callback)
    return this._fetch.bind(this)
  }

  _delay(feed) {
    const schedule = item => {
      if (this.logger) this.logger(item)
      const next = later.schedule(this.sched).next(1, item.updated) - Date.now()
      if (item.delay < next) this.forced = setTimeout(this._fetch.bind(this), item.delay)
    }
    feed.items.filter(item => item.delay > 0).map(schedule)
  }

}

module.exports = { Manager, Feed }
