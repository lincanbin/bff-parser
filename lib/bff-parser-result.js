const BffParserFilter = require('./bff-parser-filter')
const arrayIndexRegex = (new RegExp(/^\[\d+\]$/))

class BffParserResult {
  constructor () {
    this.result = {}
  }

  getResult () {
    return this.result
  }

  isEmptyObject (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  }

  async processAttributes (levelName, attributesWhiteList, attributesRenameObject) {
    if (this.isEmptyObject(attributesRenameObject) && 0 === attributesWhiteList.length) {
      return false
    }

    // console.debug('filter ' + levelName, attributesWhiteList, attributesRenameObject)
    let bffParserFilterInstance = new BffParserFilter(this, levelName, attributesWhiteList, attributesRenameObject)
    bffParserFilterInstance.filterAttributes()
  }

  addTo (levelName, body) {
    this.getOrSetElementByLevelName(levelName, body)
  }

  parseLevelNameToList (levelName) {
    let stack = []
    let levelNameList = []
    for (let element of Array.from(levelName)) {
      if ('[' === element || '.' === element) {
        if (0 < stack.length) {
          levelNameList.push(stack.join(''))
          stack = []
        }
      } else if (']' === element) {
        levelNameList.push('[' + stack.join('') + ']')
        stack = []
      } else {
        stack.push(element)
      }
    }
    if (0 < stack.length) {
      levelNameList.push(stack.join(''))
    }
    // console.debug(levelNameList)
    return levelNameList
  }

  getOrSetElementByLevelList (levelName, levelNameList, value) {
    // console.debug(levelName)
    if (0 === levelNameList.length) {
      if ('undefined' !== typeof value) {
        this.result = value
      }
      return this.getResult()
    }
    let temp = this.result
    // console.debug(value)
    // for (let key of levelNameList) {
    for (let i = 0; i < levelNameList.length; i++) {
      let key = levelNameList[i]
      if (arrayIndexRegex.test(key)) {
        if (!Array.isArray(temp)) {
          throw new Error(levelName + ' hasn\'t array element named ' + key)
        }
        let arrayIndex = parseInt(key.substr(1, key.length - 2))
        temp = temp[arrayIndex]
      } else {
        // if (!temp.hasOwnProperty(key)) {
        if ((i === levelNameList.length - 1) && 'undefined' !== typeof value) {
          temp[key] = BffParserFilter.isObject(value) ? { ...value } : value
          // console.debug(this.result)
        }
        if (temp.hasOwnProperty(key)) {
          temp = temp[key]
        } else {
          throw new Error(levelName + ' hasn\'t element named ' + key)
        }
      }
    }
    return temp
  }

  getOrSetElementByLevelName (levelName, value) {
    let levelNameList = this.parseLevelNameToList(levelName)
    return this.getOrSetElementByLevelList(levelName, levelNameList, value)
  }
}

module.exports = BffParserResult
