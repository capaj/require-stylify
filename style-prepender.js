module.exports = function prependStyle(href) {

	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('style');

	style.type = 'text/css';
	style.href = href;

	head.appendChild(style);
};