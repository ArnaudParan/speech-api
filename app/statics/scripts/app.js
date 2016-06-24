/**
 * Conditionally loads webcomponents polyfill if needed.
 * 
var webComponentsSupported = ('registerElement' in document
  && 'import' in document.createElement('link')
  && 'content' in document.createElement('template'));

if (!webComponentsSupported) {
  var wcPoly = document.createElement('script');
  wcPoly.src = '/third_party/webcomponents-lite.min.js';
  document.head.appendChild(wcPoly);
}
 */