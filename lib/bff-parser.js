const BffParserItem = require('./bff-parser-item')
const BffParserResult = require('./bff-parser-result')

class BffParser {
  constructor (body = {}, requestProcessor = async (request) => {
    return (new Promise((resolve, reject) => {
    }))
  }, options = {}) {
    this.options = {
      maxRequestNumber: 1024
    }
    this.loadOptions(options)
    this.promiseList = []
    this.result = (new BffParserResult())
    this.body = body
    this.requestCount = 0
    this.requestProcessor = requestProcessor
    this.traverse()
  }

  loadOptions (options) {
    for (let key in this.options) {
      if (options[key]) {
        this.options[key] = options[key]
      }
    }
  }

  addRequestCount () {
    this.requestCount++
  }

  traverse () {
    for (let bffItem of this.body) {
      // console.log(bffItem)
      if (!Array.isArray(bffItem) || 2 !== bffItem.length) {
        throw new Error('Bff item show be array with 2 elements: ', bffItem)
      }
      let bffItemBody = bffItem[0]
      let bffItemAlias = bffItem[1]
      this.promiseList.push(new BffParserItem(bffItemBody, bffItemAlias, '', this))
    }
  }

  async execute () {
    try {
      await Promise.all(this.promiseList)
      return this.result
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

module.exports = BffParser
