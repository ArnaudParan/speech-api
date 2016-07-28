'use strict';

// Clean dist directory
module.exports = function (del) { return function (cb) {
  del([
    'dist/statics/bower_components/**/*',
    '!dist/statics/bower_components/webcomponentsjs',
    '!dist/statics/bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '!dist/statics/bower_components/platinum-sw',
    '!dist/statics/bower_components/platinum-sw/service-worker.js',
    '!dist/statics/bower_components/firebase',
    '!dist/statics/bower_components/firebase/firebase.js',
    '!dist/statics/bower_components/page',
    '!dist/statics/bower_components/page/page.js',
    'dist/statics/elements/*',
    '!dist/statics/elements/elements.vulcanized.*',
    '!dist/statics/elements/bootstrap',
    'dist/statics/scripts/**/*.map',
    'dist/statics/themes/*/*.{html,map}',
    'dist/statics/themes/*/fonts/fonts.css'
  ], cb);
};};
