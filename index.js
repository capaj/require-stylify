'use strict'

var through = require('through2')
var less = require('less')
var sass = require('node-sass')
var path = require('path')
var clAppender = require('./append-stylesheet')
var fs = require('fs')
var prependerAdded = false
var _ = require('lodash')

function matchArgs (fnCallString) {
  var args = fnCallString.match(/("|')([^("|')]+)("|')\s*/g)
  args.forEach(function (arg, i) {
    args[i] = arg.substring(1, arg.length - 1)
  })
  return args
}

module.exports = function (file, opts) {
  var data = ''
  var options = opts.stylifyOptions || {}
  if (!options.support) {
    options.support = ['css', 'less', 'scss']
  }

  return through(transform, flush)

  function transform (chunk, enc, cb) {
    data += chunk
    cb()
  }

  function flush (cb) {
    var absoluteDir = path.dirname(file)
    var requires = data.match(/^\s*require\(["'](.+)["'](,["'](.+)\.html["']\)|\))/gm)
    if (Array.isArray(requires)) {
      var prependerNeeded = false // we don't know if any expression is a style require or not yet
      var expressions = {}
      options.support.forEach(function (type) {
        expressions[type] = requires.filter(function (expr) {
          if (prependerNeeded === false) {
            prependerNeeded = true
          }
          return expr.indexOf('.' + type) !== -1
        })
      })

      if (prependerNeeded && prependerAdded === false) {
        data = clAppender.toString() + '\r\n' + data
      }

      if (Array.isArray(expressions.css)) {
        expressions.css.forEach(function (expr) {
          var cssFilePath = matchArgs(expr)[0]

          var absPath = path.join(absoluteDir, cssFilePath) // less file absolute path
          if (fs.existsSync(absPath)) {
            var url = path.relative(opts.rootDir || absoluteDir, absPath)
            url = url.split('\\').join('/')
            data = data.replace(expr, '\r\nappendStyle("/' + url + '")')
          } else {
            throw new Error('Path ' + cssFilePath + ' failed to find required css file')
          }
        })
      }

      if (Array.isArray(expressions.less)) {
        expressions.less.forEach(function (expr) {
          var args = matchArgs(expr)
          var lessFilePath = args[0]

          var absPath = path.join(absoluteDir, lessFilePath) // less file absolute path
          if (fs.existsSync(absPath)) {
            // TODO we could make a crc which will indicate the last compiled file and compile only when crc changes
            const options = {
              paths: ['.', path.dirname(absPath)], // Specify search paths for @import directives
              filename: path.basename(file) // Specify a filename, for better error messages
            }

            var lessSourceText = fs.readFileSync(absPath, 'utf8')
            less.render(lessSourceText, options).then((output) => {
              fs.writeFileSync(absPath.replace('.less', '.css'), output.css)
            })

            var url = path.relative(opts.rootDir || absoluteDir, absPath)
            if (url.indexOf('..') === 0) {
              if (opts.rootDir) {
                throw new Error('cannot build url to a style ' + url + ' because specified root is lower in the filesystem tree')
              } else {
                throw new Error('cannot build url to a style ' + url + ' because assumed root is lower in the filesystem tree, please specify your rootDir in options')
              }
            }
            url = url.split('\\').join('/')
            url = url.replace('.less', '.css')
            if (args[1]) { // path to index
              var htmlPath = path.join(absoluteDir, args[1])
              data = data.replace(expr, '') // removing require from scripts
              if (fs.existsSync(htmlPath)) {
                var htmlFile = fs.readFileSync(htmlPath, 'utf8')
                htmlFile.replace('</head>', '<link rel="stylesheet" href="' + url + '">\r\n</head>')
                fs.writeFileSync(htmlFile)
              }
            } else {
              data = data.replace(expr, '\r\nappendStyle("/' + url + '")')
            }
          } else {
            throw new Error('Path ' + lessFilePath + ' failed to find required less file')
          }
        })
      }

      if (Array.isArray(expressions.scss)) {
        expressions.scss.forEach(function (expr) {
          var sassFilePath = matchArgs(expr)[0]

          var absPath = path.join(absoluteDir, sassFilePath) // less file absolute path
          if (fs.existsSync(absPath)) {
            // TODO we could make a crc which will indicate the last compiled file and compile only when crc changes
            var sassSourceText = fs.readFileSync(absPath, 'utf8')

            var sassOpts = {
              data: sassSourceText,
              outputStyle: 'compressed'
            }
            _.extend(sassOpts, opts.scss)

            var sassOutput = sass.renderSync(sassOpts)
            fs.writeFileSync(absPath.replace('.scss', '.css'), sassOutput.css)

            var url = path.relative(opts.rootDir || absoluteDir, absPath)
            if (url.indexOf('..') === 0) {
              if (opts.rootDir) {
                throw new Error('cannot build url to a style ' + url + ' because specified root is lower in the filesystem tree')
              } else {
                throw new Error('cannot build url to a style ' + url + ' because assumed root is lower in the filesystem tree, please specify your rootDir in options')
              }
            }
            url = url.split('\\').join('/')
            url = url.replace('.scss', '.css')
            data = data.replace(expr, '\r\nappendStyle("/' + url + '")')
          } else {
            throw new Error('Path ' + sassFilePath + ' failed to find required less file')
          }
        })
      }
    }

    this.push(data)
    cb()
  }
}
