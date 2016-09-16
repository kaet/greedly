let do_something = (text) => {
  // do something
  return text[0]
}

module.exports = {
  fetch: 'every day at 12:00 pm',
  feed: {
    title: 'Example Feed',
    description: 'Example feed generated using Greedly',
    link: 'http://example.com',
    id: 'http://example.com',
    author: { name: 'Greedly' },
    limit: 0,
    reverse: false,
    request: {
      user_agent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
    },
    root: '.content .item'
  },
  fields: {
    id: {
      select: 'a@href',
      format: 'http://example.com/%0'
    },
    link: {
      select: 'a@href',
      format: 'http://example.com/%0'
    },
    title: {
      select: 'h2.title',
      match: /(Hello|World)/
    },
    description: {
      select: 'p.description',
      format: do_something
    },
    date: {
      select: 'span.date',
      format: (date) => new Date(date[0])
    },
    image: {
      select: 'img@src',
      format: 'http://example.com/%0'
    }
  }
}
