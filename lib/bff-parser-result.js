class BffParserResult {
  constructor () {
    this.result = {}
  }

  async get () {
    return this.result
  }

  async addTo (levelName, alias, body) {

  }

  async filterAttributes (levelName, alias, attributes) {

  }

  async getElementByLevelName (levelName) {
    if (!levelName) {
      return this.get()
    }
    let stack = []
    let levelNameList = []
    for (let element of levelName.split('')) {
      if (['[', '.', ']'].includes(element)) {
        levelNameList.push(stack.join(''))
        if (']' === element) {
          levelNameList.push('[' + levelNameList.pop() + ']')
        }
      } else {
        stack.push(element)
      }
    }
    let temp = this.result
    for (let key of levelNameList) {
      if (temp.hasOwnProperty(key)) {
        temp = temp[key]
      } else {
        throw new Error(levelNameList.join('') + 'hasn\'t property ' + key)
      }
    }
    return temp
  }
}

module.exports = BffParserResult
