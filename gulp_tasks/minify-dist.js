'use strict';

// Minify JavaScript in dist directory
module.exports = function ($, gulp, merge) {
  return function () {
    var bootstrap = gulp.src('dist/statics/elements/bootstrap/*.js')
      .pipe($.uglify())
      .pipe(gulp.dest('dist/statics/elements/bootstrap'));

    var serviceWorker = gulp.src('dist/statics/bower_components/platinum-sw/service-worker.js')
      .pipe($.uglify())
      .pipe(gulp.dest('dist/statics/bower_components/platinum-sw'));

    var swImport = gulp.src('dist/statics/sw-import.js')
      .pipe($.uglify())
      .pipe(gulp.dest('dist/statics'));

    var swToolbox = gulp.src('dist/statics/scripts/sw-toolbox/*.js')
      // TODO
      //.pipe($.uglify()).on('error', errorHandler)
      // https://github.com/mishoo/UglifyJS2/issues/766
      .pipe(gulp.dest('dist/statics/sw-toolbox/scripts'));

    return merge(
        bootstrap,
        serviceWorker,
        swImport,
        swToolbox
    );
  };
};
