module.exports = function appendStyle(href) {

	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('link');

	style.type = 'text/css';
	style.rel = 'stylesheet';
	style.setAttribute('href', href);

	head.appendChild(style);
};