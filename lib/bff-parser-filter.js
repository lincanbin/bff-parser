class BffParserFilter {
  constructor (targetObject, attributesWhiteList) {
    this.targetObject = targetObject
    this.attributesWhiteList = attributesWhiteList
  }

  filterAttributes () {
    this.traverse(this.targetObject, '')
  }

  traverse (x, levelName) {
    if (this.attributesWhiteList.hasOwnProperty(levelName)) {
      return true
    }
    let result = false
    if (this.isArray(x)) {
      result = this.traverseArray(x, levelName)
    } else if (('object' === typeof x) && (null !== x)) {
      result = this.traverseObject(x, levelName)
    } else {

    }
    return result
  }

  traverseArray (arr, levelName) {
    let _this = this
    arr.forEach(function (x) {
      _this.traverse(x, levelName + '[]')
    })
  }

  traverseObject (obj, levelName) {
    let reservedBranch = false
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (false === this.traverse(obj[key], ('' === levelName ? '' : (levelName + '.')) + key)) {
          delete obj[key]
        } else {
          reservedBranch = true
        }
      }
    }
    return reservedBranch
  }

  isArray (o) {
    return '[object Array]' === Object.prototype.toString.call(o)
  }
}
module.exports = BffParserFilter
