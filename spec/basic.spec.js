var fs = require('fs');
var browserify = require('browserify');
var through = require('through2');

describe('basic less bundle', function() {
	it('should include main.css with paragraph color red with 30px font size', function(done) {
		var globRequireTransform = require('./../index');

		var data = '';
		browserify({
			entries: require.resolve('./basic/main.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (!(data.indexOf('prependStyle') !== -1)) {
				err = new Error('expected the bundle to include both test tokens');
			}

			cb();
			done(err);
		}));
	});


});

