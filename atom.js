'use strict'

const libxmljs = require('libxmljs')

class AtomFeed {

  constructor (opts) {
    this.document = new libxmljs.Document()
    this.constructs =
      { common: (root, node, value) =>
          root.node(node, value).parent()
      , text: (root, node, text) =>
          root.node(node, text).attr({ type: 'text' }).parent()
      , html: (root, node, html) =>
          root.node(node, html).attr({ type: 'html' }).parent()
      , date: (root, node, date) =>
          root.node(node, date.toISOString()).parent()
      , link: (root, rel, href) =>
          root.node('link').attr({ rel: rel.slice(5), href }).parent()
      , person: (root, node, person) => {
          root = root.node(node)
          root.node('name', person.name).parent()
          if (person.email) root.node('email', person.email).parent()
          if (person.uri) root.node('uri', person.uri).parent()
        }
      }
    this.feed(opts)
  }

  feed (opts) {
    this.root = this.document.node('feed')
      .attr({ xmlns: 'http://www.w3.org/2005/Atom' })
    let struct =
      { id: ['common', opts.id || new Error('Feed ID required.')]
      , title: ['text', opts.title || new Error('Feed title required.')]
      , subtitle: ['text', opts.subtitle]
      , link_self: ['link', opts.link_self]
      , link_alternate: ['link', opts.link_alternate]
      , link_related: ['link', opts.link_related]
      , author: ['person', opts.author || new Error('Feed author required.')]
      , contributor: ['person', opts.contributor]
      , logo: ['common', opts.logo]
      , icon: ['common', opts.icon]
      , rights: ['text', opts.rights]
      , generator: ['common', opts.generator]
      , updated: ['date', opts.updated || new Date]
      }
    this.build(this.root, struct)
  }

  entry (item) {
    let entry = this.root.node('entry')
    let struct =
      { id: ['common', item.id || new Error('Entry ID required.')]
      , title: ['html', item.title || new Error('Entry title required.')]
      , link_alternate: ['link', item.link_alternate]
      , link_enclosure: ['link', item.link_enclosure]
      , summary: ['text', item.summary]
      , content: ['html', item.content]
      , author: ['person', item.author]
      , contributor: ['person', item.contributor]
      , updated: ['date', item.updated || new Date]
      , published: ['date', item.published]
      }
    this.build(entry, struct)
  }

  build (root, data) {
    for (let field in data) {
      let [value, construct] = data[field]

      if (!value) continue
      if (value instanceof Error) throw value
      if (!(value instanceof Array)) value = [value]

      for (let v of value) this.constructs[construct](root, field, v)
    }
  }

  toString () { return this.document.toString() }
}

module.exports = AtomFeed
