class BffParserItem {
  constructor (bffItemBody, bffItemAlias, levelName = '', bffParserInstance) {
    console.log('init BffParserItem instance: ', levelName, bffItemAlias)
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
        // console.log('result of execute: ', result)
        thisPointer.bffParserInstance.addRequestCount()
        thisPointer.bffParserInstance.result.addTo(thisPointer.levelName, thisPointer.bffItemAlias, result)
        // console.error(thisPointer.bffParserInstance.result.getResult())
        let attributes = {}
        if (result && thisPointer.bffItemBody.attributes && 0 < thisPointer.bffItemBody.attributes.length) {
          for (let attribute of thisPointer.bffItemBody.attributes) {
            if (Array.isArray(attribute) && 2 === attribute.length) {
              if ('object' === typeof attribute[0]) {
                let bffItemBody = attribute[0]
                let bffItemAlias = ('' === thisPointer.levelName ? '' : (thisPointer.levelName + '.')) + thisPointer.bffItemAlias + '.' + attribute[1]
                let bffItemAliasArrayStart = bffItemAlias.indexOf('[]')
                if (-1 !== bffItemAliasArrayStart) {
                  let bffItemAliasArray = await thisPointer.bffParserInstance.result.getOrSetElementByLevelName(
                    ('' === thisPointer.levelName ? '' : (thisPointer.levelName + '.')) + bffItemAlias.substr(0, bffItemAliasArrayStart)
                  )
                  console.log(bffItemAliasArray)
                  for (let i = 0; i < bffItemAliasArray.length; i++) {
                    thisPointer.promiseList.push(
                      new BffParserItem(bffItemBody, bffItemAlias.replace('[]', '[' + i + ']'), '', thisPointer.bffParserInstance)
                    )
                  }
                } else {
                  thisPointer.promiseList.push(
                    new BffParserItem(bffItemBody, bffItemAlias, '', thisPointer.bffParserInstance)
                  )
                }
                attributes[bffItemAlias] = bffItemAlias
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
