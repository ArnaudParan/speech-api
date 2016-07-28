'use strict';

// Add colors to Web Application Manifest - manifest.json
module.exports = function ($, config, gulp) {
  return function () {
    var variables = require('../app/statics/themes/' + config.theme + '/variables');
    var manifest = require('../app/statics/manifest');

    return $.file(
        'manifest.json',
        JSON.stringify(require('merge')(manifest, variables.manifest)),
        { src: true }
      )
      .pipe(gulp.dest('.tmp/statics'))
      .pipe(gulp.dest('dist/statics'));
  };
};
