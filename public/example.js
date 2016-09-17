module.exports =

// Later.js-parseable text schedule. See full syntax at
// https://bunkat.github.io/later/parsers.html#text
{ fetch: 'every day at 12:00 pm'
, feed:
  /**
   * Basic Atom feed information. Full options viewable at
   * https://tools.ietf.org/html/rfc4287#section-4.1.1
   *
   * Required: title, id, author { name }
   * Recommended: link
   */
  { title: 'Example Feed'
  , description: 'Example feed generated using Greedly'
  , link: 'http://example.com'
  , id: 'http://example.com'
  , author: { name: 'Greedly' }

  // (Optional) Limit the number of items that are fetched per update.
  // Useful for only selecting most recent items in an ordered list.
  // Remove or set to 0 for no limit.
  , limit: 0

  // (Optional) Reverse the order of items for output. Note that this
  // won't change much if your feed aggregator uses timestamps. Reversal
  // will occur AFTER applying the limit.
  // Remove or set to false for no Reversal
  , reverse: false

  // (Optional) Request options for Needle. See
  // https://github.com/tomas/needle#request-options
  , request: { user_agent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }

  // (Required) CSS/XPath selector for root feed item elements.
  // See https://github.com/rchipka/node-osmosis/wiki/selectors.
  , root: '.content .item'
  }
, fields:
    /**
     * The rule sets for extracting and formatting data for all entry fields
     * are defined under the 'fields' key, using the same structure;
     *
     *   <field>: {
     *     select: String                 (Required) CSS/XPath selector for element. Child of feed.root.
     *                                    See https://github.com/rchipka/node-osmosis/wiki/selectors.
     *
     *   , [match: String|RegExp]         (Optional) String or RegExp to match the selected data against.
     *                                    Any items that do not match will be discarded.
     *
     *   , [format: String|Function]      (Optional) Formatting for the selected data.
     *                                    If a string is provided, string interpolation will occur using
     *                                    field.format as a template and the result of field.select (or
     *                                    field.format if present) for interpolation. Place holders are
     *                                    denoted using the '%i' notation, with 0 = (original field.select),
     *                                    and subsequent items corresponding to field.match'd groups.
     *
     *                                    E.g., prepending a base URL;
     *                                      format: 'http://example.com/%0'
     *
     *                                    E.g., stripping '---' out of an item
     *                                      match: /(.*)---(.*)/
     *                                      format: '%1 %2'
     *
     *                                    If a function is provided, it must accept an array of strings
     *                                    (with [0]  = origin field.select, and subsequent items corresponding
     *                                    to field.match'd groups.) as sole argument and return a formatted string.
     *
     *                                    E.g., appending the date to a text entry
     *                                      format: text => text[0] + (new Date).toString()
     *   }
     *
     * Required fields: link, title
     * Available fields: id (defaults to link value), description|summary,
     *   content, date (defaults to Date.now, should return a valid Date object)
     *
     * Note: Greedly will not publish an item if the 'date' field is dated in
     *   the future, and will instead delay publication until that time. This
     *   feature can be used to generate 'notifications', for example for an
     *   event. E.g.;
     *
     *     date: {
     *       select: 'span.event_date',
     *       format: date => {
     *         // publish the item 12 hours before the event date
     *         let notify = new Date(date[0]) - 12 * 60 * 60 * 1000
     *         return new Date(notify)
     *       }
     *     }
     */
  { link:
    { select: 'a@href'
    , format: 'http://example.com/%0'
    }
  , title:
    { select: 'h2.title'
    , match: /(Article|Amazing)/
    }
  , description: { select: 'p.description' }
  , date:
    { select: 'span.date'
    , format: date => new Date(date[0])
    }
  }
}
