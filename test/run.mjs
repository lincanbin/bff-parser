'use strict'
// import fs from 'fs'
// import path from 'path'
// import BffParser from '../lib/bff-parser'
const fs = require('fs')
const path = require('path')
const BffParser = require('../lib/bff-parser')

let body = JSON.parse(fs.readFileSync(path.join(fs.realpathSync('.'), './resource/sample.json'), {
  encoding: 'utf-8',
  flag: 'r'
}))

// console.log(body)
const requestProcessor = (request) => {
  // console.log('Process new request: ', request)
  return (new Promise((resolve, reject) => {
    fs.readFile(
      path.join(fs.realpathSync('.'), './mock' + request.url + '.json'),
      { encoding: 'utf-8' },
      (err, data) => {
        if (err) {
          reject(err)
        }
        // console.log(data)
        let json = JSON.parse(data)
        resolve(json)
      }
    )
  }))
}

const start = Date.now()

const testFunc = async () => {
  let bffInstance = new BffParser(body, requestProcessor)
  await bffInstance.execute()
  // console.log(bffInstance)
  console.log('Request count: ', bffInstance.requestCount)
  console.log('Result', JSON.stringify(bffInstance.getResult(), null, '\t'))

  const ms = Date.now() - start
  console.log(`${ms}ms`)
  const used = process.memoryUsage()
  for (let key in used) {
    console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
  }
}

testFunc()
