class BffParserItem {
  constructor (bffItemBody, bffItemAlias, levelName = '', bffParserInstance) {
    this.levelName = levelName
    this.bffItemBody = bffItemBody
    this.bffItemAlias = bffItemAlias
    this.bffParserInstance = bffParserInstance
    this.promiseList = []
    return this.execute()
  }

  async execute () {
    let thisPointer = this
    return (new Promise(async (resolve, reject) => {
      try {
        let result = await thisPointer.bffParserInstance.requestProcessor(thisPointer.bffItemBody)
        thisPointer.bffParserInstance.result.addTo(thisPointer.levelName, thisPointer.bffItemAlias, result)
        let attributes = {}
        if (result && thisPointer.bffItemBody.attributes && 0 < thisPointer.bffItemBody.attributes) {
          for (let attribute of thisPointer.bffItemBody.attributes) {
            if (Array.isArray(attribute) && 2 === attribute.length) {
              if ('object' === typeof attribute[0]) {
                let bffItemBody = attribute[0]
                let bffItemAlias = attribute[1]
                thisPointer.promiseList.push(
                  new BffParserItem(bffItemBody, bffItemAlias, thisPointer.levelName + '.' + thisPointer.bffItemAlias, thisPointer.bffParserInstance)
                )
              } else if ('string' === typeof attribute[0] && 'string' === typeof attribute[1]) {
                attributes[attribute[1]] = attribute[0]
              }
            } else if ('string' === typeof attribute) {
              attributes[attribute] = attribute
            }
          }
        }
        await Promise.all(thisPointer.promiseList)
        thisPointer.bffParserInstance.result.filterAttributes(thisPointer.levelName, thisPointer.bffItemAlias, attributes)
        resolve(true)
      } catch (e) {
        reject(e)
      }
    }))
  }
}

module.exports = BffParserItem
