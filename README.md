require-stylify
===============

require styles in your browserify builds, same as you require your js files:

```javascript
require('./less/main.less');
require('./sass/sassFile.scss');
```
This will get transformed into and it will compile the less file into css:
```javascript
appendStyle('/less/main.css');
appendStyle('/sass/sassFile.css');
```
appendStyle global is defined in [https://github.com/capaj/require-stylify/blob/master/append-stylesheet.js](https://github.com/capaj/require-stylify/blob/master/append-stylesheet.js)

Should works with css, less and sass(only scss files are supported though).

### why use this rather than [node-lessify](https://github.com/wilson428/node-lessify)
Because this creates a css file on your filesystem and it appends style element with href rather than just appending styles directly into the DOM. This is better, because your less/sass sourcemaps still work. Also I believe having separate CSS and JS is good thing even though you end up with one extra file(your main.less/main.sass). I personally don't change css styles as often as JS files, so when you have live web app with caching, with most new builds, users download only JS bundle and their old cached CSS doesn't need to be reloaded from the server.
