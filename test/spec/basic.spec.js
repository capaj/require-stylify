var fs = require('fs');
var browserify = require('browserify');
var through = require('through2');

describe('basic less bundle', function() {
	it('should include main.css with paragraph color red with 30px font size', function(done) {
		var stylifyRequireTransform = require('../../index');

		var data = '';
		browserify({
			entries: require.resolve('../basic/main.js')
		}).transform({compress: true}, stylifyRequireTransform).bundle()		//rootDir: '.'
			.pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (!(data.split('prependStyle(').length === 3)) {
				err = new Error('expected the bundle to include prependStyle function and one call');
			} else {
				var createdCss = fs.readFileSync('./test/basic/less/main.css', 'utf8');
				if (createdCss !== 'p{font-size:30px}p{color:#ff0000}') {
					throw 'css file was not created as expected';
				}

			}

			cb();
			done(err);
		}));
	});


});

