'use strict';

// Lint CSS and JavaScript
module.exports = function ($, gulp, merge) {
  return function () {
    var stylelintrc = require('../.stylelintrc.json');
    var postcssPlugins = [
      // Lint CSS
      require('stylelint')(stylelintrc),
      // Lint SUIT CSS methodology
      require('postcss-bem-linter')(),
      require('postcss-reporter')({
        clearMessages: true
      })
    ];

    var css = gulp.src([
        'app/statics/elements/**/*.css',
        'app/statics/themes/**/*.css',
        '!app/statics/themes/*/fonts/fonts.css'
      ])
      .pipe($.plumber({
        handleError: function (error) {
          console.log(error);
          this.emit('end');
        }
      }))
      .pipe($.postcss(postcssPlugins));

    return merge(css);
  };
};
