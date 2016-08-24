'use strict'
import fs from 'fs'
import browserify from 'browserify'
import through from 'through2'
import stylifyRequireTransform from '../../index'
import test from 'ava'
import path from 'path'

test.cb.only('should include lessFile.css element when required from a deeply nested JS file', (t) => {
  var data = ''
  browserify({
    entries: path.resolve('../basic/less/additional_styles/main2.js')
  }).transform({rootDir: './test/basic'}, stylifyRequireTransform).bundle() // rootDir: '.'
    .pipe(through(function (buf, enc, cb) {
      data += buf
      cb()
    }, function (cb) {
      var err
      if (!(data.split('appendStyle("/less').length === 2)) {
        err = new Error('expected the bundle to include prependStyle function and one call')
      }

      cb()
      t.end(err)
    }))
})

test.cb('should include plain.css element when loaded', (t) => {
  var data = ''
  browserify({
    entries: require.resolve('../basic/main.js')
  }).transform(stylifyRequireTransform).bundle() // rootDir: '.'
    .pipe(through(function (buf, enc, cb) {
      data += buf
      cb()
    }, function (cb) {
      var err
      if (data.indexOf('plain.css') === -1) {
        err = new Error('expected the bundle to include prependStyle function and one call')
      }

      cb()
      t.end(err)
    }))
})

test.cb('should include both lessFile.css with paragraph color red with 30px font size', (t) => {
  var data = ''
  browserify({
    entries: require.resolve('../basic/main.js')
  }).transform({compress: true, sourceMap: true}, stylifyRequireTransform).bundle() // rootDir: '.'
    .pipe(through(function (buf, enc, cb) {
      data += buf
      cb()
    }, function (cb) {
      var err
      if (!(data.split('appendStyle("/less').length === 2)) {
        err = new Error('expected the bundle to include prependStyle function and one call')
      } else {
        var createdCss = fs.readFileSync('./test/basic/less/lessFile.css', 'utf8')
        console.log(createdCss)
        if (createdCss.indexOf('font-size: 30px') === -1) {
          err = new Error('css file was not compiled from less as expected')
        }
      }

      cb()
      t.end(err)
    }))
})

test.cb('should compile and add SASS files', (t) => {
  var data = ''
  browserify({
    entries: require.resolve('../sass/main.js')
  }).transform(stylifyRequireTransform).bundle() // rootDir: '.'
    .pipe(through(function (buf, enc, cb) {
      data += buf
      cb()
    }, function (cb) {
      var err
      if (!(data.split('appendStyle("/scss').length === 2)) {
        err = new Error('expected the bundle to include prependStyle function and one call')
      } else {
        var createdCss = fs.readFileSync('./test/sass/scss/sassFile.css', 'utf8')
        if (createdCss.indexOf('div.fix-height img{height:100%;max-width:none}') === -1) {
          err = new Error('css file was not compiled from scss as expected')
        }
      }

      cb()
      t.end(err)
    }))
})

test.todo('should not include match css require when css support is not defined ind the options')
test.skip('should compile and add LESS/SASS files to html file when this file is specified as second parameter', (t) => {
  var data = ''
  browserify({
    entries: require.resolve('../direct_to_html/main.js')
  }).transform(stylifyRequireTransform).bundle() // rootDir: '.'
    .pipe(through(function (buf, enc, cb) {
      data += buf
      cb()
    }, function (cb) {
      var err
      if (!(data.split('appendStyle("/scss').length === 1)) {
        err = new Error('expected the bundle to include prependStyle function and one call')
      } else {
        var createdCss = fs.readFileSync('./test/sass/scss/sassFile.css', 'utf8')
        if (createdCss.indexOf('div.fix-height img{height:100%;max-width:none;}') === -1) {
          err = new Error('css file was not compiled from scss as expected')
        }
      }

      cb()
      t.end(err)
    }))
})
