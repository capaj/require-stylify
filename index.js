'use strict';

var through = require('through2');
var less = require('less');
var path = require('path');
var prepender = require('./style-prepender');
var fs = require('fs');
var prependerAdded = false;

module.exports = function (file, opts) {
	var data = '';

	return through(transform, flush);

	function transform (chunk, enc, cb) {
		data += chunk;
		cb();
	}

	function flush (cb) {
		var relativeToFile = path.dirname(file);

		var cssRequires = data.match(/require\(("|')([^(\(|\))]+).css("|')\s*\)/g);
		var lessRequires = data.match(/require\(("|')([^(\(|\))]+).less("|')\s*\)/g);
		var sassRequires = data.match(/require\(("|')([^(\(|\))]+).sass("|')\s*\)/g);

		var prependerNeeded = (cssRequires !== null || lessRequires !== null || sassRequires !== null);

		if (prependerNeeded && prependerAdded === false) {
			data = prepender.toString() + '\r\n' + data;
		}

		if (Array.isArray(lessRequires)) {
			lessRequires.forEach(function (expr){
				var lessFilePath = expr.match(/("|')([^"]+)("|')\s*/g)[0];
				lessFilePath = lessFilePath.substring(1, lessFilePath.length-1);

				//var files = glob.sync(lessFilePath, {cwd: relativeToFile});
				if (fs.existsSync(lessFilePath)) {
					data = data.replace(expr, 'prependStyle("' + lessFilePath + '");\r\n');

				} else {
					throw "Path " + lessFilePath + " failed to find required file";
				}

			});
		}

		this.push(data);
		cb();
	}
};