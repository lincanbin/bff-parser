class BffParserFilter {
  constructor (bffParserResultInstance, parentLevelName, attributesWhiteList, attributesRenameObject) {
    this.parentLevelName = parentLevelName
    this.bffParserResultInstance = bffParserResultInstance
    this.targetObject = bffParserResultInstance.getOrSetElementByLevelName(parentLevelName)
    this.attributesWhiteList = attributesWhiteList
    this.attributesRenameObject = attributesRenameObject
    /*
    let attributesRenamedList = Object.values(attributesRenameObject)
    this.attributesWhiteList = attributesWhiteList.filter((el) => {
      return 0 > attributesRenamedList.indexOf(el)
    })
    */
    console.debug('Process a new filter: ' + this.parentLevelName, this.attributesWhiteList, this.attributesRenameObject)
  }

  filterAttributes () {
    // 先rename 再filter 解决无法在自身链上rename的bug
    for (let levelName in this.attributesRenameObject) {
      if (this.attributesRenameObject.hasOwnProperty(levelName)) {
        let newFullLevelName = ('' === this.parentLevelName ? '' : this.parentLevelName + '.') + this.attributesRenameObject[levelName]
        let previousFullLevelName = ('' === this.parentLevelName ? '' : this.parentLevelName + '.') + levelName
        /*
        if ('undefined' !== typeof arrayIndex) {
          previousFullLevelName = previousFullLevelName.replace('[]', '[' + arrayIndex + ']')
          newFullLevelName = newFullLevelName.replace('[]', '[' + arrayIndex + ']')
        }
        */
        // console.debug('Rename ', previousFullLevelName, ' with ', newFullLevelName)
        this.bffParserResultInstance.getOrSetElementByLevelName(
          newFullLevelName,
          this.bffParserResultInstance.getOrSetElementByLevelName(previousFullLevelName)
        )
      }
    }
    this.traverse(this.targetObject, '')
  }

  traverse (x, levelName) {
    // console.log(levelName)
    if (this.attributesWhiteList.includes(levelName)) {
      return true
    }
    let result = false
    if (Array.isArray(x)) {
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

  static isObject (o) {
    return '[object Object]' === Object.prototype.toString.call(o)
  }
}
module.exports = BffParserFilter
