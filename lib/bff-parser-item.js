class BffParserItem {
  constructor (bffItemBody, bffItemAlias, levelName = '', bffParserInstance) {
    console.debug('init BffParserItem instance: ', levelName, bffItemAlias)
    this.levelName = levelName
    this.bffItemBody = bffItemBody
    this.bffItemAlias = bffItemAlias
    this.bffParserInstance = bffParserInstance
    this.promiseList = []
    return this.execute()
  }

  async execute () {
    let _this = this
    return (new Promise(async (resolve, reject) => {
      try {
        let levelNamePrefix = ('' === _this.levelName ? '' : (_this.levelName + '.'))
        let result = await _this.bffParserInstance.requestProcessor(_this.bffItemBody)
        // console.debug('result of execute: ', result)
        _this.bffParserInstance.addRequestCount()
        _this.bffParserInstance.result.addTo(_this.levelName, _this.bffItemAlias, result)
        // console.debug(_this.bffParserInstance.result.getResult())
        let attributes = {}
        if (result && _this.bffItemBody.attributes && 0 < _this.bffItemBody.attributes.length) {
          for (let attribute of _this.bffItemBody.attributes) {
            if (Array.isArray(attribute) && 2 === attribute.length) {
              if ('object' === typeof attribute[0]) {
                let bffItemBody = attribute[0]
                let bffItemAlias = levelNamePrefix + _this.bffItemAlias + '.' + attribute[1]
                let bffItemAliasArrayStart = bffItemAlias.indexOf('[]')
                if (-1 !== bffItemAliasArrayStart) {
                  let bffItemAliasArray = _this.bffParserInstance.result.getOrSetElementByLevelName(
                    levelNamePrefix + bffItemAlias.substr(0, bffItemAliasArrayStart)
                  )
                  // console.debug(bffItemAliasArray)
                  for (let i = 0; i < bffItemAliasArray.length; i++) {
                    _this.promiseList.push(
                      new BffParserItem(bffItemBody, bffItemAlias.replace('[]', '[' + i + ']'), '', _this.bffParserInstance)
                    )
                  }
                } else {
                  _this.promiseList.push(
                    new BffParserItem(bffItemBody, bffItemAlias, '', _this.bffParserInstance)
                  )
                }
                attributes[attribute[1]] = attribute[1]
              } else if ('string' === typeof attribute[0] && 'string' === typeof attribute[1]) {
                attributes[attribute[1]] = attribute[0]
              }
            } else if ('string' === typeof attribute) {
              attributes[attribute] = attribute
            } else {
              throw (new Error('attributes should be string or array with 2 elements, currently it is ' + attribute))
            }
          }
        }
        await Promise.all(_this.promiseList)
        await _this.bffParserInstance.result.filterAttributes(levelNamePrefix + _this.bffItemAlias, attributes)
        resolve(true)
      } catch (e) {
        reject(e)
      }
    }))
  }
}

module.exports = BffParserItem
