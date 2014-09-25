'use strict';

var through = require('through2');
var less = require('less');
var path = require('path');
var prepender = require('./style-prepender');
var fs = require('fs');
var prependerAdded = false;

module.exports = function (file, opts) {
	var data = '';
	var options = opts.stylifyOptions || {};
	if (!options.support) {
		options.support = ['css', 'less', 'sass'];
	}
	var supports = function(type) {
		return options.support.indexOf(type) !== -1;
	};

	return through(transform, flush);

	function transform (chunk, enc, cb) {
		data += chunk;
		cb();
	}

	function flush (cb) {
		var self = this;
		var absoluteDir = path.dirname(file);
		var cssRequires;
		var lessRequires;
		var sassRequires;
		if (supports('css')) {
			cssRequires = data.match(/^\s*require\(["'](.+).css["']\)/gm);
		}
		if (supports('less')) {
			lessRequires = data.match(/^\s*require\(["'](.+).less["']\)/gm);
		}
		if (supports('sass')) {
			sassRequires = data.match(/^\s*require\(["'](.+).sass["']\)/gm);
		}

		var prependerNeeded = (cssRequires !== null || lessRequires !== null || sassRequires !== null);

		if (prependerNeeded && prependerAdded === false) {
			data = prepender.toString() + '\r\n' + data;
		}


		if (Array.isArray(cssRequires)) {
			cssRequires.forEach(function (expr){
				var cssFilePath = expr.match(/("|')([^"]+)("|')\s*/g)[0];
				cssFilePath = cssFilePath.substring(1, cssFilePath.length-1);

				var absPath = path.join(absoluteDir, cssFilePath);	//less file absolute path
				if (fs.existsSync(absPath)) {

					var url = path.relative(opts.rootDir || absoluteDir, absPath);
					url = url.split('\\').join('/');
					data = data.replace(expr, '\r\nappendStyle("/' + url + '")');

				} else {
					throw "Path " + cssFilePath + " failed to find required css file";
				}
			});
		}

		if (Array.isArray(lessRequires)) {
			lessRequires.forEach(function (expr){
				var lessFilePath = expr.match(/("|')([^"]+)("|')\s*/g)[0];
				lessFilePath = lessFilePath.substring(1, lessFilePath.length-1);

				var absPath = path.join(absoluteDir, lessFilePath);	//less file absolute path
				if (fs.existsSync(absPath)) {

					//TODO we could make a crc which will indicate the last compiled file and compile only when crc changes

					var parser = new(less.Parser)({
						paths: ['.', path.dirname(absPath)], // Specify search paths for @import directives
						filename: path.basename(file) // Specify a filename, for better error messages
					});
					var lessSourceText = fs.readFileSync(absPath, 'utf8');

					parser.parse(lessSourceText, function (e, tree) {
						if (e) {
							console.error(e);
							throw e;
						}
						var css = tree.toCSS(opts);
						fs.writeFileSync(absPath.replace('.less','.css'), css);

					});
					var url = path.relative(opts.rootDir || absoluteDir, absPath);
					if (url.indexOf('..') === 0 ) {
						if (opts.rootDir) {
							throw 'cannot build url to a style ' + url + ' because specified root is lower in the filesystem tree';
						} else {
							throw 'cannot build url to a style ' + url + ' because assumed root is lower in the filesystem tree, please specify your rootDir in options';
						}
					}
					url = url.split('\\').join('/');
					url = url.replace('.less', '.css');
					data = data.replace(expr, '\r\nappendStyle("/' + url + '")');

				} else {
					throw "Path " + lessFilePath + " failed to find required less file";
				}

			});
		}

		this.push(data);
		cb();

	}
};