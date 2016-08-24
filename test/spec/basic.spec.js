var fs = require('fs')
var browserify = require('browserify')
var through = require('through2')
var stylifyRequireTransform = require('../../index')

describe('basic style bundles', function () {
  it('should include lessFile.css element when required from a deeply nested JS file', function (done) {
    var data = ''
    browserify({
      entries: require.resolve('../basic/less/additional_styles/main2.js')
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
        done(err)
      }))
  })

  it('should include plain.css element when loaded', function (done) {
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
        done(err)
      }))
  })

  it('should include both lessFile.css with paragraph color red with 30px font size', function (done) {
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
          if (createdCss.indexOf('font-size: 30px') === -1) {
            err = new Error('css file was not compiled from less as expected')
          }
        }
        cb()
        done(err)
      }))
  })

  xit('should not include match css require when css support is not defined ind the options', function (done) {})

  it('should compile and add SASS files', function (done) {
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
        done(err)
      }))
  })

  xit('should compile and add LESS/SASS files to html file when this file is specified as second parameter', function (done) {
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
        done(err)
      }))
  })
})
