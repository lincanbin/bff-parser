const BffParserFilter = require('./bff-parser-filter')
const arrayIndexRegex = (new RegExp(/^\[\d+\]$/))

class BffParserResult {
  constructor () {
    this.result = {}
  }

  getResult () {
    return this.result
  }

  async filterAttributes (levelName, attributes) {
    if (0 === attributes.length) {
      return false
    }
    let targetObject = this.getOrSetElementByLevelName(levelName)

    console.debug('filter ' + levelName, attributes, targetObject)
    let bffParserFilterInstance = new BffParserFilter(targetObject, attributes)
    bffParserFilterInstance.filterAttributes()
  }

  addTo (levelName, alias, body) {
    this.getOrSetElementByLevelName(('' === levelName ? '' : (levelName + '.')) + alias, body)
  }

  getOrSetElementByLevelName (levelName, value) {
    // console.debug(levelName)
    if (!levelName) {
      return this.getResult()
    }
    let stack = []
    let levelNameList = []
    for (let element of Array.from(levelName)) {
      if (['[', '.', ']'].includes(element)) {
        if (0 < stack.length) {
          levelNameList.push(stack.join(''))
        }
        stack = []
        if (']' === element) {
          levelNameList.push('[' + levelNameList.pop() + ']')
        }
      } else {
        stack.push(element)
      }
    }
    if (0 < stack.length) {
      levelNameList.push(stack.join(''))
    }
    let temp = this.result
    // console.debug(levelNameList)
    // console.debug(value)
    for (let key of levelNameList) {
      if (arrayIndexRegex.test(key)) {
        if (!Array.isArray(temp)) {
          throw new Error(levelName + 'hasn\'t array element named ' + key)
        }
        let arrayIndex = parseInt(key.substr(1, key.length - 2))
        temp = temp[arrayIndex]
      } else {
        if (!temp.hasOwnProperty(key)) {
          if (value) {
            temp[key] = { ...value }
            // console.debug(this.result)
          } else {
            throw new Error(levelName + ' hasn\'t array element named ' + key)
          }
        }
        temp = temp[key]
      }
    }
    return temp
  }
}

module.exports = BffParserResult
