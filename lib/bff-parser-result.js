const arrayIndexRegex = (new RegExp(/^\[\d+\]$/))

class BffParserResult {
  constructor () {
    this.result = {}
  }

  getResult () {
    return this.result
  }

  async addTo (levelName, alias, body) {
    this.getOrSetElementByLevelName(('' === levelName ? '' : (levelName + '.')) + alias, body)
  }

  async filterAttributes (levelName, alias, attributes) {

  }

  async getOrSetElementByLevelName (levelName, value) {
    console.warn(levelName)
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
    console.warn(levelNameList)
    // console.warn(value)
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
            /*
            let newChild = {}
            newChild[key] = value
            temp = { ...newChild }
            */
            temp[key] = { ...value }
            // console.error(this.result)
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
