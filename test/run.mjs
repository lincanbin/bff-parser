'use strict'
import fs from 'fs'
import path from 'path'
import BffParser from '../lib/bff-parser'

const start = Date.now()

let body = JSON.parse(fs.readFileSync(path.join(fs.realpathSync('.'), './test/resource/sample.json'), {
  encoding: 'utf-8',
  flag: 'r'
}))

console.log(body)
console.log(new BffParser(body))

const ms = Date.now() - start
console.log(`${ms}ms`)
